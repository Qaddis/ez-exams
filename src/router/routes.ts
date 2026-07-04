import type { RouteRecordRaw } from "vue-router"

import { NavigationEnum } from "@/constants/navigation.constants"

import ExamView from "@/views/ExamView.vue"
import GroupsView from "@/views/GroupsView.vue"
import GroupView from "@/views/GroupView.vue"
import HomeView from "@/views/HomeView.vue"
import SettingsView from "@/views/SettingsView.vue"
import TicketView from "@/views/TicketView.vue"

export const routes: RouteRecordRaw[] = [
	{
		path: NavigationEnum.HOME,
		component: HomeView,
		name: "Home"
	},
	{
		path: NavigationEnum.GROUPS.ALL,
		component: GroupsView,
		name: "Groups"
	},
	{
		path: NavigationEnum.GROUPS.CURRENT + ":groupId",
		component: GroupView,
		name: "Group"
	},
	{
		path: NavigationEnum.TICKET + ":groupId/:ticketId",
		component: TicketView,
		name: "Ticket"
	},
	{
		path: NavigationEnum.EXAM + ":groupId",
		component: ExamView,
		name: "Exam"
	},
	{
		path: NavigationEnum.SETTINGS,
		component: SettingsView,
		name: "Settings"
	}
]
