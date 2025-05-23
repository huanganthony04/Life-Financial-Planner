import amqp from 'amqplib'
import mongoose from 'mongoose';
import { ScenarioModel } from '../models/ScenarioModel.js'
import ResultsModel from '../models/ResultsModel.js'
import FederalTaxModel from '../models/TaxModel.js'
import StateTaxModel from '../models/StateTaxModel.js'
import runSimulations from '../simulator/runSimulations.js'
import { createCSV, logFinancialEvents } from '../components/logger.js'

import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
dotenv.config({
    path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env')
})

const RABBITMQ_URL = process.env.RABBITMQ_URL
const MONGO_URL = process.env.MONGO_URL

let connection, channel

async function init() {

    await mongoose.connect(MONGO_URL)
    connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()

    const queue = 'simulation_queue'
    await channel.assertQueue(queue, { durable: true })

    console.log(`Worker ${process.pid} waiting for messages`)

    // Message logic goes here
    channel.consume(queue, async (msg) => {
        if (msg !== null) {

            console.log(`Worker ${process.pid} received message:`, msg.content.toString())
            const { userId, email, scenarioId, resultsId, num } = JSON.parse(msg.content.toString())

            const resultsModel = await ResultsModel.findById(resultsId)
            const scenario = await ScenarioModel.findOne({_id: scenarioId}).lean()

            if (!scenario) {
                console.log(`Can't find scenario: ${scenarioId}`)
            }
            const federalTaxRates = await FederalTaxModel.findOne().lean()


            let stateTaxRates;
            if (scenario.residenceState) {
                stateTaxRates = await StateTaxModel.findOne({state: scenario.residenceState}).lean()
            }
            else {
                stateTaxRates = await StateTaxModel.findOne().lean()
            }

            try {

                // Run the simulation
                let results = runSimulations(scenario, num, federalTaxRates, stateTaxRates)

                resultsModel.simulationResults = results
                resultsModel.status = 'Complete'
                await resultsModel.save()
                await createCSV(email.split("@")[0], resultsModel)
                await logFinancialEvents(email.split("@")[0], scenario)
                console.log(`Worker ${process.pid} completed simulation and stored in ${resultsId}`)
                channel.ack(msg)

            }
            catch(error) {
                console.log(`ERROR in Worker ${process.pid}: `, error)
                await resultsModel.deleteOne()
                channel.nack(msg, false, false)
            }
        }
        else {
            console.log(`Worker ${process.pid} received null message`)
            channel.ack(msg)
        }
    })
}

let signals = ['SIGINT','SIGTERM']
signals.forEach(signal => {
    process.on(signal, async () => {
        console.log(`Worker ${process.pid} shutting down...`)
        await channel.close()
        await connection.close()
        process.exit(0)
    })
})

//Initialize the worker
init()
.catch((error) => {
    console.error('Error in worker:', error)
    process.exit(1)
})
