<script setup lang="ts">
import type { ButtonHTMLAttributes } from "vue"

interface IProps extends /* @vue-ignore */ ButtonHTMLAttributes {
	variant?: "default" | "outlined"
}

withDefaults(defineProps<IProps>(), {
	variant: "default"
})
</script>

<template>
	<button class="button" :class="[variant]">
		<slot />
	</button>
</template>

<style scoped>
.button {
	border: 1px solid var(--primary-color);
	border-radius: 5px;
	width: 100%;
	padding: 3.5px 12px;

	font-size: 1.05rem;

	transition:
		opacity 0.15s,
		translate 0.15s,
		color 0.25s,
		border-color 0.25s,
		background-color 0.25s;
}

.button:active {
	opacity: 0.85;
	translate: 0 2px;
}

.button:focus-visible {
	outline: 2px dashed var(--accent-color);
	outline-offset: 2px;
}

.default {
	background: var(--primary-color);
	color: var(--light-color);
}

.default:hover {
	background-color: var(--accent-color);
	border-color: var(--accent-color);
}

.outlined:hover {
	background-color: var(--primary-color);
	color: var(--light-color);
}
</style>
