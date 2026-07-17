<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

import SpinnerIcon from "@/assets/icons/spinner.svg"

const dotCounter = ref<number>(0)

let task: NodeJS.Timeout

onMounted(() => {
	task = setInterval(() => {
		if (dotCounter.value < 3) dotCounter.value++
		else dotCounter.value = 0
	}, 300)
})

onUnmounted(() => {
	clearInterval(task)
})
</script>

<template>
	<div class="spinner">
		<spinner-icon class="icon" />

		<p class="label">Загрузка<span v-for="_ in dotCounter">.</span></p>
	</div>
</template>

<style scoped>
.spinner {
	width: 100%;
	height: 100%;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 5px 0;
}

.icon {
	width: 3rem;
	height: 3rem;
	fill: var(--primary-color);
	animation: rotation 1.15s linear infinite;
}

.label {
	font-size: 1.35rem;
	font-family: var(--comic-font);
	font-weight: bold;
}

@keyframes rotation {
	from {
		rotate: 0deg;
	}

	to {
		rotate: 360deg;
	}
}
</style>
