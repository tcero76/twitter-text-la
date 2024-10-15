import FormatText from "./FormatText";
import InsertLineBreak from "./InsertLineBreak";
import InsertText from "./InsertText";
import InsertParagraph from "./interfaces/InsertParagraph";
import ProcessPaste from "./ProcessPaste";

export interface INodeAndOffset {
    node: Element;
    offset: number;
}

export interface INullNodeAndOffset {
    node: null;
    offset: null;
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

export type SuggestionsProps = {
    changeTextArgs:ChangeTextArgs | null;
    onInsertSuggestion:(suggestion: string) => void
}


export type HighlightProps = {
	className:string
	highlightClassName:string
}