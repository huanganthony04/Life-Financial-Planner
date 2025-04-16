import { expect, test } from 'vitest';
import path from 'path';
import { calculateTaxes } from '../simulator/util.js';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FederalTaxModel from '../models/TaxModel.js'
import StateTaxModel from '../models/StateTaxModel.js'
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});
const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  }
)

test('Federal tax on income below standard deduction', async () => {

    let federalTaxRates = await FederalTaxModel.findOne().lean()
    let stateTaxRates = {
        singleBrackets: [
            {
                min: 0,
                max: Infinity,
                rate: 0
            }
        ],
        marriedBrackets: [
            {
                min: 0,
                max: Infinity,
                rate: 0
            }
        ],
    }

    let taxes = calculateTaxes(10000, 0, 0, federalTaxRates, stateTaxRates, false)

    expect(taxes).toEqual(0)
})

test('Federal tax of $100000 Annual Income and $50000 Capital Gains', async () => {

    let federalTaxRates = {
        standardDeductionSingle: 14600,
        standardDeductionMarried: 29200,
        capitalGainsBrackets: [
            {
                min: 0,
                max: 40000,
                rate: 10,
            },
            {
                min: 40000,
                max: Infinity,
                rate: 15
            }
        ],
        taxBrackets: [
            {
                min: 0,
                max: 10000,
                rate: 10
            },
            {
                min: 10000,
                max: 40000,
                rate: 12
            },
            {
                min: 40000,
                max: Infinity,
                rate: 22
            }
        ]
    }
    let stateTaxRates = {
        singleBrackets: [
            {
                min: 0,
                max: Infinity,
                rate: 0
            }
        ],
        marriedBrackets: [
            {
                min: 0,
                max: Infinity,
                rate: 0
            }
        ],
    }

    let taxes = calculateTaxes(100000, 0, 50000, federalTaxRates, stateTaxRates, false)
    expect(taxes).toBeCloseTo(22088, 1)


})

test('Taxes adjusts for spouse passing', async () => {

    const federalTaxRates = {
        standardDeductionSingle: 14600,
        standardDeductionMarried: 29200,
        capitalGainsBrackets: [
            {
                min: 0,
                max: 40000,
                rate: 10,
            },
            {
                min: 40000,
                max: Infinity,
                rate: 15
            }
        ],
        taxBrackets: [
            {
                min: 0,
                max: 10000,
                rate: 10
            },
            {
                min: 10000,
                max: 40000,
                rate: 12
            },
            {
                min: 40000,
                max: Infinity,
                rate: 22
            }
        ]
    }
    const stateTaxRates= {
        marriedBrackets: [{
            min: 0,
            max: Infinity,
            rate: 4
        }],
        singleBrackets: [{
            min: 0,
            max: Infinity,
            rate: 5
        }]
    }

    let taxesMarried = calculateTaxes(100000, 0, 0, federalTaxRates, stateTaxRates, true)
    expect(taxesMarried).toBeCloseTo(15376, 1)
    let taxesSingle = calculateTaxes(100000, 0, 0, federalTaxRates, stateTaxRates, false)
    expect(taxesSingle).toBeCloseTo(19588, 1)

})