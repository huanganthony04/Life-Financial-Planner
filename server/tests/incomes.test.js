import { expect, test } from 'vitest';
import { calculateIncome } from '../simulator/util.js';
import { IncomeEvent } from '../classes.js';

test('Income is added and appreciated correctly', () => {
    
    const incomeEvents = [
        new IncomeEvent({
            name: 'Salary',
            type: 'income',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 10000,
            changeAmtOrPct: "amount",
            changeDistribution: { type: 'fixed', value: 1000 },
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        })
    ];

    const result = calculateIncome(2025, incomeEvents);
    
    expect(result.income).toBe(10000);
    expect(result.socialSecurity).toBe(0);
    expect(incomeEvents[0].initialAmount).toBe(11000);

});

test('Inactive events are ignored', () => {
    
    const incomeEvents = [
        new IncomeEvent({
            name: 'Salary',
            type: 'income',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 10000,
            changeAmtOrPct: "amount",
            changeDistribution: { type: 'fixed', value: 1000 },
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        }),
        new IncomeEvent({
            name: 'Salary',
            type: 'income',
            start: { type: 'fixed', value: 2030 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 15000,
            changeAmtOrPct: "amount",
            changeDistribution: { type: 'fixed', value: 1000 },
            inflationAdjusted: false,
            userFraction: 1.0,
            socialSecurity: false
        })
    ];

    const result = calculateIncome(2025, incomeEvents);
    
    expect(result.income).toBe(10000);
    expect(result.socialSecurity).toBe(0);

});

test('Income amount adjusts for spouse passing', () => {

    const incomeEvents = [
        new IncomeEvent({
            name: 'Salary',
            type: 'income',
            start: { type: 'fixed', value: 2025 },
            duration: { type: 'fixed', value: 5 },
            initialAmount: 120000,
            changeAmtOrPct: "amount",
            inflationAdjusted: false,
            userFraction: 0.5,
        })
    ];

    const resultWithSpouse = calculateIncome(2025, incomeEvents, true);
    const resultWithoutSpouse = calculateIncome(2025, incomeEvents, false);
    
    expect(resultWithSpouse.income).toBe(120000);
    expect(resultWithoutSpouse.income).toBe(60000);
})