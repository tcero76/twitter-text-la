import { ComponentPropsWithoutRef } from 'react'
import FormatText from "./impl/FormatText";
import InsertLineBreak from "./impl/InsertLineBreak";
import InsertText from "./impl/InsertText";
import InsertParagraph from "./impl/InsertParagraph";
import ProcessPaste from "./impl/ProcessPaste";

export interface INodeAndOffset {
    node: Element;
    offset: number;
}

export interface ITextUpdateDetail {
    currentText: string;
}

export interface ICursorChangeDetail {
    start: number;
    end: number;
}

export type ChangeTextArgs = {
    text:string | null
    cursorLocation: ICursorChangeDetail | null
    caretCoordinates: {top:number, left: number}
}

export type ProcessType = {
	insertLineBreak:InsertLineBreak
	insertParagraph:InsertParagraph
	insertText:InsertText
	processPaste:ProcessPaste
	formatText:FormatText
}

export interface ITweetTextareaProps
    extends Omit<
        React.HTMLAttributes<HTMLDivElement>,
        "onBeforeInput" | "onPaste" | "onInput" | "contentEditable"
    > {
    highlightClassName?: string;
    placeholder?: string;
    process:ProcessType | null;
    onChangeText: (event:ChangeTextArgs) => void;
}

export type HighlightHandle = {
    insertSuggestionAtCaret: (suggestion:string) => void
}

export type SuggestionHandler = {
    onInc: () => void
    onDec: () => void
}

export type SuggestionsProps = {
    changeTextArgs:ChangeTextArgs | null;
    onInsertSuggestion:(suggestion: string) => void
}


export type HighlightProps = {
	className:string
	highlightClassName:string
} & ComponentPropsWithoutRef<'div'>