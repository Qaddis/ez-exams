import * as v from "valibot"

export const TICKET_TITLE_MAX_LEN = 40

export const TicketMetadataSchema = v.object({
	id: v.pipe(v.number(), v.integer()),
	title: v.pipe(v.string(), v.nonEmpty()),
	createdAt: v.pipe(v.string(), v.isoTimestamp()),
	updatedAt: v.pipe(v.string(), v.isoTimestamp())
})

export const TicketTitleSchema = v.pipe(
	v.string(),
	v.nonEmpty("Название билета не может быть пустым"),
	v.minLength(3, "Название билета должно содержать хотя бы 3 символа"),
	v.maxLength(
		TICKET_TITLE_MAX_LEN,
		`Название билета должно содержать не более ${TICKET_TITLE_MAX_LEN} символов`
	)
)
