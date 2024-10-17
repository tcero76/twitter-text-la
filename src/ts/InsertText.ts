import ProcessKeyboardProcess from "./interfaces/ProcessKeyboardProcess"
import { INodeAndOffset, INullNodeAndOffset } from "./types"

class InsertText extends ProcessKeyboardProcess {

	private iNodeAndOffset:INullNodeAndOffset | null = null
	private _repeat:boolean
	private _repeatCount:number

	constructor(pattern: RegExp, highlightClassName:string) {
		super(pattern, highlightClassName)
		this._repeat = false
		this._repeatCount =  0
	}

	public process(range:Range):void {
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
		if (this._repeat && this._repeatCount > 6) {
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
		this.iNodeAndOffset = { node, offset }
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

	set repeat(value:boolean) {
		this._repeat = value
	}

	public incRepeatCount() {
		this._repeatCount++
	}

	set repeatCount(value:number) {
		this._repeatCount = value
	}

	get NodeAndOffset() {
		return this.iNodeAndOffset;
	}
}

export default InsertText