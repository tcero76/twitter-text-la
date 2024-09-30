import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173/");
});

test.describe("Accents tests", async () => {

	test("The editor accepts user input", async ({ page }) => {
		const editor = page.locator("div.input-area");
        await editor.fill('é');
		await expect(editor).toHaveText("é");
	});
});