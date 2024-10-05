import React from 'react'
import Highlight from './Highlight';

type HighlightProps = {
	className:string
}

const TweetTextarea:React.FC<HighlightProps> =  ({className}:HighlightProps) => {
	return <Highlight className={className}/>
}

export default TweetTextarea;