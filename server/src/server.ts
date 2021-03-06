import { errors } from 'celebrate'
import cors from 'cors'
import express from 'express'
import path from 'path'
import router from './router'

const app = express()
app.use(cors())
app.use(express.json())
app.use(router)

app.use('/uploads/points/', express.static(path.resolve(__dirname, '..', 'assets', 'points')))
app.use('/uploads/items/', express.static(path.resolve(__dirname, '..', 'assets', 'items')))

app.use(errors())
app.listen(3333)
