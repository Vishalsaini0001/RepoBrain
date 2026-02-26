import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { chatAPI } from '../api/client'
import {
  Send, Bot, User, FileCode, ChevronDown, ChevronUp,
  Loader2, Trash2, Sparkles, MessageSquare
} from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  "Where is the authentication logic?",
  "How do I add a new API route?",
  "What's the main entry point?",
  "How is the database connected?",
  "What design patterns are used here?",
  "How are errors handled?",
]

function ChatMessage({ msg }) {
  const [showSources, setShowSources] = useState(false)
  const isUser = msg.role === 'user'

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
        ${isUser
          ? 'bg-neon-purple/20 border border-neon-purple/40 text-neon-purple'
          : 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
        }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div className={`flex flex-col gap-2 max-w-4xl ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={isUser ? 'chat-user' : 'chat-ai'}>
          {isUser ? (
            <p className="text-gray-200 font-body text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: 'rgba(3, 7, 18, 0.9)',
                          border: '1px solid rgba(0, 229, 255, 0.15)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          margin: '0.75em 0',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    )
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowSources(s => !s)}
              className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-neon-cyan transition-colors"
            >
              <FileCode size={12} />
              {msg.sources.length} source file{msg.sources.length > 1 ? 's' : ''}
              {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {showSources && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.sources.map((src, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-obsidian-800/80 border border-obsidian-600/50 text-xs font-mono text-gray-400"
                  >
                    <span className="text-neon-cyan/60">›</span>
                    <span className="max-w-48 truncate" title={src.file}>{src.file}</span>
                    <span className="text-gray-600">{Math.round(src.relevance * 100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {msg.created_at && (
          <span className="text-xs text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(msg.created_at).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
        <Bot size={14} className="text-neon-cyan" />
      </div>
      <div className="chat-ai flex items-center gap-3">
        <Loader2 size={14} className="text-neon-cyan animate-spin flex-shrink-0" />
        <span className="text-sm font-mono text-gray-400">
          Analyzing codebase<span className="animate-pulse">...</span>
        </span>
      </div>
    </div>
  )
}

export default function ChatInterface({ repo }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (repo) {
      loadHistory()
    }
  }, [repo?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await chatAPI.history(repo.id)
      const msgs = []
      res.data.forEach(m => {
        msgs.push({ role: 'user', content: m.question, created_at: m.created_at, id: m.id + '_q' })
        msgs.push({ role: 'assistant', content: m.answer, sources: m.sources, created_at: m.created_at, id: m.id + '_a' })
      })
      setMessages(msgs)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const sendMessage = async (question) => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q, id: Date.now() + '_q' }])
    setLoading(true)
    try {
      const res = await chatAPI.ask({ repo_id: repo.id, question: q })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
        created_at: res.data.created_at,
        id: res.data.id + '_a'
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Error: ${err.response?.data?.detail || err.message}`,
        id: Date.now() + '_err'
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearHistory = async () => {
    if (!confirm('Clear all chat history for this repository?')) return
    try {
      await chatAPI.clearHistory(repo.id)
      setMessages([])
    } catch (e) {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!repo) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <MessageSquare size={40} className="text-obsidian-600 mx-auto mb-4" />
        <p className="text-gray-600 font-mono text-sm">Select a repository to start chatting</p>
      </div>
    </div>
  )

  if (repo.status === 'indexing') return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="absolute inset-0 border-2 border-neon-cyan/20 rounded-full animate-ping" />
          <div className="absolute inset-2 border-2 border-neon-cyan/40 rounded-full animate-spin" />
          <div className="absolute inset-4 bg-neon-cyan/10 rounded-full" />
        </div>
        <h3 className="font-display text-xl font-semibold text-white mb-2">Indexing Repository</h3>
        <p className="text-gray-500 font-mono text-sm">Cloning and embedding codebase...</p>
        <p className="text-neon-cyan/60 font-mono text-xs mt-2 animate-pulse">This may take a few minutes</p>
      </div>
    </div>
  )

  if (repo.status === 'error') return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="font-display text-xl font-semibold text-white mb-2">Indexing Failed</h3>
        <p className="text-red-400 font-mono text-sm">{repo.error || 'Unknown error occurred'}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-obsidian-700/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="pulse-dot" />
          <div>
            <h3 className="font-display font-semibold text-white text-sm">{repo.name}</h3>
            <p className="text-xs text-gray-500 font-mono">{repo.file_count} files · {repo.chunk_count} chunks indexed</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={20} className="text-neon-cyan animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center mb-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center animate-float">
                <Sparkles size={28} className="text-neon-cyan" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Ask about this codebase</h3>
              <p className="text-gray-500 font-body text-sm max-w-md">
                I've indexed <span className="text-neon-cyan">{repo.chunk_count}</span> code chunks from <span className="text-neon-cyan">{repo.file_count}</span> files.
                Ask me anything about the code!
              </p>
            </div>

            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 rounded-xl glass-card hover:border-neon-cyan/40 transition-all duration-200 text-sm font-body text-gray-300 hover:text-white group"
                >
                  <span className="text-neon-cyan/60 font-mono text-xs mr-2 group-hover:text-neon-cyan">›</span>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
            {loading && <ThinkingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-obsidian-700/60">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about authentication, routing, design patterns..."
              rows={1}
              className="input-field resize-none pr-12 py-3 leading-relaxed max-h-36 overflow-y-auto"
              style={{ minHeight: '48px' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px'
              }}
              disabled={loading}
            />
            <span className="absolute right-3 bottom-3 text-xs text-gray-600 font-mono">⏎</span>
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
                       hover:bg-neon-cyan hover:text-obsidian-950 transition-all duration-200
                       disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-600 font-mono mt-2 text-center">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  )
}
