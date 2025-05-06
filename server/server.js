import amqp from 'amqplib'
import mongoose from 'mongoose'
import scraperIrsData from './scraperIrs.js'
import scraperStateYaml from './scraperStateYaml.js'
import 'dotenv/config'

import app from './app.js'

import { fork } from 'child_process'

const MONGO_URL = process.env.MONGO_URL
const NUM_WORKERS = process.env.NUM_WORKERS || 1 // Default to 1 worker if not set
const RABBITMQ_URL = process.env.RABBITMQ_URL
let child_processes = []
const PORT = 8080

// Fork child processes for parallel processing
for (let i = 0; i < NUM_WORKERS; i++) {
  const worker = fork('./workers/simulationWorker.js')
  child_processes.push(worker)
  worker.on('message', (message) => {
    console.log(`Worker ${worker.pid} message:`, message)
  })
  worker.on('error', (error) => {
    console.error(`Worker ${worker.pid} error:`, error)
  })
}

// Handle graceful shutdown of child processes
const signals = ['SIGINT', 'SIGTERM', 'SIGUSR2']
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`Recieved signal ${signal}, Shutting down workers...`)
    child_processes.forEach(worker => {
      worker.kill()
    })
    process.exit(0)
  })
})

// Connect to MongoDB
try {
  await mongoose.connect(MONGO_URL)

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
}
catch(error) {
  console.log(`Error connecting to MongoDB: ${error}`)
  process.kill(process.pid, 'SIGINT')
}

