export const getLocaleDate = (date: string): string => {
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

	return new Date(date).toLocaleString("ru-RU", {
		timeZone: timezone
	})
}
