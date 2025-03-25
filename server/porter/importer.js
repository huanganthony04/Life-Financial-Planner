import YAML from 'yaml'
import { ValueDistribution, InvestmentType, Investment, EventStart, IncomeEvent, ExpenseEvent, InvestEvent, RebalanceEvent, Scenario } from '../classes.js'
import fs from 'fs'

function importScenario(content) {
    const parsedData = YAML.parse(content)
    const scenario = new Scenario(parsedData)
    console.dir(scenario, { depth: null });
}

export default importScenario
//Test code
const filePath = './scenario.yaml'
try {
    const data = fs.readFileSync(filePath, 'utf8')
    importScenario(data)
}
catch (error) {
    console.error("Error reading the file:", error)
}
