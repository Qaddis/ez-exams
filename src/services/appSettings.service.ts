import { appDataDir, join } from "@tauri-apps/api/path"
import {
	exists,
	mkdir,
	readTextFile,
	remove,
	writeTextFile
} from "@tauri-apps/plugin-fs"

import { safeParse } from "valibot"

import {
	baseAppSettings,
	FunctionalFilesEnum
} from "@/constants/files.constants"
import { AppSettingsSchema } from "@/schemas/appSettings.schemas"
import type { AppSettingsType } from "@/types/appSettings.types"

interface IGetSettingsFileObj {
	settingsFile: string
	isCreated: boolean
}

/**
 * Класс для работы с файлом настроек приложения
 */
class AppSettingsService {
	/**
	 * Возвращает путь до файла с настройками
	 * @returns {IGetSettingsFileObj} путь до файла настроек и состояние (был ли создан в процессе вызова)
	 */
	private async getSettingsFile(): Promise<IGetSettingsFileObj> {
		let isCreated: boolean = false

		const baseDir = await appDataDir()
		if (!(await exists(baseDir))) {
			await mkdir(baseDir)

			isCreated = true
		}

		const settingsFile = await join(
			baseDir,
			FunctionalFilesEnum.APP_SETTINGS_FILE
		)
		if (!(await exists(settingsFile))) {
			await this.initSettings()

			isCreated = true
		}

		return { settingsFile, isCreated }
	}

	/**
	 * Инициализирует файл настроек с начальными значениями
	 */
	private async initSettings(): Promise<void> {
		const baseDir = await appDataDir()
		if (!exists(baseDir)) await mkdir(baseDir)

		const appSettFile = await join(
			baseDir,
			FunctionalFilesEnum.APP_SETTINGS_FILE
		)
		if (await exists(appSettFile)) return

		await writeTextFile(appSettFile, JSON.stringify(baseAppSettings, null, 2))
	}

	/**
	 * Возвращает объект настроек приложения
	 * @returns {AppSettingsType} объект настроек
	 */
	async getSettings(): Promise<AppSettingsType> {
		const { settingsFile } = await this.getSettingsFile()

		let appSettings = JSON.parse(await readTextFile(settingsFile))
		if (!safeParse(AppSettingsSchema, appSettings).success) {
			await remove(settingsFile)

			await this.initSettings()
			appSettings = JSON.parse(await readTextFile(settingsFile))
		}

		return appSettings
	}

	/**
	 * Записывает новые настройки в файл
	 * @param newSettings объект с новыми настройками
	 */
	async changeSettings(newSettings: Partial<AppSettingsType>): Promise<void> {
		const { settingsFile } = await this.getSettingsFile()
		const currSettings = await this.getSettings()

		await writeTextFile(
			settingsFile,
			JSON.stringify({ ...currSettings, ...newSettings }, null, 2)
		)
	}
}

export default new AppSettingsService()
