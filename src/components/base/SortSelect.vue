<script setup lang="ts">
import type { SortVariantType } from "@/types/appSettings.types"

interface IProps {
	initValue?: SortVariantType
}

defineOptions({
	inheritAttrs: false
})

const props = withDefaults(defineProps<IProps>(), {
	initValue: "created-dec"
})

const emits = defineEmits<{
	(e: "update:initValue", value: string): void
}>()

const onSelect = (evt: Event): void => {
	const target = evt.target as HTMLSelectElement

	emits("update:initValue", target.value)
}
</script>

<template>
	<div v-bind="$attrs" class="sort">
		<label class="sort-label" for="tickets-sort">Сортировка:</label>

		<select
			:value="initValue"
			@change="onSelect"
			class="sort-select"
			name="tickets-sort"
			id="tickets-sort"
		>
			<option title="По дате создания (сначала новые)" value="created-dec">
				⭣ По дате создания
			</option>
			<option title="По дате создания (сначала старые)" value="created-inc">
				⭡ По дате создания
			</option>

			<option title="По дате обновления (сначала новые)" value="updated-dec">
				⭣ По дате обновления
			</option>
			<option title="По дате обновления (сначала старые)" value="updated-inc">
				⭡ По дате обновления
			</option>
		</select>
	</div>
</template>

<style scoped>
.sort {
	display: flex;
	flex-direction: column;
}

.sort-label {
	font-size: 1.05rem;
	margin-bottom: 1.5px;
}

.sort-select {
	font-size: 1.05rem;
	line-height: 1.1;
	text-align: center;

	border: 1px solid var(--primary-color);
	border-radius: 3.5px;
	padding: 2.5px;

	transition: border-color 0.15s;
}

.sort-select:focus-visible {
	outline: none;
	border-color: var(--accent-color);
}

.sort-select option {
	background-color: var(--light-color);
}
</style>
