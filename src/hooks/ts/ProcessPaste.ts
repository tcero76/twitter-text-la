import { ICurorChangeDetail, INodeAndOffset } from "./types";
import { ProcessKeyboard } from "./ProcessKeyboard";


class ProcessPaste extends ProcessKeyboard {

    private appendTextToParagraph(paragraph: HTMLParagraphElement, text: string): void {
        paragraph.textContent += text;
        if (
            paragraph.textContent?.length === 0 &&
            paragraph.childNodes.length === 0
        ) {
            paragraph.appendChild(document.createElement("br"));
        }
    }

    public repositionCursorInTextarea(editor: HTMLDivElement, cursorPosition: ICurorChangeDetail): void {
        if (editor.childNodes.length === 0) {
            return;
        }
        let { start } = cursorPosition;
        let startParagraph: ChildNode | undefined;
    
        let textLengthToEndOfCurrentParagraph = 0;
        for (let i = 0; i < editor.childNodes.length; i++) {
            const currentParagraph = editor.childNodes[i];
            if (
                currentParagraph.textContent === undefined ||
                currentParagraph.textContent?.length === undefined
            ) {
                continue;
            }
            textLengthToEndOfCurrentParagraph +=
                currentParagraph.textContent.length + 1;
            if (textLengthToEndOfCurrentParagraph >= start) {
                startParagraph = currentParagraph;
                start -=
                    textLengthToEndOfCurrentParagraph -
                    (currentParagraph.textContent.length + 1);
                break;
            }
        }
        if (startParagraph === undefined) {
            return;
        }
        this.repositionCursorInParagraph({ node: startParagraph, offset: 0 }, start);
    }

    private repositionCursorInParagraph(paragraphAndOffset: INodeAndOffset, offset: number): void {
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

	public textareaPasteListener(event: React.ClipboardEvent<HTMLDivElement>, editor: HTMLDivElement): string {
        event.preventDefault();
        const range = document.getSelection()?.getRangeAt(0);
        if (!editor || !range) return ''
        const { startContainer, startOffset, endContainer } = range;
        if (range.toString().length === editor.textContent?.length) {
            while (editor.firstChild) {
                editor.removeChild(editor.firstChild);
            }
        } else {
            range.deleteContents();
        }
        const lines = event.clipboardData.getData("text/plain").split("\n");
        const paragraphs = lines.map((line) => {
            const p = document.createElement("p");
            p.textContent = line;
            if (line.length === 0) {
                p.appendChild(document.createElement("br"));
            }
            return p;
        });
        let lastParagraphLength =
            paragraphs[paragraphs.length - 1].textContent?.length || 0;
        let paragraphsToFormat: HTMLParagraphElement[] = [];
        if (editor.childNodes.length === 0) {
            paragraphs.forEach((node) => editor.appendChild(node));
    
            paragraphsToFormat = paragraphs;
        } else {
            const startParagraph = this.getParentParagraph(startContainer);
            const endParagraph = this.getParentParagraph(endContainer);
    
            if (!startParagraph) {
                return '';
            }
            let paragraphOffsetInEditor = this.findNodeInParent(editor, startParagraph);
            paragraphs.slice(1).forEach((node) => {
                if (!editor || paragraphOffsetInEditor === undefined) {
                    return;
                }
                paragraphOffsetInEditor++;
                this.setCursorPosition(editor, paragraphOffsetInEditor);
                range.insertNode(node);
            });
            if (startParagraph !== endParagraph) {
                if (endParagraph) {
                    if (endParagraph.textContent === undefined || endParagraph.textContent === null ) return ''
                    const lastParagraph = paragraphs[paragraphs.length - 1];
                    this.appendTextToParagraph(lastParagraph, endParagraph.textContent);
                    endParagraph.parentElement?.removeChild(endParagraph);
                }
            } else {
                range.setStart(startContainer, startOffset);
                range.setEnd(startParagraph, startParagraph.childNodes.length);
                const text = range.toString();
                range.deleteContents();
                const lastParagraph = paragraphs[paragraphs.length - 1];
                this.appendTextToParagraph(lastParagraph, text);
            }
    
            if (paragraphs.length === 1 && startParagraph.textContent?.length !== undefined) {
                lastParagraphLength += startParagraph.textContent.length;
            }
            if (startParagraph.textContent === undefined || startParagraph.textContent === null) return ''
            if (paragraphs[0].textContent !== undefined && paragraphs[0].textContent !== null) {
                this.appendTextToParagraph(startParagraph, paragraphs[0].textContent);
            }
            paragraphsToFormat = [startParagraph, ...paragraphs.slice(1)];
        }
        paragraphsToFormat.forEach((node) => {
            if (node.firstChild && node.firstChild.nodeType === 3) {
                this.format(range, node.firstChild as Text);
            }
        });
        const lastParagraph = paragraphsToFormat[paragraphsToFormat.length - 1];
        if (lastParagraph) {
            this.repositionCursorInParagraph({ node: lastParagraph, offset: 0 }, lastParagraphLength);
        }
        editor.normalize();
        return Array.from(editor.childNodes).map((p) => p.textContent).join("\n");
    }
}

export default ProcessPaste