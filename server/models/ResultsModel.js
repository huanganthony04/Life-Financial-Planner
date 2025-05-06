import mongoose from 'mongoose'
const { Schema } = mongoose;

//Used for fixed values or Normal/Uniform distributions/GBM.
//Used in life expectancy, investment return/income, etc

const singleYearResultSchema = new Schema({
    investments: {
        type: Schema.Types.Mixed,
        default: {}
    },
    incomes: {
        type: Schema.Types.Mixed,
        default: {}
    },
    expenses: {
        type: Schema.Types.Mixed,
        default: {}
    },
}, {_id: false })

const individualSimulationResultSchema = new Schema({
    results: [singleYearResultSchema]
}, { _id: false })

const resultSchema = new Schema({
    owner: { type: String, required: true },
    status: { type: String, enum: ['Processing', 'Complete'], required: true },
    scenarioId: { type: String, unique: true },
    financialGoal: { type: Number, required: true },
    startYear: { type: Number, required: true, default: new Date().getFullYear() },
    simulationResults: [individualSimulationResultSchema]
})

const ResultModel = mongoose.model('Result', resultSchema)
export default ResultModel
