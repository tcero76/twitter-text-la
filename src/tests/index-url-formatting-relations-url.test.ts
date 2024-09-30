import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("URLs", async () => {
	test.describe("URL relationship to other entities", async () => {
		test.describe("URL relationship to other URLs", async () => {
			test("If we have two URLs, that don't include the protocol, sitting next to each other with nothing separating them, then they will be highlighted as 1 URL", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("google.comtwitter.com", { delay: 500 });

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("google.comtwitter.com");
			});

			test("If we have two URLs, with the first one including the protocol, sitting next to each other with nothing separating them, then they will be highlighted as 1 URL", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("https://google.comtwitter.com", {
					delay: 500,
				});

				const span = editor.locator("span");

				await expect(span).toBeVisible();
				expect(await span.count()).toBe(1);
				await expect(span).toHaveText("https://google.comtwitter.com");
			});

			test("If we have two URLs, with both including the protocol, sitting next to each other with nothing separating them, then none of them will be highlighted", async ({
				page,
			}) => {
				const editor = page.locator("div.input-area");

				await editor.pressSequentially("https://google.comhttps://twitter.com", {
					delay: 500,
				});

				const p = editor.locator("p");
				const span = editor.locator("span");

				await expect(span).toBeHidden();
				expect(await p.count()).toBe(1);
				await expect(p).toHaveText("https://google.comhttps://twitter.com");
			});
		});
	});
});
