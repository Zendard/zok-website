const { MongoClient } = require("mongodb");

console.log(credentials);

// Replace the uri string with your connection string.
const uri = `mongodb+srv://${credentials.username}:${credentials.Password}@zok.srwzq7w.mongodb.net/?retryWrites=true&w=majority`;

const mongoCient = new MongoClient(uri);

async function getItems() {
	try {
		const database = client.db("Zok");
		const collection = database.collection("Calendar");

		const cursor = collection.find();
		const items = await cursor.toArray();
		return items;
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
}

export default getItems;
