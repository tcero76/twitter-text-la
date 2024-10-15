import ProcessKeyboard from './interfaces/ProcessKeyboard';

class FormatText extends ProcessKeyboard {
	
	constructor(pattern:RegExp, highlightClassName:string) {
		super(pattern,highlightClassName)
	}
	
	public formatAfterUpdatingTextFromParent(editor: HTMLDivElement,range: Range,updatedText: string): void {
		const splitParagraphs = updatedText.split("\n");
		const paragraphElements = splitParagraphs.map((text) => {
			const p = document.createElement("p");
			p.textContent = text;
			p.appendChild(document.createElement("br"));
			return p;
		});
		paragraphElements.forEach((p) => {
			editor.appendChild(p);
		});
		for (let i = 0; i < editor.childNodes.length; i++) {
			const node = editor.childNodes[i];
			if (!node || (node.firstChild as Element).tagName === "BR") {
				continue;
			}
			this.format(range, node.firstChild as Text);
		}
	}
}

export default FormatText