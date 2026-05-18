// @vitest-environment nuxt
import { describe, it, expect } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import { defineComponent } from "vue"
import Sidebar from "./Sidebar.vue"

const NuxtLinkStub = defineComponent({
  name: "NuxtLink",
  props: { to: { type: String, required: true } },
  template: "<a :href=\"to\"><slot /></a>",
})

const mountOpts = {
  props: { collapsed: false },
  global: { stubs: { NuxtLink: NuxtLinkStub } },
}

describe("Sidebar", () => {
  it("renders Browse + Categories + Collections section headers", async () => {
    const wrapper = await mountSuspended(Sidebar, mountOpts)
    const html = wrapper.html().toLowerCase()
    expect(html).toContain("browse")
    expect(html).toContain("categor")
    expect(html).toContain("collection")
  })

  it("does not render a primary-nav 'Explore' section (that moved to TopBar)", async () => {
    const wrapper = await mountSuspended(Sidebar, mountOpts)
    // No top-of-sidebar "EXPLORE" header; primary nav lives in TopBar.
    expect(wrapper.html()).not.toMatch(/sidebar\.explore/)
  })

  it("Browse links target /extensions (one per type, no 'All Extensions' item)", async () => {
    const wrapper = await mountSuspended(Sidebar, mountOpts)
    const browseLinks = wrapper
      .findAll("a")
      .filter((a) => /[?&]category=/.test(a.attributes("href") ?? ""))
    // Exactly 4 type pills: skills / mcp / slash / plugins. No "All" item.
    expect(browseLinks.length).toBe(4)
  })

  it("renders all three funcCat L0 labels collapsed by default", async () => {
    const wrapper = await mountSuspended(Sidebar, mountOpts)
    const html = wrapper.html().toLowerCase()
    expect(html).toContain("work task")
    expect(html).toContain("business")
    expect(html).toContain("tools")
  })

  it("does not expand any funcCat by default (L1 rows hidden until clicked)", async () => {
    const wrapper = await mountSuspended(Sidebar, mountOpts)
    const html = wrapper.html().toLowerCase()
    expect(html).not.toContain("system design")
    expect(html).not.toContain("network protocols")
  })

  it("collapsed prop hides the inner content", async () => {
    const wrapper = await mountSuspended(Sidebar, {
      ...mountOpts,
      props: { collapsed: true },
    })
    expect(wrapper.findAll("a").length).toBe(0)
  })
})
