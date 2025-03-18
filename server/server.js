import express from 'express'

import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'

import cors from 'cors'

import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'

import 'dotenv/config'

const app = express()

const FRONTEND_URL = process.env.FRONTEND_URL
const MONGO_URL = process.env.MONGO_URL
const SESSION_SECRET = process.env.SESSION_SECRET
const PORT = 8080

const MongoDBStore = connectMongoDBSession(session)

mongoose.connect(MONGO_URL)
.then(() => {
    console.log("Connected to MongoDB")
}).catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`)
    process.exit(1)
})

//Set up session store in MongoDB
const store = new MongoDBStore(
    {
        uri: MONGO_URL,
        collection: 'sessions'
    }
)
store.on('error', (err) => {
    console.log(err)
})


//Allow the frontend URL for communication
app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true
    })
)

//Handle JSON body parsing
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: true,
        sameSite: 'strict'
    }
}))

//Import routes from ./routes
app.use('', userRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

