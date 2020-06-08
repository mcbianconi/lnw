import { Database } from "arangojs";
import fixtures from './fixtures';

const db = new Database()

const DB_USER = 'lnw'
const DB_PASS = 'lnw'
const DB_NAME = 'ecoleta'

async function check_integrity (db: Database) {
    await fixtures.createDb(db);
    await fixtures.createPoints(db);
    await fixtures.createItems(db);
    await fixtures.createCollect(db);
    return db.exists()
}

db.useDatabase('ecoleta')
db.useBasicAuth(DB_USER, DB_USER)
fixtures.createDb(db)
fixtures.createPoints(db)
fixtures.createItems(db)
fixtures.createCollect(db)



const conn = {db, check_integrity}

export default conn






