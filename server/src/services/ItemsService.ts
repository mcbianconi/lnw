import { aql, DocumentCollection } from 'arangojs';
import conn from '../database/connection';

const db = conn.db

class ItemsService {

    Collection: DocumentCollection = db.collection('items')

    async list() {
        const QUERY = aql`FOR i IN items RETURN i`;
        const cursor = await db.query(QUERY);
        const items = await cursor.map(item => {
            return {
                _key: item._key,
                name: item.name,
                image_url: `http://localhost:3333/uploads/${item.image}`
            }
        })
        return items
    }


    async get(handle: string) {
        handle = handle.toUpperCase()
        let response = {}
        try {
            const doc = await this.Collection.document(handle)
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

export default ItemsService
