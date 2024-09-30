import { ICurorChangeDetail } from "./types";
import { Process } from "./ProcessKeyboard";

class CursorEvent extends Process {

    constructor() {
        super()
    }

    private getTextLengthBeforeCurrentTextNode(textNode: Text, parentParagraph: HTMLParagraphElement): number {
        const INVALID = -1;
        const paragraphImmediateChild =
            textNode.parentElement?.tagName === "P" ? textNode : textNode.parentElement;
        if (!paragraphImmediateChild) {
            return INVALID;
        }
        const immediateChildIndex = this.findNodeInParent(
            parentParagraph,
            paragraphImmediateChild
        );
        if (immediateChildIndex === undefined) {
            return INVALID;
        }
        const nodesBeforeCurrent = Array.from(parentParagraph.childNodes).slice(
            0,
            immediateChildIndex
        );
        return this.sumTextLengthOfNodesArray(nodesBeforeCurrent, 0);
    }

    private sumTextLengthOfNodesArray(arr: Node[], initialValue: number = 0): number {
        return arr.reduce((curLength, p) => {
            if (p.textContent?.length === undefined) {
                return curLength;
            }
            return curLength + p.textContent.length;
        }, initialValue);
    }

    private sumTextLengthOfParagraphsArray(arr: HTMLParagraphElement[], parentElement: Element): number {
        const newlineCount = arr.length < parentElement.childNodes.length ? arr.length : arr.length - 1;
        return this.sumTextLengthOfNodesArray(arr, newlineCount);
    }

    public getCursorLocation(divElement: HTMLDivElement, range: Range): ICurorChangeDetail | null {
        let start: number;
        let end: number;
        if (divElement.childNodes.length === 0) {
            start = end = 0;
            return { start, end };
        }
        let { startContainer, startOffset, endContainer, endOffset } = range;
            if (startContainer === divElement) {
            const paragraphsBeforeStartOffset = Array.from(divElement.childNodes).slice(0, startOffset);
            if (paragraphsBeforeStartOffset.length === 0) {
                start = 0;
            } else {
                start = this.sumTextLengthOfParagraphsArray(paragraphsBeforeStartOffset as HTMLParagraphElement[], divElement);
            }
        } else {
            const startParagraph = this.getParentParagraph(startContainer);
            if (!startParagraph) {
                return null;
            }
            const startPIndex = this.findNodeInParent(divElement, startParagraph);
            if (startPIndex === undefined) {
                return null;
            }
            const paragraphsBeforeStart = Array.from(divElement.childNodes).slice(0, startPIndex);
            if (paragraphsBeforeStart.length === 0) {
                start = 0;
            } else {
                start = this.sumTextLengthOfParagraphsArray(paragraphsBeforeStart as HTMLParagraphElement[], divElement);
            }
            if ((startContainer as Element).tagName === "P") {
                if (startContainer.textContent?.length !== undefined && startContainer.textContent.length > 0) {
                    const nodesBeforeStartOffset = Array.from(startContainer.childNodes).slice(0, startOffset);
                    start = this.sumTextLengthOfNodesArray(nodesBeforeStartOffset, start);
                }
            } else if (startContainer.nodeType === 3) {
                const textLengthBeforeStartContainer =
                    this.getTextLengthBeforeCurrentTextNode(startContainer as Text, startParagraph);
    
                if (textLengthBeforeStartContainer < 0) {
                    return null;
                }
                start += startOffset + textLengthBeforeStartContainer;
            }
        }
        if (endContainer === divElement) {
            const paragraphsBeforeEndOffset = Array.from(divElement.childNodes).slice(0, endOffset);
            if (paragraphsBeforeEndOffset.length === 0) {
                end = 0;
            } else {
                end = this.sumTextLengthOfParagraphsArray(paragraphsBeforeEndOffset as HTMLParagraphElement[], divElement );
            }
        } else {
            const endParagraph = this.getParentParagraph(endContainer);
            if (!endParagraph) {
                return null;
            }
            const endPIndex = this.findNodeInParent(divElement, endParagraph);
            const paragraphsBeforeEnd = Array.from(divElement.childNodes).slice(0, endPIndex);
            if (paragraphsBeforeEnd.length === 0) {
                end = 0;
            } else {
                end = this.sumTextLengthOfParagraphsArray(paragraphsBeforeEnd as HTMLParagraphElement[], divElement);
            }
            if ((endContainer as Element).tagName === "P") {
                if (endContainer.textContent?.length !== undefined && endContainer.textContent.length > 0) {
                    const nodesBeforeEndOffset = Array.from(endContainer.childNodes).slice(0, endOffset);
                    end = this.sumTextLengthOfNodesArray(nodesBeforeEndOffset, end);
                }
            } else if (endContainer.nodeType === 3) {
                const textLengthBeforeEndContainer = this.getTextLengthBeforeCurrentTextNode(endContainer as Text, endParagraph);
                if (textLengthBeforeEndContainer < 0) {
                    return null;
                }
                end += endOffset + textLengthBeforeEndContainer;
            }
        }
        return { start, end };
    }
}

export default CursorEvent