import { availableModals } from "@/constants/modals.constants"

export interface IStoreModalsObj {
	name: string
	data: undefined | object
}

type StoreModalElementType = (typeof availableModals)[number]

export type ModalDataLookupType = {
	[M in StoreModalElementType as M["name"]]: M["data"]
}

export type AvailableModalsType = keyof ModalDataLookupType

export type ActiveModalType = {
	-readonly [K in keyof StoreModalElementType]: StoreModalElementType[K]
}
