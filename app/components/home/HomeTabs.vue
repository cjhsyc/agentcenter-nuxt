<script setup lang="ts">
export type HomeTabKey = "popular" | "topRated" | "recent"

const props = defineProps<{ modelValue: HomeTabKey }>()
const emit = defineEmits<{ "update:modelValue": [value: HomeTabKey] }>()

const { t } = useI18n()

const TABS: HomeTabKey[] = ["popular", "topRated", "recent"]

function select(key: HomeTabKey) {
  if (key !== props.modelValue) emit("update:modelValue", key)
}
</script>

<template>
  <div role="tablist" class="flex items-center gap-1 border-b border-(--color-border)">
    <button
      v-for="key in TABS"
      :key="key"
      role="tab"
      type="button"
      :aria-selected="modelValue === key"
      :tabindex="modelValue === key ? 0 : -1"
      class="relative px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)/40 rounded-t"
      :class="
        modelValue === key
          ? 'text-(--color-ink)'
          : 'text-(--color-ink-muted) hover:text-(--color-ink)'
      "
      @click="select(key)"
    >
      {{ t(`home.tabs.${key}`) }}
      <span
        v-if="modelValue === key"
        aria-hidden="true"
        class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-(--color-accent)"
      />
    </button>
  </div>
</template>
