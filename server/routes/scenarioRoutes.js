import express from 'express'
import { Scenario } from '../classes.js'
import UserModel from '../models/UserModel.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import ResultsModel from '../models/ResultsModel.js'
import FederalTaxModel from '../models/TaxModel.js'
import StateTaxModel from '../models/StateTaxModel.js'
import importScenario from '../components/importer.js'
import exportScenario from '../components/exporter.js'
import runSimulations from '../simulator/runSimulations.js'
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

router.get('/api/scenarioByID/', async (req,res)=>{
    //console.log()
    console.log("yoooo");
    let scenarioId= req.params.scenarioId;
    try{
    const scenario1=await ScenarioModel.findOne({_id: scenarioId});
    console.log("yoooo");
    const expenseEventList= scenario1.expenseEvents;

    
    return res.status(200).json({expenseEventList: expenseEventList});
    }
    catch{
        console.log("scenario not found")
        return res.status(401).json({error: 'scenario  not found!'});
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
    if (!scenarioObj) {
        return res.status(400).json({error: 'Invalid scenario data!'})
    }
    
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
    console.log("hi");

    if (!scenario) {
        console.log('Scenario not found!');
        return res.status(404).json({error: 'Scenario not found!'})
    }

    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
        console.log("'You do not have permission to access this scenario!'")
        return res.status(403).json({error: 'You do not have permission to access this scenario!'})
    }

    return res.status(200).json({scenario: scenario})

})

router.post('/api/scenario/save/', getUserAuth, async (req, res) => {
    const { scenarioId, ...updates } = req.body;
    const userId = req.user._id;
  
    const scenario = await ScenarioModel.findById(scenarioId);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found!' });
  
    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
      return res.status(403).json({ error: 'No permission to save this scenario!' });
    }
  
    // Assign all incoming fields onto the mongoose document
    Object.entries(updates).forEach(([key, val]) => {
      scenario[key] = val;
    });
  
    try {
      await scenario.save();
      return res.status(200).json({ success: true, scenario });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });
  
///Delete a scenario
router.post('/api/scenario/delete/', getUserAuth, async (req, res) => {
    const scenarioId = req.body.scenarioId;
    const user = req.user;

    const scenario = await ScenarioModel.findOne({_id: scenarioId});
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'});
    }

    if (scenario.owner !== user._id) {
        return res.status(403).json({error: 'Only the owner may delete this scenario!'});
    }

    try {
        await ScenarioModel.deleteOne({_id: scenarioId});

        // Use the $pull operator to remove the scenario ID from ownedScenarios
        await UserModel.updateOne(
            { _id: user._id },
            { $pull: { ownedScenarios: scenarioId } }
        );

        await ResultsModel.deleteOne(
            { scenarioId: scenarioId }
        )

        return res.status(200).json({success: true});
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({error: error});
    }
});

router.get('/api/scenario/export', getUserAuth, async (req, res) => {

    const userId = req.user._id
    const scenarioId = req.query.id

    const scenario = await ScenarioModel.findOne({_id: scenarioId}).lean()
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'})
    }
    if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
        return res.status(403).json({error: 'You do not have permission to export this scenario!'})
    }

    res.setHeader('Conent-Disposition', 'attachment; filename=scenario.yaml')
    res.setHeader('Content-Type', 'application/x-yaml')
    res.status(200).send(exportScenario(scenario))

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

