import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import TweetTextarea from './TweetTextarea'
import './static/editorStyles.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TweetTextarea className="tweet-textarea-general-style" highlightClassName=""/>
  </StrictMode>,
)
