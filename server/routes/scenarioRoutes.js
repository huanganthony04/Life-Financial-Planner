import express from 'express'
import { Scenario } from '../classes.js'
import UserModel from '../models/UserModel.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import ResultsModel from '../models/ResultsModel.js'
import FederalTaxModel from '../models/TaxModel.js'
import StateTaxModel from '../models/StateTaxModel.js'
import importScenario from '../components/importer.js'
import runSimulation from '../simulator/simulation.js'
import getUserAuth from './middleware/auth.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

const router = express.Router()

//Get scenarios by user
router.get('/api/scenario/byuser', async (req, res) => {

    const userId = req.query.userId

    try {
        const user = await UserModel.findOne({_id: userId})
        await user.populate({
            path: 'ownedScenarios',
            select: 'name'
        })
        return res.status(200).json({scenarios: user.ownedScenarios})
    }
    catch (error) {
        return res.status(500).json({error: error})
    }
})

router.post('/api/scenario/create/', getUserAuth, async (req, res) => {

    const userId = req.user._id
    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }

    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    let name = req.body.name

    if (!name || name.length === 0) {
        name = "Unnamed Scenario"
    }

    let scenarioObj = importScenario(req.body)
    scenarioObj.name = name
    scenarioObj.owner = userId
    scenarioObj.editors = [userId]

    const scenario = new ScenarioModel(scenarioObj)

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
router.get('/api/scenario/', getUserAuth, async (req, res) => {

    const scenarioId = req.query.id
    const userId = req.user._id

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
router.post('/api/scenario/save/', getUserAuth, async (req, res) => {
    
    const scenarioId = req.body.scenarioId
    const userId = req.user._id

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
router.post('/api/scenario/delete/', getUserAuth, async (req, res) => {
    
    const scenarioId = req.body.scenarioId
    const user = req.user

    const scenario = await ScenarioModel.findOne({_id: scenarioId})
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== user._id) {
        return res.status(403).json({error: 'Only the owner may delete this scenario!'})
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
console.log(map1);
   try {
    await scenario.save();
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


router.post('/api/postIncomenew', async (req, res) => {



    console.log("postEventnew reached");
    const scenarioId= req.body.scenarioId;
    const scenario = await ScenarioModel.findOne({_id: scenarioId })
    
    //need to fix format for start, duraion, as valdist 
    //assemble it as a dict before you send to end point 
    const incomeEventList= scenario.incomeEvents;
    var map1= {
        name:req.body.title,  
        start:req.body.start,
        description: req.body.summary, 
        socialSecurity:req.body.socialSecurityStatus,
        inflationAdjusted:req.body.inflationStatus,  
        duration: req.body.duration, 
        userFraction: req.body.userFrac,
        changeAmtOrPct:req.body.amountOrPercent, 
        initialAmount:req.body.initial,
        changeDistribution:req.body.changeDistribution

    }

   incomeEventList.push(map1);
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

router.get('/api/scenario/run', async (req, res) => {

    const userId = req.session.userId

    if (!userId) {
        return res.status(401).json({error: 'You are not logged in!'})
    }
    const user = await UserModel.findOne({_id: userId})
    if (!user) {
        return res.status(401).json({error: 'User not found!'})
    }

    const scenarioId = req.query.id

    const scenario = await ScenarioModel.findOne({_id: scenarioId}).lean()
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
        return res.status(403).json({error: 'You do not have permission to operate on this scenario!'})
    }

    let federalTaxRates = await FederalTaxModel.findOne().lean()
    let stateTaxRates = await StateTaxModel.findOne({state: scenario.residenceState}).lean()

    // Run the simulation
    let results = runSimulation(scenario, federalTaxRates, stateTaxRates)
    
    // Create a new ResultsModel instance
    let resultsModel = new ResultsModel({
        resultList: results,
        scenario: scenarioId,
    })

    await resultsModel.save()
    .then(() => {
        res.status(200).json(resultsModel.toObject())
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json({error: error})
    })

})
export default router