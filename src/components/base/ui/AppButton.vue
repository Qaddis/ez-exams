<script setup lang="ts">
import type { ButtonHTMLAttributes } from "vue"

interface IProps extends /* @vue-ignore */ ButtonHTMLAttributes {
	variant?: "default" | "outlined"
	danger?: boolean
}

withDefaults(defineProps<IProps>(), {
	variant: "default",
	danger: false
})
</script>

<template>
	<button class="button" :class="[variant, { danger: danger }]">
		<slot />
	</button>
</template>

<style scoped>
.button {
	--btn-bg: var(--primary-color);
	--btn-border: var(--primary-color);
	--btn-text: var(--light-color);

	background: var(--btn-bg);
	color: var(--btn-text);

	border: 1px solid var(--btn-border);
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
	opacity: 0.8 !important;
	translate: 0 2px;
}

.button:focus-visible {
	outline: 2px dashed var(--accent-color);
	outline-offset: 2px;
}

.default:hover {
	--btn-bg: var(--accent-color);
	--btn-border: var(--accent-color);
}

.outlined {
	background-color: transparent;
	color: var(--btn-bg);
}

.outlined:hover {
	background-color: var(--btn-bg);
	color: var(--btn-text);
}

.button.danger {
	--btn-bg: var(--danger-color);
	--btn-border: var(--danger-color);
}

.default.danger:hover {
	opacity: 0.9;
}
</style>
