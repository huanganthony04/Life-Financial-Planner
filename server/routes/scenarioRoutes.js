import express from 'express'
import { Scenario } from '../classes.js'
import UserModel from '../models/UserModel.js'
import ScenarioModel from '../models/ScenarioModel.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

const router = express.Router()

//Get scenarios by user
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

//Get a specific scenario
router.get('/api/scenario/', async (req, res) => {

    const scenarioId = req.query.id
    const userId = req.session.userId

    const scenario = await ScenarioModel.findOne({_id: scenarioId })

    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
        return res.status(403).json({error: 'You do not have permission to access this scenario!'})
    }

    return res.status(200).json({scenario: scenario})

})

//Save an existing scenario
router.post('/api/scenario/save/', async (req, res) => {
    
    const userId = req.session.userId
    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }

    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    const scenarioId = req.body.scenarioId

    const scenario = await ScenarioModel.findOne({_id: scenarioId})
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
        return res.status(403).json({error: 'You do not have permission to save this scenario!'})
    }

    scenario.name = req.body.name

    try {
        await scenario.save()
        return res.status(200).json({success: true})
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error: error})
    }
})

//Delete a scenario
router.post('/api/scenario/delete/', async (req, res) => {
    
    const userId = req.session.userId
    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }
    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    const scenarioId = req.body.scenarioId

    const scenario = await ScenarioModel.findOne({_id: scenarioId})
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== userId) {
        return res.status(403).json({error: 'You do not have permission to delete this scenario!'})
    }

    try {
        await ScenarioModel.deleteOne({_id: scenarioId})
        user.ownedScenarios = user.ownedScenarios.filter(scenario => scenario.toString() !== scenarioId)
        return res.status(200).json({success: true})
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error: error})
    }
})

router.post('/api/postEventnew', async (req, res) => {



    console.log("postEventnew reached");
    const scenarioId= req.body.scenarioId;
    const scenario = await ScenarioModel.findOne({_id: scenarioId })
    
    //need to fix format for start, duraion, as valdist 
    //assemble it as a dict before you send to end point 
    const expenseEventList= scenario.expenseEvents;
    var map1= {
        name:req.body.title,  
        start:req.body.start,
        description: req.body.summary, 
        discretionary:req.body.discretionaryStatus,
        inflationAdjusted:req.body.inflationStatus,  
        duration: req.body.duration, 
        userFraction: req.body.userFrac,
        changeAmtOrPct:req.body.amountOrPercent, 
        initialAmount:req.body.initial,
        changeDistribution:req.body.changeDistribution

    }

   expenseEventList.push(map1);
console.log("map made");
   try {
    await scenario.save()
    console.log("saved");
    return res.status(200).json({scenarioId: scenario._id})
}
catch(error) {
    console.log(error)
    return res.status(500).json({error: error})
}
   
   

   //find out which index or where his expense event is and replace it 
   //after modifying save the scenario wih scenario.save() or something




})

export default router