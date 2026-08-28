<script setup lang="ts">
import { useRouter } from "vue-router"

import BackIcon from "@/assets/icons/back.svg"

interface IProps {
	withBack?: boolean
}

withDefaults(defineProps<IProps>(), {
	withBack: false
})

const router = useRouter()

const goBack = (): void => router.back()
</script>

<template>
	<h2 class="heading">
		<div v-if="withBack" class="wrapper">
			<button @click="goBack" class="back-btn" title="Назад">
				<back-icon />
			</button>

			<span class="text">
				<slot />
			</span>
		</div>

		<slot v-else />
	</h2>
</template>

<style scoped>
.heading {
	width: 100%;
	background-color: var(--light-color);
	border-bottom: 2px solid var(--secondary-color);
	padding-bottom: 5px;
	margin-bottom: 15px;

	font-size: 1.8rem;
	font-family: var(--comic-font);
	font-weight: bold;
	color: var(--primary-color);
	text-align: center;

	position: sticky;
	left: 0;
	top: 0;
	z-index: 10;

	box-shadow: 0 6.5px 4px -5px rgba(0, 0, 0, 0.45);
}

.wrapper {
	width: 100%;

	display: grid;
	grid-template-rows: auto;
	grid-template-columns: 38px 1fr 38px;
	align-items: center;
}

.back-btn {
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;
	padding: 5px;
}

.back-btn::after {
	content: "";

	display: block;
	width: 100%;
	height: 100%;

	background-color: rgba(0, 0, 0, 0.25);
	border-radius: 3.5px;

	position: absolute;
	top: 0;
	left: 0;
	z-index: -1;

	opacity: 0;

	transition: opacity 0.15s;
}

.back-btn svg {
	fill: var(--primary-color);

	width: 28px;
	height: 28px;

	transition: fill 0.25s;
}

.back-btn:hover svg {
	fill: var(--accent-color);
}

.back-btn:active::after {
	opacity: 1;
}

.text::after {
	content: "";
	display: block;
}
</style>
