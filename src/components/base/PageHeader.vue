<template>
	<h2 class="heading">
		<slot />
	</h2>
</template>

<style scoped>
.heading {
	width: 100%;
	background-color: var(--light-color);
	border-bottom: 2px solid var(--secondary-color);
	padding-bottom: 5px;

	font-size: 1.8rem;
	font-family: var(--comic-font);
	font-weight: bold;
	color: var(--primary-color);
	text-align: center;

	position: sticky;
	left: 0;
	top: 0;
	z-index: 10;

	box-shadow: 0 6.5px 4px -5px rgba(0, 0, 0, 0.45);
}
</style>
