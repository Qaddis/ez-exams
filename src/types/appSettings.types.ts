import type { InferOutput } from "valibot"

import { AppSettingsSchema } from "@/schemas/appSettings.schemas"

export type AppSettingsType = InferOutput<typeof AppSettingsSchema>
