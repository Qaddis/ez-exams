/**
 * Форматирует дату формата ISO-строки в корректную для отображения в локальном часовом поясе
 * @param date дата в формате ISO-строки
 * @returns Дата для вывода в локальном часовом поясе
 */
export const getLocaleDate = (date: string): string => {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	return new Date(date).toLocaleString("ru-RU", {
		timeZone: timezone
	})
}
