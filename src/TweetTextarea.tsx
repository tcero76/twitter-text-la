import React, { useRef, useState } from 'react'
import Highlight, { HighlightHandle } from './Highlight';
import Suggestions from './Suggestions';
import { ChangeTextArgs } from './hooks/ts/types';

type HighlightProps = {
	className:string
}

const TweetTextarea:React.FC<HighlightProps> =  ({className}:HighlightProps) => {
	const [changeTextArgs, setChangeTextArgs ] = useState<ChangeTextArgs | null>(null)
	const highlightRef = useRef<HighlightHandle>({insertSuggestionAtCaret: (suggestion:string) => null})
 	const onChangeText = (event:ChangeTextArgs) => {
		if(!event) return
		setChangeTextArgs(event)
	}
	const onInsertSuggestion = (suggestion: string) => {
		highlightRef.current?.insertSuggestionAtCaret(suggestion)
	}
	return (<>
				<Highlight className={className} onChangeText={onChangeText} ref={highlightRef}/>
				<Suggestions changeTextArgs={changeTextArgs} onInsertSuggestion={onInsertSuggestion}/>
			</>
	)
}

export default TweetTextarea;