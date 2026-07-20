import { join } from "@tauri-apps/api/path"
import {
	exists,
	readDir,
	readTextFile,
	remove,
	writeFile,
	writeTextFile
} from "@tauri-apps/plugin-fs"

import { safeParse } from "valibot"

import { TicketMetadataSchema } from "@/schemas/tickets.schemas"
import type { GroupRawType } from "@/types/groups.types"
import type { ITicket, TicketMetadataType } from "@/types/tickets.types"
import { parseMetadata } from "@/utils/parseTicketMetadata"
import { ServiceError } from "@/utils/serviceError"
import groupsService from "./groups.service"

class TicketsService {
	/**
	 * Возвращает массив всех билетов внутри группы по её ID
	 * @param groupId ID группы
	 * @returns {TicketMetadataType[]} Массив данных о билетах в группе
	 */
	async getTickets(groupId: GroupRawType["id"]): Promise<TicketMetadataType[]> {
		const groupDir = await groupsService.getGroupDir(groupId)

		const ticketFiles = (await readDir(groupDir)).filter(
			t => t.isFile && t.name.toLowerCase().endsWith(".md")
		)

		const tickets: TicketMetadataType[] = []
		for (const { name: ticket } of ticketFiles) {
			const ticketFile = await join(groupDir, ticket)
			const ticketContent = await readTextFile(ticketFile)

			const { metadata } = parseMetadata(ticketContent)

			if (!safeParse(TicketMetadataSchema, metadata).success) continue

			tickets.push(metadata as TicketMetadataType)
		}

		return tickets
	}

	async getTicket(
		groupId: GroupRawType["id"],
		ticketId: TicketMetadataType["id"]
	): Promise<ITicket> {
		const groupDir = await groupsService.getGroupDir(groupId)

		const ticket = await join(groupDir, `${ticketId}.md`)
		if (!(await exists(ticket)))
			throw new ServiceError(
				"tickets-get:non-exists",
				"Билет с указанным ID не существует"
			)

		const ticketRawData = await readTextFile(ticket)

		const { metadata, content } = parseMetadata(ticketRawData)
		if (!safeParse(TicketMetadataSchema, metadata).success)
			throw new ServiceError(
				"tickets-get:non-valid",
				"Билет с указанным ID не валиден"
			)

		const { id, title } = metadata as TicketMetadataType

		return { metadata: { id, title }, content }
	}

	/**
	 * Создаёт новый билет в группе по её ID
	 * @param groupId ID группы
	 * @returns ID созданного билета
	 */
	async createTicket(groupId: GroupRawType["id"]): Promise<number> {
		const groupDir = await groupsService.getGroupDir(groupId)

		const ticketsIds = (await readDir(groupDir))
			.filter(t => t.isFile && t.name.toLowerCase().endsWith(".md"))
			.map(({ name: t }) => Number(t.slice(0, -3)))
			.filter(t => !isNaN(t))

		const maxId = ticketsIds.length > 0 ? Math.max(...ticketsIds) : 0

		const newId = maxId + 1
		const title = "Новый билет"

		const metadata: TicketMetadataType = {
			id: newId,
			title,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}

		const fileContent = `---
${JSON.stringify(metadata, null, 2)}
---

# ${title}
Здесь будет ваш текст...
`

		const ticketPath = await join(groupDir, `${newId}.md`)
		await writeFile(ticketPath, new TextEncoder().encode(fileContent))

		return newId
	}

	/**
	 * Удаляет билет по ID группы и ID билета
	 * @param groupId ID группы
	 * @param ticketId ID билета
	 */
	async removeTicket(
		groupId: GroupRawType["id"],
		ticketId: TicketMetadataType["id"]
	): Promise<void> {
		const groupDir = await groupsService.getGroupDir(groupId)

		const ticket = await join(groupDir, `${ticketId}.md`)
		if (!(await exists(ticket)))
			throw new ServiceError(
				"tickets-remove:non-exists",
				"Билет с указанным ID не существует"
			)

		await remove(ticket)
	}

	/**
	 * Изменяет название билета по ID группы и ID билета
	 * @param groupId ID группы
	 * @param ticketId ID билета
	 * @param newTitle Новое название билета
	 */
	async changeTicketTitle(
		groupId: GroupRawType["id"],
		ticketId: TicketMetadataType["id"],
		newTitle: string
	): Promise<void> {
		const groupDir = await groupsService.getGroupDir(groupId)

		const ticket = await join(groupDir, `${ticketId}.md`)
		if (!(await exists(ticket)))
			throw new ServiceError(
				"tickets-edit_title:non-exists",
				"Билет с указанным ID не существует"
			)

		const ticketRawData = await readTextFile(ticket)

		const { metadata, content } = parseMetadata(ticketRawData)
		if (!safeParse(TicketMetadataSchema, metadata).success)
			throw new ServiceError(
				"tickets-edit_title:non-valid",
				"Билет с указанным ID не валиден"
			)

		const newTicketContent = `---
${JSON.stringify({ ...metadata, title: newTitle, updatedAt: new Date().toISOString() }, null, 2)}
---

${content}`

		await writeTextFile(ticket, newTicketContent)
	}
}

export default new TicketsService()
