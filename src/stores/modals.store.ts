import { ref } from "vue"

import { defineStore } from "pinia"

import type {
	ActiveModalType,
	AvailableModalsType,
	ModalDataLookupType
} from "@/types/modals.types"

export const useModalsStore = defineStore("modals-store", () => {
	const modal = ref<ActiveModalType | null>(null)

	/**
	 * Открывает указанное модальное окно
	 * @param target Название модального окна
	 */
	function openModal<T extends AvailableModalsType>(
		name: T,
		...args: ModalDataLookupType[T] extends undefined
			? [data?: undefined]
			: [data: ModalDataLookupType[T]]
	): void {
		const data = args[0]

		modal.value = { name, data }
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
