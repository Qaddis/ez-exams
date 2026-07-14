import { computed, ref } from "vue"

import { defineStore } from "pinia"

import appSettingsService from "@/services/appSettings.service"
import groupsService from "@/services/groups.service"
import type { GroupDataType, GroupRawType, IGroup } from "@/types/groups.types"

export const useGroupsStore = defineStore("groups-store", () => {
	const rawGroups = ref<GroupRawType[]>([])
	const pinnedGroupsIds = ref<GroupRawType["id"][]>([])

	const isLoading = ref<boolean>(false)
	const groups = computed<IGroup[]>(() => {
		return rawGroups.value.map(g => ({
			...g,
			isPinned: pinnedGroupsIds.value.includes(g.id)
		}))
	})

	/**
	 * Загружает группы в groups state
	 */
	async function loadGroups() {
		isLoading.value = true

		try {
			const [groupsData, { pinnedGroups }] = await Promise.all([
				groupsService.getAllGroups(),
				appSettingsService.getSettings()
			])

			rawGroups.value = groupsData
			pinnedGroupsIds.value = pinnedGroups
		} catch (error) {
			console.error("Ошибка при загрузке групп:", error)
		} finally {
			isLoading.value = false
		}
	}

	/**
	 * Вспомогательный метод для обновления списка групп
	 */
	async function refreshGroups() {
		try {
			rawGroups.value = await groupsService.getAllGroups()
		} catch (error) {
			console.error("Ошибка при обновлении списка групп:", error)
		}
	}

	/**
	 * Создаёт новую группу и обновляет список групп в groups store
	 * @param newGroup параметры новой группы
	 */
	async function createGroup(newGroup: GroupDataType) {
		try {
			await groupsService.createGroup(newGroup)

			await refreshGroups()
		} catch (error) {
			console.error("Ошибка при создании группы:", error)
		}
	}

	/**
	 * Удаляет группу по ID и обновляет список групп в groups store
	 * @param id ID группы
	 */
	async function removeGroup(id: GroupRawType["id"]) {
		try {
			await groupsService.removeGroup(id)

			if (pinnedGroupsIds.value.includes(id)) await togglePinGroup(id)

			await refreshGroups()
		} catch (error) {
			console.error("Ошибка при удалении группы:", error)
		}
	}

	/**
	 * Обновляет статус "закрепления" группы по ID
	 * @param id ID группы
	 */
	async function togglePinGroup(id: GroupRawType["id"]) {
		const isPinned = pinnedGroupsIds.value.includes(id)

		const updatedPins = isPinned
			? pinnedGroupsIds.value.filter(g => g !== id)
			: [...pinnedGroupsIds.value, id]

		try {
			await appSettingsService.changeSettings({ pinnedGroups: updatedPins })

			pinnedGroupsIds.value = updatedPins
		} catch (error) {
			console.error("Ошибка при обновлении закреплений:", error)
		}
	}

	return {
		groups,
		isLoading,
		loadGroups,
		createGroup,
		removeGroup,
		togglePinGroup
	}
})
