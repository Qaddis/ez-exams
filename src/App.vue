<script setup lang="ts">
import { RouterView } from "vue-router"

import AppSidebar from "@/components/layout/AppSidebar.vue"
</script>

<template>
	<div class="wrapper">
		<app-sidebar />

		<main class="main">
			<router-view />
		</main>
	</div>
</template>

<style scoped></style>
