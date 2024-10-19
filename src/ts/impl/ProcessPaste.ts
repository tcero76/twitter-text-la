import ProcessKeyboard from "../interfaces/ProcessKeyboard";

class ProcessPaste extends ProcessKeyboard {

    private _event:React.ClipboardEvent<HTMLDivElement> | null
    private _editor:HTMLDivElement | null
    
    constructor(pattern:RegExp, highlightClassName:string) {
        super(pattern, highlightClassName)
        this._editor = null
        this._event = null
    }
    private appendTextToParagraph(paragraph: HTMLParagraphElement, text: string): void {
        paragraph.textContent += text;
        if (
            paragraph.textContent?.length === 0 &&
            paragraph.childNodes.length === 0
        ) {
            paragraph.appendChild(document.createElement("br"));
        }
    }

	public process(range:Range): void {
        if(!this._event || !this._editor) return
        this._event.preventDefault();
        const { startContainer, startOffset, endContainer } = range;
        if (range.toString().length === this._editor.textContent?.length) {
            while (this._editor.firstChild) {
                this._editor.removeChild(this._editor.firstChild);
            }
        } else {
            range.deleteContents();
        }
        const lines = this._event.clipboardData.getData("text/plain").split("\n");
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
        if (this._editor.childNodes.length === 0) {
            paragraphs.forEach((node) => this._editor?.appendChild(node));
            paragraphsToFormat = paragraphs;
        } else {
            const startParagraph = this.getParentParagraph(startContainer);
            const endParagraph = this.getParentParagraph(endContainer);
            if (!startParagraph) {
                return '';
            }
            let paragraphOffsetInEditor = this.findNodeInParent(this._editor, startParagraph);
            paragraphs.slice(1).forEach((node) => {
                if (!this._editor || paragraphOffsetInEditor === undefined) {
                    return;
                }
                paragraphOffsetInEditor++;
                this.setCursorPosition(this._editor, paragraphOffsetInEditor);
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
        this._editor.normalize();
    }

    set event(value:React.ClipboardEvent<HTMLDivElement>) {
        this._event = value
    }

    set editor(value:HTMLDivElement) {
        this._editor = value
    }
}

export default ProcessPaste