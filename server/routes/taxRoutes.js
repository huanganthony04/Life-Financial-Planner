import express from 'express'
import FederalTax from '../models/TaxModel.js'

const router = express.Router()

const EARLIEST_YEAR = 2020

router.get('/api/tax/federal/:year', async (req, res) => {
  const yearRequested = parseInt(req.params.year, 10)
  let taxYear = yearRequested

  if (yearRequested < EARLIEST_YEAR) {
    taxYear = EARLIEST_YEAR
  }

  try {
    let taxData = await FederalTax.findOne({ year: taxYear })
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

router.post('/api/tax/federal', async (req, res) => {
  const { year } = req.body
  if (!year) {
    return res.status(400).json({ error: 'Year is required' })
  }

  try {
    const updated = await FederalTax.findOneAndUpdate(
      { year },
      { ...req.body }, 
      { new: true, upsert: true } 
    )

    return res.status(200).json(updated)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error upserting tax data' })
  }
})

export default router
