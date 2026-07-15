import type { IStoreModalsObj } from "@/types/modals.types"

export const availableModals = [
	{
		name: "createGroup",
		data: undefined
	},
	{ name: "editModal", data: { modalId: "" as string } }
] as const satisfies Readonly<IStoreModalsObj[]>
