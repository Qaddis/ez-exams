<script setup lang="ts">
import type { InputHTMLAttributes, InputTypeHTMLAttribute } from "vue"

interface IProps {
	modelValue?: string
	label?: string
	errorMsg?: string

	id: string
	type?: InputTypeHTMLAttribute
	placeholder?: string
	name?: string
}

defineOptions({
	inheritAttrs: false
})

const props = withDefaults(defineProps<IProps>(), {
	modelValue: "",
	type: "text"
})

const emits = defineEmits<{
	(e: "update:modelValue", value: string): void
}>()

const onInput = (evt: Event): void => {
	const target = evt.target as InputHTMLAttributes

	emits("update:modelValue", target.value)
}
</script>

<template>
	<div v-bind="$attrs" class="input-wrapper">
		<label v-if="label" class="input-label" :for="id">{{ label }}</label>

		<input
			class="input"
			@input="onInput"
			:value="modelValue"
			:id
			:name
			:placeholder
			:type
		/>

		<span v-if="errorMsg" class="error-message">{{ errorMsg }}</span>
	</div>
</template>

<style scoped>
.input-wrapper {
	display: flex;
	flex-direction: column;
}

.input-label {
	font-size: 1.05rem;
	margin-bottom: 1.5px;
}

.input {
	width: 100%;
	border: 1px solid var(--primary-color);
	border-radius: 3.5px;
	padding: 2.5px;
	font-size: 1.05rem;

	transition: border-color 0.15s;
}

.input:focus-visible {
	border-color: var(--accent-color);
}

.error-message {
	margin-top: 5px;
	color: var(--danger-color);
}
</style>
