
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

export default Process