<script setup lang="ts">
import { reactive, ref } from "vue"

import { groupColors } from "@/constants/groups.constants"
import { GroupFormSchema } from "@/schemas/groups.schemas"
import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
import type { GroupDataType } from "@/types/groups.types"
import validateForm from "@/utils/validateForm"

import ModalOverlay from "@/components/base/ModalOverlay.vue"
import AppButton from "@/components/base/ui/AppButton.vue"
import TextInput from "@/components/base/ui/TextInput.vue"

const { closeModal } = useModalsStore()
const { createGroup } = useGroupsStore()

const formData = reactive<GroupDataType>({
	title: "",
	color: groupColors[0].value
})

const formErrors = ref<Record<"title" | "color", string | undefined>>({
	title: undefined,
	color: undefined
})

const formSubmit = async (): Promise<void> => {
	formErrors.value = { color: undefined, title: undefined }

	const isValid = validateForm(GroupFormSchema, formData, formErrors)
	if (isValid) {
		await createGroup(formData)

		close()
	}
}

const resetForm = (): void => {
	formData.title = ""
	formData.color = groupColors[0].value

	formErrors.value = { color: undefined, title: undefined }
}

const close = () => {
	resetForm()

	closeModal()
}
</script>

<template>
	<modal-overlay :close-func="close" :modal-name="'createGroup'">
		<div class="content">
			<h2 class="heading">Создание папки</h2>

			<form @submit.prevent="formSubmit" @reset="resetForm" class="form">
				<text-input
					v-model="formData.title"
					:error-msg="formErrors.title"
					class="name-inp"
					label="Название"
					id="name-inp"
					name="name-inp"
				/>

				<div class="select-wrapper">
					<label class="select-label" for="color-inp">Цвет</label>

					<select
						v-model="formData.color"
						class="select-inp"
						id="color-inp"
						name="color-inp"
						:style="{
							color: formData.color,
							backgroundColor: formData.color + '35',
							borderColor: formData.color
						}"
					>
						<option
							v-for="opt in groupColors"
							:key="opt.value"
							:value="opt.value"
							:style="{ color: opt.value }"
						>
							{{ opt.name.toUpperCase() }}
						</option>
					</select>

					<span v-if="formErrors.color" class="select-error">
						{{ formErrors.color }}
					</span>
				</div>

				<div class="buttons">
					<app-button type="submit">Сохранить</app-button>

					<app-button type="reset" variant="outlined">Сбросить</app-button>
				</div>
			</form>
		</div>
	</modal-overlay>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
}

.heading {
	font-size: 1.35rem;
	font-family: var(--comic-font);
	font-weight: bold;

	text-align: center;
	margin-bottom: 15px;
}

.form {
	flex-grow: 1;

	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
}

.name-inp {
	width: 100%;
}

.select-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.select-label {
	font-size: 1.05rem;
	margin-bottom: 1.5px;
}

.select-inp {
	width: 100%;
	border: 1px solid var(--primary-color);
	border-radius: 3.5px;
	padding: 2.5px;

	font-size: 1.05rem;
	text-align: center;

	transition:
		border-color 0.15s,
		background-color 0.15s;
}

.select-inp option {
	background-color: var(--light-color) !important;
}

.select-inp:focus {
	outline: none;
}

.select-error {
	color: var(--danger-color);
	margin-top: 5px;
}

.buttons {
	width: 100%;
	margin-top: 20px;

	display: flex;
	flex-direction: column;
	gap: 5px 0;
}
</style>
