import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("URLs", async () => {
	test.describe("No match for URL pattern", async () => {
		test("If the user types a string that looks like a URL, but it doesn't match the URL pattern, then it shouldn't be formatted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("hello.test", { delay: 500 });

			const p = editor.locator("p");
			const span = editor.locator("span");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("hello.test");
		});

		test("Non-word characters, other than dots and hyphens, are not allowed before the top level domain", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("hello/world.com", { delay: 500 });

			const p = editor.locator("p");
			const span = editor.locator("span");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("hello/world.com");
		});

		test("A URL that is not at the beginning of the line or not surrounded by spaces at both ends should not be formatted", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("hellohttps://google.com", { delay: 500 });

			const p = editor.locator("p");
			const span = editor.locator("span");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("hellohttps://google.com");
		});

		test("If the user erases characters from a highlighted URL, making it no longer matching the URL pattern, then the formatting should be removed", async ({
			page,
		}) => {
			const editor = page.locator("div.input-area");

			await editor.pressSequentially("hello.com", { delay: 500 });

			for (let i = 0; i < 3; i++) {
				await editor.press("Backspace");
			}

			const p = editor.locator("p");
			const span = editor.locator("span");

			await expect(span).toBeHidden();
			expect(await p.count()).toBe(1);
			await expect(p).toHaveText("hello.");
		});
	});
});
