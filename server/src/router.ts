import { celebrate, Joi } from 'celebrate';
import express from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import ItemsService from './services/ItemsService';
import PointsService from './services/PointsService';

const router = express.Router()
const upload = multer(multerConfig)

const pointsService = new PointsService()
const itemsService = new ItemsService()

router.get('/', async (request, response) => {
    const r = "welcome"
    return response.json(r)
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


router.post(
    '/points',
     upload.single('image'),
     celebrate({
         body: Joi.object().keys({
             name: Joi.string().required(),
             email: Joi.string().required().email(),
             whatsapp: Joi.string().required(),
             latitude: Joi.number().required(),
             longitude: Joi.number().required(),
             city: Joi.string().required(),
             uf: Joi.string().required().max(2),
             items: Joi.string().required(),
         })
     }, {
         abortEarly: false
     }),
     async (request, response) => {
    const {name,email,whatsapp,latitude,longitude,city,uf,items} = request.body
    const items_array = items.split(',').map((item:string) => item.trim())
    const image = request.file.filename
    const point = await pointsService.create({name, email, whatsapp, image, latitude, longitude, city , uf, items: items_array})
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
