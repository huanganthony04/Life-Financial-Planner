import { expect, test } from 'vitest'
import mongoose from 'mongoose'
import YAML from 'yaml'
import fs from 'fs'
import importScenario from '../components/importer.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import { Scenario } from '../classes.js'

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env')})

const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  }
)

test('Imported Scenario should be saved to the database successfully', async () => {

    await mongoose.connect(MONGO_URL)
        .then(() => {
            console.log("Connected to MongoDB")
        }
    )

    const data = fs.readFileSync(path.resolve(__dirname, './scenario.yaml'), 'utf8')
    const parsedData = YAML.parse(data)

    const scenarioObj = importScenario(parsedData)

    scenarioObj.name = 'test'
    scenarioObj.owner = 'user'
    scenarioObj.editors = ['user']
    
    const scenario = new ScenarioModel(scenarioObj)

    await scenario.save()

})

    

