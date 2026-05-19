<script setup lang="ts">
import {
  pdtDisplayTitle,
  type McpDto,
  type PdtBlock,
  type ToolDto,
} from "~~/shared/mcp-panorama"
import McpTile from "./McpTile.vue"
import ToolGroupHeader from "./ToolGroupHeader.vue"

const props = defineProps<{
  pdt: PdtBlock
  activeMcpId: number | null
}>()
const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()

const { locale } = useI18n()
const title = computed(() => pdtDisplayTitle(props.pdt, locale.value))

const mcpCount = computed(() =>
  props.pdt.items.reduce((acc, t) => acc + t.mcps.length, 0),
)
</script>

<template>
  <div class="bg-(--color-bg) border border-(--color-border) rounded-lg p-2.5 flex flex-col gap-2">
    <div class="flex items-center justify-between gap-2">
      <span class="text-[12px] font-semibold text-(--color-ink) tracking-tight">{{ title }}</span>
      <span class="font-mono text-[10px] text-(--color-ink-muted)">{{ mcpCount }}</span>
    </div>
    <div class="flex flex-col gap-1.5">
      <div v-for="tool in pdt.items" :key="tool.id" class="flex flex-col gap-1">
        <ToolGroupHeader :tool="tool" />
        <div class="flex flex-wrap gap-1 pl-2">
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
      </div>
    </div>
  </div>
</template>
