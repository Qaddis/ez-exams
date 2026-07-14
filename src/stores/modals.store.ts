import { ref } from "vue"

import { defineStore } from "pinia"

import type { AvailableModalsType } from "@/types/modals.types"

export const useModalsStore = defineStore("modals-store", () => {
	const modal = ref<AvailableModalsType | null>(null)

	/**
	 * Открывает указанное модальное окно
	 * @param target Название модального окна
	 */
	function openModal(target: AvailableModalsType): void {
		modal.value = target
	}

	/**
	 * Закрывает модальное окно
	 */
	function closeModal(): void {
		modal.value = null
	}

	return {
		modal,
		openModal,
		closeModal
	}
})
