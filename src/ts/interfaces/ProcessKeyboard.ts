import { validSymbolsExistPattern } from "../patterns";
import Process from './Process'

abstract class ProcessKeyboard extends Process {

    private pattern:RegExp
    private highlightClassName:string

    constructor(pattern:RegExp, highlightClassName:string) {
		super()
		this.highlightClassName = highlightClassName
		this.pattern = pattern
    }

	protected formatAfterNewParagraph (range: Range) {
		const currentParagraph = this.getCurrentParagraph(range);
		const previousParagraph = currentParagraph?.previousElementSibling;
		if (previousParagraph) {
			const textNode = this.prepParagraphForReformatting(range, previousParagraph);
			this.format(range, textNode, previousParagraph);
		}
		if (currentParagraph) {
			const textNode = this.prepParagraphForReformatting(range, currentParagraph);
			this.format(range, textNode, currentParagraph);
		}
	}

	private getCurrentParagraph(range: Range): Element | undefined {
		let currentParagraph: Element | undefined;
		if (range.startContainer.nodeType === 3) {
			const parentElement = range.startContainer.parentElement;
			if (!parentElement) {
				return undefined;
			}
			if (parentElement.tagName === "P") {
				currentParagraph = parentElement;
			} else {
				if (!parentElement.parentElement) {
					return undefined;
				}
				currentParagraph = parentElement.parentElement;
			}
		} else if ((range.startContainer as Element).tagName === "P") {
			currentParagraph = range.startContainer as Element;
		}
		return currentParagraph;
	}

	private prepParagraphForReformatting(range: Range, paragraph: Element): Text {
		range.selectNodeContents(paragraph);
		const text = range.toString();
		range.deleteContents();
		while (paragraph.firstChild) {
			paragraph.removeChild(paragraph.firstChild);
		}
		const textNode = document.createTextNode(text);
		paragraph.appendChild(textNode);
		if (text.length === 0) {
			paragraph.appendChild(document.createElement("br"));
		}
		return textNode;
	}

	protected format(range: Range, textNode: Text, finalNode?: Element): void {
		if (!textNode.textContent || !textNode.textContent.match(validSymbolsExistPattern)) {
			return;
		}
		const matches = textNode.textContent.matchAll(this.pattern);
		if (!matches) return
		const matchArr = Array.from(matches).reverse();
		if (matchArr.length === 0) return
		for (const match of matchArr) {
			const textMatch = match[1] || match[2] || match[3] || match[4];
			if (textMatch && match.index !== undefined) {
				const start = match[0] === textMatch ? match.index : match.index + 1;
				range.setStart(textNode, start);
				range.setEnd(textNode, start + textMatch.length);
				const span = document.createElement("span");
				span.classList.add("highlight");
				span.classList.add(this.highlightClassName || "tweet-textarea-entity-highlighting");
				range.surroundContents(span);
				let startNode: Node = span;
				if (finalNode) {
					startNode = finalNode;
				}
				this.setCursorPosition(startNode, 0);
			}
		}
	}

}

export default ProcessKeyboard;