import scenarioProcessor from "./preprocessor.js"
import applyInflation from "./inflation.js"
import { normalSample, calculateIncome, updateInvestments, calculateTaxes, 
    calculateNonDiscretionaryExpenses, payNonDiscretionaryExpenses,
    payDiscretionaryExpenses, runInvestEvent,  
} from "./util.js"

/**
 * Simulate a financial scenario
 * @param {Scenario} Scenario The scenario to simulate
 * @param {Object} federalTaxRates The federal tax rates to use for the simulation
 * @param {Object} stateTaxRates The state tax rates to use for the simulation
 * @returns {Array} An array of results for each year of the simulation
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

    let { cash_investment, presentYear, remainingYears } = scenarioProcessor(Scenario)

    let currentYear = presentYear

    for (let i = 0; i < remainingYears; i++) {
        
        results.push({
            investments: structuredClone(Scenario.investments), 
            incomeEvents: structuredClone(Scenario.incomeEvents), 
            expenseEvents: structuredClone(Scenario.expenseEvents),
            investEvents: structuredClone(Scenario.investEvents),
            year: currentYear
        })

        if (Scenario.inflationAssumption.distType === "fixed") {
            inflation_rate = Scenario.inflationAssumption.value
        }
        else {
            let mean = Scenario.inflationAssumption.mean
            let sigma = Scenario.inflationAssumption.sigma
            inflation_rate = normalSample(mean, sigma)
        }

        // Get income from income events
        ({ curYearIncome, curYearSS } = calculateIncome(currentYear, Scenario.incomeEvents))
        cash_investment.value += curYearIncome + curYearSS

        // Update investments
        let investmentIncome = updateInvestments(Scenario.investments)
        curYearIncome += investmentIncome

        // Pay non-discretionary expenses

        // Calculate last year's taxes
        prevYearTaxes = calculateTaxes(prevYearIncome, prevYearSS, prevYearGains, federalTaxRates, stateTaxRates, Scenario.maritalStatus)

        let expensesND = calculateNonDiscretionaryExpenses(currentYear, Scenario.expenseEvents)
        curYearGains = payNonDiscretionaryExpenses(expensesND + prevYearTaxes, Scenario.investments, cash_investment, Scenario.expenseWithdrawalStrategy)

        // Pay discretionary expenses
        payDiscretionaryExpenses(currentYear, Scenario.expenseEvents, cash_investment, Scenario.financialGoal)

        // Run investment event
        runInvestEvent(i, Scenario.investEvents, cash_investment, Scenario.investments)

        // Run rebalance event
        // curYearGains += runRebalanceEvent(events, Scenario.investments)
        
        prevYearIncome = curYearIncome
        prevYearGains = curYearGains

        // Adjust everything affected by inflation
        applyInflation(Scenario, federalTaxRates, stateTaxRates, inflation_rate)

        currentYear++

    }

    results.push({
        investments: structuredClone(Scenario.investments), 
        incomeEvents: structuredClone(Scenario.incomeEvents), 
        expenseEvents: structuredClone(Scenario.expenseEvents),
        investEvents: structuredClone(Scenario.investEvents),
        year: currentYear
    })
    return results

}