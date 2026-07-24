<script setup lang="ts">
import { computed, ref } from "vue"

import { AnimatePresence, motion } from "motion-v"

import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
import { SortVariantType } from "@/types/appSettings.types"
import type { IGroup } from "@/types/groups.types"

import PageHeader from "@/components/base/PageHeader.vue"
import SortSelect from "@/components/base/SortSelect.vue"
import Spinner from "@/components/base/Spinner.vue"
import TextInput from "@/components/base/ui/TextInput.vue"
import GroupCard from "@/components/widgets/GroupCard.vue"

const groupsStore = useGroupsStore()
const { openModal } = useModalsStore()

const groupsDisplay = computed<IGroup[]>(() => {
	const searchRes = searchInput.value.trim()

	const groupsData = [...groupsStore.groups]

	switch (sortingInput.value) {
		case "created-inc":
			groupsData.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			)
			break
		case "created-dec":
			groupsData.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
			break
		case "updated-inc":
			groupsData.sort(
				(a, b) =>
					new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
			)
			break
		case "updated-dec":
			groupsData.sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			)
			break
	}

	if (searchRes.length > 0)
		return groupsData.filter(g =>
			g.title.toLowerCase().includes(searchRes.toLowerCase())
		)
	else return groupsData
})

const searchInput = ref<string>("")
const sortingInput = ref<SortVariantType>("created-dec")
</script>

<template>
	<section class="groups-page">
		<page-header>Папки</page-header>

		<aside class="search-block">
			<text-input
				v-model:model-value="searchInput"
				class="search-inp"
				id="search-inp"
				label="Поиск:"
				placeholder="Поиск по названию"
			/>

			<sort-select v-model:init-value="sortingInput" />
		</aside>

		<div v-if="!groupsStore.isLoading" class="content">
			<h3 class="sect-header">Закреплённые папки</h3>

			<ul class="groups">
				<animate-presence mode="popLayout">
					<group-card
						v-for="group in groupsStore.bookmarkedGroups"
						:key="`pinned-${group.id}`"
						:data="group"
					/>

					<motion.li
						v-if="groupsStore.bookmarkedGroups.length === 0"
						:initial="{ translateY: '10%', opacity: 0 }"
						:animate="{ translateY: 0, opacity: 0.65 }"
						:exit="{ translateY: '-10%', opacity: 0 }"
						class="no-groups"
					>
						<span>Нет закреплённых папок</span>
					</motion.li>
				</animate-presence>
			</ul>

			<div class="row">
				<h3 class="sect-header">Все папки</h3>

				<button
					@click="() => openModal('createGroup')"
					class="add_group-btn"
					title="Добавить группу"
				>
					+
				</button>
			</div>

			<ul class="groups">
				<animate-presence mode="popLayout">
					<group-card
						v-for="group in groupsDisplay"
						:key="group.id"
						:data="group"
					/>

					<motion.li
						v-if="groupsStore.groups.length === 0"
						:initial="{ translateY: '10%', opacity: 0 }"
						:animate="{ translateY: 0, opacity: 0.65 }"
						:exit="{ translateY: '-10%', opacity: 0 }"
						class="no-groups"
					>
						<span>Здесь будут ваши папки</span>
					</motion.li>

					<motion.li
						v-if="groupsStore.groups.length > 0 && groupsDisplay.length === 0"
						:initial="{ translateY: '10%', opacity: 0 }"
						:animate="{ translateY: 0, opacity: 0.65 }"
						:exit="{ translateY: '-10%', opacity: 0 }"
						class="no-groups"
					>
						<span>Ничего не найдено</span>
					</motion.li>
				</animate-presence>
			</ul>
		</div>
		<spinner v-else />
	</section>
</template>

<style scoped>
.groups-page {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.search-block {
	display: grid;
	grid-template-columns: 4fr 2fr;
	gap: 15px;
}

.search-inp:deep(.input) {
	height: 30px;
}

.content {
	flex-grow: 1;
	overflow-y: scroll;
	padding: 15px 15px 0 0;
	container-type: inline-size;
}

.sect-header {
	font-size: 1.5rem;
	font-family: var(--comic-font);
	font-weight: bold;
	line-height: 1.2;

	color: var(--primary-color);
	margin-bottom: 7.5px;
}

.add_group-btn {
	width: 2rem;
	height: 2rem;
	border: 1px solid var(--secondary-color);
	border-radius: 50%;
	padding: 3.5px;

	font-size: 1.5rem;
	line-height: 1;

	display: flex;
	align-items: center;
	justify-content: center;

	transition:
		background-color 0.25s,
		color 0.25s,
		translate 0.15s,
		opacity 0.15s;
}

.add_group-btn:hover {
	background-color: var(--secondary-color);
	color: var(--light-color);
}

.add_group-btn:active {
	translate: 0 2px;
	opacity: 0.75;
}

.groups {
	width: 100%;
	min-height: 65px;

	display: grid;
	grid-template-columns: repeat(4, calc(25% - 7.5px));
	gap: 10px;

	position: relative;
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 15px 0 7.5px;
}

.row .sect-header {
	margin: 0;
}

.no-groups {
	position: absolute;
	top: 0;
	left: 0;

	width: 100%;
	height: 65px;

	display: flex;
	justify-content: center;
	align-items: center;

	font-size: 1.25rem;
	font-weight: 600;
	opacity: 0.65;
}

@container (max-width: 1000px) {
	.groups {
		grid-template-columns: repeat(3, calc(33.33% - 6.66px));
	}
}

@container (max-width: 660px) {
	.groups {
		grid-template-columns: repeat(2, calc(50% - 5px));
	}
}
</style>
