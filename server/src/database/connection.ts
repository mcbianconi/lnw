import { Database } from "arangojs";
import fixtures from './fixtures';
const db = new Database()

const DB_USER = 'lnw'
const DB_PASS = 'lnw'
const DB_NAME = 'ecoleta'

db.useBasicAuth("lnw", "lnw")
db.useDatabase('ecoleta')

async function check_integrity (db: Database) {
    await fixtures.createDb(db);
    await fixtures.createPoints(db);
    await fixtures.createItems(db);
    await fixtures.createCollect(db);
    return db.exists()
}

const conn = {db, check_integrity}

export default conn






