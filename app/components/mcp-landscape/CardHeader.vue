<script setup lang="ts">
import { groupDisplayTitle, type Group } from "~~/shared/mcp-panorama"

const props = defineProps<{ group: Group }>()

const emit = defineEmits<{ drill: [] }>()

const { locale, t } = useI18n()
const displayTitle = computed(() => groupDisplayTitle(props.group, locale.value))
</script>

<template>
  <header class="flex items-baseline justify-between gap-3 min-w-0">
    <h3 class="m-0 min-w-0">
      <button
        type="button"
        class="flex items-baseline gap-2 min-w-0 bg-transparent border-0 p-0 cursor-pointer text-left text-(--color-ink) hover:underline underline-offset-4 decoration-(--color-ink-muted) transition-colors"
        :title="t('mcpPanorama.card.drillIn', { name: displayTitle })"
        @click="emit('drill')"
      >
        <span class="font-serif text-[18px] font-medium tracking-tight truncate">
          {{ displayTitle }}
        </span>
        <span class="font-mono text-[11px] text-(--color-ink-muted) shrink-0">
          {{ group.stats.total }}
        </span>
      </button>
    </h3>
    <span class="font-mono text-[11px] text-(--color-ink-muted) shrink-0 tabular-nums">
      <span class="text-(--color-ink)">{{ group.stats.counts.released }}</span>/{{ group.stats.total }}
      <span class="opacity-70">{{ t("mcpPanorama.card.releasedShort") }}</span>
    </span>
  </header>
</template>
