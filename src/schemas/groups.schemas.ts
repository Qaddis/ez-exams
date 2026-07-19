import * as v from "valibot"

import { groupColors } from "@/constants/groups.constants"

export const GroupSettingsSchema = v.object({
	id: v.string(),
	color: v.picklist(groupColors.map(c => c.value)),
	title: v.pipe(v.string(), v.minLength(3), v.maxLength(36)),
	createdAt: v.date(),
	updatedAt: v.date()
})

export const GroupFormSchema = v.object({
	color: v.picklist(
		groupColors.map(c => c.value),
		"Выбран некорректный цвет"
	),
	title: v.pipe(
		v.string("Название должно быть строкой"),
		v.nonEmpty('Поле "Название" является обязательным'),
		v.minLength(3, "Название должно содержать не менее 3 символов"),
		v.maxLength(36, "Название должно содержать не более 32 символов")
	)
})
