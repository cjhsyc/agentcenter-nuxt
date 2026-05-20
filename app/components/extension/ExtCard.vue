<script setup lang="ts">
import { Building2, Download, Star } from "lucide-vue-next"
import { deptPath, MY_DEPT_ID } from "~~/shared/data/departments"
import { tagLabel } from "~~/shared/tags"
import type { ExtensionListItem } from "~~/shared/db/queries-types"
import type { Locale } from "~~/shared/types"

const props = defineProps<{ ext: ExtensionListItem }>()

const { locale } = useI18n()
const localePath = useLocalePath()

const TAG_VISIBLE_LIMIT = 3

const BADGE_LABEL = { official: "Official", popular: "Popular", new: "New" } as const
const BADGE_CLASS = {
  official: "badge-official",
  popular: "badge-popular",
  new: "badge-new",
} as const

const name = computed(() =>
  locale.value === "zh" && props.ext.nameZh ? props.ext.nameZh : props.ext.name,
)
const desc = computed(() =>
  locale.value === "zh" && props.ext.descriptionZh
    ? props.ext.descriptionZh
    : props.ext.description,
)

const deptTrail = computed(() =>
  props.ext.deptId ? deptPath(props.ext.deptId, locale.value as Locale) : null,
)
const deptLeaf = computed(() =>
  deptTrail.value && deptTrail.value.length > 0
    ? deptTrail.value[deptTrail.value.length - 1]
    : null,
)
const isMine = computed(() => {
  const id = props.ext.deptId
  if (!id) return false
  return id === MY_DEPT_ID || id.startsWith(`${MY_DEPT_ID}.`)
})

const visibleTags = computed(() => props.ext.tagIds.slice(0, TAG_VISIBLE_LIMIT))
const hiddenTagCount = computed(() =>
  Math.max(0, props.ext.tagIds.length - TAG_VISIBLE_LIMIT),
)

function formatCount(n: number): string {
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`
}
</script>

<template>
  <article
    class="group relative flex flex-col gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-card) p-[18px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-(--color-accent)/30 hover:shadow-[0_2px_10px_-4px_oklch(0_0_0_/_0.08)]"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-[8px] border-[1.5px] text-[18px]"
        :style="{
          background: `${ext.iconColor ?? '#888'}1c`,
          borderColor: `${ext.iconColor ?? '#888'}33`,
        }"
      >
        {{ ext.iconEmoji }}
      </div>
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <NuxtLink
          :to="localePath(`/extensions/${ext.slug}`)"
          class="truncate text-[15px] font-semibold tracking-tight transition-colors hover:text-(--color-accent) after:absolute after:inset-0 after:content-['']"
        >
          {{ name }}
        </NuxtLink>
        <span
          v-if="ext.badge"
          class="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold"
          :class="BADGE_CLASS[ext.badge]"
        >
          {{ BADGE_LABEL[ext.badge] }}
        </span>
      </div>
    </div>

    <p
      v-if="desc"
      class="text-(--color-ink-muted) text-[13px] leading-[1.55] overflow-hidden"
      style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;"
    >
      {{ desc }}
    </p>

    <div
      v-if="deptLeaf"
      class="inline-flex items-center gap-1.5 text-[11px]"
      :class="isMine ? 'text-(--color-accent)' : 'text-(--color-ink-muted)'"
    >
      <Building2 :size="11" aria-hidden="true" />
      <span class="truncate font-semibold">{{ deptLeaf }}</span>
    </div>

    <div v-if="visibleTags.length > 0" class="flex flex-wrap items-center gap-1">
      <span
        v-for="tag in visibleTags"
        :key="tag"
        class="rounded border border-(--color-border) px-1.5 py-0.5 font-mono text-[11px] font-semibold text-(--color-ink-muted)"
      >
        #{{ tagLabel(tag, locale as Locale) }}
      </span>
      <span
        v-if="hiddenTagCount > 0"
        class="rounded border border-(--color-border)/60 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-(--color-ink-muted)/70"
      >
        +{{ hiddenTagCount }}
      </span>
    </div>

    <div class="mt-auto flex items-center gap-3 pt-1">
      <div class="flex items-center gap-1">
        <Star :size="12" class="fill-amber-500 text-amber-500" aria-hidden="true" />
        <span class="font-mono text-[12px] font-semibold">{{ Number(ext.starsAvg).toFixed(1) }}</span>
      </div>
      <div class="flex items-center gap-1">
        <Download :size="12" class="text-(--color-ink-muted)" aria-hidden="true" />
        <span class="text-(--color-ink-muted) font-mono text-[12px]">
          {{ formatCount(ext.downloadsCount) }}
        </span>
      </div>
      <div class="relative z-10 ml-auto">
        <InstallButton :extension-id="ext.id" size="sm" />
      </div>
    </div>
  </article>
</template>
