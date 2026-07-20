import { availableModals } from "@/constants/modals.constants"

type AvailableModalElement = (typeof availableModals)[number]

export type AvailableModalsType = AvailableModalElement["name"]

export type ModalDataLookupType = {
	[M in AvailableModalElement as M["name"]]: M["data"]
}

export type ActiveModalType = {
	[K in AvailableModalsType]: {
		name: K
		data: ModalDataLookupType[K]
	}
}[AvailableModalsType]

export interface IStoreModalsObj {
	name: string
	data: any
}
