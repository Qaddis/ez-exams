<script setup lang="ts">
import { RouterLink } from "vue-router"

import { motion } from "motion-v"

import { NavigationEnum } from "@/constants/navigation.constants"
import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
import type { IGroup } from "@/types/groups.types"

import BookmarkFillIcon from "@/assets/icons/bookmark-fill.svg"
import BookmarkIcon from "@/assets/icons/bookmark.svg"
import SettingsIcon from "@/assets/icons/settings.svg"

const { data } = defineProps<{ data: IGroup }>()

const groupsStore = useGroupsStore()
const { openModal } = useModalsStore()

const changePinStatus = async (): Promise<void> => {
	await groupsStore.togglePinGroup(data.id)
}

const openGroupSettings = (): void => {
	openModal("editGroup", { groupId: data.id })
}
</script>

<template>
	<motion.li
		class="card"
		:style="{ borderColor: data.color, backgroundColor: data.color + '45' }"
		layout
		:initial="{ y: 15, opacity: 0 }"
		:animate="{
			y: 0,
			opacity: 1,
			transition: { delay: 0.2, duration: 0.2 }
		}"
		:exit="{
			y: -15,
			opacity: 0,
			transition: { duration: 0.2 }
		}"
		:transition="{
			layout: { type: 'tween', ease: 'easeOut', duration: 0.32 }
		}"
	>
		<router-link class="link" :to="NavigationEnum.GROUPS.CURRENT + data.id" />

		<p class="heading" :style="{ color: data.color }" :title="data.title">
			{{ data.title }}
		</p>

		<div class="buttons">
			<button
				@click="changePinStatus"
				class="btn"
				:class="{ pinned: data.isPinned }"
				:style="{ borderColor: data.color }"
				:title="data.isPinned ? 'Открепить' : 'Закрепить'"
				:disabled="!data.isPinned && groupsStore.bookmarkedGroups.length === 3"
			>
				<bookmark-fill-icon
					v-if="data.isPinned"
					:style="{ fill: data.color }"
				/>
				<bookmark-icon v-else :style="{ fill: data.color }" />
			</button>

			<button
				@click="openGroupSettings"
				class="btn"
				:style="{ borderColor: data.color }"
				title="Настройки папки"
			>
				<settings-icon :style="{ fill: data.color }" />
			</button>
		</div>
	</motion.li>
</template>

<style scoped>
.card {
	/* width: calc(33.33% - 3.33px); */
	height: 65px;

	position: relative;

	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 10px;

	border: 1px solid;
	border-radius: 5px;
	padding: 3.5px;
}

.link {
	position: absolute;
	top: 0;
	left: 0;

	width: 100%;
	height: 100%;
}

.heading {
	font-size: 1.15rem;
	font-weight: 500;
	line-height: 1;

	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	text-overflow: ellipsis;
	overflow: hidden;

	pointer-events: none;
}

.buttons {
	display: flex;
	gap: 0 3.5px;
	z-index: 2;
}

.btn {
	width: 1.35rem;
	height: 1.35rem;
	font-size: 1.35rem;
	transition: all 0.15s;
}

.btn:not(:disabled):hover {
	scale: 1.2;
}

.btn:disabled {
	opacity: 0.65;
}
</style>
