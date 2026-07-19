<script setup lang="ts">
import { onMounted } from "vue"

import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"

import PageHeader from "@/components/base/PageHeader.vue"
import Spinner from "@/components/base/Spinner.vue"
import GroupCard from "@/components/widgets/GroupCard.vue"
import { AnimatePresence } from "motion-v"

const groupsStore = useGroupsStore()
const { openModal } = useModalsStore()

onMounted(async () => {
	await groupsStore.loadGroups()
})
</script>

<template>
	<section class="groups-page">
		<page-header>Папки</page-header>

		<div v-if="!groupsStore.isLoading" class="content">
			<h3 class="sect-header">Закреплённые папки</h3>
			<ul v-if="groupsStore.bookmarkedGroups.length > 0" class="groups">
				<animate-presence mode="popLayout">
					<group-card
						v-for="group in groupsStore.bookmarkedGroups"
						:key="`pinned-${group.id}`"
						:data="group"
					/>
				</animate-presence>
			</ul>
			<p v-else class="no-groups">
				<span>Нет закреплённых папок</span>
			</p>

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

			<ul v-if="groupsStore.groups.length > 0" class="groups">
				<animate-presence mode="popLayout">
					<group-card
						v-for="group in groupsStore.groups"
						:key="group.id"
						:data="group"
					/>
				</animate-presence>
			</ul>
			<p v-else class="no-groups">
				<span>Здесь будут ваши папки</span>
			</p>
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
	display: grid;
	grid-template-columns: repeat(4, calc(25% - 7.5px));
	gap: 10px;
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
