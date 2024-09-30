import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Mentions", async () => {
	test.describe("Mentions relation to other entities", async () => {
		test.describe("Mentions in relation to cashtags", async () => {
			test("If the user types the $ character after a highlighted mention, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello @amsaid1989$", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("@amsaid1989");
			});

			test("If the user types a valid cashtag after a highlighted mention, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello @amsaid1989$AMZN", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("@amsaid1989");
			});

			test("If the user types the $ character immediately before a highlighted mention, with no characters separating them, then the highlighting will be removed", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello @amsaid", { delay: 500 });

				for (let i = 0; i < 7; i++) {
					await editor.press("ArrowLeft");
				}

				await editor.pressSequentially("$", { delay: 500 });

				const p = editor.locator("p");
				const span = editor.locator("span");

				await expect(span).toBeHidden();
				expect(await p.count()).toBe(1);
				await expect(p).toHaveText("Hello $@amsaid");
			});

			test("If the user types the $ character, followed by other word characters, immediately before a highlighted hashtag, with no characters separating them, then the highlighting will be removed", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello @amsaid", { delay: 500 });

				const span = editor.locator("span");

				for (let i = 0; i < 7; i++) {
					await editor.press("ArrowLeft");
				}

				await editor.pressSequentially("$AMZN", { delay: 500 });

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("$AMZN");
			});
		});
	});
});
