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
	 * @param name Название модального окна
	 * @param args Данные модального окна (обязательны, если не undefined)
	 */
	function openModal<T extends AvailableModalsType>(
		name: T,
		...args: ModalDataLookupType[T] extends undefined
			? []
			: [data: ModalDataLookupType[T]]
	): void {
		const data = args[0] as ModalDataLookupType[T]

		modal.value = { name, data } as Extract<ActiveModalType, { name: T }>
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
