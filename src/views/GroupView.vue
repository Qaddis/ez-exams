<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { NavigationEnum } from "@/constants/navigation.constants"
import ticketsService from "@/services/tickets.service"
import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
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

const route = useRoute()
const router = useRouter()

const groupsStore = useGroupsStore()
const modalsStore = useModalsStore()

const tickets = ref<TicketMetadataType[]>([])
const isLoading = ref<boolean>(true)

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
				<div class="sort">
					<label class="sort-label" for="tickets-sort">Сортировка:</label>

					<select class="sort-select" name="tickets-sort" id="tickets-sort">
						<option value="created-inc">⭡ По дате создания</option>
						<option value="created-dec">⭣ По дате создания</option>
						<option value="updated-inc">⭡ По дате обновления</option>
						<option value="updated-dec">⭣ По дате обновления</option>
					</select>
				</div>

				<text-input
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

				<ticket-card
					v-for="ticket in tickets"
					:data="ticket"
					:group-id="group!.id"
					:refresh-func="refreshTickets"
				/>

				<li v-if="tickets.length === 0" class="no-tickets">
					<span>Тут будут созданные вами билеты</span>
				</li>
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

.sort {
	display: flex;
	flex-direction: column;
}

.sort-label {
	font-size: 1.05rem;
	margin-bottom: 1.5px;
}

.sort-select {
	font-size: 1.05rem;
	line-height: 1.1;
	text-align: center;

	border: 1px solid var(--primary-color);
	border-radius: 3.5px;
	padding: 2.5px;

	transition: border-color 0.15s;
}

.sort-select:focus-visible {
	outline: none;
	border-color: var(--accent-color);
}

.sort-select option {
	background-color: var(--light-color);
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
	gap: 10px 0;
	padding: 2.5px 15px 7.5px 7.5px;
	scrollbar-gutter: stable;
	overflow-y: scroll;
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
