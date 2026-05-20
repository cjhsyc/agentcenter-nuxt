<script setup lang="ts">
interface RelatedRow {
  id: string
  slug: string
  name: string
  nameZh?: string | null
  iconEmoji: string | null
  iconColor: string | null
}

const props = defineProps<{ related: RelatedRow[] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()

function labelFor(r: RelatedRow): string {
  if (locale.value === "zh" && r.nameZh) return r.nameZh
  return r.name
}
</script>

<template>
  <div
    v-if="props.related.length > 0"
    class="rounded-(--radius-card) border border-(--color-border) bg-(--color-card) p-6"
  >
    <h2 class="font-serif text-base font-semibold tracking-tight mb-4 text-(--color-ink)">
      {{ t("extensions.related") }}
    </h2>
    <ul class="space-y-3">
      <li v-for="r in props.related" :key="r.id">
        <NuxtLink
          :to="localePath(`/extensions/${r.slug}`)"
          class="group flex items-center gap-3 hover:text-(--color-accent)"
        >
          <span class="text-[18px]">{{ r.iconEmoji }}</span>
          <span class="flex-1 truncate text-[13px] font-medium">{{ labelFor(r) }}</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
