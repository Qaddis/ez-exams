interface IRes {
	metadata: object
	content: string
}

/**
 * Парсит метадату .md документа билета
 * @param rawContent - текст файла билета
 * @returns {IRes} объект, содержащий метадату и пользовательские данные
 */
export function parseMetadata(rawContent: string): IRes {
	const fmRegExp = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/

	const match = rawContent.match(fmRegExp)
	if (!match)
		return {
			metadata: {},
			content: rawContent
		}

	try {
		const metadata = JSON.parse(match[1])
		const content = rawContent.slice(match[0].length)

		return { metadata, content }
	} catch (error) {
		console.error("Повреждены метаданные:", error)

		return { metadata: {}, content: rawContent }
	}
}
