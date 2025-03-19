import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import UserModel from '../models/UserModel.js'
import ScenarioModel from '../models/ScenarioModel.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

const router = express.Router()

router.get('/api/scenarios/:userId', async (req, res) => {

    const userId = req.params.userId

    try {
        const scenarios = await UserModel.find({userId: userId})
        return res.status(200).json({scenarios: scenarios})
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({error: error})
    }
})

export default router