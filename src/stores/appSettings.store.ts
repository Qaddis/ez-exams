import { defineStore } from "pinia"
import { onMounted, onUnmounted, ref } from "vue"

import { listen, type UnlistenFn } from "@tauri-apps/api/event"
import { safeParse } from "valibot"

import { AppSettingsSchema } from "@/schemas/appSettings.schemas"
import appSettingsService from "@/services/appSettings.service"
import type { AppSettingsType } from "@/types/appSettings.types"

export const useSettingsStore = defineStore("app-settings-store", () => {
	const settings = ref<AppSettingsType | null>(null)

	const isLoading = ref<boolean>(false)
	const isInit = ref<boolean>(false)

	let unlistenNoSettings: UnlistenFn | null = null
	let unlistenLoadSettings: UnlistenFn | null = null

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

	/**
	 * Обработка вызова emits из Rust
	 */
	async function setupWatcherListeners() {
		unlistenNoSettings = await listen("watcher:no-app-settings", async () => {
			await loadSettings(true)
		})

		unlistenLoadSettings = await listen("watcher:load-app-settings", event => {
			const res = safeParse(AppSettingsSchema, event.payload)

			if (res.success) {
				settings.value = res.output
				isInit.value = true
			} else loadSettings(true)
		})
	}

	onMounted(async () => {
		await setupWatcherListeners()
	})

	onUnmounted(() => {
		unlistenLoadSettings?.()
		unlistenNoSettings?.()
	})

	return {
		settings,
		isLoading,
		isInit,
		loadSettings,
		changeSettings
	}
})
