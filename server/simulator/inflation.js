import { Scenario } from "../classes.js"

/**
 * Takes in a scenario and adjusts all applicable values to a supplied inflation value.
 * @param {Scenario} Scenario 
 * @param {Object} federalTaxRates 
 * @param {Object} stateTaxRates 
 * @param {Number} inflation 
 */
export default function applyInflation(Scenario, federalTaxRates, stateTaxRates, inflation) {

    let incomeEvents = Scenario.incomeEvents
    let expenseEvents = Scenario.expenseEvents

    for (let incomeEvent of incomeEvents) {
        if (incomeEvent.inflationAdjusted) {
            incomeEvent.initialAmount *= (1 + inflation)
        }
    }

    for (let expenseEvent of expenseEvents) {
        if (expenseEvent.inflationAdjusted) {
            expenseEvent.initialAmount *= (1 + inflation)
        }
    }

    // Adjust the federal tax brackets by inflation
    for (let i = 0; i < federalTaxRates.taxBrackets.length; i++) {
        federalTaxRates.taxBrackets[i].max *= (1 + inflation)
    }

    federalTaxRates.standardDeductionSingle *= (1 + inflation)
    federalTaxRates.standardDeductionMarried *= (1 + inflation)

    for (let i = 0; i < federalTaxRates.capitalGainsBrackets.length; i++) {
        federalTaxRates.capitalGainsBrackets[i].max *= (1 + inflation)
    }

    federalTaxRates.standardDeductionHeadOfHousehold *= (1 + inflation)
    federalTaxRates.standardDeductionMarried *= (1 + inflation)
    federalTaxRates.standardDeductionSingle *= (1 + inflation)

    // Adjust the state tax brackets by inflation
    for (let i = 0; i < stateTaxRates.marriedBrackets.length; i++) {
        stateTaxRates.marriedBrackets[i].max *= (1 + inflation)
    }
    for (let i = 0; i < stateTaxRates.singleBrackets.length; i++) {
        stateTaxRates.singleBrackets[i].max *= (1 + inflation)
    }

}