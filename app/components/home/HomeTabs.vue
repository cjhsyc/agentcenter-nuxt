<script setup lang="ts">
export type HomeTabKey = "official" | "popular" | "recent"

defineProps<{ modelValue: HomeTabKey }>()
const emit = defineEmits<{ "update:modelValue": [value: HomeTabKey] }>()

const { t } = useI18n()

const TABS: HomeTabKey[] = ["official", "popular", "recent"]
</script>

<template>
  <Tabs
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v as HomeTabKey)"
  >
    <TabsList class="flex w-full justify-center gap-12 border-b-0">
      <TabsTrigger
        v-for="key in TABS"
        :key="key"
        :value="key"
        class="px-6 py-4 text-lg font-semibold tracking-tight data-[state=active]:font-bold data-[state=active]:border-b-[3px]"
      >
        {{ t(`home.tabs.${key}`) }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
