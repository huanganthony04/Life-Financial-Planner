import express from 'express'
import getUserAuth from './middleware/auth.js'
import ResultsModel from '../models/ResultsModel.js'

export default function createResultRouter() {
    
    const router = express.Router()

    //Get result by scenario ID
    router.get('/api/results', getUserAuth, async (req, res) => {

        const userId = req.user._id
        const scenarioId = req.query.id

        const results = await ResultsModel.findOne({scenarioId: scenarioId, owner: userId}).lean()

        if (!results) {
            // No results for the given scenario
            return res.status(200).json(null)
        }
        else return res.status(200).json({results})
    })

    return router
}