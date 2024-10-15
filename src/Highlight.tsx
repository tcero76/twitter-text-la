import React, { useState,
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle } from "react";
import { type HighlightHandle,
	ICursorChangeDetail,
	type ITweetTextareaProps } from "./ts/types.ts";
import "./static/editorStyles.css";
import ProcessKeyboardProcess from "./ts/interfaces/ProcessKeyboardProcess.ts";
import ProcessParagraph from "./ts/ProcessParagraph";
import CursorEvent from "./ts/CursorEvent";

let processParagraph:ProcessParagraph
let textArea:ProcessKeyboardProcess | null

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
		const [textCursorPosition, setTextCursorPosition] = useState<ICursorChangeDetail>({ start: 0, end: 0 });
		let repeat:boolean = false
		let repeatCount:number = 0
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
                        const position = beforeAfterText[0].length + suggestion.length + 1;
                        setText(newText);
                        setTextCursorPosition({start:position, end:position});
                    }
            }}
        })

		useEffect(() => {
			processParagraph = new ProcessParagraph(editorRef.current)
		},[editorRef])

		useEffect(() => {
			const editor = editorRef.current;
			const currentTextInEditor = Array.from(editor.childNodes).map((p) => p.textContent).join("\n");
			if (currentTextInEditor !== text) {
				while (editor.firstChild) {
					editor.removeChild(editor.firstChild);
				}
				editor.focus();
				if (text.length === 0) {
					return;
				}
				const range = document.getSelection()?.getRangeAt(0);
				if (range) {
					formatText.formatAfterUpdatingTextFromParent(editor, range, text);
				}
				processPaste.repositionCursorInTextarea(editorRef.current,textCursorPosition);
			}
		}, [text]);

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
			repeat = event.repeat && event.key !== "Enter" && event.key !== "Backspace";
			if (repeat) {
				repeatCount = repeatCount++;
			} else {
				repeatCount = 0;
			}
		}; 

		const beforeInputListener = (event: React.FormEvent<HTMLDivElement>) => {
			const currentText = processParagraph.processParagraph(event);
			setText(currentText);
		};

		const pasteListener = (event: React.ClipboardEvent<HTMLDivElement>) => {
			const currentText = processPaste.textareaPasteListener(event, editorRef.current);
			setText(currentText);
		};

		const inputListener = (event: React.FormEvent<HTMLDivElement>) => {
			const inputType = (event.nativeEvent as InputEvent).inputType;
			const range = document.getSelection()?.getRangeAt(0);
			const editor = editorRef.current
			if (!range) return;
			if (inputType === "deleteContentBackward"
				|| inputType === "deleteContentForward"
				|| inputType === "deleteByCut") {
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
			textArea?.process(range, repeat, repeatCount)
			editor.normalize();
			const currentText = Array.from(editor.childNodes)
				.map((p) => p.textContent)
				.join("\n");
			setText(currentText);
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