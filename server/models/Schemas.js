import mongoose from "mongoose"
const { Schema } = mongoose;

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
    returnAmtOrPct: {
        type: String,
        enum: ['percent', 'amount']
    },
    returnDistribution: valueDistributionSchema,
    expenseRatio: Number,
    incomeAmtOrPct: {
        type: String,
        enum: ['percent', 'amount']
    },
    incomeDistribution: valueDistributionSchema,
    taxability: Boolean
})

//Schema for investments
const investmentSchema = new Schema({
    investmentType: investmentTypeSchema,
    value: {
        type: Number,
        default: 0
    },
    taxStatus: {
        type: String,
        enum: ['non-retirement', 'pre-tax', 'after-tax']
    },
    id: {
        type: String,
        default: function() {
            return `${this.investmentType.name} ${this.taxStatus}`
        }
    },
    costBasis: {
        type: Number,
        default: 0
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
        type: String,
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
    maxCash: {
        type: Number,
        default: 0
    }
    
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

export { valueDistributionSchema, investmentTypeSchema, investmentSchema, incomeEventSchema, expenseEventSchema, investEventSchema, rebalanceEventSchema }