import mongoose from 'mongoose'
import { valueDistributionSchema, investmentSchema, incomeEventSchema, expenseEventSchema, investEventSchema, rebalanceEventSchema } from './Schemas.js'
const { Schema } = mongoose;

const ScenarioSchema = new Schema({

    name: {
        type: String,
        default: "Unnamed Scenario",
    },
    owner: {
        type: String,
    },
    editors: {
        type: [String],
    },
    maritalStatus: Boolean,
    birthYears: {
        type: [Number],
    },
    lifeExpectancy: {
        type: [valueDistributionSchema],
    },
    investments: [investmentSchema],
    incomeEvents: [incomeEventSchema],
    expenseEvents: [expenseEventSchema],
    investEvents: [investEventSchema],
    rebalanceEvents: [rebalanceEventSchema],
    inflationAssumption: {
        type: valueDistributionSchema,
    },
    afterTaxContributionLimit: Number,
    spendingStrategy: [String],
    expenseWithdrawalStrategy: [String],

    /*
    RMDStrategy: [String],
    RothConversionOpt: Boolean,
    RothConversionStart: Number,
    RothConversionEnd: Number,
    RothConversionStrategy: [String],
    */

    financialGoal: {
        type: Number,
        default: 0,
        validate: {
            validator: function(v) {
                return v >= 0
            }
        }
    },
    residenceState: {
        type: String,
        validate: {
            validator: function (v) {
                return v.length == 2
            }
        },
        message: "residenceState must be of length 2"
    }

})

const ScenarioModel = mongoose.model('Scenario', ScenarioSchema)
export { ScenarioModel, ScenarioSchema }