import * as v from "valibot"

import { groupColors } from "@/constants/groups.constants"

export const GroupSettingsSchema = v.object({
	id: v.string(),
	color: v.picklist(groupColors.map(c => c.value)),
	title: v.pipe(v.string(), v.minLength(3), v.maxLength(32))
})
