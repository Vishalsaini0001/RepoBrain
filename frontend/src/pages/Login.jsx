import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Terminal, Github, Zap, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 grid-bg flex items-center justify-center relative overflow-hidden px-4">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent animate-scan" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-obsidian-800 neon-border flex items-center justify-center">
              <Terminal className="w-6 h-6 text-neon-cyan" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              Code<span className="neon-text">Mind</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 font-body text-sm">Sign in to explore your codebases</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                ⚠ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="dev@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pr-12"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-obsidian-700 text-center">
            <p className="text-gray-500 text-sm font-body">
              Don't have an account?{' '}
              <Link to="/register" className="text-neon-cyan hover:text-neon-green transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs font-mono mt-6">
          <Github size={12} className="inline mr-1" />
          AI-powered codebase intelligence
        </p>
      </div>
    </div>
  )
}
