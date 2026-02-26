import React, { useState } from 'react'
import { reposAPI } from '../api/client'
import { Github, Plus, Loader2, Trash2, RefreshCw, AlertCircle, CheckCircle, GitBranch, FileCode } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    ready: { color: 'text-neon-green', dot: 'bg-neon-green', label: 'Ready' },
    indexing: { color: 'text-neon-orange', dot: 'bg-neon-orange animate-pulse', label: 'Indexing' },
    error: { color: 'text-red-400', dot: 'bg-red-400', label: 'Error' },
  }
  const s = map[status] || map.error
  return (
    <span className={`flex items-center gap-1.5 text-xs font-mono ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

export default function RepoSidebar({ repos, selectedRepo, onSelect, onReposChange, onRepoDeleted }) {
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [indexing, setIndexing] = useState(false)
  const [error, setError] = useState('')

  const handleIndex = async (e) => {
    e.preventDefault()
    setError('')
    setIndexing(true)
    try {
      const res = await reposAPI.index({ repo_url: url.trim(), branch: branch.trim() || 'main' })
      onReposChange()
      setUrl('')
      setBranch('main')
      setShowForm(false)
      onSelect(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start indexing')
    } finally {
      setIndexing(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this repository?')) return
    try {
      await reposAPI.delete(id)
      onRepoDeleted(id)
      onReposChange()
    } catch (err) {}
  }

  const handleRefresh = async (e, repo) => {
    e.stopPropagation()
    try {
      await reposAPI.index({ repo_url: repo.repo_url, branch: repo.branch })
      onReposChange()
    } catch (err) {}
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-5 border-b border-obsidian-700/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-white text-sm">Repositories</h2>
            <p className="text-xs text-gray-600 font-mono mt-0.5">{repos.length} indexed</p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-colors flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Index Form */}
        {showForm && (
          <form onSubmit={handleIndex} className="space-y-3">
            {error && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider">GitHub URL</label>
              <div className="relative">
                <Github size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://github.com/user/repo"
                  className="input-field pl-8 text-xs py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5 uppercase tracking-wider">Branch</label>
              <div className="relative">
                <GitBranch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="main"
                  className="input-field pl-8 text-xs py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={indexing} className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5">
                {indexing ? <><Loader2 size={12} className="animate-spin" />Indexing...</> : <><Plus size={12} />Index Repo</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto py-2">
        {repos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Github size={24} className="text-obsidian-600 mx-auto mb-3" />
            <p className="text-gray-600 text-xs font-mono">No repositories yet</p>
            <p className="text-gray-700 text-xs font-mono mt-1">Click + to add one</p>
          </div>
        ) : (
          repos.map(repo => (
            <button
              key={repo.id}
              onClick={() => onSelect(repo)}
              className={`w-full text-left px-4 py-3 hover:bg-obsidian-800/50 transition-all duration-150 group border-l-2
                ${selectedRepo?.id === repo.id
                  ? 'border-l-neon-cyan bg-obsidian-800/60'
                  : 'border-l-transparent'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                      <Github size={10} className="text-neon-cyan/70" />
                    </div>
                    <span className="text-sm font-display font-medium text-gray-200 truncate">{repo.name}</span>
                  </div>
                  <StatusBadge status={repo.status} />
                  {repo.status === 'ready' && (
                    <p className="text-xs font-mono text-gray-600 mt-1.5 flex items-center gap-1.5">
                      <FileCode size={10} />
                      {repo.file_count} files · {repo.chunk_count} chunks
                    </p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={e => handleRefresh(e, repo)}
                    className="w-6 h-6 rounded hover:bg-obsidian-700 flex items-center justify-center text-gray-500 hover:text-neon-cyan transition-colors"
                    title="Re-index"
                  >
                    <RefreshCw size={11} />
                  </button>
                  <button
                    onClick={e => handleDelete(e, repo.id)}
                    className="w-6 h-6 rounded hover:bg-red-500/20 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
