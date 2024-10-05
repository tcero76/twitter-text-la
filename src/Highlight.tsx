import React, { useState, useEffect, useRef, forwardRef } from "react";
import patterns from "./hooks/ts/patterns.ts";
import customEvents from "./hooks/ts/customEvents.ts";
import { ICurorChangeDetail, ITweetTextareaProps } from "./hooks/ts/types.ts";
import "./static/editorStyles.css";
import { ProcessKeyboardProcess,
	InsertLineBreak,
	InsertParagraph,
	InsertText, 
	FormatText} from './hooks/ts/ProcessKeyboard.ts'
import ProcessParagraph from "./hooks/ts/ProcessParagraph.ts";
import ProcessPaste from "./hooks/ts/ProcessPaste.ts";
import CursorEvent from "./hooks/ts/CursorEvent.ts";
import { useSuggestion } from "./hooks/useSuggestion.tsx";

const STORAGE_KEY = "highlightPattern";
let insertLineBreak:InsertLineBreak
let insertParagraph:InsertParagraph
let insertText:InsertText
var textArea:ProcessKeyboardProcess | null
let processParagraph:ProcessParagraph
let processPaste:ProcessPaste
let cursorEvent:CursorEvent
let formatText:FormatText
const textAreaCols = 40;

const Highlight = forwardRef<HTMLDivElement | null, ITweetTextareaProps>((
	{className, highlightClassName = '', placeholder, value, cursorPosition, onTextUpdate, onCursorChange, ...htmlDivAttributes }: ITweetTextareaProps,
	ref: React.ForwardedRef<HTMLDivElement>
	): JSX.Element => {
		const editorRef = useRef<HTMLDivElement>(document.createElement('div'));
		const [text, setText] = useState<string>("");
		const [textCursorPosition, setTextCursorPosition] = useState<ICurorChangeDetail>({ start: 0, end: 0 });
		const [repositionCursor, setRepositionCursor] = useState<boolean>(false);
		let repeat:boolean = false
		let repeatCount:number = 0
		const [showModal, setShowModal] = useState(false);

		useEffect(() => {
			let pattern:RegExp | null = null;
			function init(pattern: RegExp) {
				insertLineBreak = new InsertLineBreak(pattern, highlightClassName)
				insertParagraph = new InsertParagraph(pattern, highlightClassName)
				insertText = new InsertText(pattern, highlightClassName)
				processPaste = new ProcessPaste(pattern, highlightClassName)
				formatText = new FormatText(pattern, highlightClassName)
			}
			processParagraph = new ProcessParagraph(editorRef.current)
			cursorEvent = new CursorEvent()
			const storedPattern = window.localStorage.getItem(STORAGE_KEY);
			if (storedPattern && storedPattern.trim() !== "") {
				pattern = patterns.patternFromString(storedPattern);
			}
			if(pattern){
				init(pattern)
			} else {
				patterns
					.initPattern()
					.then((highlightPattern) => {
						window.localStorage.setItem(STORAGE_KEY, highlightPattern.source);
						init(highlightPattern)
					})
					.catch((err) => console.error(err));
			}

		}, []);

		useEffect(() => {
			if (onTextUpdate) {
				editorRef.current.addEventListener(customEvents.textUpdateEvent, onTextUpdate as EventListener);
			}
			if (onCursorChange) {
				editorRef.current.addEventListener(customEvents.cursorChangeEvent, onCursorChange as EventListener);
			}
			return () => {
				if (onTextUpdate) {
					editorRef.current.removeEventListener(customEvents.textUpdateEvent, onTextUpdate as EventListener);
				}

				if (onCursorChange) {
					editorRef.current.removeEventListener(customEvents.cursorChangeEvent, onCursorChange as EventListener);
				}
			};
		}, [editorRef.current, onTextUpdate, onCursorChange]);

		useEffect(() => {
			if (text !== value && value !== undefined) {
				setText(value);
			}
		}, [value]);

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
				if (cursorPosition) {
					setTextCursorPosition(cursorPosition);
				}
				setRepositionCursor(true);
			}
		}, [text]);

		useEffect(() => {
			if (repositionCursor) {
				setRepositionCursor(false);
				processPaste.repositionCursorInTextarea(editorRef.current,textCursorPosition);
			}
		}, [textCursorPosition, repositionCursor]);

		const {
			insertSuggestionAtCaret,
			onChangeTextArea,
			modalPosition,
			suggestions
		} = useSuggestion({setText,
			text,
			setTextCursorPosition,
			setShowModal,
			insertText,
			editor: editorRef.current,
			cursorEvent
		});


		const keyDownListener = (event: React.KeyboardEvent<HTMLDivElement>) => {
			onChangeTextArea(event)
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
			if (!event.isDefaultPrevented()) return;
			customEvents.dispatchTextUpdateEvent(editorRef.current, { currentText });
		};

		const pasteListener = (event: React.ClipboardEvent<HTMLDivElement>) => {
			const currentText = processPaste.textareaPasteListener(event, editorRef.current);
			setText(currentText);
			if (!event.isDefaultPrevented()) {
				return;
			}
			customEvents.dispatchTextUpdateEvent(editorRef.current, { currentText });
		};

		const inputListener = (event: React.FormEvent<HTMLDivElement>) => {
			const inputType = (event.nativeEvent as InputEvent).inputType;
			const range = document.getSelection()?.getRangeAt(0);
			const editor = editorRef.current
			if (!range) return;
			if (inputType === "deleteContentBackward" || inputType === "deleteContentForward" || inputType === "deleteByCut" ) {
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
			textArea?.process(range,repeat,repeatCount)
			editor.normalize();
			const currentText = Array.from(editor.childNodes)
				.map((p) => p.textContent)
				.join("\n");
			setText(currentText);
			customEvents.dispatchTextUpdateEvent(editor, { currentText });
		};

		const cursorEventDispatch = () => {
			const selection = document.getSelection()
			if (selection && selection.rangeCount) {
				const range = selection.getRangeAt(0)
				const cursorPosition = cursorEvent.getCursorLocation(editorRef.current,range);
				if (cursorPosition) customEvents.dispatchCursorChangeEvent(editorRef.current, cursorPosition);
			}
		};

		return (
			<div className={`tweet-textarea ${className || "tweet-textarea-general-style" }`}>
				{text.length === 0 && placeholder && (<div className="placeholder">{placeholder}</div>)}
				<div
					{...htmlDivAttributes}
					ref={editorRef}
					className="input-area"
					onKeyDown={keyDownListener}
					onBeforeInput={beforeInputListener}
					onPaste={pasteListener}
					onInput={inputListener}
					onKeyUp={cursorEventDispatch}
					onMouseUp={cursorEventDispatch}
					contentEditable
				/>
				{showModal && (
					<div id="suggestions"
					style={{
						position: "absolute",
						top: modalPosition.top,
						left: modalPosition.left,
						backgroundColor: "white",
						border: "1px solid #ccc",
						padding: "10px",
						boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
						zIndex: 10,
						maxHeight: "150px",
						overflowY: "auto",
					}}
					>
					{suggestions.map((s, idx) => (
						<div
						id={idx.toString()}
						key={idx}
						className="suggestion"
						style={{
							padding: "5px",
							cursor: "pointer",
						}}
						onClick={() => insertSuggestionAtCaret(s)}
						>
						{s}
						</div>
					))}
					</div>
				)}

			</div>

		);
	}
);

export default Highlight