// @vitest-environment nuxt
import { describe, it, expect } from "vitest"
import { useTheme } from "./useTheme"

describe("useTheme", () => {
  it("defaults to ivory when no cookie is set", () => {
    const { theme } = useTheme()
    expect(theme.value).toBe("ivory")
  })

  it("set updates the current theme value through all three options", () => {
    const { theme, set } = useTheme()
    set("dark")
    expect(theme.value).toBe("dark")
    set("mono")
    expect(theme.value).toBe("mono")
    set("ivory")
    expect(theme.value).toBe("ivory")
  })

  it("invalid persisted value resets to ivory", () => {
    document.cookie = "theme=garbage; path=/"
    const { theme } = useTheme()
    expect(theme.value).toBe("ivory")
  })
})