router.post('/api/postEventUpdate', async (req, res) => {



    console.log("postEventUpdate reached");
    const scenarioId= req.body.scenarioId;
    const expenseEventId= req.body.expenseEventId;
    console.log(expenseEventId+"expeneEventId");

    const updatedFields = {
        "expenseEvents.$.name": req.body.title,
        "expenseEvents.$.start": req.body.start,
        "expenseEvents.$.description": req.body.summary,
        "expenseEvents.$.discretionary": req.body.discretionaryStatus,
        "expenseEvents.$.inflationAdjusted": req.body.inflationStatus,
        "expenseEvents.$.duration": req.body.duration,
        "expenseEvents.$.userFraction": req.body.userFrac,
        "expenseEvents.$.changeAmtOrPct": req.body.amountOrPercent,
        "expenseEvents.$.initialAmount": req.body.initial,
        "expenseEvents.$.changeDistribution": req.body.changeDistribution
      };
      try {
        const result = await ScenarioModel.findOneAndUpdate(
          {
            _id: scenarioId,
            "expenseEvents._id": expenseEventId
          },
          {
            $set: updatedFields
          },
          { new: true }
        );
      
        if (!result) {
            console.log("postEventUpdate 404 expense event or scenario not found");
          return res.status(404).json({ error: "Expense Event or Scenario not found" });
        }
      
        return res.status(200).json({ message: "Expense event updated", scenario: result });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
   
})


router.post('/api/postIncomeUpdate', async (req, res) => {



    console.log("postIncomeUpdate reached");
    const scenarioId= req.body.scenarioId;
    const incomeEventId= req.body.IncomeEventId;
    console.log(incomeEventId+"incomeEventId");

    const updatedFields = {
        "incomeEvents.$.name": req.body.title,
        "incomeEvents.$.start": req.body.start,
        "incomeEvents.$.description": req.body.summary,
        "incomeEvents.$.socialSecurity": req.body.socialSecurity,
        "incomeEvents.$.inflationAdjusted": req.body.inflationStatus,
        "incomeEvents.$.duration": req.body.duration,
        "incomeEvents.$.userFraction": req.body.userFrac,
        "incomeEvents.$.changeAmtOrPct": req.body.amountOrPercent,
        "incomeEvents.$.initialAmount": req.body.initial,
        "incomeEvents.$.changeDistribution": req.body.changeDistribution
      };
      try {
        const result = await ScenarioModel.findOneAndUpdate(
          {
            _id: scenarioId,
            "incomeEvents._id": incomeEventId
          },
          {
            $set: updatedFields
          },
          { new: true }
        );
      
        if (!result) {
            console.log("postIncomeUpdate 404 income event or scenario not found");
          return res.status(404).json({ error: "Income Event or Scenario not found" });
        }
      
        return res.status(200).json({ message: "Income event updated", scenario: result });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
   
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

router.post('/api/postInvestmentEventnew', async (req, res) => {



    console.log("postInvestmentEventnew reached");
    const scenarioId= req.body.scenarioId;
    const scenario = await ScenarioModel.findOne({_id: scenarioId })
    
    //need to fix format for start, duraion, as valdist 
    //assemble it as a dict before you send to end point 
    const investmentEventList= scenario.investEvents;
        console.log(req.body.assetAllocation)
        console.log(req.body.glideStatus)
        console.log(req.body.start)
    if(req.body.glideStatus==false){
    var map1= {
        name:req.body.title,  
        start:req.body.start,
        description: req.body.summary, 
        glidePath:req.body.glideStatus,  
        duration: req.body.duration, 
        assetAllocation:req.body.assetAllocation
        

    }
}
    if(req.body.glideStatus==true){

    var map1= {
        name:req.body.title,  
        start:req.body.start,
        description: req.body.summary, 
        glidePath:req.body.glideStatus,  
        duration: req.body.duration, 
        assetAllocation:req.body.assetAllocation,
        assetAllocation2:req.body.assetAllocation2
        

    }
}
   investmentEventList.push(map1);
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


   


})





router.post('/api/postInvestmentEventUpdate', async (req, res) => {



    console.log("postInvestmentEventUpdate reached");
    const scenarioId= req.body.scenarioId;
    const investmentEventId= req.body.InvestEventId;
    console.log(investmentEventId+"investmentEventId");
 let updatedFields;
 let unsetfields={};
        if(req.body.glideStatus==false){
     updatedFields = {
        "investEvents.$.name": req.body.title,
        "investEvents.$.start": req.body.start,
        "investEvents.$.description": req.body.summary,
        "investEvents.$.glidePath": req.body.glideStatus,
        "investEvents.$.assetAllocation":req.body.assetAllocation,
        "investEvents.$.duration": req.body.duration,

        

      };

      unsetfields={
        "investEvents.$.assetAllocation2": ""
      }

    }
    if(req.body.glideStatus==true){
         updatedFields = {
            "investEvents.$.name": req.body.title,
            "investEvents.$.start": req.body.start,
            "investEvents.$.description": req.body.summary,
            "investEvents.$.glidePath": req.body.glideStatus,
            "investEvents.$.assetAllocation":req.body.assetAllocation,
            "investEvents.$.duration": req.body.duration,
            "investEvents.$.assetAllocation2":req.body.assetAllocation2,
    
          };



        }

      try {
        const result = await ScenarioModel.findOneAndUpdate(
          {
            _id: scenarioId,
            "investEvents._id": investmentEventId
          },
          {
            $set: updatedFields,
          
          $unset :unsetfields},
          { new: true }
        );
      
        if (!result) {
            console.log("postIncomeUpdate 404 income event or scenario not found");
          return res.status(404).json({ error: "Income Event or Scenario not found" });
        }
      
        return res.status(200).json({ message: "Income event updated", scenario: result });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
      }
   
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
    console.dir(scenario, {depth: null})
    let results = runSimulations(scenario, 10, federalTaxRates, stateTaxRates)
    
    // Create a new ResultsModel instance
    let resultsModel = new ResultsModel({
        scenarioId: scenarioId,
        financialGoal: scenario.financialGoal,
        startYear: new Date().getFullYear(),
        simulationResults: results,
    })

    await resultsModel.save()
    .then(() => {
        res.status(200).json(resultsModel.toObject({flattenMaps: true}))
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json({error: error})
    })

})
export default router