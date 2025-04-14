import mongoose from 'mongoose'
const { Schema } = mongoose;

//Used for fixed values or Normal/Uniform distributions/GBM.
//Used in life expectancy, investment return/income, etc

const individualSimulationResultSchema = new Schema({
    results: [{type: Map, of: Number}]
}, { _id: false })

const resultSchema = new Schema({
    scenarioId: { type: String, required: true },
    financialGoal: { type: Number, required: true },
    startYear: { type: Number, required: true, default: new Date().getFullYear() },
    simulationResults: [individualSimulationResultSchema]
})

const ResultModel = mongoose.model('Result', resultSchema)
export default ResultModel
