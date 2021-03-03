const mongoose = require('mongoose')

module.exports = function () {
    const db = "mongodb://localhost/foneapi"

    mongoose
        .set('useNewUrlParser', true)
        .set('useUnifiedTopology', true)
        .set('useCreateIndex', true)
        .connect(db)
        .then(() =>
            console.log('Connected to MongoDB...')
        )
        .catch(err => console.error(`Could not connect to ${db}\n${err}`))
}
