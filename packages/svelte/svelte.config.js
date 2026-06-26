import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// Preprocess handles `<script lang="ts">` for both svelte-package (build) and svelte-check.
export default {
  preprocess: vitePreprocess(),
}
