import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Hashtags", async () => {
	test.describe("Hashtags relation to other entities", async () => {
		test.describe("Hashtags in relation to other hashtags", async () => {
			test("If the user types the # character immediately before a highlighted hashtag, with no characters separating them, then the highlighting will be maintained", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100days", { delay: 500 });

				for (let i = 0; i < 8; i++) {
					await editor.press("ArrowLeft");
				}

				await editor.pressSequentially("#", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("#100days");
			});

			test("If the user types the # character, followed by other word characters, immediately before a highlighted hashtag, with no characters separating them, then the highlighting will be removed", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100days", { delay: 500 });

				const p = editor.locator("p");
				const span = editor.locator("span");

				for (let i = 0; i < 8; i++) {
					await editor.press("ArrowLeft");
				}

				await editor.pressSequentially("#500", { delay: 500 });

				await expect(span).toBeHidden();
				expect(await p.count()).toBe(1);
				await expect(p).toHaveText("Hello #500#100days");
			});

			test("If the user types the # character after a highlighted hashtag, then the highlighting will be removed", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("Hello #100DaysOfCode#", { delay: 500 });

				const p = editor.locator("p");
				const span = editor.locator("span");

				await expect(span).toBeHidden();
				expect(await p.count()).toBe(1);
				await expect(p).toHaveText("Hello #100DaysOfCode#");
			});

			test("If we have multiple hashtags one after the other, with no non-word characters separating them, then none of them should be highlighted", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("#buildinpublic#100DaysOfCode", {
					delay: 500,
				});

				const p = editor.locator("p");
				const span = editor.locator("span");

				await expect(span).toBeHidden();
				expect(await p.count()).toBe(1);
				await expect(p).toHaveText("#buildinpublic#100DaysOfCode");
			});
		});
	});
});
