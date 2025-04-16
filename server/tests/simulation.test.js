import { expect, test } from 'vitest';
import path from 'path';
import { ValueDistribution, InvestmentType, Investment, EventStart, IncomeEvent, ExpenseEvent, InvestEvent, RebalanceEvent, Scenario } from '../classes.js';
import { ScenarioModel } from '../models/ScenarioModel.js';
import runSimulation from '../simulator/simulation.js';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve(__dirname, '../.env')
});
const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  }
)

const taxRateNone = {
    year: 2025,
    capitalGainsBrackets: [
        {
            min: 0,
            max: Infinity,
            rate: 0
        }
    ],
    taxBrackets: [
        {
            min: 0,
            max: Infinity,
            rate: 0
        }
    ],
    singleBrackets: [
        {
            min: 0,
            max: Infinity,
            rate: 0,
        }
    ],
    marriedBrackets: [
        {
            min: 0,
            max: Infinity,
            rate: 0,
        }
    ],
    standardDeductionMarried: 0,
    standardDeductionSingle: 0,
}

test('$10000 Annual Income has $80000 after the 8th year', () => {

    const ScenarioObj = new Scenario({
        name: 'Scenario',
        maritalStatus: 'single',
        lifeExpectancy: [{type: 'fixed', value: 80}],
        birthYears: [2000],
        eventSeries: [
            {
                name: 'Salary',
                type: 'income',
                start: { type: 'fixed', value: 2025 },
                duration: { type: 'fixed', value: 40 },
                initialAmount: 10000,
                changeAmtOrPct: "amount",
                changeDistribution: { type: 'fixed', value: 0 },
                inflationAdjusted: false,
                userFraction: 1.0,
                socialSecurity: false
            }
        ],
        inflationAssumption: { type: 'fixed', value: 0.00 },
    })

    let results = runSimulation(ScenarioObj, taxRateNone, taxRateNone)

    expect(results[8].investments['cash']).toBe(80000)
})

