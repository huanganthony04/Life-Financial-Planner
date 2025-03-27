import mongoose from 'mongoose'
import fs from 'fs'
import yaml from 'js-yaml'
import StateTax from './models/stateTaxModel.js'

import 'dotenv/config'

const MONGO_URI = process.env.MONGO_URL
const YAML_PATH = './states.yaml'

async function main() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB.')

    // Read the YAML
    const fileContents = fs.readFileSync(YAML_PATH, 'utf8')
    const data = yaml.load(fileContents)

    if (!data || !data.states) {
      console.log("No 'states' key found in YAML. Exiting.")
      return
    }

    for (const stateInfo of data.states) {
      const {
        name,
        baseYear,
        baseInflationRate,
        singleBrackets,
        marriedBrackets
      } = stateInfo

      // Upsert into the DB
      const doc = await StateTax.findOneAndUpdate(
        { state: name.toUpperCase(), year: baseYear },
        {
          state: name.toUpperCase(),
          year: baseYear,
          baseInflationRate: baseInflationRate || 0.03,
          singleBrackets: singleBrackets || [],
          marriedBrackets: marriedBrackets || []
        },
        { upsert: true, new: true }
      )
      console.log(`Upserted state data: ${doc.state}, year=${doc.year}`)
    }

  } catch (err) {
    console.error('Error reading state YAML or updating DB:', err)
  } 
}

export default main
