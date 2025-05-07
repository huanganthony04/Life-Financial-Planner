import { createObjectCsvWriter } from "csv-writer"
import { dirname, join } from 'path'
import { promises as pfs } from 'fs'
import fs from 'fs'
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const timestamp  = new Date().toISOString().replace(/[:.]/g, '-')

export async function createCSV(username, resultsModel) {

    let startYear = resultsModel.startYear
    let firstYearResults = resultsModel.simulationResults[0].results

    let investmentNames = Object.getOwnPropertyNames(firstYearResults[0].investments)
    const filePath   = join(__dirname, '..', 'logs', `${username}_${timestamp}.csv`)

    await pfs.mkdir(dirname(filePath), { recursive: true })

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            {id: 'year', title: 'Year'},
            ...investmentNames.map((name) => ({id: name, title: name.toUpperCase()}))
        ]
    })

    const records = []

    for(let i = 0; i < firstYearResults.length; i++) {
        records.push({year: (i + startYear), ...firstYearResults[i].investments})
    }

    await csvWriter.writeRecords(records)

    console.log('Simulation logged')
}

export async function logFinancialEvents(username, scenario) {

    const filePath = join (__dirname, '..', 'logs', `${username}_${timestamp}.log`)
    await pfs.mkdir(dirname(filePath), {recursive: true })

    let events = scenario.incomeEvents.concat(scenario.expenseEvents).concat(scenario.investEvents).concat(scenario.rebalanceEvents)

    await pfs.writeFile(filePath, JSON.stringify(events, null, 2))
    console.log('Scenario Logged')
    
}