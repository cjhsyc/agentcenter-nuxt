<script setup lang="ts">
import {
  toolDisplayName,
  type McpDto,
  type ToolDto,
} from "~~/shared/mcp-panorama"
import McpTile from "./McpTile.vue"

const props = defineProps<{
  tool: ToolDto
  activeMcpId: number | null
}>()

const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()

const { locale, t } = useI18n()

const toolName = computed(() => toolDisplayName(props.tool, locale.value))

// Real (non-placeholder) MCPs only — placeholder tools shouldn't claim "×1".
const realMcpCount = computed(
  () => props.tool.mcps.filter((m) => !m.isPlaceholder).length,
)

const rollupDotClass = computed(() => {
  switch (props.tool.rollupStatus) {
    case "released":
      return "bg-(--color-status-released)"
    case "dev":
      return "bg-(--color-status-dev)"
    default:
      return "bg-(--color-status-none)"
  }
})

const rollupAriaLabel = computed(() =>
  t(`mcpPanorama.status.${props.tool.rollupStatus}.label`),
)
</script>

<template>
  <article
    class="bg-(--color-card) border border-(--color-border)/60 rounded-lg shadow-[0_1px_2px_rgba(60,40,20,0.04)] px-3 py-2.5 flex flex-col gap-1.5 transition hover:shadow-[0_2px_6px_rgba(60,40,20,0.07)] hover:border-(--color-border)"
  >
    <header class="flex items-center gap-2 min-w-0">
      <span class="font-serif text-[13.5px] font-medium tracking-tight text-(--color-ink) truncate">
        {{ toolName }}
      </span>
      <span
        v-if="realMcpCount > 1"
        class="font-mono text-[9px] text-(--color-ink-muted) shrink-0"
        :aria-label="`${realMcpCount} MCPs`"
      >×{{ realMcpCount }}</span>
      <span
        class="ml-auto size-[6px] rounded-full shrink-0"
        :class="rollupDotClass"
        :aria-label="rollupAriaLabel"
      />
    </header>
    <div class="flex flex-wrap gap-1.5">
      <McpTile
        v-for="mcp in tool.mcps"
        :key="mcp.id"
        :tool="tool"
        :mcp="mcp"
        :active="activeMcpId === mcp.id"
        compact
        @pick="(p) => emit('pick', p)"
      />
    </div>
  </article>
</template>
