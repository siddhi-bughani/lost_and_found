import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchItemById, contactOwner } from '../services/items'
import { useApi } from '../services/api'
import Spinner from '../components/Spinner'
import ErrorState from '../components/ErrorState'
import StatusBadge from '../components/StatusBadge'

export default function ItemDetails() {
  const { id } = useParams()
  const { data: item, loading, error } = useApi(() => fetchItemById(id), [id])

  if (loading) return <Spinner />
  if (error) return <ErrorState message={error.message} />
  if (!item) return <ErrorState message="Item not found." />

  return (
    <div className="details">
      <Link to="/browse" className="back-link">← Back to browse</Link>

      <div className="details__layout">
        <div className="details__media">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} />
          ) : (
            <span className="item-card__placeholder">No image provided</span>
          )}
        </div>

        <div className="details__body">
          <div className="details__top">
            <StatusBadge status={item.status} />
            <span className="item-card__category">{item.category}</span>
          </div>
          <h1>{item.name}</h1>
          <p className="details__desc">{item.description}</p>

          <dl className="details__meta">
            <div>
              <dt>Location</dt>
              <dd>{item.location}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDate(item.date)}</dd>
            </div>
            <div>
              <dt>Reported</dt>
              <dd>{formatDate(item.createdAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{item.status === 'lost' ? 'Lost' : 'Found'}</dd>
            </div>
          </dl>

          <ContactForm item={item} />
        </div>
      </div>
    </div>
  )
}

function ContactForm({ item }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState(null)

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required.'
    if (!form.email.trim()) e.email = 'Required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.message.trim()) e.message = 'Required.'
    return e
  }

  async function submit(ev) {
    ev.preventDefault()
    const eMap = validate()
    setErrors(eMap)
    if (Object.keys(eMap).length) return
    setSending(true)
    setSendError(null)
    try {
      await contactOwner(item.id, form)
      setSent(true)
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="contact-sent">
        <h3>Message sent</h3>
        <p>
          Thanks, {form.name.split(' ')[0]}. The reporter will reach out to you
          at {form.email} if this item is a match.
        </p>
      </div>
    )
  }

  return (
    <form className="form contact" onSubmit={submit} noValidate>
      <h3>{item.status === 'lost' ? 'Think you found this?' : 'Think this is yours?'}</h3>
      <p>Send a message to get in touch about this item.</p>

      <label className={`field ${errors.name ? 'field--error' : ''}`}>
        <span className="field__label">Your name <em>*</em></span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          aria-invalid={!!errors.name}
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
        />
        {errors.email && <span className="field__msg">{errors.email}</span>}
      </label>

      <label className={`field ${errors.message ? 'field--error' : ''}`}>
        <span className="field__label">Message <em>*</em></span>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setField('message', e.target.value)}
          placeholder="Briefly describe how to identify the item."
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className="field__msg">{errors.message}</span>}
      </label>

      {sendError && <p className="form__error" role="alert">{sendError}</p>}

      <button type="submit" className="btn btn--primary" disabled={sending}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
