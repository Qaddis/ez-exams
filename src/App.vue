<script setup lang="ts">
import { RouterView } from "vue-router"

import AppSidebar from "@/components/common/TheSidebar.vue"
import ModalsLayout from "./components/common/ModalsLayout.vue"
</script>

<template>
	<div class="wrapper">
		<app-sidebar />

		<main class="main">
			<router-view />
		</main>
	</div>

	<modals-layout />
</template>

<style scoped>
.wrapper {
	width: 100vw;
	height: 100vh;
	padding: 15px;

	display: flex;
	gap: 25px;
}

.main {
	flex-grow: 1;
}
</style>
