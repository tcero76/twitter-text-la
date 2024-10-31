import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TweetTextarea from './TweetTextarea'
import KeyPressProvider, { useKeyPress } from './store/context.tsx';
import './static/editorStyles.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeyPressProvider>
      <TweetTextarea className="tweet-textarea-general-style" highlightClassName=""/>
    </KeyPressProvider>
  </StrictMode>,
)
