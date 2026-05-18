import { expect, test } from "@playwright/test"

// 3-way theme picker (Ivory / Dark / Mono). The composable writes the
// `theme` cookie and useHead syncs the `<html>` class on the client.

test.describe("theme switcher dropdown", () => {
  test("opens the picker, switches to Mono, persists across reload", async ({ page }) => {
    await page.goto("/en")

    const trigger = page.getByRole("button", { name: "Theme" })
    await expect(trigger).toBeVisible()
    await trigger.click()

    // All three options render in the menu
    const monoOption = page.getByRole("option", { name: /Mono/ })
    await expect(monoOption).toBeVisible()
    await expect(page.getByRole("option", { name: /Ivory/ })).toBeVisible()
    await expect(page.getByRole("option", { name: /Dark/ })).toBeVisible()

    await monoOption.click()

    // <html> picks up the mono class and the cookie is set
    await expect(page.locator("html")).toHaveClass(/\bmono\b/)
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === "theme")?.value).toBe("mono")

    // Persists across hard reload
    await page.reload()
    await expect(page.locator("html")).toHaveClass(/\bmono\b/)
  })

  test("switching to Dark removes mono and adds dark", async ({ page }) => {
    await page.context().addCookies([
      { name: "theme", value: "mono", url: "http://localhost:3000" },
    ])
    await page.goto("/en")
    await expect(page.locator("html")).toHaveClass(/\bmono\b/)

    await page.getByRole("button", { name: "Theme" }).click()
    await page.getByRole("option", { name: /Dark/ }).click()

    await expect(page.locator("html")).toHaveClass(/\bdark\b/)
    await expect(page.locator("html")).not.toHaveClass(/\bmono\b/)
  })

  test("Escape closes the dropdown without changing the theme", async ({ page }) => {
    await page.goto("/en")
    const trigger = page.getByRole("button", { name: "Theme" })
    await trigger.click()
    await expect(page.getByRole("option", { name: /Mono/ })).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByRole("option", { name: /Mono/ })).toHaveCount(0)
    await expect(page.locator("html")).not.toHaveClass(/\bmono\b/)
  })
})
