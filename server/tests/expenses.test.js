import { expect, test } from 'vitest';
import { calculateNonDiscretionaryExpenses, payNonDiscretionaryExpenses } from '../simulator/util.js';
import { Investment, InvestmentType, ExpenseEvent } from '../classes.js';

test('Non-discretionary expenses are calculated correctly', () => {

    const expenseEvents = [
        new ExpenseEvent({
            name: 'Expense Event 1',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 1000,
            changeAmtOrPct: "amount",
            changeDistribution: { type: 'fixed', value: 100 },
            userFraction: 1.0,
            discretionary: false,
        }),
        new ExpenseEvent({
            name: 'Expense Event 2',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 1000,
            changeAmtOrPct: "amount",
            changeDistribution: { type: 'fixed', value: 200 },
            userFraction: 1.0,
            discretionary: true,
        })
    ]

    const expenses = calculateNonDiscretionaryExpenses(2025, expenseEvents);

    expect(expenses).toBe(1000);

})

test('Non-discretionary expenses are paid correctly', () => {

    const cashInvestment = new Investment({
        investmentType: new InvestmentType({
            name: 'cash',
            description: 'cash',
            returnAmtOrPct: 'amount',
            returnDistribution: { type: 'fixed', value: 0 },
            expenseRatio: 0,
            incomeAmtOrPct: 'percent',
            incomeDistribution: { type: 'fixed', value: 0 },
            taxability: true
        }),
        value: 0,
        taxStatus: 'non-retirement',
    })

    const investments = [
        cashInvestment,
        new Investment({
            investmentType: new InvestmentType({
                name: 'asset 1',
                description: 'asset 1'
            }),
            value: 500,
            costBasis: 500
        }),
        new Investment({
            investmentType: new InvestmentType({
                name: 'asset 2',
                description: 'asset 2'
            }),
            value: 500,
            costBasis: 100
        })
    ]

    const withdrawalStrategy = [ 'cash non-retirement', 'asset 1 non-retirement', 'asset 2 non-retirement' ]

    let capitalGains = payNonDiscretionaryExpenses(2000, investments, cashInvestment, withdrawalStrategy);

    expect(cashInvestment.value).toBe(0);
    expect(capitalGains).toBe(400);
    expect(investments[1].value).toBe(0);
    expect(investments[2].value).toBe(0);
})

test('Non-discretionary expenses are paid correctly with partial withdrawal', () => {

    const cashInvestment = new Investment({
        investmentType: new InvestmentType({
            name: 'cash',
            description: 'cash',
            returnAmtOrPct: 'amount',
            returnDistribution: { type: 'fixed', value: 0 },
            expenseRatio: 0,
            incomeAmtOrPct: 'percent',
            incomeDistribution: { type: 'fixed', value: 0 },
            taxability: true
        }),
        value: 0,
        taxStatus: 'non-retirement',
    })

    const investments = [
        cashInvestment,
        new Investment({
            investmentType: new InvestmentType({
                name: 'asset 1',
                description: 'asset 1'
            }),
            value: 2000,
            costBasis: 500
        }),
    ]

    const withdrawalStrategy = [ 'asset 1 non-retirement' ]

    let capitalGains = payNonDiscretionaryExpenses(1000, investments, cashInvestment, withdrawalStrategy);
    expect(cashInvestment.value).toBe(0);
    expect(capitalGains).toBeCloseTo(750, 1);
    expect(investments[1].value).toBeCloseTo(1000, 1);

})