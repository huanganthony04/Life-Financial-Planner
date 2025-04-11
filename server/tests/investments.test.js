import { expect, test } from 'vitest';
import { updateInvestments } from '../simulator/util.js';
import { InvestmentType, Investment } from '../classes.js';

test('5% Return on Investment, No Cost Basis', () => {

    const InvestmentSet = [
        new Investment({
            investmentType: new InvestmentType({
                name: 'Investment1',
                returnAmtOrPct: "percent",
                returnDistribution: { type: 'fixed', value: 0.05 },
                incomeAmtOrPct: "amount",
                incomeDistribution: { type: 'fixed', value: 0.00 },
                taxability: 'true'
            }),
            value: 10000,
            taxStatus: 'non-retirement',
            id: 'investment1',
        })
    ]

    updateInvestments(InvestmentSet)

    expect(InvestmentSet[0].value).toBe(10500)
})

test('Flat $500 Return on Investment, No Cost Basis', () => {

    const InvestmentSet = [
        new Investment({
            investmentType: new InvestmentType({
                name: 'Investment1',
                returnAmtOrPct: "amount",
                returnDistribution: { type: 'fixed', value: 500 },
                incomeAmtOrPct: "amount",
                incomeDistribution: { type: 'fixed', value: 0.00 },
                taxability: 'true'
            }),
            value: 10000,
            taxStatus: 'non-retirement',
            id: 'investment1',
        })
    ]

    updateInvestments(InvestmentSet)

    expect(InvestmentSet[0].value).toBe(10500)

})

test('5% Return on Investment, Income of 1%', () => {

    const InvestmentSet = [
        new Investment({
            investmentType: new InvestmentType({
                name: 'Investment1',
                returnAmtOrPct: "percent",
                returnDistribution: { type: 'fixed', value: 0.05 },
                incomeAmtOrPct: "percent",
                incomeDistribution: { type: 'fixed', value: 0.01 },
                taxability: 'true'
            }),
            value: 10000,
            taxStatus: 'non-retirement',
            id: 'investment1',
        })
    ]

    let dividends = updateInvestments(InvestmentSet)

    expect(InvestmentSet[0].value).toBeCloseTo(10605, 1)
    expect(dividends).toBeCloseTo(100, 1)
    expect(InvestmentSet[0].costBasis).toBeCloseTo(10100, 1)

})

test('5% Return on Investment, Income of 1%, expense ratio of 1%', () => {

    const InvestmentSet = [
        new Investment({
            investmentType: new InvestmentType({
                name: 'Investment1',
                returnAmtOrPct: "percent",
                returnDistribution: { type: 'fixed', value: 0.05 },
                incomeAmtOrPct: "percent",
                incomeDistribution: { type: 'fixed', value: 0.01 },
                taxability: 'true',
                expenseRatio: 0.01
            }),
            value: 10000,
            costBasis: 10000,
            taxStatus: 'non-retirement',
            id: 'investment1',
        })
    ]

    let dividends = updateInvestments(InvestmentSet)

    expect(InvestmentSet[0].value).toBeCloseTo(10501.475, 1)
    expect(dividends).toBeCloseTo(100, 1)
    expect(InvestmentSet[0].costBasis).toBeCloseTo(10100, 1)

})

