import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isApiConfigured } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.email.trim()) e.email = 'Required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password) e.password = 'Required.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const eMap = validate()
    setErrors(eMap)
    if (Object.keys(eMap).length) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (isApiConfigured()) {
        // ENDPOINT NEEDS CONFIRMATION from the backend team.
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error('Invalid credentials.')
        const data = await res.json()
        if (data?.token) localStorage.setItem('lf_token', data.token)
      } else {
        // Mock mode: no real auth backend.
        await new Promise((r) => setTimeout(r, 600))
      }
      navigate('/my-reports')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <p className="page-head__kicker">Welcome back</p>
        <h1>Sign in</h1>
        <p className="auth__lede">Access your reports and claim messages.</p>

        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.email ? 'field--error' : ''}`}>
            <span className="field__label">Email <em>*</em></span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              aria-invalid={!!errors.email}
              autoComplete="email"
            />
            {errors.email && <span className="field__msg">{errors.email}</span>}
          </label>

          <label className={`field ${errors.password ? 'field--error' : ''}`}>
            <span className="field__label">Password <em>*</em></span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
            />
            {errors.password && <span className="field__msg">{errors.password}</span>}
          </label>

          {submitError && <p className="form__error" role="alert">{submitError}</p>}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth__alt">
          No account? <Link to="/register">Create one</Link>
        </p>

        {!isApiConfigured() && (
          <p className="form__note">
            Demo mode — sign-in is simulated. Connect a backend via
            <code> VITE_API_BASE_URL</code> for real authentication.
          </p>
        )}
      </div>
    </div>
  )
}
