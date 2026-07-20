import type { InferOutput } from "valibot"

import { TicketMetadataSchema } from "@/schemas/tickets.schemas"

export type TicketMetadataType = InferOutput<typeof TicketMetadataSchema>
export type TicketDataType = Omit<TicketMetadataType, "createdAt" | "updatedAt">

export interface ITicket {
	metadata: TicketDataType
	content: string
}
