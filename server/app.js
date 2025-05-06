/**
 * app.js defines the express application instance to start the backend with, including sessions, CORS, and routes.
 */
import express from 'express'
import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'
import cors from 'cors'

import userRoutes from './routes/userRoutes.js'
import scenarioRoutes from './routes/scenarioRoutes.js'
import taxRoutes from './routes/taxRoutes.js'
import resultRoutes from './routes/resultRoutes.js'
import stateTaxRoutes from './routes/stateTaxRoutes.js'

import 'dotenv/config'
const FRONTEND_URL = process.env.FRONTEND_URL
const MONGO_URL = process.env.MONGO_URL
const SESSION_SECRET = process.env.SESSION_SECRET

import amqp from 'amqplib'
const RABBITMQ_URL = process.env.RABBITMQ_URL

const MongoDBStore = connectMongoDBSession(session)

const app = express()

// Set up session store in MongoDB
const store = new MongoDBStore({
    uri: MONGO_URL,
    collection: 'sessions'
})

store.on('error', (err) => {
    console.log(err)
})

// Allow the frontend URL for communication
app.use(
    cors({
    origin: FRONTEND_URL,
    credentials: true
    })
)

// Handle JSON body parsing
app.use(express.json())

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
    httpOnly: true,
    sameSite: 'strict'
    }
}))

// Connect to AMQP (RabbitMQ) to be notified when a simulation has been completed
const connection = await amqp.connect(process.env.RABBITMQ_URL)
const channel = await connection.createChannel()

// Import routes from ./routes
app.use('', userRoutes)
app.use('', scenarioRoutes(channel))
app.use('', taxRoutes)
app.use('', stateTaxRoutes)
app.use('', resultRoutes())

export default app