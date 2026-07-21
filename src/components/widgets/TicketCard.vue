<script setup lang="ts">
import { RouterLink } from "vue-router"

import { safeParse } from "valibot"

import { NavigationEnum } from "@/constants/navigation.constants"
import {
	TICKET_TITLE_MAX_LEN,
	TicketTitleSchema
} from "@/schemas/tickets.schemas"
import ticketsService from "@/services/tickets.service"
import { useModalsStore } from "@/stores/modals.store"
import type { TicketMetadataType } from "@/types/tickets.types"
import { getLocaleDate } from "@/utils/formatDates"
import { getServiceErrorData } from "@/utils/serviceError"

import DeleteIcon from "@/assets/icons/delete.svg"

interface IProps {
	data: TicketMetadataType
	groupId: string
	refreshFunc: () => Promise<void>
}

const props = defineProps<IProps>()

const { openModal } = useModalsStore()

const deleteTicket = async (): Promise<void> => {
	openModal("deleteTicket", {
		groupId: props.groupId,
		ticketId: props.data.id,
		onSuccess: props.refreshFunc
	})
}

const onBlur = async (evt: Event): Promise<void> => {
	const el = evt.target as HTMLElement
	const newTitle = el.innerText.trim()

	if (newTitle === props.data.title) return

	if (!safeParse(TicketTitleSchema, newTitle).success) {
		el.innerText = props.data.title
		return
	}

	try {
		await ticketsService.changeTicketTitle(
			props.groupId,
			props.data.id,
			newTitle
		)

		await props.refreshFunc()
	} catch (error) {
		console.error(
			"Ошибка при изменении названия билета:",
			getServiceErrorData(error).message
		)
	}
}

const onInput = (evt: Event): void => {
	const el = evt.target as HTMLElement
	const text = el.innerText

	if (text.length > TICKET_TITLE_MAX_LEN) {
		const clippedText = text.slice(0, TICKET_TITLE_MAX_LEN)
		el.innerText = clippedText

		const range = document.createRange()
		const selection = document.getSelection()

		range.selectNodeContents(el)
		range.collapse(false)

		selection?.removeAllRanges()
		selection?.addRange(range)
	}
}
</script>

<template>
	<li class="ticket">
		<router-link
			:to="NavigationEnum.TICKET + `${groupId}/${data.id}`"
			class="link"
		/>

		<span
			class="title"
			contenteditable="plaintext-only"
			@keydown.enter.prevent="evt => (evt.target as HTMLElement).blur()"
			@input="onInput"
			@blur="onBlur"
		>
			{{ data.title }}
		</span>

		<div class="controls">
			<ul class="dates">
				<li><b>Изменен</b>: {{ getLocaleDate(data.updatedAt) }}</li>
				<li><b>Создан:</b> {{ getLocaleDate(data.createdAt) }}</li>
			</ul>

			<button @click="deleteTicket" class="delete-btn">
				<delete-icon />
			</button>
		</div>
	</li>
</template>

<style scoped>
.ticket {
	width: 100%;
	height: 62.5px;
	padding: 7.5px;
	box-shadow: 0 1.5px 5px 2.5px rgba(0, 0, 0, 0.3);
	border-radius: 5px;

	display: flex;
	justify-content: space-between;
	align-items: flex-start;

	position: relative;

	transition:
		box-shadow 0.25s,
		background-color 0.25s;
}

.ticket:hover {
	box-shadow: none;
	background-color: rgba(0, 0, 0, 0.1);
}

.title {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	text-overflow: ellipsis;
	overflow: hidden;

	max-width: 350px;
	padding: 2.5px;
	border-radius: 5px;
	background-color: transparent;

	font-family: var(--comic-font);
	font-size: 1.1rem;
	line-height: 1.1;

	z-index: 2;
}

.title:focus {
	display: block;
	overflow: visible;
	position: relative;
	outline: none;
}

.ticket:focus-within {
	z-index: 5;
}

.title:focus::before {
	content: "";

	position: absolute;
	left: 0;
	top: 0;
	z-index: -1;

	display: block;
	width: calc(100% + 4px);
	height: calc(100% + 4px);

	border-radius: 5px;
	background-color: var(--light-color);
	border: 2px solid var(--accent-color);
}

.title::selection {
	background-color: var(--accent-color);
	color: var(--light-color);
}

.even {
	background-color: rgba(0, 0, 0, 0.1);
}

.link {
	position: absolute;
	top: 0;
	left: 0;

	width: 100%;
	height: 100%;
}

.controls {
	display: flex;
	align-items: center;
	gap: 15px;
}

.dates b {
	font-weight: 500;
}

.delete-btn {
	width: 45px;
	height: 45px;
	z-index: 2;
}

.delete-btn svg {
	width: 100%;
	fill: var(--primary-color);
}

.delete-btn:hover svg {
	fill: var(--danger-color);
}

@container tickets (max-width: 700px) {
	.title {
		max-width: 225px;
	}
}
</style>
