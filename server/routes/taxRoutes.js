import express from 'express'
import FederalTax from '../models/taxModel.js'

const router = express.Router()

// Suppose we define a constant for the earliest year in your system
// (Alternatively, store it in the DB or environment config)
const EARLIEST_YEAR = 2020

/**
 * GET federal tax data for a specific year.
 * If year < EARLIEST_YEAR or not found in DB, returns the earliest year data.
 */
router.get('/api/tax/federal/:year', async (req, res) => {
  const yearRequested = parseInt(req.params.year, 10)
  let taxYear = yearRequested

  if (yearRequested < EARLIEST_YEAR) {
    taxYear = EARLIEST_YEAR
  }

  try {
    let taxData = await FederalTax.findOne({ year: taxYear })
    // If there's no record for that year, fallback to earliest year
    if (!taxData && taxYear !== EARLIEST_YEAR) {
      taxYear = EARLIEST_YEAR
      taxData = await FederalTax.findOne({ year: taxYear })
    }

    if (!taxData) {
      return res.status(404).json({ error: `No tax data found for year ${taxYear}` })
    }

    return res.status(200).json(taxData)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error fetching tax data' })
  }
})

/**
 * POST (or PUT) to create/update (upsert) the tax data for a given year.
 * Example usage: 
 *   POST /api/tax/federal
 *   { 
 *     "year": 2025,
 *     "standardDeductionSingle": 15000,
 *     "standardDeductionMarried": 30000,
 *     "taxBrackets": [ { "min":0, "max":10000, "rate":10 }, ... ],
 *     "capitalGainsBrackets": [ ... ],
 *     ...
 *   }
 */
router.post('/api/tax/federal', async (req, res) => {
  const { year } = req.body
  if (!year) {
    return res.status(400).json({ error: 'Year is required' })
  }

  try {
    // Upsert (create if not found, otherwise update existing)
    const updated = await FederalTax.findOneAndUpdate(
      { year },
      { ...req.body },    // spread the fields from the body
      { new: true, upsert: true } // 'new' returns the updated doc, 'upsert' creates if none found
    )

    return res.status(200).json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error upserting tax data' })
  }
})

export default router
