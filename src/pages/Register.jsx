import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isApiConfigured } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required.'
    if (!form.email.trim()) e.email = 'Required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password) e.password = 'Required.'
    else if (form.password.length < 8) e.password = 'At least 8 characters.'
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
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
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        })
        if (!res.ok) throw new Error('Could not create account.')
      } else {
        await new Promise((r) => setTimeout(r, 700))
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
        <p className="page-head__kicker">Join the community</p>
        <h1>Create account</h1>
        <p className="auth__lede">Register to report items and manage your posts.</p>

        <form className="form" onSubmit={submit} noValidate>
          <label className={`field ${errors.name ? 'field--error' : ''}`}>
            <span className="field__label">Full name <em>*</em></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-invalid={!!errors.name}
              autoComplete="name"
            />
            {errors.name && <span className="field__msg">{errors.name}</span>}
          </label>

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
              autoComplete="new-password"
            />
            {errors.password && <span className="field__msg">{errors.password}</span>}
          </label>

          <label className={`field ${errors.confirm ? 'field--error' : ''}`}>
            <span className="field__label">Confirm password <em>*</em></span>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) => setField('confirm', e.target.value)}
              aria-invalid={!!errors.confirm}
              autoComplete="new-password"
            />
            {errors.confirm && <span className="field__msg">{errors.confirm}</span>}
          </label>

          {submitError && <p className="form__error" role="alert">{submitError}</p>}

          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth__alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        {!isApiConfigured() && (
          <p className="form__note">
            Demo mode — registration is simulated. Connect a backend via
            <code> VITE_API_BASE_URL</code> for real accounts.
          </p>
        )}
      </div>
    </div>
  )
}
