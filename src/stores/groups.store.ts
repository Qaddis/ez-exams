import { computed, onMounted, ref } from "vue"

import { defineStore } from "pinia"

import groupsService from "@/services/groups.service"
import type {
	GroupFormDataType,
	GroupRawType,
	IGroup
} from "@/types/groups.types"
import { useSettingsStore } from "./appSettings.store"

export const useGroupsStore = defineStore("groups-store", () => {
	const settingsStore = useSettingsStore()

	const rawGroups = ref<GroupRawType[]>([])
	const pinnedGroupsIds = computed<GroupRawType["id"][]>(
		() => settingsStore.settings?.pinnedGroups ?? []
	)

	const isLoading = ref<boolean>(false)

	const groups = computed<IGroup[]>(() => {
		return rawGroups.value.map(g => ({
			...g,
			isPinned: pinnedGroupsIds.value.includes(g.id)
		}))
	})
	const bookmarkedGroups = computed<IGroup[]>(() => {
		if (pinnedGroupsIds.value.length === 0) return []

		return pinnedGroupsIds.value
			.map(id => groups.value.find(g => g.id === id))
			.filter(g => g !== undefined)
	})

	/**
	 * Загружает группы в groups state
	 * @param force Принудительная перезапись списка групп
	 */
	async function loadGroups(force: boolean = false) {
		isLoading.value = true

		try {
			const [_, groupsData] = await Promise.all([
				settingsStore.loadSettings(),
				rawGroups.value.length === 0 || force
					? groupsService.getAllGroups()
					: Promise.resolve(rawGroups.value)
			])

			rawGroups.value = groupsData
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
	async function createGroup(newGroup: GroupFormDataType) {
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

		if (!isPinned && pinnedGroupsIds.value.length >= 3) return

		const updatedPins = isPinned
			? pinnedGroupsIds.value.filter(g => g !== id)
			: [...pinnedGroupsIds.value, id]

		try {
			await settingsStore.changeSettings({ pinnedGroups: updatedPins })
		} catch (error) {
			console.error("Ошибка при обновлении закреплений:", error)
		}
	}

	/**
	 * Изменяет группу по её ID
	 * @param id ID группы
	 * @param newParams Новые параметры группы
	 */
	async function editGroup(
		id: GroupRawType["id"],
		newParams: GroupFormDataType
	) {
		try {
			await groupsService.editGroup(id, newParams)

			await refreshGroups()
		} catch (error) {
			console.error("Ошибка при изменении параметров группы:", error)
		}
	}

	onMounted(() => loadGroups())

	return {
		groups,
		bookmarkedGroups,
		isLoading,
		loadGroups,
		createGroup,
		removeGroup,
		togglePinGroup,
		editGroup
	}
})
