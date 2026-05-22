<script setup lang="ts">
import { ArrowRight, Search, Sparkles } from "lucide-vue-next"
import type { HomeTabKey } from "./HomeTabs.vue"
import type { ExtensionListItem } from "~~/shared/db/queries-types"
import type { TagFacet } from "~~/shared/types"

const { t } = useI18n()
const localePath = useLocalePath()

const activeTab = ref<HomeTabKey>("popular")
const sortFor: Record<HomeTabKey, "downloads" | "stars" | "recent"> = {
  popular: "downloads",
  topRated: "stars",
  recent: "recent",
}

const { data: gridData } = await useFetch("/api/internal/extensions", {
  key: "home-discovery-extensions",
  query: computed(() => ({ category: "skills", sort: sortFor[activeTab.value] })),
  default: () => ({
    items: [] as ExtensionListItem[],
    total: 0,
    filters: {},
  }),
})

const { data: facetsData } = await useFetch("/api/internal/facets", {
  key: "home-discovery-facets",
  default: () => ({
    creators: [],
    publishers: [],
    tags: [] as TagFacet[],
  }),
})

const items = computed(() => gridData.value.items.slice(0, 12))
const total = computed(() => gridData.value.total)
const tags = computed(() => facetsData.value.tags)

const searchInput = ref("")

function submitSearch() {
  const q = searchInput.value.trim()
  navigateTo(
    localePath({
      path: "/extensions",
      query: q ? { category: "skills", q } : { category: "skills" },
    }),
  )
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
    <h2 class="text-center font-serif text-3xl tracking-tight text-(--color-ink) sm:text-4xl">
      {{
        total > 0
          ? t("home.discoveryHeading", { count: total })
          : t("home.discoveryHeadingEmpty")
      }}
    </h2>

    <form class="mx-auto mt-8 flex max-w-3xl gap-3" @submit.prevent="submitSearch">
      <label class="sr-only" for="home-search">{{ t("home.discoverySearchPlaceholder") }}</label>
      <div class="relative flex-1">
        <Search
          :size="16"
          aria-hidden="true"
          class="absolute top-1/2 left-4 -translate-y-1/2 text-(--color-ink-muted)"
        />
        <input
          id="home-search"
          v-model="searchInput"
          type="search"
          :placeholder="t('home.discoverySearchPlaceholder')"
          class="w-full rounded-full border border-(--color-border) bg-(--color-card) py-3 pr-4 pl-11 text-sm text-(--color-ink) shadow-sm transition placeholder:text-(--color-ink-muted) focus:border-(--color-accent)/50 focus:outline-none focus:ring-2 focus:ring-(--color-accent)/20"
        >
      </div>
      <button
        type="submit"
        class="inline-flex shrink-0 items-center gap-2 rounded-full bg-(--color-accent) px-5 py-3 text-sm font-semibold text-(--color-accent-fg) transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)/40"
      >
        <Sparkles :size="14" aria-hidden="true" />
        {{ t("home.discoveryExploreAll") }}
      </button>
    </form>

    <div class="mt-10">
      <HomeTabs v-model="activeTab" />
    </div>

    <div v-if="tags.length > 0" class="mt-5">
      <HomeTagRail :tags="tags" />
    </div>

    <div class="mt-6">
      <ExtGrid :items="items" />
    </div>

    <div v-if="items.length > 0" class="mt-10 text-center">
      <NuxtLink
        :to="localePath({ path: '/extensions', query: { category: 'skills' } })"
        class="inline-flex items-center gap-1 text-sm font-medium text-(--color-ink-muted) transition hover:text-(--color-ink)"
      >
        {{ t("home.viewMore") }}
        <ArrowRight :size="12" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>
