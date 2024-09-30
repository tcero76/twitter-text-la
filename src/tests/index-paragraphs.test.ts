import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("http://localhost:5173");
});

test.describe("Paragraphs", async () => {
	test("When user types some text, a paragraph element is created to contain that text", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.pressSequentially("Hello from TweetTextarea", { delay: 500 });

		const p = editor.locator("p");

		await expect(p).toBeVisible();

		expect(await p.count()).toBe(1);

		await expect(p).toHaveText("Hello from TweetTextarea");
	});

	test("When user presses Enter in an empty editor, it should create new paragraphs", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.press("Enter");

		const p = editor.locator("p");

		expect(await p.count()).toBe(2);

		expect(
			(await p.allTextContents()).every((text) => text === "")
		).toBeTruthy();
	});

	test("When user presses Backspace in an empty paragraph, it should be deleted", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.press("Enter", { delay: 1000 });

		await editor.press("Backspace", { delay: 1000 });

		const p = editor.locator("p");

		expect(await p.count()).toBe(0);
	});

	test("When user presses Enter at the end of a paragraph a new empty paragraph should be created", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.pressSequentially("Hello from TweetTextarea", { delay: 500 });

		await editor.press("Enter");

		const p = editor.locator("p");

		expect(await p.count()).toBe(2);
		await expect(p.nth(0)).toHaveText("Hello from TweetTextarea");
		await expect(p.nth(1)).toHaveText("");
	});

	test("When user presses Enter in the middle of a paragraph, a new paragraph should be created moving all text after cursor to the new paragraph", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.pressSequentially("Hello from TweetTextarea", { delay: 500 });

		for (let i = 0; i < 13; i++) {
			await editor.press("ArrowLeft");
		}

		await editor.press("Enter");

		const p = editor.locator("p");

		expect(await p.count()).toBe(2);
		await expect(p.nth(0)).toHaveText("Hello from ");
		await expect(p.nth(1)).toHaveText("TweetTextarea");
	});

	test("When user presses Enter in the middle of a formatted element, the formatting should be recalculated", async ({
		page,
	}) => {
		const editor = page.locator("div.input-area");

		await editor.pressSequentially("Hello from #100DaysOfCode", { delay: 500 });

		for (let i = 0; i < 10; i++) {
			await editor.press("ArrowLeft");
		}

		await editor.press("Enter");

		const p = editor.locator("p");
		const span = editor.locator("span");

		expect(await p.count()).toBe(2);
		await expect(span).toBeHidden();
	});
});
