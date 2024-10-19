import { validSymbolsExistPattern } from "../impl/patterns";
import { INodeAndOffset } from "../types";
import Process from './Process'

abstract class ProcessKeyboard extends Process {

    private pattern:RegExp
    private highlightClassName:string

    constructor(pattern:RegExp, highlightClassName:string) {
		super()
		this.highlightClassName = highlightClassName
		this.pattern = pattern
    }

	abstract process(range:Range): void;

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

    protected repositionCursorInParagraph(paragraphAndOffset: INodeAndOffset, offset: number): void {
        const { node: parentParagraph, offset: offsetInParent } = paragraphAndOffset;
        let currentLength = 0;
        for (let i = offsetInParent; i < parentParagraph.childNodes.length; i++) {
            const child = parentParagraph.childNodes[i];
            if ((child as Element).tagName === "BR") ++currentLength;
            if (child.textContent?.length !== undefined) {
                if (currentLength + child.textContent.length < offset) {
                    currentLength += child.textContent.length;
                } else {
                    offset -= currentLength;
                    let startNode: Node = child;
                    if (child.nodeType !== 3) {
                        if (child.firstChild) {
                            startNode = child.firstChild;
                        }
                    }
                    this.setCursorPosition(startNode, offset);
                    break;
                }
            }
        }
    }
}

export default ProcessKeyboard;