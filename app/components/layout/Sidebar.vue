<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  Command,
  Globe2,
  Plug,
  Zap,
} from "lucide-vue-next"
import { FUNC_CAT_COLORS, FUNC_TAXONOMY } from "~~/shared/taxonomy"
import type { Component } from "vue"

defineProps<{ collapsed: boolean }>()

const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

type Category = "skills" | "mcp" | "slash" | "plugins"

const BROWSE_ITEMS: { key: Category; labelKey: string; Icon: Component }[] = [
  { key: "skills", labelKey: "sidebar.skills", Icon: Zap },
  { key: "mcp", labelKey: "sidebar.mcpServers", Icon: Globe2 },
  { key: "slash", labelKey: "sidebar.slashCommands", Icon: Command },
  { key: "plugins", labelKey: "sidebar.plugins", Icon: Plug },
]

const activeCategory = computed<Category | null>(() => {
  const raw = route.query.category
  if (typeof raw === "string" && ["skills", "mcp", "slash", "plugins"].includes(raw)) {
    return raw as Category
  }
  return null
})

const activeFuncCat = computed(() => (typeof route.query.funcCat === "string" ? route.query.funcCat : null))
const activeSubCat = computed(() => (typeof route.query.subCat === "string" ? route.query.subCat : null))
const activeL2 = computed(() => (typeof route.query.l2 === "string" ? route.query.l2 : null))

function buildHref(updates: Record<string, string | null>): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(route.query)) {
    if (typeof v === "string" && k !== "page") params.set(k, v)
  }
  for (const [k, v] of Object.entries(updates)) {
    if (v === null) params.delete(k)
    else params.set(k, v)
  }
  const qs = params.toString()
  const path = localePath("/extensions")
  return qs ? `${path}?${qs}` : path
}
</script>

<template>
  <div v-if="!collapsed" class="min-w-[200px] flex-1 overflow-y-auto px-5 py-3 text-(--color-ink)">
    <!-- Browse -->
    <h2 class="px-2 pb-1.5 font-serif text-[12px] italic tracking-wide text-(--color-ink-muted)">
      {{ t("sidebar.browse") }}
    </h2>
    <div class="flex flex-col gap-px">
      <NuxtLink
        v-for="item in BROWSE_ITEMS"
        :key="item.key"
        :to="buildHref({ category: item.key === activeCategory ? null : item.key })"
        class="flex w-full items-center gap-2.5 rounded-md border-l-2 px-2 py-1.5 text-[15px] font-medium text-(--color-ink) transition hover:bg-(--color-card)"
        :class="activeCategory === item.key ? 'border-l-(--color-ink) bg-(--color-sidebar)/60 font-semibold' : 'border-transparent'"
      >
        <component :is="item.Icon" :size="16" class="shrink-0" />
        <span class="flex-1 truncate">{{ t(item.labelKey) }}</span>
      </NuxtLink>
    </div>

    <div class="bg-(--color-border) mx-1 my-3 h-px" />

    <!-- Function types -->
    <h2 class="px-2 pb-1.5 font-serif text-[12px] italic tracking-wide text-(--color-ink-muted)">
      {{ t("sidebar.categories") }}
    </h2>
    <div class="flex flex-col gap-px">
      <div v-for="cat in FUNC_TAXONOMY" :key="cat.key">
        <NuxtLink
          :to="buildHref({ funcCat: activeFuncCat === cat.key && !activeSubCat && !activeL2 ? null : cat.key, subCat: null, l2: null })"
          class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[15px] font-semibold transition hover:bg-(--color-card)"
          :class="activeFuncCat === cat.key && !activeSubCat && !activeL2 ? 'bg-(--color-sidebar)/60 text-(--color-ink)' : 'text-(--color-ink)'"
          :aria-expanded="activeFuncCat === cat.key"
        >
          <span class="size-[9px] shrink-0 rounded-sm" :style="{ background: FUNC_CAT_COLORS[cat.key] }" />
          <span class="flex-1">{{ t(`taxonomy.funcCat.${cat.key}`) }}</span>
          <ChevronDown v-if="activeFuncCat === cat.key" :size="14" class="shrink-0 text-(--color-ink-muted)" aria-hidden="true" />
          <ChevronRight v-else :size="14" class="shrink-0 text-(--color-ink-muted)" aria-hidden="true" />
        </NuxtLink>

        <div v-if="activeFuncCat === cat.key">
          <div v-for="l1 in cat.l1" :key="l1.key" class="ml-2">
            <NuxtLink
              :to="buildHref({ funcCat: cat.key, subCat: activeSubCat === l1.key ? null : l1.key, l2: null })"
              class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13.5px] font-medium hover:bg-(--color-card)"
              :class="activeSubCat === l1.key && !activeL2 ? 'bg-(--color-sidebar)/60 text-(--color-ink) font-semibold' : 'text-(--color-ink)'"
              :aria-expanded="l1.l2.length > 0 ? activeSubCat === l1.key : undefined"
            >
              <span
                class="w-[1.5px] shrink-0 self-stretch rounded"
                :style="{ background: FUNC_CAT_COLORS[cat.key], opacity: activeSubCat === l1.key && !activeL2 ? 1 : 0.35 }"
              />
              <span class="flex-1">{{ t(`taxonomy.l1.${l1.key}`) }}</span>
              <template v-if="l1.l2.length > 0">
                <ChevronDown v-if="activeSubCat === l1.key" :size="13" class="shrink-0 text-(--color-ink-muted)" aria-hidden="true" />
                <ChevronRight v-else :size="13" class="shrink-0 text-(--color-ink-muted)" aria-hidden="true" />
              </template>
            </NuxtLink>

            <div v-if="activeSubCat === l1.key">
              <NuxtLink
                v-for="l2key in l1.l2"
                :key="l2key"
                :to="buildHref({ funcCat: cat.key, subCat: l1.key, l2: activeL2 === l2key ? null : l2key })"
                class="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 pl-6 text-left text-[13px] hover:bg-(--color-card)"
                :class="activeL2 === l2key ? 'bg-(--color-sidebar)/60 text-(--color-ink) font-semibold' : 'text-(--color-ink)/85'"
              >
                <span class="bg-(--color-ink-muted) size-[3px] shrink-0 rounded-full" />
                {{ t(`taxonomy.l2.${l2key}`) }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
