import { ExpenseEvent, IncomeEvent, Investment, ValueDistribution } from "../classes.js"

/**
 * Generate a normal distribution using Box-Muller transform
 * @param {number} mean The mean of the normal distribution
 * @param {number} sigma The standard deviation of the normal distribution
    * @returns {number} A random sample from the normal distribution
 * */
function normalSample(mean, sigma) {
    if (mean == null || sigma == null || Number.isNaN(mean) || Number.isNaN(sigma)) {
        throw new Error("Invalid mean or sigma value")
    }
    let u1 = Math.random()
    let u2 = Math.random()
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return mean + sigma * z0
}

/**
 * Given a value distribution, sample it and return a value.
 * @param {ValueDistribution} ValueDistribution
 */
function getValueFromDistribution(ValueDistribution) {
    if (ValueDistribution.distType === "fixed") {
        return ValueDistribution.value
    }
    else if (ValueDistribution.distType === "uniform") {
        let lower = ValueDistribution.lower
        let upper = ValueDistribution.upper
        return Math.random() * (upper - lower) + lower
    }
    else {
        let mean = ValueDistribution.mean
        let sigma = ValueDistribution.sigma
        return normalSample(mean, sigma)
    }
}

/**
 * Calculates the income for a given year based on income events.
 * @param {Number} currentYear 
 * @param {Array<IncomeEvent>} incomeEvents 
 * @param {Boolean} spouseAlive Whether the spouse is alive or not
 * @returns {{income: Number, socialSecurity: Number}} An object containing the total income and social security income for the year
 */

function calculateIncome(currentYear, incomeEvents, spouseAlive) {

    let income = 0
    let socialSecurity = 0

    for (let incomeEvent of incomeEvents) {

        let startYear = incomeEvent.start.startDistribution.value
        let endYear = startYear + incomeEvent.duration.value

        if (currentYear < startYear || currentYear >= endYear) {
            continue
        }

        //Add the income to the total income

        if (incomeEvent.socialSecurity) {
            // Remove the spouse's contributions if they have passed
            if(!spouseAlive) {
                socialSecurity += incomeEvent.initialAmount * incomeEvent.userFraction
            }
            else {
                socialSecurity += incomeEvent.initialAmount
            }
        }
        else {
            if (!spouseAlive) {
                income += incomeEvent.initialAmount * incomeEvent.userFraction
            }
            else {
                income += incomeEvent.initialAmount
            }
        }

        //Calculate the expected annual change

        if (incomeEvent.changeDistribution.distType == "fixed") {
            if (incomeEvent.changeAmtOrPct == "amount") {
                let value = getValueFromDistribution(incomeEvent.changeDistribution)
                incomeEvent.initialAmount += value
            }
            else {
                let rate = getValueFromDistribution(incomeEvent.changeDistribution)
                incomeEvent.initialAmount *= 1 + rate
            }
        }
    }

    return { income, socialSecurity }

}

function updateInvestments(investments) {

    let totalDividends = 0

    for (let investment of investments) {

        const asset = investment.investmentType
        let dividends = 0

        // Calculate and reinvest any dividends and interest
        if (asset.incomeAmtOrPct === "amount") {
            let value = getValueFromDistribution(asset.incomeDistribution)
            investment.value += value
            investment.costBasis += value
            dividends += value
        }
        else {
            //Percent rate
            let rate = getValueFromDistribution(asset.incomeDistribution)
            let value = investment.value * rate
            investment.value += value
            investment.costBasis += value
            dividends += value
        }

        let new_value;

        // Get the expected new value
        if (asset.returnAmtOrPct === "amount") {
            let value = getValueFromDistribution(asset.returnDistribution)
            new_value = investment.value + value
        }
        else {
            //Percent rate
            let rate = getValueFromDistribution(asset.returnDistribution)
            new_value = investment.value * (1 + rate)
        }

        let average_value = (new_value + investment.value) / 2

        // Update the value
        investment.value = new_value

        // Pay the expense ratio
        if (asset.expenseRatio) {
            investment.value -= average_value * asset.expenseRatio
        }

        // Add the dividends to the total dividends
        totalDividends += dividends
    
    }

    return totalDividends

}

