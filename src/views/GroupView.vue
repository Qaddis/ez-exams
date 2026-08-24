<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue"
import { useRoute, useRouter } from "vue-router"

import { listen, type UnlistenFn } from "@tauri-apps/api/event"
import { AnimatePresence, motion } from "motion-v"

import { sortingVariants } from "@/constants/appSettings.constants"
import { NavigationEnum } from "@/constants/navigation.constants"
import ticketsService from "@/services/tickets.service"
import { useSettingsStore } from "@/stores/appSettings.store"
import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
import type { SortVariantType } from "@/types/appSettings.types"
import type { IGroup } from "@/types/groups.types"
import type { TicketMetadataType } from "@/types/tickets.types"

import PageHeader from "@/components/base/PageHeader.vue"
import Spinner from "@/components/base/Spinner.vue"
import TextInput from "@/components/base/ui/TextInput.vue"
import TicketCard from "@/components/widgets/TicketCard.vue"

import AddNoteIcon from "@/assets/icons/add-note.svg"
import BookmarkFillIcon from "@/assets/icons/bookmark-fill.svg"
import BookmarkIcon from "@/assets/icons/bookmark.svg"
import SettingsIcon from "@/assets/icons/settings.svg"
import SortSelect from "@/components/base/SortSelect.vue"
import { TicketMetadataSchema } from "@/schemas/tickets.schemas"
import { safeParse } from "valibot"

const route = useRoute()
const router = useRouter()

const settingsStore = useSettingsStore()
const groupsStore = useGroupsStore()
const modalsStore = useModalsStore()

const tickets = ref<TicketMetadataType[]>([])
const isLoading = ref<boolean>(true)

const searchInput = ref<string>("")
const sortingInput = ref<SortVariantType>(sortingVariants[0])

let unlistenTicketsUpdate: UnlistenFn | null = null

watchEffect(() => {
	if (settingsStore.settings?.defaultSortingVariant)
		sortingInput.value = settingsStore.settings.defaultSortingVariant
})

const ticketsDisplay = computed<TicketMetadataType[]>(() => {
	const searchRes = searchInput.value.trim()

	const ticketsData = [...tickets.value]

	switch (sortingInput.value) {
		case "created-inc":
			ticketsData.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)
			break
		case "created-dec":
			ticketsData.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
			break
		case "updated-inc":
			ticketsData.sort(
				(a, b) =>
					new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
			)
			break
		case "updated-dec":
			ticketsData.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			)
			break
		default:
			ticketsData.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)
			break
	}

	if (searchRes.length > 0)
		return ticketsData.filter(t =>
			t.title.toLowerCase().includes(searchRes.toLowerCase())
		)
	else return ticketsData
})

const group = computed<IGroup | undefined>(() => {
	return groupsStore.groups.find(g => g.id === route.params.groupId)
})

const openSettings = (): void => {
	if (group.value)
		modalsStore.openModal("editGroup", { groupId: group.value.id })
}

const togglePinStatus = (): void => {
	if (group.value) groupsStore.togglePinGroup(group.value.id)
}

const createNewTicket = async (): Promise<void> => {
	if (group.value) {
		const ticketId = await ticketsService.createTicket(group.value.id)

		if (settingsStore.settings && settingsStore.settings.openTicketOnCreate)
			router.push(NavigationEnum.TICKET + `${group.value.id}/${ticketId}`)
	}
}

const refreshTickets = async (): Promise<void> => {
	if (group.value) {
		tickets.value = await ticketsService.getTickets(group.value.id)
		isLoading.value = false
	} else isLoading.value = true
}

watch(() => group.value, refreshTickets, { immediate: true })

// Работа с emits из Rust
const setupWatcherListener = async () => {
	if (unlistenTicketsUpdate) {
		unlistenTicketsUpdate()
		unlistenTicketsUpdate = null
	}

	unlistenTicketsUpdate = await listen("watcher:load-tickets", event => {
		const payload = event.payload as { groupId: string; tickets: unknown[] }

		if (payload.groupId !== group.value?.id) return

		const validTickets = payload.tickets
			.map(t => safeParse(TicketMetadataSchema, t))
			.filter(res => res.success)
			.map(res => res.output) as TicketMetadataType[]

		tickets.value = validTickets
	})
}

onMounted(async () => {
	await setupWatcherListener()
})

