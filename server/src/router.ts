import express from 'express';
import conn from './database/connection';
import ItemsService from './services/ItemsService';
import PointsService from './services/PointsService';

const db = conn.db

const router = express.Router()

const pointsService = new PointsService()
const itemsService = new ItemsService()

router.get('/', async (request, response) => {
    const r = await db.collections()
    return response.json(r)
})

router.get('/db', async (request, response) => {
    conn.check_integrity(db)
    return response.json('done')
})

router.get('/items', async (request, response) => {
    const list = await itemsService.list()
    return response.json(list)
})

router.get('/items/:id', async (request, response) => {
    const {id} = request.params
    const items = await itemsService.get(id)
    return response.json(items)
})


router.post('/points', async (request, response) => {
    const {name,email,whatsapp,latitude,longitude,city,uf,items} = request.body
    const point = await pointsService.create({name, email, whatsapp, latitude, longitude, city, uf, items})
    response.json(point)
})

router.get('/points', async (request, response) => {
    let {city, uf, items} = request.query
    items = items ? String(items).split(',').map(item => item.trim()) : []
    const params = {
        city: city,
        uf: uf,
        items: items
    }
    const points = await pointsService.list(params)
    return response.json(points)
})

router.get('/points/:id', async (request, response) => {
    const {id} = request.params
    const point = await pointsService.get(id)
    return response.json(point)
})

export default router
