import ProcessKeyboard from "../interfaces/ProcessKeyboard"
import { ICursorChangeDetail } from "../types"

class FormatText extends ProcessKeyboard {
	
	private _editor:HTMLDivElement
	private _textCursorPosition:ICursorChangeDetail
	private _text:string

	constructor(pattern:RegExp, highlightClassName:string) {
		super(pattern,highlightClassName)
		this._editor = document.createElement('div')
		this._text = ''
		this._textCursorPosition = { start: 0, end: 0 }
	}
	
	public process(range: Range): void {
		while (this._editor.firstChild) {
			this._editor.removeChild(this._editor.firstChild);
		}
		if (this._text.length === 0) {
			return;
		}
		const splitParagraphs = this._text.split("\n");

		const paragraphElements = splitParagraphs.map((text) => {
			const p = document.createElement("p");
			p.textContent = text;
			p.appendChild(document.createElement("br"));
			return p;
		});
		paragraphElements.forEach((p) => {
			this._editor.appendChild(p);
		});
		for (let i = 0; i < this._editor.childNodes.length; i++) {
			const node = this._editor.childNodes[i];
			if (!node || (node.firstChild as Element).tagName === "BR") {
				continue;
			}
			this.format(range, node.firstChild as Text);
		}
		this.repositionCursorInTextarea(this._editor,this._textCursorPosition);
	}

    private repositionCursorInTextarea(editor: HTMLDivElement, cursorPosition: ICursorChangeDetail): void {
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
        this.repositionCursorInParagraph({ node: startParagraph as Element, offset: 0 }, start);
    }

	set editor(value:HTMLDivElement) {
		this._editor = value
	}
	set text(value:string) {
		this._text = value
	}
	set textCursorPosition(value:ICursorChangeDetail) {
		this._textCursorPosition = value
	}

}

export default FormatText