<script setup lang="ts">
import { RouterLink } from "vue-router"

import { motion } from "motion-v"

import { NavigationEnum } from "@/constants/navigation.constants"
import { useGroupsStore } from "@/stores/groups.store"
import type { IGroup } from "@/types/groups.types"

import BookmarkIcon from "@/assets/icons/bookmark-fill.svg"

interface IProps {
	data: IGroup
	isOpen: boolean
}

const props = defineProps<IProps>()

const { togglePinGroup } = useGroupsStore()

const unpinGroup = (): void => {
	togglePinGroup(props.data.id)
}
</script>

<template>
	<motion.li
		class="card-layout-wrapper"
		layout
		:initial="{ height: 0, marginBottom: 0 }"
		:animate="{
			height: 'auto',
			marginBottom: 5,
			transition: { delay: 0 }
		}"
		:exit="{
			height: 0,
			marginBottom: 0,
			transition: { delay: 0.2 }
		}"
	>
		<motion.article
			class="card"
			:style="{
				borderColor: data.color,
				backgroundColor: data.color + '45',
				justifyContent: isOpen ? 'space-between' : 'center'
			}"
			:initial="{ translateX: 270, opacity: 0 }"
			:animate="{
				translateX: 0,
				opacity: 1,
				transition: { delay: 0.2, translateX: { bounce: 0, ease: 'easeInOut' } }
			}"
			:exit="{
				translateX: -270,
				opacity: 0,
				transition: { delay: 0, translateX: { bounce: 0, ease: 'easeInOut' } }
			}"
		>
			<router-link
				class="link"
				:to="NavigationEnum.GROUPS.CURRENT + data.id"
				:title="isOpen ? '' : data.title"
			/>

			<motion.div
				class="heading-wrapper"
				:variants="{
					open: { width: '100%', marginRight: 15, opacity: 1 },
					close: { width: 0, marginRight: 0, opacity: 0 }
				}"
				:animate="isOpen ? 'open' : 'close'"
			>
				<h3 class="heading" :style="{ color: data.color }">
					{{ data.title }}
				</h3>
			</motion.div>

			<div class="btn-wrapper">
				<button
					@click="unpinGroup"
					class="pin-btn"
					title="Открепить"
					:style="{ zIndex: isOpen ? 2 : -1 }"
				>
					<bookmark-icon class="pin-btn__icon" :style="{ fill: data.color }" />
				</button>
			</div>
		</motion.article>
	</motion.li>
</template>

<style scoped>
.card-layout-wrapper {
	width: 100%;
	overflow: visible;
	display: flex;
}

.card {
	width: 100%;
	height: 50px;
	border: 1px solid;
	border-radius: 5px;

	display: flex;
	padding: 5px;

	position: relative;
	overflow: hidden;
}

.link {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.heading-wrapper {
	display: flex;
	overflow: hidden;
	min-width: 0;
}

.heading {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	text-overflow: ellipsis;
	overflow: hidden;

	font-weight: 500;
	line-height: 1.1;
	min-width: 0;
	width: 100%;
	margin: 0;
}

.btn-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;

	align-self: center;
	flex-shrink: 0;
}

.pin-btn {
	width: 28px;
	height: 28px;

	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0;
	border: none;
	background: transparent;
	cursor: pointer;
}

.pin-btn__icon {
	width: 100%;
	height: 100%;
	flex-shrink: 0;
}
</style>
