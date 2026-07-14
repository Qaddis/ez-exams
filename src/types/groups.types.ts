import type { InferOutput } from "valibot"

import { GroupFormSchema, GroupSettingsSchema } from "@/schemas/groups.schemas"

export interface IGroup extends GroupRawType {
	isPinned: boolean
}

export type GroupRawType = InferOutput<typeof GroupSettingsSchema>

export type GroupDataType = InferOutput<typeof GroupFormSchema>

export interface IGroupColor {
	name: string
	value: `#${string}`
}
