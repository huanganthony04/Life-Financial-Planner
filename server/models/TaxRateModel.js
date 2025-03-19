import mongoose from 'mongoose'
const { Schema } = mongoose

const taxBracketSchema = new Schema({
    limit: Number,
    rate: Number,
})
const taxSchema = new Schema({
    //If isFederal is true, the state field is ignored, but state should be undefined
    isFederal: Boolean,
    state: String,
    brackets: [taxBracketSchema]
})

const taxModel = mongoose.model('TaxRate', taxSchema)