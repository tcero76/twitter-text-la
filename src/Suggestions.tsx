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
        },
        suggestOff() {
            disableSuggest()
        }

    }))
    useEffect(() => {
        const firstShard:RegExp = /^#\D+$/
        const palabras:RegExp = /\s/
        const selection = window.getSelection()
        if(selection?.rangeCount) {
            const range = selection.getRangeAt(0)
            if(!changeTextArgs) return
            const { text, cursorLocation, caretCoordinates } = changeTextArgs
            if(!range || !text) return
            if (!cursorLocation) return
            setModalPosition(caretCoordinates);
            const lineas = text.split("\n\n").map(str => str.replace(/\n/,''))
            const linesWords = lineas.flatMap(str => str.split(palabras))
            const lineasCount = linesWords.map(str => str.length)
            let index:number = 0
            lineasCount.reduce((acumulador:number, valorActual:number, idx:number) => {
                acumulador+=valorActual+1
                if(cursorLocation.start<=acumulador && index === 0) {
                    index = idx
                }
                return acumulador
            },-1)
            const lastWord = linesWords[index]??'';
            if(firstShard.test(linesWords[index])) {
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
                setSelectedSuggestion(0)
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