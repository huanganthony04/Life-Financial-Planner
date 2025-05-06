import { createObjectCsvWriter } from "csv-writer"
import { dirname, join } from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default async function createCSV(username, resultsModel) {

    let startYear = resultsModel.startYear
    let firstYearResults = resultsModel.simulationResults[0].results

    let investmentNames = Object.getOwnPropertyNames(firstYearResults[0].investments)

    const timestamp  = new Date().toISOString().replace(/[:.]/g, '-')
    const filePath   = join(__dirname, '..', 'logs', `${username}_${timestamp}.csv`)

    await fs.mkdir(dirname(filePath), { recursive: true })

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