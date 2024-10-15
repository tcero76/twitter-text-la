import Process from "./interfaces/Process";

class ProcessParagraph extends Process {

    private editor:HTMLDivElement

    constructor(editor:HTMLDivElement) {
        super()
        this.editor = editor
    }

    public processParagraph(event: React.FormEvent<HTMLDivElement>):string {
        const selection = document.getSelection();
        const range = selection?.getRangeAt(0);
        if (!range) return ''
        const selectedText = range?.toString();
        const inputEvent = event as unknown as InputEvent;
        const data = inputEvent.data;
        const keyboardKey = data === "\n" || data === "\r" 
            ? "Enter"
            : data === " "
                ? "Space"
                : inputEvent.data;
        if (!range.collapsed && selectedText && selectedText.length === this.editor.textContent?.length) {
            while (this.editor.firstChild) {
                this.editor.removeChild(this.editor.firstChild);
            }
        }
        if (this.editor.childNodes.length === 0 && keyboardKey) {
            event.preventDefault();
            const paragraph = document.createElement("p");
            if (keyboardKey === "Enter") {
                paragraph.innerHTML = "<br>";
                const paragraph2 = document.createElement("p");
                paragraph2.innerHTML = "<br>";
                this.editor.appendChild(paragraph);
                this.editor.appendChild(paragraph2);
                this.setCursorPosition(paragraph2, 0);
            } else {
                const text = keyboardKey === "Space" ? "\u00A0" : keyboardKey;
                const textNode = document.createTextNode(text);
                paragraph.appendChild(textNode);
                this.editor.appendChild(paragraph);
                this.setCursorPosition(textNode, 1);
            }

        }
        const { startContainer, startOffset } = range;
        if (startContainer === this.editor) {
            const paragraph = this.editor.childNodes[startOffset - 1];
            this.setCursorPosition(paragraph, paragraph.childNodes.length);
        }
        if (keyboardKey === "Space" && startContainer.parentElement?.tagName === "SPAN" && startOffset === startContainer.textContent?.length) {
            event.preventDefault();
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
        return Array.from(this.editor.childNodes)
            .map((p) => p.textContent)
            .join("\n");
        }
}

export default ProcessParagraph