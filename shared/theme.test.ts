import { describe, it, expect } from "vitest"
import { THEME_COOKIE_NAME, VALID_THEMES, isValidTheme } from "~~/shared/theme"

describe("theme", () => {
  it("cookie name is 'theme'", () => {
    expect(THEME_COOKIE_NAME).toBe("theme")
  })

  it("valid themes are exactly ivory, dark, and mono", () => {
    expect([...VALID_THEMES].sort()).toEqual(["dark", "ivory", "mono"])
  })

  it.each([
    ["ivory", true],
    ["dark", true],
    ["mono", true],
    ["system", false],
    ["", false],
    [null, false],
    [undefined, false],
    [42, false],
  ])("isValidTheme(%j) === %s", (input, expected) => {
    expect(isValidTheme(input)).toBe(expected)
  })
})
