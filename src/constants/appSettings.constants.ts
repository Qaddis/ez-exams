import { AppSettingsType } from "@/types/appSettings.types"

export const sortingVariants = [
	"created-inc",
	"created-dec",
	"updated-inc",
	"updated-dec"
] as const

export const appLanguages = [
	{
		code: "RU",
		label: "Русский"
	},
	{
		code: "EN",
		label: "English"
	}
] as const satisfies { label: string; code: string }[]

export const baseAppSettings: AppSettingsType = {
	language: "RU",
	pinnedGroups: [],
	openTicketOnCreate: false,
	defaultSortingVariant: "created-dec",
	exam: {
		preparingTime: 45,
		answerTime: 30
	}
}
