import express from 'express'
import { Scenario } from '../classes.js'
import UserModel from '../models/UserModel.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import ResultsModel from '../models/ResultsModel.js'
import FederalTaxModel from '../models/TaxModel.js'
import StateTaxModel from '../models/StateTaxModel.js'
import importScenario from '../components/importer.js'
import runSimulation from '../components/simulator.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

const router = express.Router()

//Get result by scenario ID
router.get('/api/results', async (req, res) => {

    const scenarioId = req.query.id
    console.log(scenarioId)

    const results = await ResultsModel.findOne({scenario: scenarioId})
    if (!results) {
        return res.status(404).json({error: 'Results not found'})
    }
    else {
        return res.status(200).json(results)
    }
})

export default router