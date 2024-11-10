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
import { useKeyPress } from "./store/context.tsx";

let processParagraph:ProcessParagraph
let textArea:ProcessKeyboard | null

const Highlight = forwardRef<HighlightHandle, ITweetTextareaProps>(({
	highlightClassName,
	placeholder,
	process,
	onChangeText,
	...props }: ITweetTextareaProps,
	ref: React.ForwardedRef<HighlightHandle>
	): JSX.Element => {
		const editorRef = useRef<HTMLDivElement>(document.createElement('div'));
		const [text, setText] = useState<string>("");
		const { isSuggesting } = useKeyPress()
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
					let firstShard:RegExp = /#[^\s#]+/g;
                    const iNodeAndOffset = insertText.NodeAndOffset
                    if(iNodeAndOffset) {
                        const { node } = iNodeAndOffset
                        const word = node.textContent
                        if (word) {
							const positionArr = text.split(firstShard).map(str => str.length)
							node.textContent = '#' + suggestion
							let innerText = editorRef.current.innerText
							const domText = innerText.split(/\n\n/g,-1).flatMap(str => str.match(firstShard)).filter(item => item !=null)
							let textLinear = text.split(/\n\n/g,-1).flatMap(str => str.match(firstShard)).filter(item => item !=null)
							if (!domText || !textLinear) return
							let i = -1
							let position:number = 0
							formatText.text = text.replace(firstShard, ():string => {
								i++
								position += positionArr[i]
								if(innerText[i] !== textLinear[i]) {
									position += domText[i].length
									return domText[i]
								} else {
									return textLinear[i]
								}
							})
							formatText.editor = editorRef.current
							formatText.textCursorPosition = {start:position, end:position };
							textArea = formatText
							render();
						}
                    }
            	}
			}
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
			if (isSuggesting &&
				(event.key === 'ArrowUp' ||
				event.key === 'ArrowDown'||
				event.key === 'Tab' ||
				event.key === 'Enter')) {
				event.preventDefault()
				return
			}
			if (event.repeat && event.key !== "Enter" && event.key !== "Backspace") {
				insertText.incRepeatCount();
			} else {
				insertText.repeatCountReset()
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
			const range = document.getSelection()?.getRangeAt(0)
			if (!range) return;
			const editor = editorRef.current
            const rect = editor.getBoundingClientRect();
            const cursorLocation = cursorEvent?.getCursorLocation(editor, range)
            if (cursorLocation) {
                onChangeText({
					text: editor.innerText,
                    cursorLocation,
                    caretCoordinates: {
						top: rect.height + 30,
                        left: rect.left + cursorLocation.start + 20
					}})
            }
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
			<div className={`tweet-textarea ${highlightClassName || "tweet-textarea-general-style" }`} {...props}>
				{text.length === 0 && placeholder && (<div className="placeholder">{placeholder}</div>)}
				<div
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