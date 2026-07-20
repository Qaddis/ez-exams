<script setup lang="ts">
import { reactive, ref, watch } from "vue"

import { groupColors } from "@/constants/groups.constants"
import { GroupFormSchema } from "@/schemas/groups.schemas"
import { useGroupsStore } from "@/stores/groups.store"
import { useModalsStore } from "@/stores/modals.store"
import type { GroupFormDataType } from "@/types/groups.types"
import validateForm from "@/utils/validateForm"

import ModalOverlay from "@/components/base/ModalOverlay.vue"
import AppButton from "@/components/base/ui/AppButton.vue"
import TextInput from "@/components/base/ui/TextInput.vue"

const modalsStore = useModalsStore()
const groupsStore = useGroupsStore()

const groupId = ref<string>("")
const showRemoveSect = ref<boolean>(false)

const formData = reactive<GroupFormDataType>({
	title: "",
	color: groupColors[0].value
})

const formErrors = ref<Record<"title" | "color", string | undefined>>({
	title: undefined,
	color: undefined
})

const formSubmit = async (): Promise<void> => {
	formErrors.value = { title: undefined, color: undefined }

	const isValid = validateForm(GroupFormSchema, formData, formErrors)
	if (isValid) {
		await groupsStore.editGroup(groupId.value, formData)

		close()
	}
}

const removeGroup = async (): Promise<void> => {
	await groupsStore.removeGroup(groupId.value)

	close()
}

const close = (): void => {
	showRemoveSect.value = false

	modalsStore.closeModal()
}

const openRemoveSect = () => {
	showRemoveSect.value = true
}

const closeRemoveSect = () => {
	showRemoveSect.value = false
}

watch(
	() => modalsStore.modal,
	currModal => {
		if (currModal && currModal.name === "editModal") {
			const groupInitData = groupsStore.groups.find(
				g => g.id === currModal.data.modalId
			)

			if (groupInitData) {
				formData.color = groupInitData.color
				formData.title = groupInitData.title

				groupId.value = groupInitData.id
			} else modalsStore.openModal("createGroup")
		}
	}
)
</script>

<template>
	<modal-overlay modal-name="editModal" :close-func="close">
		<div class="content">
			<h2 class="heading">
				Настроить папку<br /><span>{{ groupId }}</span>
			</h2>

			<form @submit.prevent="formSubmit" class="form">
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

					<span v-if="formErrors.color" class="select-error">{{
						formErrors.color
					}}</span>
				</div>

				<app-button class="save-btn" type="submit">Сохранить</app-button>
			</form>

			<div v-if="showRemoveSect" class="remove-sect">
				<h3 class="remove-sect__heading">
					Вы действительно хотите удалить эту папку?
				</h3>

				<div class="buttons">
					<app-button @click="removeGroup" danger>Да</app-button>

					<app-button @click="closeRemoveSect">Нет</app-button>
				</div>
			</div>
			<app-button
				v-else
				@click="openRemoveSect"
				class="remove-btn"
				variant="outlined"
				danger
			>
				Удалить
			</app-button>
		</div>
	</modal-overlay>
</template>

<style scoped>
.content {
	width: 445px;
	display: flex;
	flex-direction: column;
}

.heading {
	font-size: 1.35rem;
	font-family: var(--comic-font);
	font-weight: bold;
	line-height: 1.1;

	text-align: center;
	margin-bottom: 15px;
}

.heading span {
	font-size: 1rem;
	color: var(--accent-color);
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

.save-btn {
	margin: 20px 0 10px;
}

.remove-sect__heading {
	font-size: 1.15rem;
	font-family: var(--comic-font);
	text-align: center;
	margin-bottom: 5px;
}

.buttons {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 0 10px;
}
</style>
