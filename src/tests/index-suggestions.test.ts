import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
 	await page.route('http://localhost:5173/api/v1/suggestions', async route => {
		const suggestions = ["apple", "applebeans", "banana", "cherry", "date", "elderberry", "fig", "grape"]
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(suggestions),
			});
	  })
	await page.goto("http://localhost:5173");
});

test("when the user write some text and use a hash char to iniciate a word", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem ipsum", { delay: 500})
	for(let i = 0; 6 > i ; i++) {
		await page.keyboard.press("ArrowLeft")
	}
	await editor.pressSequentially(" #ch", { delay: 500})
	const suggestion = await page.locator("div.suggestion")
	await expect(suggestion).toBeVisible()
	await expect(await suggestion.count()).toBe(1)
})

test("when the user write some text and not use a hash char to iniciate a word", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem ipsum")
	for(let i = 0; 6 > i ; i++) {
		await page.keyboard.press("ArrowLeft")
	}
	await editor.pressSequentially(" ch", { delay: 500})
	const suggestion = await page.locator("div.suggestion")
	await expect(await suggestion.count()).toBe(0)
})

test( "when the user click a suggestions and introduce some text from suggestion", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem ipsum")
	for(let i = 0; 6 > i ; i++) {
		await page.keyboard.press("ArrowLeft")
	}
	await editor.pressSequentially(" #ch", { delay: 500})
	await page.click('div.suggestion', { delay: 500})
	await expect(editor).toHaveText("Lorem #cherry ipsum")
})

test("when the user click a suggestions width the last word and introduce some text from suggestion", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem ipsum #ch", { delay: 500})
	await page.click('div.suggestion', { delay: 500})
	await expect(editor).toHaveText("Lorem ipsum #cherry")
})

test("when the user write and delete all", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem", { delay: 500})
	for(let i = 0; i < 5 ; i++) {
		await page.keyboard.press("Backspace")
	}
	await expect(editor).toHaveText("")
})

test("when the user write two words whith first char a shard", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem", { delay: 500})
	await editor.pressSequentially(" #ch", { delay: 500})
	await page.click('div.suggestion', { delay: 500})
	await editor.pressSequentially(" ipsum #applebe", { delay: 50})
	await page.click('div.suggestion', { delay: 500})
	await expect(editor).toHaveText('Lorem #cherry ipsum #applebeans')
})

test("when the user write two words whith first char a shard continuous", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem")
	await editor.pressSequentially(" #ch", { delay: 500})
	await page.click('div.suggestion', { delay: 500})
	await editor.pressSequentially(" #applebe", { delay: 500})
	await page.click('div.suggestion', { delay: 500})
	await expect(editor).toHaveText('Lorem #cherry #applebeans')
})

test("when the user write a lonely shard and select an alternative with Tab", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem #", { delay: 50})
	await page.keyboard.press("Tab")
	await expect(editor).toHaveText('Lorem #')
	const suggestion = page.locator("div.suggestion")
	await expect(await suggestion.count()).toBe(0)
})

test("when the user write a shard and select an alternative with Tab", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem #ap", { delay: 50})
	await page.keyboard.press("Tab")
	await expect(editor).toHaveText('Lorem #apple')
})

test("when the user write a shard and select an alternative with ArrowDown and Tab", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem #ap", { delay: 50})
	await page.keyboard.press("ArrowDown")
	await page.keyboard.press("Tab")
	await expect(editor).toHaveText('Lorem #applebeans')
})

test("when the user write a shard and select an alternative with ArrowDown and Enter", async ({
	page
}) => {
	const editor = page.locator("div.input-area")
	await editor.pressSequentially("Lorem #ap", { delay: 50})
	await page.keyboard.press("ArrowDown")
	await page.keyboard.press("Enter")
	await expect(editor).toHaveText('Lorem #applebeans')
})