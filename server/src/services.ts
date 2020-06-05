import { aql } from 'arangojs';
import conn from './database/connection';

const db = conn.db

const itemsService = {
    async list () {
        const result = await db.query(aql`
        FOR d IN items
        RETURN d
      `);
      return result
    }
}

export default {itemsService}
