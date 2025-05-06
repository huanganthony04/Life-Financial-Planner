import mongoose from 'mongoose'

const { Schema } = mongoose
const bracketSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  rate: { type: Number, required: true } 
})

// The main schema
const StateTaxSchema = new Schema({
  // e.g. "NY", "NJ", "CT"
  state: { type: String, required: true },
  year: { type: Number, required: true },

  singleBrackets: {
    type: [bracketSchema],
    default: []
  },

  marriedBrackets: {
    type: [bracketSchema],
    default: []
  },
  
  standardDeductionSingle: { type: Number, default: 0 },
  standardDeductionMarried: { type: Number, default: 0 },
  baseInflationRate: { type: Number, default: 0.03 } 
})

StateTaxSchema.index({ state: 1, year: 1 }, { unique: true })

const StateTaxModel = mongoose.model('StateTax', StateTaxSchema)
export default StateTaxModel
