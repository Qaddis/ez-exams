export const NavigationEnum = {
	HOME: "/",
	GROUPS: {
		ALL: "/groups",
		CURRENT: "/groups/" // + groupId
	},
	SETTINGS: "/settings",
	TICKET: "/groups/", // + groupId + ticketId
	EXAM: "/exam/" // + groupId
} as const
