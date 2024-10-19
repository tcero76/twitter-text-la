import ProcessKeyboard from "../interfaces/ProcessKeyboard";

class ProcessParagraph extends ProcessKeyboard {

    private _editor:HTMLDivElement | null
    private _event:React.FormEvent<HTMLDivElement> | null

    constructor() {
        super(new RegExp(""), '')
        this._editor = null
        this._event = null
    }

    public process():void {
        const selection = document.getSelection();
        const range = selection?.getRangeAt(0);
        if (!range) return
        const selectedText = range?.toString();
        const inputEvent = this._event as unknown as InputEvent;
        const data = inputEvent.data;
        const keyboardKey = data === "\n" || data === "\r" 
            ? "Enter"
            : data === " "
                ? "Space"
                : inputEvent.data;
        if (!range.collapsed && selectedText && selectedText.length === this._editor?.textContent?.length) {
            while (this._editor?.firstChild) {
                this._editor?.removeChild(this._editor?.firstChild);
            }
        }
        if (this._editor?.childNodes.length === 0 && keyboardKey) {
            this._event?.preventDefault();
            const paragraph = document.createElement("p");
            if (keyboardKey === "Enter") {
                paragraph.innerHTML = "<br>";
                const paragraph2 = document.createElement("p");
                paragraph2.innerHTML = "<br>";
                this._editor?.appendChild(paragraph);
                this._editor?.appendChild(paragraph2);
                this.setCursorPosition(paragraph2, 0);
            } else {
                const text = keyboardKey === "Space" ? "\u00A0" : keyboardKey;
                const textNode = document.createTextNode(text);
                paragraph.appendChild(textNode);
                this._editor?.appendChild(paragraph);
                this.setCursorPosition(textNode, 1);
            }
        }
        const { startContainer, startOffset } = range;
        if (startContainer === this._editor) {
            const paragraph = this._editor?.childNodes[startOffset - 1];
            if(!paragraph) return
            this.setCursorPosition(paragraph, paragraph.childNodes.length);
        }
        if (keyboardKey === "Space" && startContainer.parentElement?.tagName === "SPAN" && startOffset === startContainer.textContent?.length) {
            this._event?.preventDefault();
            const spanElement = startContainer.parentElement;
            if (spanElement && spanElement.parentElement) {
                let offsetInParent = this.findNodeInParent(spanElement.parentElement, spanElement);
                if (offsetInParent != null && offsetInParent !== undefined) {
                    offsetInParent++;
                    range.setStart(spanElement.parentElement, offsetInParent);
                    range.collapse(true);
                    const textNode = document.createTextNode("\u00A0");
                    range.insertNode(textNode);
                    this.setCursorPosition(textNode, 1);
                }
            }
        }
    }
    set editor(value:HTMLDivElement) {
        this._editor = value
    }

    set event(value:React.FormEvent<HTMLDivElement>) {
        this._event = value
    }
}

export default ProcessParagraph