onUnmounted(() => {
	if (unlistenTicketsUpdate) {
		unlistenTicketsUpdate()
		unlistenTicketsUpdate = null
	}
})
</script>

<template>
	<section class="group-page">
		<page-header>
			<span v-if="group" :style="{ color: group.color }">
				{{ group.title }}
			</span>
			<span v-else>Загрузка...</span>
		</page-header>

		<div class="content">
			<aside class="search-sect">
				<sort-select v-model:init-value="sortingInput" />

				<text-input
					v-model:model-value="searchInput"
					class="search-inp"
					id="search-inp"
					label="Поиск:"
					placeholder="Поиск по названию"
				/>

				<div class="setting-buttons">
					<button @click="togglePinStatus" class="stg-button">
						<bookmark-fill-icon v-if="group?.isPinned" />
						<bookmark-icon v-else />
					</button>

					<button @click="openSettings" class="stg-button">
						<settings-icon />
					</button>
				</div>
			</aside>

			<ul v-if="!isLoading" class="tickets">
				<li class="add-ticket">
					<button @click="createNewTicket" class="add-ticket-btn">
						<add-note-icon /><span>Создать билет</span>
					</button>
				</li>

				<animate-presence mode="popLayout">
					<ticket-card
						v-for="ticket in ticketsDisplay"
						:data="ticket"
						:group-id="group!.id"
						:key="`tk-${ticket.id}`"
					/>

					<motion.li
						v-if="tickets.length === 0"
						class="no-tickets"
						key="no-tickets"
						:initial="{ translateY: '10%', opacity: 0 }"
						:animate="{ translateY: 0, opacity: 0.75 }"
						:exit="{ translateY: '10%', opacity: 0 }"
					>
						<span>Тут будут созданные вами билеты</span>
					</motion.li>

					<motion.li
						v-if="tickets.length > 0 && ticketsDisplay.length === 0"
						class="no-tickets"
						key="no-found"
						:initial="{ translateY: '10%', opacity: 0 }"
						:animate="{ translateY: 0, opacity: 0.75 }"
						:exit="{ translateY: '10%', opacity: 0 }"
					>
						<span>Ничего не найдено</span>
					</motion.li>
				</animate-presence>
			</ul>

			<spinner v-else />
		</div>
	</section>
</template>

<style scoped>
.group-page {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.content {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	height: calc(100% - 62px);
}

.search-sect {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 0 15px;
	margin-bottom: 25px;
}

.search-inp {
	width: 50%;
	flex-shrink: 0;
}

.search-inp:deep(.input) {
	height: 30px;
	text-align: center;
	align-self: center;
}

.setting-buttons {
	display: flex;
	gap: 0 5px;
}

.stg-button {
	width: 35px;
	height: 35px;

	display: flex;
	align-items: center;
	justify-content: center;

	transition:
		opacity 0.15s,
		translate 0.15s;
}

.stg-button svg {
	width: 100%;
	height: 100%;
	fill: var(--primary-color);

	transition: fill 0.15s;
}

.stg-button:hover svg {
	fill: var(--accent-color);
}

.stg-button:active {
	opacity: 0.85;
	translate: 0 1.5px;
}

.tickets {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	gap: 10px 0;
	padding: 2.5px 15px 7.5px 7.5px;

	overflow-y: scroll;
	overflow-x: hidden;
	scrollbar-gutter: stable;

	container-type: inline-size;
	container-name: tickets;
}

.no-tickets {
	width: 100%;
	height: 62.5px;

	display: flex;
	align-items: center;
	justify-content: center;

	font-size: 1.35rem;
	font-weight: 500;
	opacity: 0.75;
}

.add-ticket {
	width: 100%;
	height: 60px;
	border-radius: 5px;
	border: 2px dashed var(--primary-color);
	transition: all 0.15s;
}

.add-ticket-btn {
	width: 100%;
	height: 100%;
	padding: 5px;

	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0 10px;

	font-size: 1.35rem;
	font-weight: 500;
	letter-spacing: 0.125rem;
}

.add-ticket:hover {
	color: var(--accent-color);
	border-color: var(--accent-color);
}

.add-ticket:active {
	translate: 0 2px;
	opacity: 0.85;
}

.add-ticket-btn svg {
	width: 30px;
	height: 30px;
	fill: var(--primary-color);

	transition: fill 0.15s;
}

.add-ticket:hover svg {
	fill: var(--accent-color);
}
</style>
