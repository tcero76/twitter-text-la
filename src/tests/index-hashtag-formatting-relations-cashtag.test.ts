import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Hashtags", async () => {
	test.describe("Hashtags relation to other entities", async () => {
		test.describe("Hashtags in relation to cashtags", async () => {
			test("If the user types the $ character after a highlighted hashtag, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100DaysOfCode$", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("#100DaysOfCode");
			});

			test("If the user types a valid cashtag after a highlighted hashtag, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100DaysOfCode$AMZN", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("#100DaysOfCode");
			});

			test("If the user types the $ character immediately before a highlighted hashtag, with no characters separating them, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100days", { delay: 500 });

				for (let i = 0; i < 8; i++) {
					await editor.press("ArrowLeft");
				}

				await editor.pressSequentially("$", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("#100days");
			});

			test("If the user types the $ character, followed by other word characters, immediately before a highlighted hashtag, with no characters separating them, then the highlighting will be removed", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100days", { delay: 500 });

				const span = editor.locator("span");

				for (let i = 0; i < 8; i++) {
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
