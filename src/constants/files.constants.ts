import type { AppSettingsType } from "@/types/appSettings.types"

export const FunctionalFilesEnum = {
	APP_SETTINGS_FILE: "app.settings.json",
	GROUPS_DIR: "groups",
	GROUP_SETTINGS_FILE: "settings.json"
} as const

export const appLanguages: { label: string; code: string }[] = [
	{
		code: "RU",
		label: "Русский"
	},
	{
		code: "EN",
		label: "English"
	}
]

export const baseAppSettings: AppSettingsType = {
	language: "RU",
	pinnedGroups: [],
	exam: {
		preparingTime: 45,
		answerTime: 30
	}
}
