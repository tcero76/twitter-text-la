import ProcessKeyboardProcess from "./interfaces/ProcessKeyboardProcess";

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

export default InsertLineBreak