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
import type { GroupDataType, GroupRawType } from "@/types/groups.types"

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

			const groupSettings = JSON.parse(await readTextFile(groupSettFile))

			if (!safeParse(GroupSettingsSchema, groupSettings).success) continue

			groupsData.push(groupSettings)
		}

		return groupsData
	}

	/**
	 * Создаёт новую группу
	 * @param groupParams - объект, содержащий название и цвет группы
	 */
	async createGroup({ title, color }: GroupDataType): Promise<void> {
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
			JSON.stringify({ id, title, color }, null, 2)
		)
	}

	/**
	 * Удаляет группу по ID
	 * @param id - ID группы для удаления
	 */
	async removeGroup(id: GroupRawType["id"]): Promise<void> {
		const { groupsDir, isCreated } = await this.getGroupsDir()

		if (isCreated) return

		const groupDir = await join(groupsDir, id)
		if (await exists(groupsDir)) await remove(groupDir, { recursive: true })
	}
}

export default new GroupService()
