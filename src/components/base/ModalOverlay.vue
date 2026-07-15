<script setup lang="ts">
import { AnimatePresence, motion } from "motion-v"

import { useModalsStore } from "@/stores/modals.store"
import type { AvailableModalsType } from "@/types/modals.types"

interface IProps {
	modalName: AvailableModalsType
	closeFunc: () => void
}

const props = defineProps<IProps>()

const modalsStore = useModalsStore()
</script>

<template>
	<animate-presence>
		<motion.div
			v-if="modalsStore.modal?.name === modalName"
			@click="closeFunc"
			class="overlay"
			:initial="{ opacity: 0 }"
			:animate="{ opacity: 1 }"
			:exit="{ opacity: 0 }"
		>
			<button @click="closeFunc" class="close-btn" title="Закрыть">
				&times;
			</button>

			<motion.div
				@click="evt => evt.stopPropagation()"
				class="modal"
				:initial="{ translateY: '10%' }"
				:animate="{ translateY: 0 }"
				:exit="{ translateY: '10%' }"
			>
				<slot />
			</motion.div>
		</motion.div>
	</animate-presence>
</template>

<style scoped>
.overlay {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 10;

	width: 100vw;
	height: 100vh;
	background-color: rgba(0, 0, 0, 0.55);

	display: flex;
	align-items: center;
	justify-content: center;
}

.modal {
	max-width: 720px;
	min-width: 420px;
	max-height: 60vh;
	background-color: var(--light-color);
	border: 3px solid var(--secondary-color);
	border-radius: 10px;
	padding: 15px;

	z-index: 11;
}

.close-btn {
	position: fixed;
	right: 20px;
	top: 20px;

	font-size: 2.5rem;
	line-height: 0.6;
	color: var(--light-color);
}
</style>
