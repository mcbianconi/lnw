import express from 'express';

const app = express()

app.get('/users', (request, response) => {
    console.log('lista usuarios')
    response.json([
        'U1',
        'U2'
    ])
})

app.listen(3333)