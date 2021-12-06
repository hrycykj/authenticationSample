const mongoose = require ("mongoose")

const credentials = './config/atlasCertificate.pem'
const { MONGO_URI } = process.env

exports.connect = () => {
    mongoose
        .connect (MONGO_URI, {
            // userNewUrlParser: true,
            // useUnifiedTopology: true,
            // useCreateIndex: true,
            // useFindAndModify: false,
            sslKey: credentials,
            sslCert: credentials
        })
        .then( () => {
            console.log('Successfully connected to the database.')
        })
        .catch( (error) => {
            console.log('Database connection failed.  Exiting now...')
            console.log (error)
            process.exit(1)
        })
}