import { useContext, useReducer, createContext, ReactNode } from 'react'

type KeyPressState = {
    isSuggesting: boolean
}

type KeyPressValue = {
    toggleSuggest: () => void
    enableSuggest: () => void
    disableSuggest: () => void
} & KeyPressState

const KeysContext = createContext<KeyPressValue | null>(null)

export function useKeyPress() {
    const keyPressCtx = useContext(KeysContext)
    if (keyPressCtx === null) {
        throw new Error('keyPressCtx es nulo')
    }
    return keyPressCtx
}

type Action = 'onFocus' | 'onGlobal' | 'onToggle'

function keyPressReducers(state:KeyPressState, action:Action):KeyPressState {
    if (action === 'onFocus') {
        return { 
            ...state,
            isSuggesting: true
        }
    } else if(action === 'onGlobal') {
        return {
            ...state,
            isSuggesting: false
        }
    } else if(action === 'onToggle') {
        return { 
            ...state,
            isSuggesting: !state.isSuggesting
        }
    }
    return state
}

type KeyPressProviderProps = {
    children: ReactNode
}

const initialState:KeyPressState = {
    isSuggesting: false
}

export default function KeyPressProvider({
    children
}:KeyPressProviderProps):JSX.Element{
    const [keyPressState, dispatch] = useReducer(keyPressReducers, initialState)
    const ctx:KeyPressValue = {
        isSuggesting: keyPressState.isSuggesting,
        toggleSuggest: () => {
            dispatch('onToggle')
        },
        enableSuggest: () => {
            dispatch('onFocus')
        },
        disableSuggest: () => {
            dispatch('onGlobal')
        }
    }
    return <KeysContext.Provider value={ctx}>{children}</KeysContext.Provider>
}