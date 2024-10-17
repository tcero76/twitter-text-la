import ProcessKeyboardProcess from "./interfaces/ProcessKeyboardProcess"
import ProcessPaste from "./ProcessPaste"
import { ICursorChangeDetail } from "./types"

class FormatText extends ProcessKeyboardProcess {
	
	private _editor:HTMLDivElement
	private _textCursorPosition:ICursorChangeDetail
	private _text:string
	private processPaste:ProcessPaste

	constructor(pattern:RegExp, highlightClassName:string) {
		super(pattern,highlightClassName)
		this._editor = document.createElement('div')
		this._text = ''
		this._textCursorPosition = { start: 0, end: 0 }
		this.processPaste = new ProcessPaste(pattern, highlightClassName)
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
		this.processPaste.repositionCursorInTextarea(this._editor,this._textCursorPosition);
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