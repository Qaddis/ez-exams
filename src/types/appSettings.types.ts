import type { InferOutput } from "valibot"

import { sortingVariants } from "@/constants/appSettings.constants"
import { AppSettingsSchema } from "@/schemas/appSettings.schemas"

export type AppSettingsType = InferOutput<typeof AppSettingsSchema>

export type SortVariantType = (typeof sortingVariants)[number]
