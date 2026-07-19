import type { InferOutput } from "valibot"

import { GroupFormSchema, GroupSettingsSchema } from "@/schemas/groups.schemas"

export interface IGroup extends GroupFieldsType {
	isPinned: boolean
}

export type GroupRawType = InferOutput<typeof GroupSettingsSchema>
export type GroupFieldsType = Omit<GroupRawType, "createdAt" | "updatedAt">

export type GroupFormDataType = InferOutput<typeof GroupFormSchema>

export interface IGroupColor {
	name: string
	value: `#${string}`
}
