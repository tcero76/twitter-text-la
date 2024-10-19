import React, { useState,
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle } from "react";
import { type HighlightHandle,
	type ITweetTextareaProps } from "./ts/types.ts";
import "./static/editorStyles.css";
import ProcessKeyboard from "./ts/interfaces/ProcessKeyboard.ts";
import ProcessParagraph from "./ts/impl/ProcessParagraph.ts";
import CursorEvent from "./ts/impl/CursorEvent";

let processParagraph:ProcessParagraph
let textArea:ProcessKeyboard | null

const Highlight = forwardRef<HighlightHandle, ITweetTextareaProps>(({
	highlightClassName,
	placeholder,
	process,
	onChangeText,
	...htmlDivAttributes }: ITweetTextareaProps,
	ref: React.ForwardedRef<HighlightHandle>
	): JSX.Element => {
		const editorRef = useRef<HTMLDivElement>(document.createElement('div'));
		const [text, setText] = useState<string>("");
		let cursorEvent:CursorEvent = new CursorEvent()
		if(process) {
			var {
				insertLineBreak,
				insertParagraph,
				insertText,
				processPaste,
				formatText
			} = process
		}

        useImperativeHandle(ref, () => {
            return {
                insertSuggestionAtCaret(suggestion: string):void {
                    const iNodeAndOffset = insertText.NodeAndOffset
                    if(iNodeAndOffset) {
                        const { node } = iNodeAndOffset
                        const word = node.textContent
                        if (!word) return
                        const beforeAfterText = text?.split(word,-1);
                        const newText = beforeAfterText[0] + '#' + suggestion + beforeAfterText[1];
                        const position = beforeAfterText[0].length + suggestion.length + 2;
						formatText.editor = editorRef.current
						formatText.text = newText
                        formatText.textCursorPosition = {start:position, end:position};
						textArea = formatText
                        render();
                    }
            }}
        })

		useEffect(() => {
			processParagraph = new ProcessParagraph()
		},[editorRef])

		function render() {
			const editor = editorRef.current;
			editor.focus();
			const selection = document.getSelection();
			const range = selection?.getRangeAt(0)
			if (range) {
				textArea?.process(range)
				textArea = null
				setText(Array.from(editor.childNodes)
					.map((p) => p.textContent)
					.join("\n"))
			}
		};

		const keyDownListener = (event: React.KeyboardEvent<HTMLDivElement>) => {
			const range = document.getSelection()?.getRangeAt(0);
            if(!range) return
			const editor = editorRef.current
            const rect = editor.getBoundingClientRect();
            const cursorLocation = cursorEvent?.getCursorLocation(editor, range)
            if (cursorLocation) {
                onChangeText({text: editor.textContent,
                    cursorLocation,
                    caretCoordinates: { top: rect.height + 30,
                        left: rect.left + cursorLocation.start + 20}})
            }
			if (event.repeat && event.key !== "Enter" && event.key !== "Backspace") {
				insertText.incRepeatCount();
				insertText.repeat = true
			} else {
				insertText.repeatCountZero
				insertText.repeat = false
			}
		}; 

		const beforeInputListener = (event: React.FormEvent<HTMLDivElement>) => {
			processParagraph.event = event
			processParagraph.editor = editorRef.current
			textArea = processParagraph
			render();
		};

		const pasteListener = (event: React.ClipboardEvent<HTMLDivElement>) => {
			processPaste.event = event
			processPaste.editor = editorRef.current
			textArea = processPaste;
			render();
		};

		const inputListener = (event: React.FormEvent<HTMLDivElement>) => {
			const inputType = (event.nativeEvent as InputEvent).inputType;
			const range = document.getSelection()?.getRangeAt(0);	
			const editor = editorRef.current
			if (!range) return;
			if (inputType === "deleteContentBackward"
				|| inputType === "deleteContentForward"
				|| inputType === "deleteByCut") {
				textArea = insertText
				if (editor.childNodes.length === 1 && editor.textContent?.length === 0 ) {
					while (editor.firstChild) {
						editor.removeChild(editor.firstChild);
					}
				}
			} else if (inputType === "insertParagraph") {
				textArea = insertParagraph
			} else if (inputType === "insertLineBreak") {
				textArea = insertLineBreak
			} else if(inputType === "insertCompositionText") {
				textArea = null
			} else {
				textArea = insertText
			}
			editor.normalize()
			render()
		};
		return (
			<div className={`tweet-textarea ${highlightClassName || "tweet-textarea-general-style" }`}>
				{text.length === 0 && placeholder && (<div className="placeholder">{placeholder}</div>)}
				<div
					{...htmlDivAttributes}
					ref={editorRef}
					className="input-area"
					onKeyDown={keyDownListener}
					onBeforeInput={beforeInputListener}
					onPaste={pasteListener}
					onInput={inputListener}
					contentEditable
				/>
			</div>

		);
	}
);

export default Highlight