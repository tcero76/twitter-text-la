import React, { useEffect, useRef, useState } from 'react'
import Highlight from './Highlight';
import Suggestions from './Suggestions';
import { type HighlightProps,
	type ChangeTextArgs,
	type HighlightHandle,
	type ProcessType, 
	type SuggestionHandler} from './ts/types';
import patterns from "./ts/impl/patterns.ts";
import InsertLineBreak from './ts/impl/InsertLineBreak.ts'
import InsertParagraph from './ts/impl/InsertParagraph.ts'
import InsertText from './ts/impl/InsertText.ts'
import FormatText from './ts/impl/FormatText.ts'
import ProcessPaste from "./ts/impl/ProcessPaste.ts";
import { useKeyPress } from './store/context.tsx';
const STORAGE_KEY = "highlightPattern";

const TweetTextarea:React.FC<HighlightProps> =  ({
	className,
	highlightClassName = '',
	...props}:HighlightProps) => {
	const [changeTextArgs, setChangeTextArgs ] = useState<ChangeTextArgs | null>(null)
	const highlightRef = useRef<HighlightHandle>({ insertSuggestionAtCaret: () => {} })
	const suggestionRef =
		useRef<SuggestionHandler>({ onInc: () => {}, onDec: () => {}, onSelect : () => {}, suggestOff: () => {} })
	let [process, setProcess] = useState<ProcessType | null>(null)
	const [pattern, setPattern ] = useState<RegExp | null>(null)
	const { isSuggesting } = useKeyPress()
	useEffect(() => {
		const storedPattern = window.localStorage.getItem(STORAGE_KEY);
		if (storedPattern && storedPattern.trim() !== "") {
			setPattern(patterns.patternFromString(storedPattern))
		} else {
			patterns
				.initPattern()
				.then((highlightPattern) => {
					window.localStorage.setItem(STORAGE_KEY, highlightPattern.source);
					setPattern(highlightPattern)
				})
				.catch((err) => console.error(err));
		}
	},[])
	useEffect(() => {
		if(!pattern) return
		setProcess({
			insertLineBreak: new InsertLineBreak(pattern, highlightClassName),
			insertParagraph: new InsertParagraph(pattern, highlightClassName),
			insertText: new InsertText(pattern, highlightClassName),
			processPaste: new ProcessPaste(pattern, highlightClassName),
			formatText: new FormatText(pattern, highlightClassName)
		})
	}, [pattern]);

	const onChangeText = (event:ChangeTextArgs) => {
		if(!event) return
		setChangeTextArgs(event)
	}
	const onInsertSuggestion = (suggestion: string) => {
		highlightRef.current?.insertSuggestionAtCaret(suggestion)
	}
	const onKeyDown = (e:React.KeyboardEvent<HTMLDivElement>) => {
		if(isSuggesting) {
			if(e.key === 'ArrowUp') {
				suggestionRef.current?.onDec()
			} else if(e.key === 'ArrowDown') {
				suggestionRef.current?.onInc()
			} else if(e.key === 'Tab' || e.key === 'Enter') {
				suggestionRef.current?.onSelect()
			} else if(e.key === 'Escape') {
				suggestionRef.current?.suggestOff()
			}
		}
	}
	return (
			<div onKeyDown={(e) => onKeyDown(e)}>
				<Highlight className={className}
					onChangeText={onChangeText}
					process={process}
					ref={highlightRef}
					{...props}
				/>
				<Suggestions
					changeTextArgs={changeTextArgs}
					onInsertSuggestion={onInsertSuggestion}
					ref={suggestionRef}/>
			</div>
	)
}

export default TweetTextarea;