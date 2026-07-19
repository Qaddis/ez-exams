import { appDataDir, join } from "@tauri-apps/api/path"
import {
	exists,
	mkdir,
	readDir,
	readTextFile,
	remove,
	writeTextFile
} from "@tauri-apps/plugin-fs"

import { safeParse } from "valibot"

import { FunctionalFilesEnum } from "@/constants/files.constants"
import { GroupSettingsSchema } from "@/schemas/groups.schemas"
import type { GroupFormDataType, GroupRawType } from "@/types/groups.types"
import { ServiceError } from "@/utils/serviceError"

interface IGetGroupsDir {
	groupsDir: string
	isCreated: boolean
}

/**
 * Класс для работы с файлами и директориями "Groups"
 */
class GroupService {
	/**
	 * Возвращает путь до папки хранения групп
	 * @returns {IGetGroupsDir} путь до папки хранения групп и состояние (была ли создана в процессе вызова)
	 */
	private async getGroupsDir(): Promise<IGetGroupsDir> {
		let isCreated: boolean = false

		const baseDir = await appDataDir()
		if (!(await exists(baseDir))) {
			mkdir(baseDir)

			isCreated = true
		}

		const groupsDir = await join(baseDir, FunctionalFilesEnum.GROUPS_DIR)
		if (!(await exists(groupsDir))) {
			mkdir(groupsDir)

			isCreated = true
		}

		return { groupsDir: groupsDir, isCreated }
	}

	/**
	 * Возвращает массив групп
	 * @returns {GroupRawType[]} массив объектов групп
	 */
	async getAllGroups(): Promise<GroupRawType[]> {
		const { groupsDir, isCreated } = await this.getGroupsDir()

		if (isCreated) return []

		const groupsData: GroupRawType[] = []

		const groups = (await readDir(groupsDir)).filter(g => g.isDirectory)
		if (groups.length === 0) return []

		for (const { name: group } of groups) {
			const groupSettFile = await join(
				groupsDir,
				group,
				FunctionalFilesEnum.GROUP_SETTINGS_FILE
			)
			if (!(await exists(groupSettFile))) continue

			const rawData = JSON.parse(await readTextFile(groupSettFile))
			const groupSettings: GroupRawType = {
				...rawData,
				createdAt: new Date(rawData.createdAt),
				updatedAt: new Date(rawData.updatedAt)
			}

			if (!safeParse(GroupSettingsSchema, groupSettings).success) continue

			groupsData.push(groupSettings)
		}

		groupsData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

		return groupsData
	}

	/**
	 * Создаёт новую группу
	 * @param groupParams - объект, содержащий название и цвет группы
	 */
	async createGroup({ title, color }: GroupFormDataType): Promise<void> {
		const { groupsDir } = await this.getGroupsDir()
		const groups = await this.getAllGroups()

		let id: string
		do
			id = Array.from({ length: 8 }, () =>
				Math.floor(Math.random() * 16).toString(16)
			)
				.join("")
				.toUpperCase()
		while (groups.some(g => g.id === id))

		const groupDir = await join(groupsDir, id)
		await mkdir(groupDir)

		const groupSettFile = await join(
			groupDir,
			FunctionalFilesEnum.GROUP_SETTINGS_FILE
		)

		await writeTextFile(
			groupSettFile,
			JSON.stringify(
				{ id, title, color, createdAt: new Date(), updatedAt: new Date() },
				null,
				2
			)
		)
	}

	/**
	 * Удаляет группу по ID
	 * @param id - ID группы для удаления
	 */
	async removeGroup(id: GroupRawType["id"]): Promise<void> {
		const { groupsDir, isCreated } = await this.getGroupsDir()

		if (isCreated)
			throw new ServiceError(
				"groups-remove:non-exists",
				"Группа с указанным ID не существует"
			)

		const groupDir = await join(groupsDir, id)
		if (await exists(groupsDir)) await remove(groupDir, { recursive: true })
	}

	/**
	 * Изменяет параметры группы по ID
	 * @param id ID группы
	 * @param newParams новые параметры группы
	 */
	async editGroup(
		id: GroupRawType["id"],
		{ title, color, createdAt }: Omit<GroupRawType, "id" | "updatedAt">
	): Promise<void> {
		const { groupsDir, isCreated } = await this.getGroupsDir()

		if (isCreated)
			throw new ServiceError(
				"groups-edit:non-exists",
				"Группа с указанным ID не существует"
			)

		const groupDirSettFile = await join(
			groupsDir,
			id,
			FunctionalFilesEnum.GROUP_SETTINGS_FILE
		)
		if (!(await exists(groupDirSettFile)))
			throw new ServiceError(
				"groups-edit:non-exists",
				"Группа с указанным ID не существует"
			)

		const rawSettings = JSON.parse(await readTextFile(groupDirSettFile))
		const oldSettings: GroupRawType = {
			...rawSettings,
			createdAt: new Date(rawSettings.createdAt),
			updatedAt: new Date(rawSettings.updatedAt)
		}

		if (!safeParse(GroupSettingsSchema, oldSettings).success)
			throw new ServiceError(
				"groups-edit:non-valid",
				"Файл настроек группы не валиден"
			)

		await writeTextFile(
			groupDirSettFile,
			JSON.stringify(
				{ id: oldSettings.id, title, color, updatedAt: new Date(), createdAt },
				null,
				2
			)
		)
	}
}

export default new GroupService()
