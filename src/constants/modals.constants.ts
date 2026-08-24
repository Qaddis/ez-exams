import type { IStoreModalsObj } from "@/types/modals.types"

export const availableModals = [
	{
		name: "createGroup",
		data: undefined
	},
	{ name: "editGroup", data: { groupId: "" as string } },
	{
		name: "deleteTicket",
		data: {
			groupId: "" as string,
			ticketId: 0 as number
		}
	}
] as const satisfies Readonly<IStoreModalsObj[]>
