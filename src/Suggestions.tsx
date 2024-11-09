import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { type SuggestionsProps, type SuggestionHandler } from './ts/types';
import { getSuggestion } from './http/http';
import { useKeyPress } from './store/context';

const Suggestions = forwardRef<SuggestionHandler,SuggestionsProps>(({
    changeTextArgs,
    onInsertSuggestion
}:SuggestionsProps, ref: ForwardedRef<SuggestionHandler>): JSX.Element => {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [selectedSuggestion, setSelectedSuggestion ] = useState<number>(0)
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 })
    const { enableSuggest, disableSuggest, isSuggesting } = useKeyPress()
    useImperativeHandle(ref, () => ({
        onInc() {
            if(suggestions.length > selectedSuggestion+1) {
                setSelectedSuggestion(selectedSuggestion+1)
            }
        },
        onDec() {
            if(selectedSuggestion > 0) {
                setSelectedSuggestion(selectedSuggestion-1)
            }
        },
        onSelect() {
            onInsertSuggestion(suggestions[selectedSuggestion])
            disableSuggest()
        }

    }))
    useEffect(() => {
        const firstShard:RegExp = /^#\D.*\S$/;
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
                getSuggestion()
                    .then(res => {
                        const matchingSuggestions = res.data.filter(s =>
                            s.startsWith(lastWord.replace('#', '')!)
                        );
                        setSuggestions(matchingSuggestions);
                        if (matchingSuggestions.length > 0) {
                            enableSuggest()
                        }
                    })
                    .catch(res => {
                        console.error(res.message)
                    })
            } else {
                disableSuggest()
            }
        }
    },[changeTextArgs])
    const onClickSuggestion = (suggestion:string) => {
        onInsertSuggestion(suggestion)
        disableSuggest()
    }
    return (
        <>
        {isSuggesting && (
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
                className={"suggestion" + (idx===selectedSuggestion?" selected":"")}
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
    )})

export default Suggestions