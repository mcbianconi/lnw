import { Database } from "arangojs";

async function createDb(db: Database) {
    const exist = await db.exists();
    if (!exist) {
        await db.createDatabase("ecoleta", [{ username: "lnw", passwd: "lnw" }]);
    }
    return db
}

async function createPoints(db: Database) {
    const collection = db.collection("points");
    const exist = await collection.exists();
    if (!exist) {
        collection.create({waitForSync: true})
        collection.createGeoIndex(["latitude", "longitude"])
    }
    return db
}

async function createItems(db: Database) {
    const collection = db.collection("items");
    const exist = await collection.exists();
    if (!exist) {
        collection.create({waitForSync: true})
        let items = [
            { _key: 'LAMP', name: 'Lâmpadas', image: 'lampadas.svg'},
            { _key: 'BATT', name: 'Pilhas e baterias', image: 'baterias.svg'},
            { _key: 'PAPE', name: 'Papéis e Papelão', image: 'papeis-papelao.svg'},
            { _key: 'ELET', name: 'Resíduos Eletrônicos', image: 'eletronicos.svg'},
            { _key: 'ORGA', name: 'Resíduos Orgânicos', image: 'organicos.svg'},
            { _key: 'OLEO', name: 'Óleo de cozinha', image: 'oleo.svg'}
        ]
        collection.save(items)
    }
    return db
}

async function createCollect(db: Database) {
    const collection = db.edgeCollection("collects");
    const exist = await collection.exists();
    if (!exist) {
        collection.create({waitForSync: true})
    }
    return db
}

export default {createDb: createDb, createItems: createItems, createPoints: createPoints, createCollect: createCollect}