function calculateTaxes(income, socialSecurity, capitalGains, federalTaxRates, stateTaxRates, spouseAlive) {

    if (isNaN(capitalGains)) {
        throw new Error(`capitalGains is invalid! ${capitalGains}`)
    }

    let tax = 0
    let previous_limit = 0

    let adjustedIncome = income
    if (spouseAlive) {
        adjustedIncome -= federalTaxRates.standardDeductionMarried
    }
    else {
        adjustedIncome -= federalTaxRates.standardDeductionSingle
    }
    adjustedIncome = Math.max(0, adjustedIncome)

    // Each cell in taxRates has two fields, limit and rate.
    for (const bracket of federalTaxRates.taxBrackets) {
        let limit = bracket.max
        // TODO: Rates are currently stored numbers not decimals. Divide by 100 for now, fix tax rates maybe?
        let rate = bracket.rate / 100

        if (adjustedIncome > limit) {
            tax += (limit - previous_limit) * rate
            previous_limit = limit
        }
        else {
            tax += (adjustedIncome - previous_limit) * rate
            break
        }
    }

    previous_limit = 0

    adjustedIncome = income

    if (spouseAlive) {
        for (const bracket of stateTaxRates.marriedBrackets) {
            let limit = bracket.max
            let rate = bracket.rate / 100
    
            if (adjustedIncome > limit) {
                tax += (limit - previous_limit) * rate
                previous_limit = limit
            }
            else {
                tax += (adjustedIncome - previous_limit) * rate
                break
            }
        }
    }
    else {
        for (const bracket of stateTaxRates.singleBrackets) {
            let limit = bracket.max
            let rate = bracket.rate / 100
    
            if (adjustedIncome > limit) {
                tax += (limit - previous_limit) * rate
                previous_limit = limit
            }
            else {
                tax += (adjustedIncome - previous_limit) * rate
                break
            }
        }
    }

    // Calculate capital gains tax
    previous_limit = 0
    let remaining_gains = capitalGains
    for (const bracket of federalTaxRates.capitalGainsBrackets) {

        let limit = bracket.max
        let rate = bracket.rate

        if (income >= limit) {
            previous_limit = limit
            continue
        }

        let taxable_gains = Math.min(remaining_gains, Math.max(0, limit - Math.max(previous_limit, income)))
        tax += taxable_gains * rate / 100
        remaining_gains -= taxable_gains
        previous_limit = limit

        if (remaining_gains <= 0) {
            break
        }

    }

    return tax
}

/**
 * Calculate the total non-discretionary expenses for a given year based on expense events.
 * @param {Number} currentYear 
 * @param {[ExpenseEvent]} expenseEvents 
 * @param {Boolean} spouseAlive 
 * @returns {Number} The total non-discretionary expenses for the year
 */
function calculateNonDiscretionaryExpenses(currentYear, expenseEvents, spouseAlive) {

    let expenses = 0

    for (let expenseEvent of expenseEvents) {

        let startYear = expenseEvent.start.startDistribution.value
        let endYear = startYear + expenseEvent.duration.value

        if (currentYear < startYear || currentYear >= endYear) {
            continue
        }

        if (expenseEvent.discretionary) continue;

        //Add the expense to the total expenses
        if (!spouseAlive) {
            expenses += expenseEvent.initialAmount * expenseEvent.userFraction
        }
        else {
            expenses += expenseEvent.initialAmount
        }

        //Calculate the expected annual change

        if (expenseEvent.changeAmtOrPct === "amount") {
            let value = getValueFromDistribution(expenseEvent.changeDistribution)
            expenseEvent.initialAmount += value
        }
        else {
            let rate = getValueFromDistribution(expenseEvent.changeDistribution)
            let value = expenseEvent.initialAmount * rate
            expenseEvent.initialAmount += value
        }
    }

    if (Number.isNaN(expenses) || expenses < 0) {
        throw new Error("Invalid expenses value")
    }

    return expenses

}
        
