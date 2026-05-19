<script setup lang="ts">
import { toolDisplayName, type ToolDto } from "~~/shared/mcp-panorama"

const props = defineProps<{ tool: ToolDto }>()

const { locale } = useI18n()
const displayName = computed(() => toolDisplayName(props.tool, locale.value))

// Real (non-placeholder) MCPs only — when a tool ships zero MCPs we don't
// want a misleading "×1" hint next to the placeholder tile.
const realMcpCount = computed(
  () => props.tool.mcps.filter((m) => !m.isPlaceholder).length,
)
</script>

<template>
  <div class="flex items-baseline gap-1.5 min-w-0">
    <span class="text-[11px] font-semibold tracking-tight truncate text-(--color-ink)">
      {{ displayName }}
    </span>
    <span
      v-if="realMcpCount > 1"
      class="font-mono text-[9px] text-(--color-ink-muted) shrink-0"
      :aria-label="`${realMcpCount} MCPs`"
    >×{{ realMcpCount }}</span>
  </div>
</template>
