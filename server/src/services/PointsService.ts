import { aql } from 'arangojs';
import slugify from 'slugify';
import conn from '../database/connection';

const db = conn.db

interface Point {
    name: string,
    email: string,
    whatsapp: string,
    latitude: number,
    longitude: number,
    city: string,
    uf: string,
    items: string[],
    image?: string[]
}
class PointsService {

    async create(point: Point) {

        const Points = db.collection('points')
        const Collects = db.edgeCollection('collects')

        const trx = await db.beginTransaction([Collects, Points])

        try {
            point.city = slugify(point.city, {lower: true})
            const model = await Points.save(point)
            point.items.forEach(async item => {
                const data = {
                    created_at: new Date(),
                    _from: model._id,
                    _to: `items/${item}`
                }
                Collects.save(data)
            });
            trx.commit()
            return this.get(model)
        } catch (error) {
            console.log(error);
            trx.abort()
        }
    }

    async list(filters: { city: any; uf: any; items: string[]; }) {
        let point_filters = []

        const {city, uf, items} = filters

        if (uf) point_filters.push(aql`FILTER p.uf == ${uf}`)

        if (city) {
            const citySlug = slugify(city, {lower: true})
            point_filters.push(aql`FILTER p.city == ${citySlug}`)
        }

        items.forEach(item => {
            point_filters.push(aql`FILTER ${item} in p.items`)
        })

        const POINT_FILTERS = aql.join(point_filters)
        const QUERY = aql`
        FOR p IN points ${POINT_FILTERS}
            RETURN MERGE (p, {
                items: DOCUMENT('items', p.items),
                image: 'https://images.unsplash.com/photo-1498579397066-22750a3cb424?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=30'
            })`

        const cursor = await db.query(QUERY);
        const result = await cursor.all()
        return result
    }

    async get(handle: any) {
        const Points = db.collection('points')
        let response = {}
        try {
            const doc = await Points.document(handle)
            response = doc
        } catch (err) {
            response = err
            if (err.isArangoError) {
                response = err.response.body
            }
        } finally {
            return response
        }
    }
}

export default PointsService
