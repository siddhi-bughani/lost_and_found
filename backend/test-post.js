async function testInvalidBody() {
    try {
        const response = await fetch('http://localhost:5000/api/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(null),
        })
        const result = await response.text()

        console.log('Status:', response.status)
        console.log('Content-Type:', response.headers.get('content-type'))
        console.log('Response:', result)
    } catch (error) {
        console.error('Request failed:', error.message)
    }
}

testInvalidBody()