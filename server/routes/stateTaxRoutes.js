import express from 'express'
import StateTax from '../models/StateTaxModel.js'

const router = express.Router()

const EARLIEST_YEAR = 2020

/**
 * Retrieves state tax data for the given state and year. 
 * If the requested year doesn't exist for that year,
 * it falls back to the earliest year
 */
router.get('/api/tax/state/:state/:year', async (req, res) => {
  const yearRequested = parseInt(req.params.year, 10)
  const stateRequested = req.params.state.toUpperCase() 

  let taxYear = yearRequested < EARLIEST_YEAR ? EARLIEST_YEAR : yearRequested

  try {
    let taxData = await StateTax.findOne({ state: stateRequested, year: taxYear })
    if (!taxData && taxYear !== EARLIEST_YEAR) {
      taxData = await StateTax.findOne({ state: stateRequested, year: EARLIEST_YEAR })
      taxYear = EARLIEST_YEAR
    }

    if (!taxData) {
      return res.status(404).json({
        error: `No state tax data found for ${stateRequested} in year ${taxYear}`
      })
    }

    return res.status(200).json(taxData)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error fetching state tax data' })
  }
})

/**
 * POST /api/tax/state
 * Example:
 * {
 *   "state": "CA",
 *   "year": 2023,
 *   "standardDeductionSingle": 4800,
 *   "taxBrackets": [
 *     { "min": 0, "max": 8932, "rate": 1 },
 *     ...
 *   ],
 *   "capitalGainsBrackets": [
 *     ...
 *   ],
 *   "interestDividendTax": {
 *     "threshold": 2400,
 *     "rate": 4
 *   }
 * }
 */
router.post('/api/tax/state', async (req, res) => {
  const { state, year } = req.body

  if (!state || !year) {
    return res.status(400).json({ error: 'State and Year are required' })
  }

  try {
    const updated = await StateTax.findOneAndUpdate(
      { state: state.toUpperCase(), year },  
      { ...req.body, state: state.toUpperCase() }, 
      { new: true, upsert: true } 
    )

    return res.status(200).json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error upserting state tax data' })
  }
})

export default router
