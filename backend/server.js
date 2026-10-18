const supabase = require('./supabase')
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: 'http://localhost:5173',
}))

app.use(express.json())

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'Invalid JSON request body',
        })
    }

    next(err)
})

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CampusFind backend is running!',
    })
})

app.get('/health/db', async(req, res) => {
    const { error } = await supabase
        .from('items')
        .select('id')
        .limit(1)

    if (error) {
        console.error('Database connection failed:', error.message)
        return res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
        })
    }

    res.json({
        status: 'ok',
        message: 'Supabase database connected!',
    })
})


app.get('/api/items', async(req, res) => {
    try {

        let query = supabase
            .from('items')
            .select('*')

        const { status, category, location, q } = req.query

        console.log('Received filters:', req.query)

        if (status && ['lost', 'found'].includes(status)) {
            query = query.eq('status', status)
        }

        if (category) {
            query = query.ilike('category', category)
        }

        if (location) {
            query = query.ilike('location', `%${location}%`)
        }

        if (q) {
            const search = q.trim().replace(/[,%()]/g, ' ')
            if (search) {
                query = query.or(
                    `name.ilike.%${search}%,description.ilike.%${search}%`
                )
            }
        }

        const { data, error } = await query
            .order('created_at', { ascending: false })


        if (error) {
            console.error('Failed to fetch items:', error.message)
            return res.status(500).json({
                error: 'Failed to fetch items',
            })
        }

        const items = data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            status: item.status,
            location: item.location,
            date: item.date,
            imageUrl: item.image_url,
            contact: item.contact,
            createdAt: item.created_at,
        }))

        res.json(items)
    } catch (error) {
        console.error('Unexpected error:', error.message)
        res.status(500).json({
            error: 'Internal server error',
        })
    }
})


app.get('/api/items/:id', async(req, res) => {
    try {
        const { id } = req.params

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error) {
            console.error('Failed to fetch item:', error.message)
            return res.status(500).json({
                error: 'Failed to fetch item',
            })
        }

        if (!data) {
            return res.status(404).json({
                error: 'Item not found',
            })
        }

        const item = {
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status,
            location: data.location,
            date: data.date,
            imageUrl: data.image_url,
            contact: data.contact,
            createdAt: data.created_at,
        }

        res.json(item)
    } catch (error) {
        console.error('Unexpected error:', error.message)
        res.status(500).json({
            error: 'Internal server error',
        })
    }
})


function isValidDate(date) {
    if (typeof date !== 'string') {
        return false
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)

    if (!match) {
        return false
    }

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false
    }

    const parsedDate = new Date(Date.UTC(year, month - 1, day))

    return (
        parsedDate.getUTCFullYear() === year &&
        parsedDate.getUTCMonth() === month - 1 &&
        parsedDate.getUTCDate() === day
    )
}

app.post('/api/items', async(req, res) => {
    try {
        const {
            name,
            description,
            category,
            status,
            location,
            date,
            imageUrl,
            contact,
        } = req.body


        // 1. Validate required fields are non-empty strings
        const requiredFields = {
            name,
            description,
            category,
            status,
            location,
            contact,
        }

        for (const [field, value] of Object.entries(requiredFields)) {
            if (typeof value !== 'string' || !value.trim()) {
                return res.status(400).json({
                    error: `Please provide a valid ${field}`,
                })
            }
        }

        // 2. Validate status
        if (!['lost', 'found'].includes(status)) {
            return res.status(400).json({
                error: 'Status must be either lost or found',
            })
        }

        // 3. Validate optional date
        if (date !== undefined && date !== null && date !== '') {
            if (!isValidDate(date)) {
                return res.status(400).json({
                    error: 'Date must be a valid date in YYYY-MM-DD format',
                })
            }
        }

        // 4. Validate optional imageUrl
        if (
            imageUrl !== undefined &&
            imageUrl !== null &&
            imageUrl !== '' &&
            (typeof imageUrl !== 'string' || !imageUrl.trim())
        ) {
            return res.status(400).json({
                error: 'Image URL must be a valid string',
            })
        }

        // 3. Prepare the database record
        const newItem = {
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            status,
            location: location.trim(),
            contact: contact.trim(),
            ...(date && { date }),
            ...(imageUrl && { image_url: imageUrl }),
        }

        // 4. Insert into Supabase
        const { data, error } = await supabase
            .from('items')
            .insert([newItem])
            .select()
            .single()

        if (error) {
            console.error('Failed to create item:', error.message)
            return res.status(500).json({
                error: 'Failed to create item',
            })
        }

        // 5. Return the newly created item
        const item = {
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.category,
            status: data.status,
            location: data.location,
            date: data.date,
            imageUrl: data.image_url,
            contact: data.contact,
            createdAt: data.created_at,
        }

        return res.status(201).json(item)
    } catch (error) {
        console.error('Unexpected error:', error.message)
        return res.status(500).json({
            error: 'Internal server error',
        })
    }
})


app.listen(PORT, () => {
    console.log(`CampusFind API running at http://localhost:${PORT}`)
})