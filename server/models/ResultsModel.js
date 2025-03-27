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
    },
    scenario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    }
})

const ResultModel = mongoose.model('Result', resultSchema)
export default ResultModel
