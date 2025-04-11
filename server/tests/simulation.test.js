import { expect, test } from 'vitest';
import { ValueDistribution, InvestmentType, Investment, EventStart, IncomeEvent, ExpenseEvent, InvestEvent, RebalanceEvent, Scenario } from '../classes.js';
import runSimulation from '../simulator/simulation.js';


// No Inflation 10000 yearly income for 40 years
const Scenario10KNoInflation = new Scenario({
    name: 'Scenario 1',
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
let results = runSimulation(Scenario10KNoInflation, taxRateNone, taxRateNone)

test('$10000 Annual Income has $80000 after the 8th year', () => {
    expect(results[8].investments.find(i => i.id === 'cash').value).toBe(80000)
})
