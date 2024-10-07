import React, { useEffect, useState } from 'react'
import { ChangeTextArgs } from './hooks/ts/types';

export type SuggestionsProps = {
    changeTextArgs:ChangeTextArgs | null;
    onInsertSuggestion:(suggestion: string) => void
}
const allSuggestions = ["apple", "applebeans", "banana", "cherry", "date", "elderberry", "fig", "grape"];
const Suggestions = ({
    changeTextArgs,
    onInsertSuggestion
}:SuggestionsProps) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        const firstShard:RegExp = /^#/;
        const selection = window.getSelection()
        if(selection?.rangeCount) {
            const range = selection.getRangeAt(0)
            if(!changeTextArgs) return
            const { text, cursorLocation, caretCoordinates } = changeTextArgs
            if(!range || !text) return
            if (!cursorLocation) return
            setModalPosition(caretCoordinates);
            const inputText = text.slice(0, cursorLocation.start);
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
    },[changeTextArgs])
    const onClickSuggestion = (suggestion:string) => {
        setShowModal(false)
        onInsertSuggestion(suggestion)
    }
    return (
        <>
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
                onClick={() => onClickSuggestion(s)}
                >
                {s}
                </div>
            ))}
            </div>
        )}
        </>
    )}

export default Suggestions