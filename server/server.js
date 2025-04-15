import express from 'express'
import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'
import cors from 'cors'
import mongoose from 'mongoose'
import scraperIrsData from './scraperIrs.js'
import scraperStateYaml from './scraperStateYaml.js'
import 'dotenv/config'

import app from './app.js'

const MONGO_URL = process.env.MONGO_URL
const PORT = 8080

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

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`)
    process.exit(1)
  })
