// @vitest-environment nuxt
import { describe, it, expect, beforeEach } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import ThemeSwitch from "./ThemeSwitch.vue"

describe("ThemeSwitch", () => {
  beforeEach(() => {
    document.cookie = "theme=ivory; path=/"
  })

  it("trigger shows the Sun icon when theme is ivory", async () => {
    const wrapper = await mountSuspended(ThemeSwitch)
    expect(wrapper.find("svg.lucide-sun").exists()).toBe(true)
    expect(wrapper.find("svg.lucide-moon").exists()).toBe(false)
    expect(wrapper.find("svg.lucide-contrast").exists()).toBe(false)
  })

  it("trigger shows the Moon icon when theme is dark", async () => {
    document.cookie = "theme=dark; path=/"
    const wrapper = await mountSuspended(ThemeSwitch)
    expect(wrapper.find("svg.lucide-moon").exists()).toBe(true)
    expect(wrapper.find("svg.lucide-sun").exists()).toBe(false)
  })

  it("trigger shows the Contrast icon when theme is mono", async () => {
    document.cookie = "theme=mono; path=/"
    const wrapper = await mountSuspended(ThemeSwitch)
    expect(wrapper.find("svg.lucide-contrast").exists()).toBe(true)
    expect(wrapper.find("svg.lucide-sun").exists()).toBe(false)
  })

  it("trigger exposes the Theme aria-label and a title with the current theme", async () => {
    const wrapper = await mountSuspended(ThemeSwitch)
    const trigger = wrapper.find("button")
    expect(trigger.attributes("aria-label")).toBe("Theme")
    expect(trigger.attributes("title")).toContain("Ivory")
  })
})
