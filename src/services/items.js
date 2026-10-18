/**
 * Item-related API methods.
 *
 * Mock data is kept separate from real API logic. When VITE_API_BASE_URL is
 * configured, the real API is called. Otherwise, mock data is returned so the
 * UI can be demonstrated standalone.
 *
 * ENDPOINTS MARKED `// CONFIRM` need confirmation from the backend team.
 */

import { get, post, isApiConfigured, uploadImage } from './api'
import { mockItems, mockMyItems } from '../data/mockItems'

const USE_MOCK = !isApiConfigured()

// Simulate latency for a realistic loading state in mock mode.
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Accessories',
  'Books',
  'Keys & Cards',
  'Bags',
  'Documents',
  'Other',
]

export const LOCATIONS = [
  'Central Library',
  'Student Union',
  'Engineering Building',
  'Science Block',
  'Athletics Center',
  'Dining Hall',
  'Dormitories',
  'Campus Quad',
]

export const STATUSES = ['lost', 'found']

/**
 * Fetch all items with optional filters.
 * @param {{ q?: string, status?: string, category?: string, location?: string }} filters
 */
export async function fetchItems(filters = {}) {
  if (USE_MOCK) {
    await delay()
    return filterMock(mockItems, filters)
  }
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.location) params.set('location', filters.location)
  return get(`/items?${params.toString()}`) // CONFIRM endpoint
}

export async function fetchItemById(id) {
  if (USE_MOCK) {
    await delay()
    const item = mockItems.find((i) => i.id === id)
    if (!item) throw new Error('Item not found')
    return item
  }
  return get(`/items/${id}`) // CONFIRM endpoint
}

export async function fetchMyItems() {
  if (USE_MOCK) {
    await delay()
    return mockMyItems
  }
  return get('/items/me') // CONFIRM endpoint
}

/**
 * Create a new report.
 * @param {object} payload item fields
 * @param {File|null} imageFile optional image
 */
export async function createItem(payload, imageFile = null) {
  if (USE_MOCK) {
    await delay(700)
    const newItem = {
      id: `m-${Date.now()}`,
      ...payload,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : null,
      createdAt: new Date().toISOString(),
    }
    mockItems.unshift(newItem)
    return newItem
  }
  // Real flow: upload image first (if any), then create the item.
  let imageUrl = null
  if (imageFile) {
    const uploadRes = await uploadImage('/uploads/image', imageFile) // CONFIRM
    imageUrl = uploadRes?.url || null
  }
  return post('/items', { ...payload, imageUrl }) // CONFIRM endpoint
}

/**
 * Contact / claim action on an item.
 * @param {string} id
 * @param {{ name: string, email: string, message: string }} contact
 */
export async function contactOwner(id, contact) {
  if (USE_MOCK) {
    await delay(600)
    return { ok: true, id, ...contact }
  }
  return post(`/items/${id}/contact`, contact) // CONFIRM endpoint
}

function filterMock(items, filters) {
  const q = (filters.q || '').trim().toLowerCase()
  return items.filter((i) => {
    if (q) {
      const hay = `${i.name} ${i.description} ${i.location}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (filters.status && i.status !== filters.status) return false
    if (filters.category && i.category !== filters.category) return false
    if (filters.location && i.location !== filters.location) return false
    return true
  })
}
