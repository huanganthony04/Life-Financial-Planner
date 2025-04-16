import scenarioProcessor from "./preprocessor.js"
import applyInflation from "./inflation.js"
import { getValueFromDistribution, calculateIncome, calculateNonDiscretionaryExpenses, payNonDiscretionaryExpenses,
    payDiscretionaryExpenses, runInvestEvent, runRebalanceEvent, updateInvestments, calculateTaxes, getResults,
} from "./util.js"

/**
 * Simulate a financial scenario
 * @param {Scenario} Scenario The scenario to simulate
 * @param {Object} federalTaxRates The federal tax rates to use for the simulation
 * @param {Object} stateTaxRates The state tax rates to use for the simulation
 * @returns {{investments: Object, incomes: Object, expenses: Object}[]} An array of results for each year of the simulation
 * */
export default function simulation(Scenario, federalTaxRates, stateTaxRates) {
    
    let inflation_rate = 0
    let prevYearIncome = 0
    let prevYearSS = 0
    let curYearIncome = 0
    let curYearSS = 0
    let prevYearGains = 0
    let curYearGains = 0
    let prevYearTaxes = 0
    let results = []

    let { processedScenario, cash_investment, presentYear, userRemainingYears, spouseRemainingYears } = scenarioProcessor(Scenario)
    Scenario = processedScenario

    let currentYear = presentYear

    for (let i = 0; i < userRemainingYears; i++) {

        let spouseAlive = (i < spouseRemainingYears) ? true : false
        
        results.push(getResults(Scenario.investments, Scenario.incomeEvents, Scenario.expenseEvents))

        inflation_rate = getValueFromDistribution(Scenario.inflationAssumption)

        applyInflation(Scenario, federalTaxRates, stateTaxRates, inflation_rate)

        // Get income from income events
        let { income, socialSecurity } = calculateIncome(currentYear, Scenario.incomeEvents, spouseAlive)
        curYearIncome = income
        curYearSS = socialSecurity
        cash_investment.value += curYearIncome + curYearSS

        // Update investments
        let investmentIncome = updateInvestments(Scenario.investments)
        curYearIncome += investmentIncome

        // Pay non-discretionary expenses

        // Calculate last year's taxes
        prevYearTaxes = calculateTaxes(prevYearIncome, prevYearSS, prevYearGains, federalTaxRates, stateTaxRates, spouseAlive)

        let expensesND = calculateNonDiscretionaryExpenses(currentYear, Scenario.expenseEvents, spouseAlive)
        curYearGains = payNonDiscretionaryExpenses(expensesND + prevYearTaxes, Scenario.investments, cash_investment, Scenario.expenseWithdrawalStrategy)

        // Pay discretionary expenses
        payDiscretionaryExpenses(currentYear, Scenario.expenseEvents, cash_investment, Scenario.financialGoal, spouseAlive)

        // Run investment event
        runInvestEvent(currentYear, Scenario.investEvents, Scenario.investments, cash_investment)

        // Run rebalance event
        curYearGains += runRebalanceEvent(currentYear, Scenario.rebalanceEvents, Scenario.investments)
        
        prevYearIncome = curYearIncome
        prevYearGains = curYearGains

        currentYear++
    }

    results.push(getResults(Scenario.investments, Scenario.incomeEvents, Scenario.expenseEvents))
    return results

}