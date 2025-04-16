import { expect, test } from 'vitest';
import { updateInvestments, runRebalanceEvent } from '../simulator/util.js';
import { InvestmentType, Investment, RebalanceEvent } from '../classes.js';

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

test('Rebalance 60/40 Split to 50/50', () => {
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
            value: 6000,
            costBasis: 2000,
            taxStatus: 'non-retirement',
            id: 'investment1',
        }),
        new Investment({
            investmentType: new InvestmentType({
                name: 'Investment2',
                returnAmtOrPct: "percent",
                returnDistribution: { type: 'fixed', value: 0.05 },
                incomeAmtOrPct: "amount",
                incomeDistribution: { type: 'fixed', value: 0.00 },
                taxability: 'true'
            }),
            value: 4000,
            costBasis: 2000,
            taxStatus: 'non-retirement',
            id: 'investment2',
        })
    ]
    const rebalanceEvents = [
        new RebalanceEvent({
            name: 'rebalance',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            assetAllocation: { 'investment1': 0.5, 'investment2': 0.5 },
        }),
    ]

    let capitalGains = runRebalanceEvent(2025, rebalanceEvents, InvestmentSet)
    expect(InvestmentSet[0].value).toBeCloseTo(5000, 1)
    expect(InvestmentSet[0].costBasis).toBeCloseTo(1666.66, 1)
    expect(InvestmentSet[1].value).toBeCloseTo(5000, 1)
    expect(InvestmentSet[1].costBasis).toBeCloseTo(3000, 1)
    expect(capitalGains).toBeCloseTo(666.66, 1)

})

