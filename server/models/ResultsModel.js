import mongoose from 'mongoose'
import { valueDistributionSchema, investmentTypeSchema, investmentSchema, incomeEventSchema, expenseEventSchema, investEventSchema, rebalanceEventSchema } from './schemas.js'
const { Schema } = mongoose;

//Used for fixed values or Normal/Uniform distributions/GBM.
//Used in life expectancy, investment return/income, etc

const yearResultSchema = new Schema({

    investments: [mongoose.Schema.Types.Mixed],
    incomeEvents: [mongoose.Schema.Types.Mixed],
    expenseEvents: [mongoose.Schema.Types.Mixed],
    investEvents: [mongoose.Schema.Types.Mixed],

    year: {
        type: Number,
        required: true
    }

}, {_id: false})

const resultSchema = new Schema({
    resultList: {
        type: [yearResultSchema],
    },
    scenario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true
    }
})

const ResultModel = mongoose.model('Result', resultSchema)
export default ResultModel
