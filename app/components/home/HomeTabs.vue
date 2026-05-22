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
    <TabsList class="flex w-full justify-center gap-10">
      <TabsTrigger
        v-for="key in TABS"
        :key="key"
        :value="key"
        class="px-5 py-3 text-base font-semibold tracking-tight data-[state=active]:font-bold"
      >
        {{ t(`home.tabs.${key}`) }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
