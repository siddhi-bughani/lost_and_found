import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createItem, CATEGORIES, LOCATIONS, STATUSES } from '../services/items'
import { isApiConfigured } from '../services/api'

export default function Report() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    date: '',
    location: '',
    status: params.get('status') === 'found' ? 'found' : 'lost',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((er) => ({ ...er, image: 'Please choose an image file.' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: 'Image must be under 5 MB.' }))
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors((er) => ({ ...er, image: undefined }))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required.'
    if (!form.description.trim()) e.description = 'Required.'
    if (!form.category) e.category = 'Choose a category.'
    if (!form.location) e.location = 'Choose a location.'
    if (!form.status) e.status = 'Choose a status.'
    if (form.date && isNaN(new Date(form.date))) e.date = 'Invalid date.'
    if (form.date && new Date(form.date) > new Date()) {
      e.date = 'Date cannot be in the future.'
    }
    return e
  }

  async function submit(e) {
    e.preventDefault()
    const eMap = validate()
    setErrors(eMap)
    if (Object.keys(eMap).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const created = await createItem({ ...form }, imageFile)
      navigate(`/items/${created.id}`)
    } catch (err) {
      setSubmitError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="report">
      <header className="page-head">
        <p className="page-head__kicker">New report</p>
        <h1>Report an item</h1>
        <p className="page-head__lede">
          Provide as much detail as you can — it helps the right person find
          your report.
        </p>
      </header>

      <form className="form" onSubmit={submit} noValidate>
        <fieldset className="form__group">
          <legend>Item details</legend>

          <label className={`field ${errors.name ? 'field--error' : ''}`}>
            <span className="field__label">Item name <em>*</em></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'err-name' : undefined}
              placeholder="e.g. Black leather wallet"
            />
            {errors.name && <span id="err-name" className="field__msg">{errors.name}</span>}
          </label>

          <label className={`field ${errors.description ? 'field--error' : ''}`}>
            <span className="field__label">Description <em>*</em></span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'err-desc' : undefined}
              placeholder="Describe distinguishing features, contents, color, condition…"
            />
            {errors.description && <span id="err-desc" className="field__msg">{errors.description}</span>}
          </label>

          <div className="field-row">
            <label className={`field ${errors.category ? 'field--error' : ''}`}>
              <span className="field__label">Category <em>*</em></span>
              <select
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                aria-invalid={!!errors.category}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className="field__msg">{errors.category}</span>}
            </label>

            <label className={`field ${errors.location ? 'field--error' : ''}`}>
              <span className="field__label">Campus location <em>*</em></span>
              <select
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                aria-invalid={!!errors.location}
              >
                <option value="">Select…</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {errors.location && <span className="field__msg">{errors.location}</span>}
            </label>
          </div>

          <div className="field-row">
            <label className={`field ${errors.date ? 'field--error' : ''}`}>
              <span className="field__label">Date</span>
              <input
                type="date"
                value={form.date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setField('date', e.target.value)}
                aria-invalid={!!errors.date}
              />
              {errors.date && <span className="field__msg">{errors.date}</span>}
            </label>

            <fieldset className="field field--status">
              <span className="field__label">Status <em>*</em></span>
              <div className="status-toggle">
                {STATUSES.map((s) => (
                  <label key={s} className={form.status === s ? 'is-active' : ''}>
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={form.status === s}
                      onChange={() => setField('status', s)}
                    />
                    <span>{s === 'lost' ? 'I lost it' : 'I found it'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </fieldset>

        <fieldset className="form__group">
          <legend>Image</legend>
          <label className={`field ${errors.image ? 'field--error' : ''}`}>
            <span className="field__label">Upload a photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              aria-invalid={!!errors.image}
            />
            {errors.image && <span className="field__msg">{errors.image}</span>}
          </label>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Selected item preview" />
              <button type="button" className="btn btn--ghost" onClick={clearImage}>
                Remove image
              </button>
            </div>
          )}
        </fieldset>

        {submitError && (
          <p className="form__error" role="alert">{submitError}</p>
        )}

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/browse')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>

        {!isApiConfigured() && (
          <p className="form__note">
            Running in demo mode — reports are stored only in memory and won&rsquo;t
            persist. Set <code>VITE_API_BASE_URL</code> to connect a real backend.
          </p>
        )}
      </form>
    </div>
  )
}
