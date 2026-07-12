import type { InferOutput } from "valibot"

import { GroupSettingsSchema } from "@/schemas/groups.schemas"

export interface IGroup extends GroupRawType {
	isPinned: boolean
}

export type GroupRawType = InferOutput<typeof GroupSettingsSchema>

export interface IGroupColor {
	name: string
	value: `#${string}`
}
