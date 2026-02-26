import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { reposAPI } from '../api/client'
import RepoSidebar from '../components/RepoSidebar'
import ChatInterface from '../components/ChatInterface'
import {
  Terminal, LogOut, Menu, X, ChevronRight,
  Github, Cpu, Database, Zap
} from 'lucide-react'

function Navbar({ user, onLogout, onMenuToggle, menuOpen }) {
  return (
    <header className="h-14 border-b border-obsidian-700/60 glass-card flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-neon-cyan transition-colors"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-obsidian-800 neon-border flex items-center justify-center">
            <Terminal size={13} className="text-neon-cyan" />
          </div>
          <span className="font-display font-bold text-white text-base tracking-tight hidden sm:block">
            Code<span className="neon-text">Mind</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1 ml-2 text-xs font-mono text-gray-600">
          <ChevronRight size={12} />
          <span className="text-gray-400">{user?.username}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-800/60 border border-obsidian-600/40">
          <span className="pulse-dot w-1.5 h-1.5" />
          <span className="text-xs font-mono text-gray-500">AI Ready</span>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
            <span className="text-neon-purple text-xs font-display font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-400 font-body hidden sm:block">{user?.username}</span>
        </div>

        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  )
}

function WelcomeScreen() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        {/* Animated icon cluster */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
            <Github size={24} className="text-neon-cyan" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <ChevronRight size={16} className="text-neon-cyan" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
            <Cpu size={24} className="text-neon-purple" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-obsidian-800 border border-obsidian-600 flex items-center justify-center">
            <ChevronRight size={16} className="text-neon-cyan" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
            <Zap size={24} className="text-neon-green" />
          </div>
        </div>

        <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
          Explore any codebase<br />
          <span className="neon-text">with AI</span>
        </h2>
        <p className="text-gray-500 font-body text-base leading-relaxed mb-8 max-w-lg mx-auto">
          Index a GitHub repository, then ask questions in natural language.
          Understand architecture, find patterns, and navigate unfamiliar code instantly.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          {[
            { icon: Database, color: 'cyan', label: 'Vector Search', desc: 'Semantic code retrieval' },
            { icon: Cpu, color: 'purple', label: 'LLaMA 70B', desc: 'Powered by Groq' },
            { icon: Zap, color: 'green', label: 'Instant Answers', desc: 'Sub-second responses' },
          ].map(({ icon: Icon, color, label, desc }) => (
            <div key={label} className={`glass-card rounded-xl p-4 text-center border-obsidian-700/60`}>
              <Icon size={18} className={`mx-auto mb-2 text-neon-${color}`} />
              <p className="text-xs font-display font-semibold text-white">{label}</p>
              <p className="text-xs text-gray-600 font-mono mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-600 font-mono">
          ← Add a repository from the sidebar to get started
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [repos, setRepos] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchRepos = useCallback(async () => {
    try {
      const res = await reposAPI.list()
      setRepos(res.data)
      // Auto-select first ready repo if none selected
      if (!selectedRepo) {
        const ready = res.data.find(r => r.status === 'ready')
        if (ready) setSelectedRepo(ready)
      } else {
        // Update selected repo data
        const updated = res.data.find(r => r.id === selectedRepo.id)
        if (updated) setSelectedRepo(updated)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedRepo?.id])

  useEffect(() => {
    fetchRepos()
    // Poll while any repo is indexing
    const interval = setInterval(() => {
      const hasIndexing = repos.some(r => r.status === 'indexing')
      if (hasIndexing) fetchRepos()
    }, 5000)
    return () => clearInterval(interval)
  }, [repos.some?.(r => r.status === 'indexing')])

  useEffect(() => {
    fetchRepos()
  }, [])

  const handleRepoDeleted = (id) => {
    setRepos(prev => prev.filter(r => r.id !== id))
    if (selectedRepo?.id === id) setSelectedRepo(null)
  }

  return (
    <div className="min-h-screen bg-obsidian-950 grid-bg flex flex-col">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Navbar user={user} onLogout={logout} onMenuToggle={() => setSidebarOpen(s => !s)} menuOpen={sidebarOpen} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`
            flex-shrink-0 w-72 border-r border-obsidian-700/60 bg-obsidian-900/40 backdrop-blur-sm
            lg:flex lg:flex-col
            ${sidebarOpen ? 'flex flex-col absolute inset-y-0 left-0 z-40 mt-14' : 'hidden'}
          `}>
            <RepoSidebar
              repos={repos}
              selectedRepo={selectedRepo}
              onSelect={(repo) => { setSelectedRepo(repo); setSidebarOpen(false) }}
              onReposChange={fetchRepos}
              onRepoDeleted={handleRepoDeleted}
            />
          </aside>

          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-30 bg-black/60 mt-14" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Main chat area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin" />
              </div>
            ) : selectedRepo ? (
              <ChatInterface repo={selectedRepo} key={selectedRepo.id} />
            ) : (
              <WelcomeScreen />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
