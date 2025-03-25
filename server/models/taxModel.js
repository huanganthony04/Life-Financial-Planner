import mongoose from 'mongoose'
const { Schema } = mongoose

const bracketSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  rate: { type: Number, required: true }
})

const capitalGainsBracketSchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  rate: { type: Number, required: true }
})

const FederalTaxSchema = new Schema({
  year: { type: Number, required: true, unique: true },
  standardDeductionSingle: { type: Number, default: 0 },
  standardDeductionMarried: { type: Number, default: 0 },
  standardDeductionHeadOfHousehold: { type: Number, default: 0 },

  taxBrackets: {
    type: [bracketSchema],
    default: []
  },

  capitalGainsBrackets: {
    type: [capitalGainsBracketSchema],
    default: []
  },

  socialSecurityBaseSingle: { type: Number, default: 0 },
  socialSecurityBaseMarried: { type: Number, default: 0 },
})

export default mongoose.model('FederalTax', FederalTaxSchema)
