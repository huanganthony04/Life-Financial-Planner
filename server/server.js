import express from 'express'
import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'
import cors from 'cors'
import mongoose from 'mongoose'
import userRoutes from './routes/userRoutes.js'
import scenarioRoutes from './routes/scenarioRoutes.js'
import taxRoutes from './routes/taxRoutes.js'
import scraperIrsData from './scraperIrs.js'
import stateTaxRoutes from './routes/stateTaxRoutes.js'
import scraperStateYaml from './scraperStateYaml.js'
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

    // Run the IRS scraper on server startup
    scraperIrsData()
      .then(() => {
        console.log("IRS scraper executed successfully.")
      })
      .catch((error) => {
        console.error("Error executing IRS scraper:", error)
      })

    // Run the State YAML loader/scraper
    scraperStateYaml()
      .then(() => {
        console.log("State YAML data loaded successfully.")
      })
     .catch ((error) => {
       console.error("Error loading state YAML data:", error)
      })

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

    // Import routes from ./routes
    app.use('', userRoutes)
    app.use('', scenarioRoutes)
    app.use('', taxRoutes)
    app.use('', stateTaxRoutes)

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`)
    process.exit(1)
  })
