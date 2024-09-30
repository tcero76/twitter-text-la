import {useEffect, useState} from 'react'
import { ICurorChangeDetail } from './ts/types';
import { InsertText } from './ts/ProcessKeyboard';
import CursorEvent from './ts/CursorEvent';

type TypeUseSuggestion = {
    setText: React.Dispatch<React.SetStateAction<string>>,
    text:string,
    setTextCursorPosition: React.Dispatch<React.SetStateAction<ICurorChangeDetail>>,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    insertText:InsertText,
    editor: HTMLDivElement,
    cursorEvent:CursorEvent
}

const allSuggestions = ["apple", "applebeans", "banana", "cherry", "date", "elderberry", "fig", "grape"];

export function useSuggestion({setText,
    text,
    setTextCursorPosition,
    setShowModal,
    insertText,
    editor,
    cursorEvent}:TypeUseSuggestion) {
		const [suggestions, setSuggestions] = useState<string[]>([]);
		const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
		const getCaretCoordinates = (element: HTMLDivElement, position: number) => {
			const rect = element.getBoundingClientRect();
			return {
				top: rect.height + 30,
				left: rect.left + position + 20,
			};
		};
		const onChangeTextArea = (e:React.FormEvent<HTMLDivElement>) => {
			const firstShard:RegExp = /^#/;
			const range = window.getSelection()?.getRangeAt(0)
			const { textContent } = editor
			if(!range || !textContent) return
			const cursorPosition = cursorEvent.getCursorLocation(editor,range);
			if (!cursorPosition) return
			const { top, left } = getCaretCoordinates(editor, cursorPosition.start);
			setModalPosition({ top, left });
			const inputText = textContent.slice(0, cursorPosition.start);
			const lastWord = inputText.split(/\s/g).pop()??'';
			if(firstShard.test(lastWord)) {
				const matchingSuggestions = allSuggestions.filter(s =>
					s.startsWith(lastWord.replace(firstShard, '')!)
				);
				setSuggestions(matchingSuggestions);
				setShowModal(matchingSuggestions.length > 0);
			} else {
				setShowModal(false)
			}
		}

    const insertSuggestionAtCaret = (suggestion: string) => {
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
            setShowModal(false);
        }
    };
    return {
        insertSuggestionAtCaret,
        onChangeTextArea,
        modalPosition,
        suggestions
    }
}
