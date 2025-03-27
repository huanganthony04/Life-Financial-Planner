import mongoose from 'mongoose'
import { ScenarioSchema } from './ScenarioModel.js'
const { Schema } = mongoose;

//Used for fixed values or Normal/Uniform distributions/GBM.
//Used in life expectancy, investment return/income, etc

const resultItemSchema = new Schema({
    result: {
        type: ScenarioSchema,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
}, { _id: false })

const resultSchema = new Schema({
    results: {
        type: [resultItemSchema],
    }
})

const ResultModel = mongoose.model('result', resultSchema)
export default ResultModel
