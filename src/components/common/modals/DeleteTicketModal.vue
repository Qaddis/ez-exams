<script setup lang="ts">
import { ref, watch } from "vue"

import ticketsService from "@/services/tickets.service"
import { useModalsStore } from "@/stores/modals.store"
import { getServiceErrorData } from "@/utils/serviceError"

import ModalOverlay from "@/components/base/ModalOverlay.vue"
import AppButton from "@/components/base/ui/AppButton.vue"

const modalsStore = useModalsStore()

const ticketTitle = ref<string>("")

const deleteTicket = async (): Promise<void> => {
	const modal = modalsStore.modal

	if (modal && modal.name === "deleteTicket") {
		try {
			await ticketsService.removeTicket(modal.data.groupId, modal.data.ticketId)

			modalsStore.closeModal()
		} catch (error) {
			console.error("Ошибка при удалении билета:", getServiceErrorData(error))
		}
	}
}

watch(
	() => modalsStore.modal,
	async currModal => {
		if (currModal && currModal.name === "deleteTicket") {
			const { groupId, ticketId } = currModal.data

			const { metadata } = await ticketsService.getTicket(groupId, ticketId)

			ticketTitle.value = metadata.title
		} else ticketTitle.value = "Загрузка..."
	}
)
</script>

<template>
	<modal-overlay modal-name="deleteTicket" :close-func="modalsStore.closeModal">
		<div class="wrapper">
			<h2 class="title">
				Вы действительно хотите удалить билет<br />&laquo;<span>{{
					ticketTitle
				}}</span
				>&raquo;?
			</h2>

			<div class="buttons">
				<app-button @click="deleteTicket" danger>Да</app-button>
				<app-button @click="modalsStore.closeModal">Нет</app-button>
			</div>
		</div>
	</modal-overlay>
</template>

<style scoped>
.wrapper {
	padding: 15px;
}

.title {
	font-size: 1.45rem;
	font-family: var(--comic-font);
	margin-bottom: 25px;
	text-align: center;
	line-height: 1.2;
}

.title span {
	color: var(--accent-color);
}

.buttons {
	display: flex;
	gap: 0 15px;
}
</style>
