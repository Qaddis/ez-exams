import type { Ref } from "vue"

import { type BaseIssue, type BaseSchema, flatten, safeParse } from "valibot"

/**
 * Утилита для валидации данных формы с помощью Valibot с выводом ошибок
 * @param schema - схема валидации Valibot
 * @param data - объект с данными для валидации
 * @param formErrors - Vue Ref на объект с ошибками
 * @returns {boolean} статус валидации (true/false)
 */
function validateForm<T extends Record<string, string | undefined>>(
	schema: BaseSchema<unknown, unknown, BaseIssue<unknown>>,
	data: object,
	formErrors?: Ref<T>
): boolean {
	const res = safeParse(schema, data)

	if (res.success) return true

	const issues = flatten(res.issues)

	if (formErrors && issues.nested)
		for (const [key, value] of Object.entries(issues.nested))
			if (value) formErrors.value[key as keyof T] = value[0] as T[keyof T]

	return false
}

export default validateForm
