<script setup lang="ts">
import type { McpDto, SectorGroup, ToolDto } from "~~/shared/mcp-panorama"
import CardHeader from "./CardHeader.vue"
import McpTile from "./McpTile.vue"
import ToolGroupHeader from "./ToolGroupHeader.vue"

defineProps<{
  group: SectorGroup
  activeMcpId: number | null
}>()
const emit = defineEmits<{ pick: [{ tool: ToolDto; mcp: McpDto }] }>()
</script>

<template>
  <article class="bg-(--color-card) border border-(--color-border) rounded-xl p-3.5 flex flex-col gap-3">
    <CardHeader :group="group" />
    <div class="flex flex-col gap-2">
      <div v-for="tool in group.items" :key="tool.id" class="flex flex-col gap-1">
        <ToolGroupHeader :tool="tool" />
        <div class="flex flex-wrap gap-1.5 pl-2">
          <McpTile
            v-for="mcp in tool.mcps"
            :key="mcp.id"
            :tool="tool"
            :mcp="mcp"
            :active="activeMcpId === mcp.id"
            @pick="(p) => emit('pick', p)"
          />
        </div>
      </div>
    </div>
  </article>
</template>
