import YAML from 'yaml'
import mongoose from 'mongoose'
import { Scenario } from '../classes.js'
import { ScenarioModel } from '../models/ScenarioModel.js'
import fs from 'fs'

function importScenario(parsedData) {

    try {
        console.log(parsedData)
        const scenario = new Scenario(parsedData)
        return scenario
    }
    catch (error) {
        console.error("Error importing scenario:", error)
        return null
    }
}

export default importScenario


/* Test code */
/*
const filePath = './scenario.yaml'
try {
    const data = fs.readFileSync(filePath, 'utf8')
    const parsedData = YAML.parse(data)
    importScenario(parsedData)
}
catch (error) {
    console.error("Error reading the file:", error)
}
*/