function payNonDiscretionaryExpenses(amount, investments, cash_investment, withdrawalStrategy) {

    if (Number.isNaN(amount) || amount < 0) {
        throw new Error("Invalid amount value: " + amount)
    }

    //Check if there is enough cash to pay the expenses
    if (cash_investment.value > amount) {
        cash_investment.value -= amount
        return 0
    }

    amount -= cash_investment.value
    cash_investment.value = 0

    let capitalGains = 0

    for (const assetId of withdrawalStrategy) {
        let investment = investments.find(i => i.id === assetId)

        if (investment.value < 1) {
            continue;
        }
        if (amount < 1) {
            break;
        }
        
        if (investment.value < amount) {
            //Sell the entire investment to pay the expenses
            amount -= investment.value
            capitalGains += investment.value - investment.costBasis
            investment.value = 0
            investment.costBasis = 0
        }
        else {
            //Sell a portion of the investment to pay the expenses
            let portion = amount / investment.value
            capitalGains += amount - investment.costBasis * portion
            investment.value -= amount
            investment.costBasis -= investment.costBasis * portion
            amount = 0
        }
    }

    if (isNaN(capitalGains)) {
        throw new Error(`Capital Gains is invalid in non-discretionary expense calculation! ${capitalGains} ${amount}`)
    }

    return capitalGains

}

/**
 * Calculate and pay for any discretionary expenses for a given year based on expense events.
 * @param {Number} currentYear 
 * @param {[ExpenseEvent]} expenseEvents 
 * @param {Investment} cash_investment 
 * @param {Number} financialGoal 
 * @param {Boolean} spouseAlive 
 * @returns 
 */
function payDiscretionaryExpenses(currentYear, expenseEvents, cash_investment, financialGoal, spouseAlive) {

    if (financialGoal == null || Number.isNaN(financialGoal)) {
        throw new Error("Invalid financial goal value")
    }

    // Take out all excess cash from the cash investment
    let cashAvailable = cash_investment.value - financialGoal
    if (cashAvailable <= 0) return
    else cash_investment.value = financialGoal

    for (let expenseEvent of expenseEvents) {
        if (!expenseEvent.discretionary) continue

        let startYear = expenseEvent.start.startDistribution.value
        let endYear = startYear + expenseEvent.duration.value

        if (currentYear < startYear || currentYear >= endYear) {
            continue
        }

        // Find the current amount and pay only if enough excess cash is available
        let amount = expenseEvent.initialAmount * (spouseAlive ? 1 : expenseEvent.userFraction)
        if (cashAvailable >= amount) {
            cashAvailable -= amount
        }

        // Calculate the expected annual change
        if (expenseEvent.changeAmtOrPct === "amount") {
            let value = getValueFromDistribution(expenseEvent.changeDistribution)
            expenseEvent.initialAmount += value
        }
        else {
            let rate = getValueFromDistribution(expenseEvent.changeDistribution)
            let value = expenseEvent.initialAmount * rate
            expenseEvent.initialAmount += value
        }
    }
    // If there is still cash available, add it back to the cash investment
    cash_investment.value += cashAvailable
}
            
function runInvestEvent(currentYear, investEvents, investments, cash_investment) {

    let activeInvestEvent = null
    let startYear, endYear

    for (let investEvent of investEvents) {
        startYear = investEvent.start.startDistribution.value
        endYear = startYear + investEvent.duration.value
        if (currentYear < startYear || currentYear > endYear) {
            continue
        }
        else {
            activeInvestEvent = investEvent
            break
        }
    }

    if (!activeInvestEvent) {
        return
    }

    let excess_cash = cash_investment.value - activeInvestEvent.maxCash
    cash_investment.value = activeInvestEvent.maxCash

    if (excess_cash <= 0) {
        return
    }

    let assetAlloc = activeInvestEvent.assetAllocation

    if (activeInvestEvent.glidePath) {

        let finalAssetAlloc = activeInvestEvent.assetAllocation2

        let progress = 0
        if (activeInvestEvent.duration.value !== 0) {
            progress = (currentYear - startYear) / activeInvestEvent.duration.value
        }

        for (const [asset, alloc] of Object.entries(assetAlloc)) {

            let targetAlloc = alloc + ((finalAssetAlloc[asset] - alloc) * progress)

            let investment = investments.find(i => i.id === asset)
            
            investment.value += excess_cash * targetAlloc
            investment.costBasis += excess_cash * targetAlloc
            excess_cash -= excess_cash * targetAlloc

        }
    }
    // If there is no glide path, just invest according to the asset allocation
    else {
        for(const [asset, alloc] of Object.entries(assetAlloc)) {
            let investment = investments.find(i => i.id == asset)

            investment.value += excess_cash * alloc
            investment.costBasis += excess_cash * alloc
            excess_cash -= excess_cash * alloc

        }
    }
}

