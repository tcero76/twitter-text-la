import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Cashtags", async () => {
	test.describe("Text matches cashtag pattern", async () => {
		test("If the user types something after the $ character, and the result matches the cashtag pattern, it should be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("$google");
		});

		test("A suffix made of an underscore and a maximum of two alphabetical characters is allowed and should be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google_uk", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("$google_uk");
		});

		test("If the suffix doesn't match the rules, then only the cashtag part will be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google_inc", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("$google");
		});

		test("When the user adds a non-word character after a sequence of word characters that match the cashtag pattern, then the formatting should stop before the non-word character", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google-2022", { delay: 500 });

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("$google");
		});

		test("If the user erases characters from a string that doesn't match the cashtag pattern, making it match, then the text should be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $googleinc", { delay: 500 });

			for (let i = 0; i < 3; i++) {
				await editor.press("Backspace", { delay: 500 });
			}

			const span = editor.locator("span");

			await expect(span).toBeVisible();
			expect(await span.count()).toBe(1);
			await expect(span).toHaveText("$google");
		});
	});
});
