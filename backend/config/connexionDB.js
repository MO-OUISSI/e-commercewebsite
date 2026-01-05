const mongoose = require(`mongoose`);
require('dotenv').config();

function connection() {
    const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/womensClothingStore";
    return mongoose.connect(dbUri)
        .then(() => console.log(`Connected to database: ${dbUri}`))
        .catch(e => {
            console.log(`Database connection error: ` + e);
            throw e;
        });
}
module.exports = connection