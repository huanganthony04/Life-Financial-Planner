// routes/stateYamlUploadRoutes.js

import express from 'express'
import multer from 'multer'
import fs from 'fs'
import yaml from 'js-yaml'
import StateTax from '../models/StateTaxModel.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' }) // or wherever you store temporary uploads

// POST /api/tax/state/upload
// The user uploads a YAML file with the same structure as states.yaml
router.post('/api/tax/state/upload', upload.single('stateFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const fileContents = fs.readFileSync(req.file.path, 'utf8')
    const data = yaml.load(fileContents)
    
    if (!data || !data.states) {
      return res.status(400).json({ error: "YAML file must have a 'states' key" })
    }

    for (const stateInfo of data.states) {
      const {
        name,
        baseYear,
        baseInflationRate,
        singleBrackets,
        marriedBrackets
      } = stateInfo

      await StateTax.findOneAndUpdate(
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
    }

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path)

    return res.json({ message: 'State data uploaded and processed successfully' })
  } catch (err) {
    console.error('Error processing uploaded YAML:', err)
    return res.status(500).json({ error: 'Failed to process uploaded YAML' })
  }
})

export default router
