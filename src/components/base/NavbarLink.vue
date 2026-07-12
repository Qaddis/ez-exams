<script setup lang="ts">
import { computed, useSlots } from "vue"
import { RouterLink, useRoute } from "vue-router"

import { motion } from "motion-v"

interface IProps {
	to: string
	icon: string
	isOpen: boolean
}

const props = defineProps<IProps>()

const route = useRoute()

const slots = useSlots()

const slotText = computed<string | undefined>(() => {
	const defaultSlot = slots.default?.()

	if (
		defaultSlot &&
		defaultSlot[0] &&
		typeof defaultSlot[0].children === "string"
	)
		return defaultSlot[0].children

	return undefined
})
</script>

<template>
	<router-link
		:to="to"
		class="link"
		:class="{ active: route.path === to }"
		:title="slotText"
	>
		<component :is="icon" class="icon" />

		<motion.div
			class="text-wrapper"
			:animate="{
				gridTemplateColumns: isOpen ? '1fr' : '0fr',
				marginLeft: isOpen ? 5 : 0
			}"
		>
			<p class="text">
				<slot />
			</p>
		</motion.div>
	</router-link>
</template>

<style scoped>
.link {
	display: flex;
	align-items: center;
	justify-content: center;

	width: 100%;
	height: min-content;
	padding: 3.5px;
	border-radius: 5px;

	position: relative;
	overflow: hidden;

	color: var(--primary-color);

	transition: color 0.25s;
}

.link::after {
	content: "";
	display: block;

	position: absolute;
	left: 50%;
	top: 50%;

	translate: -50% -50%;

	width: 120%;
	aspect-ratio: 1/1;
	background-color: #00000015;
	border-radius: 50%;

	transform: scaleX(0);
	transition:
		transform 0.35s,
		background-color 0.25s;
}

.link:hover::after {
	transform: scaleX(1);
}

.link.active {
	color: var(--accent-color);
}

.link.active::after {
	transform: scaleX(1);
	background-color: #00000025;
}

.link.active .icon {
	fill: var(--accent-color);
}

.link:focus-visible {
	outline: 2px dashed var(--accent-color);
	outline-offset: 1.5px;
}

.text {
	font-size: 1.15rem;
	font-weight: 600;
	min-width: 0;
}

.icon {
	width: 1.35rem;
	height: 1.35rem;
	fill: var(--primary-color);
}

.text-wrapper {
	display: grid;
	overflow: hidden;
}
</style>
