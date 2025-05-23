import express from 'express'
import UserModel from '../models/UserModel.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import ResultsModel from '../models/ResultsModel.js'
import importScenario from '../components/importer.js'
import exportScenario from '../components/exporter.js'
import getUserAuth from './middleware/auth.js'
import 'dotenv/config'

const FRONTEND_URL = process.env.FRONTEND_URL

export default function createScenarioRouter(channel, jobStore) {

  const router = express.Router()

  //Get scenarios by user
  router.get('/api/scenario/byuser', getUserAuth, async (req, res) => {

      const userId = req.user._id
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

router.get('/api/sharedscenario/byuser', getUserAuth, async (req, res) => {
    console.log("Share reached scenario by user")
    const userId = req.user._id

    try {
        const user = await UserModel.findOne({_id: userId})

        return res.status(200).json({sharedscenarios: user.sharedScenarios})
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

  router.post('/api/scenario/update/', getUserAuth, async (req, res) => {
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

      //Delete the stale result of the scenario
      await ResultsModel.deleteOne({scenarioId: scenarioId})

      return res.status(200).json({ success: true, scenario });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });

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

router.get('/api/scenario2/', getUserAuth, async (req, res) => {

    const scenarioId = req.query.id
    const userId = req.user._id

    const scenario = await ScenarioModel.findOne({_id: scenarioId })
    console.log("hi");

    if (!scenario) {
        console.log('Scenario not found!');
        return res.status(404).json({error: 'Scenario not found!'})
    }

    return res.status(200).json({scenario: scenario})

})
    
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

  router.post('/api/events/create/:type', getUserAuth, async(req, res) => {

    const scenarioId = req.body.scenarioId
    const newEvent = req.body.event
    const user = req.user
    const eventType = req.params.type;

    if (!eventType) {
      return res.status(404).json({error: "Missing event type!"})
    }
    if (!newEvent) {
      return res.status(400).json({error: "Event object missing!"})
    }

    const scenario = await ScenarioModel.findOne({_id: scenarioId})

    if (!scenario) {
      return res.status(404).json({error: "Scenario not found!"})
    }

    if (scenario.owner !== user._id && !scenario.editors.contains(user._id)) {
      return res.status(401).json({error: "You do not have permission to edit this scenario!"})
    }

    if (eventType === 'income') {
      scenario.incomeEvents.push(newEvent)
    }
    else if (eventType === 'expense') {
      scenario.expenseEvents.push(newEvent)
    }
    else if (eventType === 'invest') {
      scenario.investEvents.push(newEvent)
    }
    else if (eventType === 'rebalance') {
      scenario.rebalanceEvents.push(newEvent)
    }
    else {
      return res.status(400).json({error: `Invalid event type ${eventType} detected`})
    }

    try {
      await scenario.save()

      //Delete the stale result of the scenario
      await ResultsModel.deleteOne({scenarioId: scenarioId})
      
      return res.status(200).json({msg: 'OK'})
    }
    catch (error) {
      return res.status(500).json({error: error})
    }
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

router.post('/api/scenario/Editordelete/', getUserAuth, async (req, res) => {
    const user = req.user;
    console.log("editor deleting reached"+user._id)
    const scenarioId = req.body.scenarioId;
    

    const scenario = await ScenarioModel.findOne({_id: scenarioId});
    if (!scenario) {
        return res.status(404).json({error: 'Scenario not found!'});
    }
//if you wont want tp let editor delete you can rempve !scenario.editors.includes(userId)
    if (!scenario.editors.includes(user._id)) {
        return res.status(403).json({error: 'No edit access can delete'});
    }
    for(let i=0; i<scenario.editors;i++){
        let editors=scenario.editors[i]
        const users = await UserModel.findOne({_id: editors});
        user.sharedScenarios= user.sharedScenarios.filter(sharedScenarioId=>sharedScenarioId!==scenarioId)
       
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

    res.setHeader('Conent-Disposition', 'attachment; filename=scenario.yaml')
    res.setHeader('Content-Type', 'application/x-yaml')
    res.status(200).send(exportScenario(scenario))

})

router.post('/api/scenario/share', async (req, res) => {

    console.log("pshare reached");
    const scenarioId= req.body.scenarioId;
    let  targetUser=req.body.targetUser;
    const permission=req.body.permission;

    try{
    const user= await UserModel.findOne({email: targetUser })
    targetUser=user._id//if you want editor array to store user emails instead of user id you can comment this out
    console.log(user+"userbal")
    console.log(targetUser+"targetUser");

    if (!user) {
        //return res.status(500).json({error: error})
        throw new Error('User not found');
      }

        const scenario = await ScenarioModel.findOne({_id: scenarioId })
    
    //need to fix format for start, duraion, as valdist 
    //assemble it as a dict before you send to end point 
    const editors= scenario.editors;
    //if u want to remove all permisison (permission=="none") you can use .filter() to make new arrays without the user email and new array without this scenarioId and use update to set it 
    const prevCopyEditors=scenario.editors
    if(permission=="Viewer"){
        //removes user from editor in case it is already/previously an editor
        const filteredScenarios = editors.filter(userEmail => userEmail !== targetUser);
        scenario.editors=filteredScenarios;
        if(filteredScenarios==null){
            scenario.editors=[];
        }

        if(!user.sharedScenarios.includes(scenarioId)){
            user.sharedScenarios.push(scenarioId);
        }

    }
    if(permission=="Editor"){
        if(!editors.includes(targetUser)){
            editors.push(targetUser);
        }

        if(!user.sharedScenarios.includes(scenarioId)){
            user.sharedScenarios.push(scenarioId);
        }

    }
    if(permission=='None'){
        const filteredScenarios = editors.filter(userEmail => userEmail !== targetUser);
        scenario.editors=filteredScenarios;

        const filteredUserSharedList=user.sharedScenarios.filter(sharedScenarios => sharedScenarios !== scenarioId);
        user.sharedScenarios=filteredUserSharedList;
    }

    try {
        await scenario.save()
        await user.save()
        console.log("saved");
        return res.status(200).json({scenarioId: scenario._id})
    }
    catch(error) {
        console.log(error)
        return res.status(500).json({error: error})
    }

    }
    catch(error){
        console.log(error)
        console.log("hiii")
        return res.status(400).json({error: error.message})
        //console.log("hisdsdsii")
    }

   //find out which index or where his expense event is and replace it 
   //after modifying save the scenario wih scenario.save() or something

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

  router.post('/api/postRebalanceEventUpdate', async (req, res) => {

      console.log("postREventUpdate reached");
      const scenarioId= req.body.scenarioId;
      console.log(scenarioId,"scenarioId");               
      const RebalanceEventId= req.body.RebalanceEventId;
      console.log(RebalanceEventId,"hi");
      console.log(req.body.assetAllocation)
      
  let updatedFields;

      updatedFields = {
          "rebalanceEvents.$.name": req.body.title,
          "rebalanceEvents.$.start": req.body.start,
          "rebalanceEvents.$.description": req.body.summary,
          "rebalanceEvents.$.assetAllocation":req.body.assetAllocation,
          "rebalanceEvents.$.duration": req.body.duration,
        };

        try {
          const result = await ScenarioModel.findOneAndUpdate(
            {
              _id: scenarioId,
              "rebalanceEvents._id": RebalanceEventId
            },
            {
              $set: updatedFields,
            
            },
            { new: true }
          );
        
          if (!result) {
              console.log("postRebalanceUpdate 404 income event or scenario not found");
            return res.status(404).json({ error: "Income Event or Scenario not found" });
          }
        
          return res.status(200).json({ message: "Income event updated", scenario: result });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: "Server error" });
        }
    
  })

  router.post('/api/scenario/run', getUserAuth, async (req, res) => {

      const userId = req.user._id
      const email = req.email

      if (!userId) {
          return res.status(401).json({error: 'You are not logged in!'})
      }
      const user = await UserModel.findOne({_id: userId})
      if (!user) {
          return res.status(401).json({error: 'User not found!'})
      }

      const scenarioId = req.body.scenarioId

      const scenario = await ScenarioModel.findOne({_id: scenarioId}).lean()
      if (!scenario) {
          return res.status(404).json({error: 'Scenario not found!'})
      }

      if (scenario.owner !== userId && !scenario.editors.includes(userId)) {
          return res.status(403).json({error: 'You do not have permission to operate on this scenario!'})
      }

      const num = req.query.num ? parseInt(req.query.num) : 10
      if (isNaN(num)) {
        return res.status(400).json({error: 'Invalid number of simulations!'})
      }
      else if (num < 10) {
          return res.status(400).json({error: 'Number of simulations must be at least 10!'})
      }
      else if (num > 1000) {
          return res.status(400).json({error: 'Number of simulations must be at most 1000!'})
      }

      // Create a new ResultsModel instance with results not yet calculated
      let resultsModel = new ResultsModel({
        owner: userId,
        status: 'Processing',
        scenarioId: scenarioId,
        financialGoal: scenario.financialGoal,
        startYear: new Date().getFullYear(),
        simulationResults: [],
      })
      await resultsModel.save()

      let payload = {userId: userId, email: email, scenarioId: scenarioId, resultsId: resultsModel._id, num: req.body.num}

      await channel.assertQueue('simulation_queue', { durable: true })
      channel.sendToQueue('simulation_queue', Buffer.from(JSON.stringify(payload)), { persistent: true })
      return res.status(200).json({results: resultsModel})

  })

  return router

}