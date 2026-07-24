import { defineStore } from "pinia"
import { ref } from "vue"

import appSettingsService from "@/services/appSettings.service"
import type { AppSettingsType } from "@/types/appSettings.types"

export const useSettingsStore = defineStore("app-settings-store", () => {
	const appSettings = ref<AppSettingsType | null>(null)

	/**
	 * Загружает настройки приложения из файла
	 * @param force Принудительная перезапись настроек
	 */
	async function loadSettings(force: boolean = false): Promise<void> {
		if (!appSettings.value || force)
			appSettings.value = await appSettingsService.getSettings()
	}

	/**
	 * Изменяет настройки приложения в соответствии с переданными параметрами
	 * @param newSettings Новые параметры
	 */
	async function changeSettings(
		newSettings: Partial<AppSettingsType>
	): Promise<void> {
		await appSettingsService.changeSettings(newSettings)

		if (!appSettings.value) await loadSettings()
		else appSettings.value = { ...appSettings.value, ...newSettings }
	}

	return {
		appSettings,
		loadSettings,
		changeSettings
	}
})
