import React, { useEffect, useRef, useState } from 'react'
import Highlight, { HighlightHandle } from './Highlight';
import Suggestions from './Suggestions';
import { ChangeTextArgs, ProcessType } from './ts/types';
import patterns from "./ts/patterns.ts";
import {
	InsertLineBreak,
	InsertParagraph,
	InsertText, 
	FormatText} from './ts/ProcessKeyboard.ts'
import ProcessPaste from "./ts/ProcessPaste.ts";
type HighlightProps = {
	className:string
	highlightClassName:string
}

const TweetTextarea:React.FC<HighlightProps> =  ({
	className,
	highlightClassName = ''}:HighlightProps) => {
	const [changeTextArgs, setChangeTextArgs ] = useState<ChangeTextArgs | null>(null)
	const highlightRef = useRef<HighlightHandle>({insertSuggestionAtCaret: (suggestion:string) => null})
	const STORAGE_KEY = "highlightPattern";
	let [process, setProcess] = useState<ProcessType | null>(null)
	const [pattern, setPattern ] = useState<RegExp | null>(null) ;
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
	return (<>
				<Highlight className={className}
					onChangeText={onChangeText}
					process={process}
					ref={highlightRef}
				/>
				<Suggestions changeTextArgs={changeTextArgs} onInsertSuggestion={onInsertSuggestion}/>
			</>
	)
}

export default TweetTextarea;