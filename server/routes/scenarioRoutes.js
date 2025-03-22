import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import UserModel from '../models/UserModel.js'
import ScenarioModel from '../models/ScenarioModel.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

const router = express.Router()

router.get('/api/scenario/:userId', async (req, res) => {

    const userId = req.params.userId

    try {
        const user = await UserModel.findOne({_id: userId})
        await user.populate({
            path: 'ownedScenarios',
            select: 'name'
        })
        console.log(user)
        return res.status(200).json({scenarios: user.ownedScenarios})
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({error: error})
    }
})

router.post('/api/scenario/create/', async (req, res) => {

    const userId = req.session.userId
    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }

    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    console.log(userId)

    let name = req.body.name

    if (!name || name.length === 0) {
        name = "Unnamed Scenario"
    }

    const scenario = new ScenarioModel({
        name: name,
        owner: userId,
        editors: [user._id],
    })

    try {
        await scenario.save()
        user.ownedScenarios.push(scenario._id)
        await user.save()
        return res.status(200).json({scenarioId: scenario._id})
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error: error})
    }
})

export default router