function runRebalanceEvent(currentYear, rebalanceEvents, investments) {

    let activeRebalanceEvent = null
    let startYear, endYear

    for (let rebalanceEvent of rebalanceEvents) {
        startYear = rebalanceEvent.start.startDistribution.value
        endYear = startYear + rebalanceEvent.duration.value
        if (currentYear < startYear || currentYear > endYear) {
            continue
        }
        else {
            activeRebalanceEvent = rebalanceEvent
            break
        }
    }

    if (!activeRebalanceEvent) {
        return 0
    }

    let assetAlloc = activeRebalanceEvent.assetAllocation

    // Find current total for all investments included in the assetAllocation
    let total = 0

    for (const [investmentId] of Object.entries(assetAlloc)) {
        let investmentObj = investments.find(i => i.id === investmentId)
        if (!investmentObj) {
            throw new Error(`Investment with ID ${investmentId} not found in ${investments.map(i => i.id)}`)
        }
        total += investmentObj.value
    }

    let capitalGains = 0

    for (const [investmentId, percent] of Object.entries(assetAlloc)) {
        
        let targetValue = total * percent
        let investmentObj = investments.find(i => i.id === investmentId)
        if (!investmentObj) {
            throw new Error(`Investment with ID ${investmentId} not found in ${investments.map(i => i.id)}`)
        }
        if (targetValue < investmentObj.value) {
            // Sell the investment
            let portion = (investmentObj.value - targetValue) / investmentObj.value
            capitalGains += investmentObj.value * portion - investmentObj.costBasis * portion
            investmentObj.value = investmentObj.value * (1 - portion)
            investmentObj.costBasis = investmentObj.costBasis * (1 - portion)
        }
        else {
            // Buy the investment
            let amount = targetValue - investmentObj.value
            investmentObj.value += amount
            investmentObj.costBasis += amount
        }
    }
    
    return capitalGains

}

/**
 * Get the scenario's current investment values and return as a map of ID : Value
 * @param {Number} currentYear 
 * @param {Array<Object>} investments
 * @param {Array<Object>} incomeEvents
 * @param {Array<Object>} expenseEvents
 * @returns {{investments: Object, incomes: Object, expenses: Object}} A an object of investment IDs to their current values
 */
function getResults(currentYear, investments, incomeEvents, expenseEvents) {
    
    let investmentResults = {}
    let incomeResults = {}
    let expenseResults = {}

    investments.forEach((investment) => {
        investmentResults[investment.id] = investment.value
    })

    incomeEvents.forEach((incomeEvent) => {
        let startYear = incomeEvent.start.startDistribution.value
        let endYear = startYear + incomeEvent.duration.value

        if (currentYear >= startYear && currentYear < endYear) {
            incomeResults[incomeEvent.name] = incomeEvent.initialAmount
        }
    })

    expenseEvents.forEach((expenseEvent) => {
        let startYear = expenseEvent.start.startDistribution.value
        let endYear = startYear + expenseEvent.duration.value

        if (currentYear >= startYear && currentYear < endYear) {
            expenseResults[expenseEvent.name] = expenseEvent.initialAmount
        }
    })

    return { investments: investmentResults, incomes: incomeResults, expenses: expenseResults }
}

export { getValueFromDistribution, calculateIncome, calculateNonDiscretionaryExpenses, payNonDiscretionaryExpenses,
    payDiscretionaryExpenses, runInvestEvent, runRebalanceEvent, updateInvestments, calculateTaxes, getResults }