import cors from 'cors'
import express from 'express'
import path from 'path'
import router from './router'


const app = express()
app.use(cors())

app.use(express.json())
app.use(router)

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'assets')))

app.listen(3333)
