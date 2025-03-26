import mongoose from 'mongoose'
const { Schema } = mongoose;

//Used for fixed values or Normal/Uniform distributions/GBM.
//Used in life expectancy, investment return/income, etc
const valueDistributionSchema = new Schema({
    distType: {
        type: String,
        enum: ['normal', 'fixed', 'GBM', 'uniform'],
        required: true
    },
    value: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.distType === 'fixed') {
                    return v !== undefined
                }
                else {
                    return v === undefined
                }
            },
            message: "Value must be defined if type is fixed, and undefined otherwise"
        }
    },
    //mean and sigma are only defined for Normal and GBM distributions
    mean: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.distType !== 'fixed') {
                    return v !== undefined
                }
                else {
                    return v === undefined
                }
            }
        },
        message: "Mean must be defined if type is GBM or Normal, and undefined otherwise"
    },
    sigma: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.distType !== 'fixed') {
                    return v !== undefined
                }
                else {
                    return v === undefined
                }
            }
        },
        message: "Sigma must be defined if type is GBM or Normal, and undefined otherwise"
    },
    lower: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.distType === 'uniform') {
                    return v !== undefined
                }
                else {
                    return v === undefined
                }
            }
        }
    },
    upper: {
        type: Number,
        validate: {
            validator: function(v) {
                if (this.distType === 'uniform') {
                    return v !== undefined
                }
                else {
                    return v === undefined
                }
            }
        }
    }
})

//Schema for an investmentType
const investmentTypeSchema = new Schema({
    name: String,
    description: String,
    returnAmtorPct: {
        type: String,
        enum: ['percent', 'amount']
    },
    returnDistribution: valueDistributionSchema,
    expenseRatio: Number,
    incomeAmtorPct: {
        type: String,
        enum: ['percent', 'amount']
    },
    incomeDistribution: valueDistributionSchema,
    taxability: Boolean
})

//Schema for investments
const investmentSchema = new Schema({
    investmentType: investmentTypeSchema,
    value: Number,
    taxStatus: {
        type: String,
        enum: ['non-retirement', 'pre-tax', 'after-tax']
    },
    id: {
        type: String,
        default: function() {
            return `${this.investmentType.name} ${this.taxStatus}`
        }
    }
})

//Schema for the start time of an event
const eventStartSchema = new Schema({
    //eventSeries start field can be either a valueDistributionSchema, or a 'startsWith'. This is rather inconvenient, so excuse the shoehorning.
    //We have two separate fields, startDistribution and startWith. Only one of these can be defined, and stands in the for the 'start' field.
    startDistribution: {
        type: valueDistributionSchema
    },
    startWith: {
        //The name of the eventSeries this eventSeries starts with
        eventSeries: String
    },
    duration: valueDistributionSchema,
})

//Schema for income events
const incomeEventSchema = new Schema({

    name: String,
    //eventSeries start field can be either a valueDistributionSchema, or a 'startsWith'. This is rather inconvenient, so excuse the shoehorning.
    //We have two separate fields, startDistribution and startWith. Only one of these can be defined, and stands in the for the 'start' field.
    start: {type: eventStartSchema, required: true},
    duration: {type: valueDistributionSchema, required: true},
    initialAmount: {type: Number, required: true},
    changeAmtOrPct: {type: String, enum: ['amount', 'percent'], required: true},
    changeDistribution: {type: valueDistributionSchema, required: true},
    inflationAdjusted: {type: Boolean, required: true},
    userFraction: {type: Number, default: 1.0},
    socialSecurity: {type: Boolean, required: true}

})

//Schema for expense events
const expenseEventSchema = new Schema({

    name: String,
    start: {type: eventStartSchema, required: true},
    duration: {type: valueDistributionSchema, required: true},
    initialAmount: {type: Number, required: true},
    changeAmtOrPct: {type: String, enum: ['amount', 'percent'], required: true},
    changeDistribution: {type: valueDistributionSchema, required: true},
    inflationAdjusted: {type: Boolean, required: true},
    userFraction: {type: Number, default: 1.0},
    discretionary: {type: Boolean, required: true}

})

const investEventSchema = new Schema({

    name: String,
    start: {type: eventStartSchema, required: true},
    duration: {type: valueDistributionSchema, required: true},
    assetAllocation: {
        type: Map,
        of: Number,
        required: true
    },
    glidePath: Boolean,
    assetAllocation2: {
        type: Map,
        of: Number
    },
    
})

const rebalanceEventSchema = new Schema({

    name: String,
    start: {type: eventStartSchema, required: true},
    duration: {type: valueDistributionSchema, required: true},
    assetAllocation: {
        type: Map,
        of: Number,
        required: true
    }

})

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
export default ScenarioModel