test('Advanced Simulation Test', async () => {

    const ScenarioObj = {
        name: 'Retirement Planning Scenario',
        maritalStatus: true,
        birthYears: [ 1985, 1987 ],
        lifeExpectancy: [
            { distType: 'fixed', value: 80 },
            { distType: 'normal', mean: 82, sigma: 3 }
        ],
        investments: [
            {
                investmentType: {
                name: 'cash',
                description: 'cash',
                returnAmtOrPct: 'amount',
                returnDistribution: { distType: 'fixed', value: 0 },
                expenseRatio: 0,
                incomeAmtOrPct: 'percent',
                incomeDistribution: { distType: 'fixed', value: 0 },
                taxability: true
                },
                value: 100,
                taxStatus: 'non-retirement',
                id: 'cash',
                costBasis: 100
            },
            {
                investmentType: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                returnDistribution: { distType: 'normal', mean: 0.06, sigma: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                incomeDistribution: { distType: 'normal', mean: 0.01, sigma: 0.005 },
                taxability: true
                },
                value: 10000,
                taxStatus: 'non-retirement',
                id: 'S&P 500 non-retirement',
                costBasis: 10000
            },
            {
                investmentType: {
                name: 'tax-exempt bonds',
                description: 'NY tax-exempt bonds',
                returnAmtOrPct: 'amount',
                returnDistribution: { distType: 'fixed', value: 0 },
                expenseRatio: 0.004,
                incomeAmtOrPct: 'percent',
                incomeDistribution: { distType: 'normal', mean: 0.03, sigma: 0.01 },
                taxability: false
                },
                value: 2000,
                taxStatus: 'non-retirement',
                id: 'tax-exempt bonds',
                costBasis: 2000
            },
            {
                investmentType: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                returnDistribution: { distType: 'normal', mean: 0.06, sigma: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                incomeDistribution: { distType: 'normal', mean: 0.01, sigma: 0.005 },
                taxability: true
                },
                value: 10000,
                taxStatus: 'pre-tax',
                id: 'S&P 500 pre-tax',
                costBasis: 10000
            },
            {
                investmentType: {
                name: 'S&P 500',
                description: 'S&P 500 index fund',
                returnAmtOrPct: 'percent',
                returnDistribution: { distType: 'normal', mean: 0.06, sigma: 0.02 },
                expenseRatio: 0.001,
                incomeAmtOrPct: 'percent',
                incomeDistribution: { distType: 'normal', mean: 0.01, sigma: 0.005 },
                taxability: true
                },
                value: 2000,
                taxStatus: 'after-tax',
                id: 'S&P 500 after-tax',
                costBasis: 2000
            }
        ],
        incomeEvents: [
            {
                name: 'salary',
                start: { startDistribution: { distType: 'fixed', value: 2025 } },
                duration: { distType: 'fixed', value: 40 },
                initialAmount: 75000,
                changeAmtOrPct: 'amount',
                changeDistribution: { distType: 'uniform', lower: 500, upper: 2000 },
                inflationAdjusted: false,
                userFraction: 1,
                socialSecurity: false
            }
        ],
        expenseEvents: [
            {
                name: 'food',
                start: { startWith: 'salary' },
                duration: { distType: 'fixed', value: 200 },
                initialAmount: 5000,
                changeAmtOrPct: 'percent',
                changeDistribution: { distType: 'normal', mean: 0.02, sigma: 0.01 },
                inflationAdjusted: true,
                userFraction: 0.5,
                discretionary: false
            },
            {
                name: 'vacation',
                start: { startWith: 'salary' },
                duration: { distType: 'fixed', value: 40 },
                initialAmount: 1200,
                changeAmtOrPct: 'amount',
                changeDistribution: { distType: 'fixed', value: 0 },
                inflationAdjusted: true,
                userFraction: 0.6,
                discretionary: true
            },
            {
                name: 'streaming services',
                start: { startWith: 'salary' },
                duration: { distType: 'fixed', value: 40 },
                initialAmount: 500,
                changeAmtOrPct: 'amount',
                changeDistribution: { distType: 'fixed', value: 0 },
                inflationAdjusted: true,
                userFraction: 1,
                discretionary: true
            }
        ],
        investEvents: [
            {
                name: 'my investments',
                start: {
                startDistribution: { distType: 'fixed', value: 2025 }
                },
                duration: { distType: 'fixed', value: 10 },
                assetAllocation: { 'S&P 500 non-retirement': 0.6, 'S&P 500 after-tax': 0.4 },
                glidePath: true,
                assetAllocation2: { 'S&P 500 non-retirement': 0.8, 'S&P 500 after-tax': 0.2 },
                maxCash: 1000
            }
        ],
        rebalanceEvents: [
            {
                name: 'rebalance',
                start: {
                startDistribution: { distType: 'fixed', value: 2025 }
                },
                duration: { distType: 'fixed', value: 10 },
                assetAllocation: { 'S&P 500 non-retirement': 0.7, 'tax-exempt bonds': 0.3 }
            }
        ],
        inflationAssumption: { distType: 'fixed', value: 0.03 },
        afterTaxContributionLimit: 7000,
        spendingStrategy: [ 'vacation', 'streaming services' ],
        expenseWithdrawalStrategy: [
        'S&P 500 non-retirement',
        'tax-exempt bonds',
        'S&P 500 after-tax'
        ],
        financialGoal: 10000,
        residenceState: 'NY',
        __v: 0
    }

    let results = runSimulation(ScenarioObj, taxRateNone, taxRateNone)
    
    expect.soft(results.length).toBe(41)
    expect.soft(results[0].investments['cash']).toBeCloseTo(100, 2)
    expect.soft(results[5].investments['cash']).toBeLessThanOrEqual(1000)
    expect.soft(results[40].investments['S&P 500 non-retirement']).toBeLessThan(100000000)

})
