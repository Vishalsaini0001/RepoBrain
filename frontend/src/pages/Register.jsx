import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Terminal, Zap, Eye, EyeOff, User } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-obsidian-950 grid-bg flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-obsidian-800 neon-border flex items-center justify-center">
              <Terminal className="w-6 h-6 text-neon-cyan" />
            </div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              Code<span className="neon-text">Mind</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-500 font-body text-sm">Join thousands of developers using AI to explore code</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                ⚠ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={30}
                  className="input-field pl-9"
                  placeholder="cool_developer"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Email</label>
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
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-field pr-12"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan transition-colors" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-obsidian-950/30 border-t-obsidian-950 rounded-full animate-spin" /><span>Creating...</span></>
              ) : (
                <><Zap size={16} /><span>Create Account</span></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-obsidian-700 text-center">
            <p className="text-gray-500 text-sm font-body">
              Already have an account?{' '}
              <Link to="/login" className="text-neon-cyan hover:text-neon-green transition-colors font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
