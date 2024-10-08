import { validSymbolsExistPattern } from "./patterns";
import { INodeAndOffset } from "./types";
const STORAGE_KEY = "highlightPattern";

abstract class Process {

	constructor() {
	}

	protected getParentParagraph(node: Node): HTMLParagraphElement | null {
		let parent: HTMLParagraphElement | null = null;
		if ((node as Element).tagName === "P") {
			return node as HTMLParagraphElement;
		}
		let currentNode = node;
		while (currentNode.parentElement) {
			if (currentNode.parentElement.tagName === "P") {
				parent = currentNode.parentElement as HTMLParagraphElement;
				break;
			} else {
				currentNode = currentNode.parentElement;
			}
		}
		return parent;
	}

	protected findNodeInParent(parent: Node, node: Node): number | undefined {
		let offsetInParent: number | undefined;
		for (let i = 0; i < parent.childNodes.length; i++) {
			const child: ChildNode = parent.childNodes[i];
			if (child === node) {
				offsetInParent = i;
				break;
			}
		}
		return offsetInParent;
	}

	protected setCursorPosition(node: Node, offset: number): void {
		if (!node) return
		const sel = document.getSelection();
		const range = sel?.getRangeAt(0);
		sel?.removeAllRanges();
		range?.setStart(node, offset);
		range?.collapse(true);
		if(!range) return
		sel?.addRange(range);
	}
}

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

abstract class ProcessKeyboardProcess extends ProcessKeyboard {

    constructor(pattern:RegExp, highlightClassName:string) {
		super(pattern, highlightClassName)
	}

	abstract process(range:Range, repeat:boolean, repeatCount:number): void;
}

class InsertLineBreak extends ProcessKeyboardProcess {

	public process(range:Range, repeat:boolean, repeatCount:number): void {
			let { startContainer, startOffset } = range;
			const currentParagraph = this.getParentParagraph(startContainer);
			const endOffset = (currentParagraph as Element).childNodes.length;
			if (currentParagraph) {
				range.setStart(startContainer, startOffset);
				range.setEnd(currentParagraph, endOffset);
				const newParagraph = document.createElement("p");
				newParagraph.appendChild(range.extractContents());
				const parent = currentParagraph.parentNode;
				if (parent) {
					const offset = this.findNodeInParent(parent, currentParagraph);
					if (offset !== undefined) {
						range.setStart(parent, offset + 1);
						range.setEnd(parent, offset + 1);
					}
					range.insertNode(newParagraph);
					range.setStart(newParagraph, 0);
					range.collapse(true);
				}
			}
			this.formatAfterNewParagraph(range);
	}

}

class InsertParagraph extends ProcessKeyboardProcess {
	public 	process(range:Range, repeat:boolean, repeatCount:number): void {
		this.formatAfterNewParagraph(range);
	}
}

class InsertText extends ProcessKeyboardProcess {

	private iNodeAndOffset:INodeAndOffset | null = null

	constructor(pattern: RegExp, highlightClassName:string) {
		super(pattern, highlightClassName)
		let range:Range | null 
		const rangeCount = document.getSelection()?.rangeCount
		if(rangeCount) {
			range = document.getSelection()?.getRangeAt(0)!!
		} else {
			range = null
		}
	}

	public process(range:Range, repeat:boolean, repeatCount:number):void {
		const iNodeAndOffset = this.getCurrentNodeAndOffset(range);
		if (!iNodeAndOffset) return
		let { node, offset } = iNodeAndOffset
		const prevNode = node.previousSibling || node.previousElementSibling;
		let nextNode = (node.nextSibling || node.nextElementSibling) as Element;
		if (nextNode) {
			if (nextNode.tagName === "BR" || (nextNode.tagName === "SPAN" && !nextNode.textContent?.length)) {
				if (nextNode.tagName === "SPAN") nextNode.parentElement?.removeChild(nextNode);
				nextNode = node;
			}
		}
		const startNode = prevNode || node;
		const startOffset = 0;
		const endNode = nextNode || node;
		const endOffset = endNode.nodeType === 3 && endNode.textContent?.length !== undefined
				? endNode.textContent.length
				: 1;
		if (startNode !== node && startNode.textContent?.length !== undefined) {
			offset += startNode.textContent.length;
		}
		const parentParagraph = startNode.parentElement;
		if (!parentParagraph || parentParagraph.childNodes.length === 0) {
			return;
		}
		const offsetInParent = this.findNodeInParent(parentParagraph, startNode);
		if (offsetInParent === undefined) {
			return;
		}
		if (repeat && repeatCount > 6) {
			return;
		}
		range.setStart(startNode, startOffset);
		range.setEnd(endNode, endOffset);
		const text = range.toString();
		range.deleteContents();
		node.parentElement?.removeChild(node);
		startNode.parentElement?.removeChild(startNode);
		endNode.parentElement?.removeChild(endNode);
		range.setStart(parentParagraph, offsetInParent);
		range.collapse(true);
		const textNode = document.createTextNode(text);
		range.insertNode(textNode);
		this.setCursorPosition(textNode, textNode.textContent?.length || 0);
		this.format(range, textNode);
		let currentLength = 0;
		for (let i = offsetInParent; i < parentParagraph.childNodes.length; i++) {
			const child = parentParagraph.childNodes[i];
			if ((child as Element).tagName === "BR") {
				++currentLength;
			}
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

	public getCurrentNodeAndOffset(range: Range):INodeAndOffset | null  {
		let node = range.startContainer as Element;
		let offset = range.startOffset;
		this.iNodeAndOffset = { node, offset}
		if (node.tagName === "DIV") {
			const currentParagraph = node.childNodes[offset - 1];
			this.setCursorPosition(currentParagraph, currentParagraph?.childNodes.length);
			return null;
		} else if (node.tagName === "P") {
			const childIndex = offset - 1 >= 0 ? offset - 1 : 0;
			const lastChildBeforeOffset = node.childNodes[childIndex] as Element;
			if (lastChildBeforeOffset && lastChildBeforeOffset.tagName !== "BR") {
				node = lastChildBeforeOffset;
			} else {
				this.setCursorPosition(node, 0);
				return null;
			}
			if (!(node.nodeType === 3)) {
				node = node.firstChild as Element;
			}
			if (offset > 0 && node.textContent?.length !== undefined) {
				offset = node.textContent.length;
			}
			this.setCursorPosition(node, offset);
		}
		if (node.nodeType === 3) {
			if (node.parentElement?.tagName === "SPAN") {
				node = node.parentElement;
			}
		}
		return { node, offset };
	}

	get NodeAndOffset() {
		return this.iNodeAndOffset;
	}
}

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

export { Process, ProcessKeyboard, ProcessKeyboardProcess, InsertLineBreak, InsertParagraph, InsertText, FormatText};