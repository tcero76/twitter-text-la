import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Cashtags", async () => {
	test.describe("No match for cashtag pattern", async () => {
		test("When the user types the $ character alone, nothing should be formatted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $", { delay: 500 });

			const span = page.locator("span.highlight");
			const p = editor.locator("p");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("Hello $");
		});

		test("If the user types word characters after the $, but the result doesn't match the cashtag pattern, it shouldn't be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $100 $googleinc $goog22", { delay: 500 });

			const span = page.locator("span.highlight");
			const p = editor.locator("p");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("Hello $100 $googleinc $goog22");
		});

		test("If the user types an underscore immediately after the $ character, it shouldn't be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $_googl", { delay: 500 });

			const span = page.locator("span.highlight");
			const p = editor.locator("p");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("Hello $_googl");
		});

		test("If the user types non-word characters immediately after the $, it shouldn't be highlighted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $-google", { delay: 500 });

			const span = page.locator("span.highlight");
			const p = editor.locator("p");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("Hello $-google");
		});

		test("When the user erases characters from a string that matches the cashtag pattern, making it no longer matching, the highlighting should be removed", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google", { delay: 500 });

			for (let i = 0; i < 6; i++) {
				await editor.press("Backspace");
			}

			const span = page.locator("span.highlight");
			const p = editor.locator("p");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("Hello $");
		});

		test("If the user adds word characters immediately before a highlighted cashtag, with no non-word characters separating them, then the highlighting should be removed", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("Hello $google", { delay: 500 });

			const span = page.locator("span.highlight");

			for (let i = 0; i < 7; i++) {
				await editor.press("ArrowLeft");
			}

			await editor.pressSequentially("from", { delay: 500 });

			await expect(span).toBeHidden();
		});
	});
});
