import * as v from "valibot"

import {
	appLanguages,
	sortingVariants
} from "@/constants/appSettings.constants"

const ExamSettingsSchema = v.object({
	preparingTime: v.pipe(
		v.number(),
		v.integer(),
		v.minValue(5),
		v.maxValue(120)
	),
	answerTime: v.pipe(v.number(), v.integer(), v.minValue(5), v.maxValue(60))
})

export const AppSettingsSchema = v.object({
	language: v.picklist(appLanguages.map(l => l.code)),
	pinnedGroups: v.array(v.pipe(v.string(), v.nonEmpty())),
	defaultSortingVariant: v.picklist(sortingVariants),
	openTicketOnCreate: v.boolean(),
	exam: ExamSettingsSchema
})
