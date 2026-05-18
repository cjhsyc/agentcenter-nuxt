<script setup lang="ts">
import { Check, Moon, Sun } from "lucide-vue-next"
import type { Theme } from "~~/shared/types"

const { t } = useI18n()
const { theme, set } = useTheme()

const open = ref(false)

interface ThemeOption {
  key: Theme
  labelKey: string
  descKey: string
  paper: string
  ink: string
  accent: string
}

const options: ThemeOption[] = [
  { key: "ivory", labelKey: "nav.themeIvory", descKey: "nav.themeIvoryDesc", paper: "#f6f1e8", ink: "#1a1a1e", accent: "#c46a3a" },
  { key: "dark",  labelKey: "nav.themeDark",  descKey: "nav.themeDarkDesc",  paper: "#1a1a1e", ink: "#e8eaed", accent: "#8da4ef" },
  { key: "mono",  labelKey: "nav.themeMono",  descKey: "nav.themeMonoDesc",  paper: "#f6f6f6", ink: "#0f0f0f", accent: "#0f0f0f" },
]

const current = computed(() => options.find(o => o.key === theme.value) ?? options[0]!)
const currentLabel = computed(() => t(current.value.labelKey))

function pick(next: Theme) {
  set(next)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="size-8 rounded-full inline-flex items-center justify-center border border-transparent hover:bg-(--color-sidebar) data-[state=open]:border-(--color-border) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        :aria-label="t('nav.themeLabel')"
        :title="`${t('nav.themeLabel')}: ${currentLabel}`"
      >
        <Sun v-if="theme === 'ivory'" :size="16" aria-hidden="true" />
        <Moon v-else-if="theme === 'dark'" :size="16" aria-hidden="true" />
        <svg
          v-else
          data-theme-icon="mono"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 1.8a6.2 6.2 0 010 12.4z" fill="currentColor" />
        </svg>
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="8"
      class="w-60 p-1.5 rounded-xl shadow-lg"
    >
      <div
        class="px-2.5 pt-1.5 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-(--color-ink-muted)"
      >
        {{ t("nav.themeLabel") }}
      </div>
      <button
        v-for="opt in options"
        :key="opt.key"
        type="button"
        role="option"
        :aria-selected="theme === opt.key"
        class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-(--color-sidebar) data-[active=true]:bg-(--color-sidebar) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)"
        :data-active="theme === opt.key"
        @click="pick(opt.key)"
      >
        <span
          class="relative shrink-0 w-9 h-[26px] rounded-md overflow-hidden border border-(--color-border)"
          :style="{ background: opt.paper }"
          aria-hidden="true"
        >
          <span
            class="absolute left-[3px] right-[3px] top-[3px] h-1 rounded-[1.5px] opacity-90"
            :style="{ background: opt.ink }"
          />
          <span
            class="absolute left-[3px] top-[10px] w-[11px] h-1 rounded-[1.5px]"
            :style="{ background: opt.accent }"
          />
          <span
            class="absolute left-[3px] right-2 top-[17px] h-[2.5px] rounded-[1px] opacity-[0.28]"
            :style="{ background: opt.ink }"
          />
          <span
            class="absolute left-[3px] right-[13px] top-[21px] h-[2.5px] rounded-[1px] opacity-[0.28]"
            :style="{ background: opt.ink }"
          />
        </span>
        <span class="flex-1 min-w-0">
          <span
            class="block text-[13px] tracking-tight font-serif"
            :class="theme === opt.key ? 'font-semibold' : 'font-medium'"
          >
            {{ t(opt.labelKey) }}
          </span>
          <span class="block text-[11px] text-(--color-ink-muted) mt-px">
            {{ t(opt.descKey) }}
          </span>
        </span>
        <Check
          v-if="theme === opt.key"
          :size="13"
          class="text-(--color-accent) shrink-0"
          aria-hidden="true"
        />
      </button>
    </PopoverContent>
  </Popover>
</template>
