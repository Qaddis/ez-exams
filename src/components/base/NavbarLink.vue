<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router"

interface IProps {
	to: string
	iconId: string
}

defineProps<IProps>()

const route = useRoute()
</script>

<template>
	<router-link :to="to" class="link" :class="{ active: route.path === to }">
		<svg class="icon">
			<use :href="`/icons.svg#${iconId}`"></use>
		</svg>

		<p class="text">
			<slot />
		</p>
	</router-link>
</template>

<style scoped>
.link {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0 5px;

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
}

.icon {
	width: 1.35rem;
	height: 1.35rem;
	fill: var(--primary-color);
}
</style>
