import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Mentions", async () => {
	test.describe("Text matches mention pattern", async () => {
		test("If the user types something after the @, and the result matches the mention pattern, it should be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello @amsaid1989", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("@amsaid1989");
		});

		test("When the user adds a non-word character after a sequence of word characters that match the mention pattern, then the formatting should stop before the non-word character", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello @amsaid1989-2022", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("@amsaid1989");
		});

		test("If the user erases characters from a string that doesn't match the mention pattern, making it match, then the text should be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello @-amsaid", { delay: 500 });

			for (let i = 0; i < 6; i++) {
				await editor.press("ArrowLeft");
			}

			await editor.press("Backspace");

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("@amsaid");
		});
	});
});
