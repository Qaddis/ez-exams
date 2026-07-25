import { defineStore } from "pinia"
import { ref } from "vue"

import appSettingsService from "@/services/appSettings.service"
import type { AppSettingsType } from "@/types/appSettings.types"

export const useSettingsStore = defineStore("app-settings-store", () => {
	const settings = ref<AppSettingsType | null>(null)

	const isLoading = ref<boolean>(false)
	const isInit = ref<boolean>(false)

	/**
	 * Загружает настройки приложения из файла
	 * @param force Принудительная перезапись настроек
	 */
	async function loadSettings(force: boolean = false): Promise<void> {
		if (isInit.value && !force) return

		isLoading.value = true

		try {
			const data = await appSettingsService.getSettings()

			settings.value = data
			isInit.value = true
		} catch (error) {
			console.log("Ошибка при загрузке настроек приложения:", error)
		} finally {
			isLoading.value = false
		}
	}

	/**
	 * Изменяет настройки приложения в соответствии с переданными параметрами
	 * @param newSettings Новые параметры
	 */
	async function changeSettings(
		newSettings: Partial<AppSettingsType>
	): Promise<void> {
		if (!settings.value) return

		try {
			await appSettingsService.changeSettings(newSettings)

			settings.value = { ...settings.value, ...newSettings }
		} catch (error) {
			console.error("Ошибка при обновлении данных:", error)
		}
	}

	return {
		settings,
		isLoading,
		isInit,
		loadSettings,
		changeSettings
	}
})
