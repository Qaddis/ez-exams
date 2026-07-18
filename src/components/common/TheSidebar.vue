<script setup lang="ts">
import { computed, ref } from "vue"

import { AnimatePresence, motion } from "motion-v"

import { NavigationEnum } from "@/constants/navigation.constants"
import { useGroupsStore } from "@/stores/groups.store.ts"

import NavbarLink from "../widgets/NavbarLink.vue"
import SidebarGroupCard from "../widgets/SidebarGroupCard.vue"

import BackIcon from "@/assets/icons/back.svg"
import FolderIcon from "@/assets/icons/folder.svg"
import HomeIcon from "@/assets/icons/home.svg"
import SettingsIcon from "@/assets/icons/settings.svg"

const groupsStore = useGroupsStore()

const isOpen = ref<boolean>(true)

const changeSidebarState = () => {
	isOpen.value = !isOpen.value
}

const pinnedGroups = computed(() => groupsStore.groups.filter(g => g.isPinned))
</script>

<template>
	<motion.aside
		class="sidebar"
		:animate="isOpen ? 'open' : 'close'"
		:variants="{ open: { width: 270 }, close: { width: 76 } }"
	>
		<motion.h1
			:variants="{ open: { gap: '0 5px' }, close: { gap: '0 0' } }"
			class="logo"
		>
			<img src="/Logo.png" alt="EzExams Logo" class="logo__img" />

			<motion.div
				class="text-wrapper"
				:variants="{
					open: { gridTemplateColumns: '1fr' },
					close: { gridTemplateColumns: '0fr' }
				}"
			>
				<p class="logo__text"><span>Ez</span>Exams</p>
			</motion.div>
		</motion.h1>

		<div class="center-block">
			<motion.ul
				class="pinned-groups"
				:animate="{
					marginBottom: pinnedGroups.length > 0 ? 25 : 0,
					transition: { delay: pinnedGroups.length > 0 ? 0 : 0.2 }
				}"
			>
				<animate-presence>
					<sidebar-group-card
						v-for="group in pinnedGroups"
						:data="group"
						:is-open="isOpen"
						:key="`sidebar-bm-group-${group.id}`"
					/>
				</animate-presence>
			</motion.ul>

			<motion.nav class="navigation" layout>
				<navbar-link
					:to="NavigationEnum.HOME"
					:icon="HomeIcon"
					:is-open="isOpen"
				>
					Главная
				</navbar-link>
				<navbar-link
					:to="NavigationEnum.GROUPS.ALL"
					:icon="FolderIcon"
					:is-open="isOpen"
				>
					Папки
				</navbar-link>
				<navbar-link
					:to="NavigationEnum.SETTINGS"
					:icon="SettingsIcon"
					:is-open="isOpen"
				>
					Настройки
				</navbar-link>
			</motion.nav>
		</div>

		<button
			@click="changeSidebarState"
			class="sidebar-btn"
			:title="isOpen ? 'Свернуть боковую панель' : 'Раскрыть боковую панель'"
		>
			<motion.div
				class="sidebar-btn__icon-wrapper"
				:variants="{ open: { rotateZ: 0 }, close: { rotateZ: 180 } }"
				:transition="{ rotateZ: { bounce: 0 } }"
			>
				<back-icon class="sidebar-btn__icon" />
			</motion.div>

			<motion.div
				class="text-wrapper"
				:variants="{
					open: { gridTemplateColumns: '1fr' },
					close: { gridTemplateColumns: '0fr' }
				}"
			>
				<p class="sidebar-btn__text">Свернуть</p>
			</motion.div>
		</button>
	</motion.aside>
</template>

<style scoped>
.sidebar {
	border: 3px solid var(--secondary-color);
	border-radius: 10px;
	padding: 7.5px;

	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex-shrink: 0;

	box-shadow: 2.5px 2.5px 12px 3px #00000065;

	overflow-x: hidden;
}

.logo {
	display: flex;
	justify-content: flex-start;
	align-items: center;
}

.logo__img {
	width: 55px;
	height: 55px;
	flex-shrink: 0;
}

.logo__text {
	font-size: 2.5rem;
	font-weight: bold;
	font-family: var(--comic-font);
	min-width: 0;
}

.logo__text span {
	color: var(--accent-color);
}

.pinned-groups {
	display: flex;
	flex-direction: column;
}

.navigation {
	display: grid;
	grid-template-columns: 100%;
	grid-template-rows: repeat(3, 1fr);
	gap: 5px 0;
}

.sidebar-btn {
	width: 100%;
	padding: 3.5px;

	display: flex;
	align-items: center;
	justify-content: center;

	border: 1px solid var(--primary-color);
	border-radius: 5px;

	transition:
		color 0.15s,
		background-color 0.15s,
		border-color 0.15s;
}

.sidebar-btn:hover {
	background-color: var(--primary-color);
	color: var(--light-color);
}

.sidebar-btn:hover .sidebar-btn__icon {
	fill: var(--light-color);
}

.sidebar-btn:active {
	background-color: var(--accent-color);
	border-color: var(--accent-color);
	color: var(--light-color);
}

.sidebar-btn:active .sidebar-btn__icon {
	fill: var(--light-color);
}

.sidebar-btn:focus-visible {
	outline: 2px dashed var(--accent-color);
	outline-offset: 3px;
}

.sidebar-btn__icon {
	width: 1.35rem;
	height: 1.35rem;

	fill: var(--primary-color);
	outline: none !important;

	transition: fill 0.15s;
}

.sidebar-btn__icon-wrapper {
	width: 1.35rem;
	height: 1.35rem;
}

.sidebar-btn__text {
	font-size: 1.15rem;
	font-weight: 600;
	min-width: 0;
}

.text-wrapper {
	display: grid;
	overflow: hidden;
}
</style>
