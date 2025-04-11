import { IncomeEvent } from "../classes.js"

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
 * Calculates the income for a given year based on income events.
 * @param {Number} currentYear 
 * @param {Array<IncomeEvent>} incomeEvents 
 * @returns {{income: Number, socialSecurity: Number}} An object containing the total income and social security income for the year
 */

function calculateIncome(currentYear, incomeEvents) {

    let income = 0
    let socialSecurity = 0

    for (let incomeEvent of incomeEvents) {

        let startYear = incomeEvent.start.startDistribution.value
        let endYear = startYear + incomeEvent.duration.value

        if (currentYear < startYear || currentYear > endYear) {
            continue
        }

        //Add the income to the total income

        if (incomeEvent.socialSecurity) {
            socialSecurity += incomeEvent.initialAmount
        }
        else {
            income += incomeEvent.initialAmount
        }

        //Calculate the expected annual change

        if (incomeEvent.changeDistribution.distType == "fixed") {
            if (incomeEvent.changeAmtOrPct == "amount") {
                incomeEvent.initialAmount += incomeEvent.changeDistribution.value
            }
            else {
                incomeEvent.initialAmount *= 1 + incomeEvent.changeDistribution.value
            }
        }
    }

    return { income, socialSecurity }

}

function updateInvestments(investments) {

    let totalDividends = 0

    for (let investment of investments) {

        let new_value;

        const asset = investment.investmentType

        // Get the expected new value
        if (asset.returnAmtOrPct == "amount") {
            if (asset.returnDistribution.distType == "fixed") {
                new_value = asset.returnDistribution.value + investment.value
            }
            else if (asset.returnDistribution.distType == "normal") {
                let mean = asset.returnDistribution.mean
                let sigma = asset.returnDistribution.sigma
                new_value = normalSample(mean, sigma) + investment.value
            }
            else {
                let lower = asset.returnDistribution.lower
                let upper = asset.returnDistribution.upper
                new_value = Math.random() * (upper - lower) + lower + investment.value
            }
        }
        else if (asset.returnAmtOrPct == "percent") {
            if (asset.returnDistribution.distType == "fixed") {
                new_value = investment.value * (1 + asset.returnDistribution.value)
            }
            else if (asset.returnDistribution.distType == "normal") {
                let mean = asset.returnDistribution.mean
                let sigma = asset.returnDistribution.sigma
                new_value = investment.value * (1 + normalSample(mean, sigma))
            }
            else {
                let lower = asset.returnDistribution.lower
                let upper = asset.returnDistribution.upper
                new_value = investment.value * (1 + Math.random() * (upper - lower) + lower)
            }
        }

        let average_value = (new_value + investment.value) / 2

        // Update the value
        investment.value = new_value

        // Pay the expense ratio
        if (asset.expenseRatio) {
            investment.value -= average_value * asset.expenseRatio
        }

        let dividends = 0

        // Calculate and reinvest any dividends and interest
        if (asset.incomeAmtOrPct === "amount") {
            if (asset.incomeDistribution.distType === "fixed") {
                investment.value += asset.incomeDistribution.value
                investment.costBasis += asset.incomeDistribution.value
                dividends += asset.incomeDistribution.value
            }
            else if (asset.incomeDistribution.distType === "normal") {
                let mean = asset.incomeDistribution.mean
                let sigma = asset.incomeDistribution.sigma
                let sample = normalSample(mean, sigma)
                investment.value += sample
                investment.costBasis += sample
                dividends += sample
            }
            else {
                let lower = asset.incomeDistribution.lower
                let upper = asset.incomeDistribution.upper
                let sample = Math.random() * (upper - lower) + lower
                investment.value += sample
                investment.costBasis += sample
                dividends += sample
            }
        }

        else {
            if (asset.incomeDistribution.distType === "fixed") {
                let dividend = investment.value * (1 + asset.incomeDistribution.value) - investment.value
                investment.value += dividend
                investment.costBasis += dividend
                dividends += dividend
            }
            else if (asset.incomeDistribution.distType === "normal") {
                let mean = asset.incomeDistribution.mean
                let sigma = asset.incomeDistribution.sigma
                let dividend = investment.value * (1 + normalSample(mean, sigma)) - investment.value
                investment.value += dividend
                investment.costBasis += dividend
                dividends += dividend
            }
            else {
                let lower = asset.incomeDistribution.lower
                let upper = asset.incomeDistribution.upper
                let dividend = investment.value * (1 + Math.random() * (upper - lower) + lower) - investment.value
                investment.value += dividend
                investment.costBasis += dividend
                dividends += dividend
            }
        }

        // Add the dividends to the total dividends
        totalDividends += dividends
    
    }

    return totalDividends

}

function calculateTaxes(income, socialSecurity, capitalGains, federalTaxRates, stateTaxRates, isMarried) {

    let tax = 0
    let previous_limit = 0

    let adjustedIncome = income
    if (isMarried) {
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

    if (isMarried) {
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
        tax += taxable_gains * rate
        remaining_gains -= taxable_gains
        previous_limit = limit

        if (remaining_gains <= 0) {
            break
        }

    }

    return tax
}

function calculateNonDiscretionaryExpenses(currentYear, expenseEvents) {

    let expenses = 0

    for (let expenseEvent of expenseEvents) {

        let startYear = expenseEvent.start.startDistribution.value
        let endYear = startYear + expenseEvent.duration.value

        if (currentYear < startYear || currentYear > endYear) {
            continue
        }

        if (expenseEvent.isDiscretionary) continue;

        //Add the expense to the total expenses
        expenses += expenseEvent.initialAmount

        //Calculate the expected annual change

        if (expenseEvent.changeDistribution.distType == "fixed") {
            if (expenseEvent.changeAmtOrPct == "amount") {
                expenseEvent.initialAmount += expenseEvent.changeDistribution.value
            }
            else {
                expenseEvent.initialAmount *= 1 + expenseEvent.changeDistribution.value
            }
        }
        else if (expenseEvent.changeDistribution.distType == "normal") {
            let mean = expenseEvent.changeDistribution.mean
            let sigma = expenseEvent.changeDistribution.sigma
            let change = normalSample(mean, sigma)
            if (expenseEvent.changeAmtOrPct == "amount") {
                expenseEvent.initialAmount += change
            }
            else {
                expenseEvent.initialAmount *= 1 + change
            }
        }
        else {
            let lower = expenseEvent.changeDistribution.lower
            let upper = expenseEvent.changeDistribution.upper
            let change = Math.random() * (upper - lower) + lower
            if (expenseEvent.changeAmtOrPct == "amount") {
                expenseEvent.initialAmount += change
            }
            else {
                expenseEvent.initialAmount *= 1 + change
            }
        }
    }

    return expenses

}
        
function payNonDiscretionaryExpenses(amount, investments, cash_investment, withdrawalStrategy) {

    //Check if there is enough cash to pay the expenses
    if (cash_investment.value > amount) {
        cash_investment.value -= amount
        return 0
    }

    amount -= cash_investment.value
    cash_investment.value = 0

    let capitalGains = 0

    for (const assetName of withdrawalStrategy) {
        let investment = investments.find(i => i.id === assetName)
        if (investment.value < amount) {
            //Sell the entire investment to pay the expenses
            amount -= investment.value
            capitalGains += investment.value - investment.costBasis
        }
        else {
            //Sell a portion of the investment to pay the expenses
            let portion = amount / investment.value
            capitalGains += investment.value * portion - investment.costBasis * portion
            investment.value -= amount
            investment.costBasis -= investment.costBasis * portion
        }
    }

    return capitalGains

}
    
function payDiscretionaryExpenses(currentYear, expenseEvents, cash_investment, financialGoal) {

    if (financialGoal == null || Number.isNaN(financialGoal)) {
        throw new Error("Invalid financial goal value")
    }

    // Take out all excess cash from the cash investment
    let cashAvailable = cash_investment.value - financialGoal
    cash_investment.value = financialGoal

    if (cashAvailable <= 0) return

    for (let expenseEvent of expenseEvents) {
        if (!expenseEvent.isDiscretionary) continue

        let startYear = expenseEvent.start.startDistribution.value
        let endYear = startYear + expenseEvent.duration.value

        if (currentYear < startYear || currentYear > endYear) {
            continue
        }

        if (expenseEvent.initialAmount > cashAvailable) {
            expenseEvent.initialAmount -= cashAvailable
            break
        }
        else {
            cashAvailable -= expenseEvent.initialAmount
            expenseEvent.initialAmount = 0
        }
    }

    // If there is still cash available, add it back to the cash investment
    cash_investment.value += cashAvailable

}
            
function runInvestEvent(currentYear, investEvents, cash_investment, investments) {

    let activeInvestEvent = null

    for (let investEvent of investEvents) {
        let startYear = investEvent.start.startDistribution.value
        let endYear = startYear + investEvent.duration.value
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

    if (excess_cash <= 0) {
        return
    }

    let assetAlloc = activeInvestEvent.assetAllocation

    if (activeInvestEvent.glidePath) {

        let finalAssetAlloc = activeInvestEvent.assetAllocation2

        let progress = 0
        if (activeInvestEvent.duration.value !== 0) {
            progress = currentYear - activeInvestEvent.start.value / activeInvestEvent.duration.value
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

/*
function runRebalanceEvent(rebalanceEvent, investments) {

    #find active rebalance event
    rebalanceEvent = None

    currentYear = Date().getFullYear() + yearsElapsed

    for event in events:
        if event.startYear > currentYear || event.duration + event.startYear < currentYear
            continue
        if event.type is REBALANCE:
            rebalanceEvent = event
            break

    if rebalanceEvent is None:
        return

    target = rebalanceEvent.AssetAlloc.percentage

    #Find the current total for all the investments included in the rebalance event
    total = 0

    for [investment, percent] in target:

        find i in investments such that i.name == investment.name

            total += i.value

    capitalGains = 0

    for [investment, percent] in target:

        find i in investments such that i.name == investment.name
            targetValue = total * percent
            if targetValue < i.value:
                valueSold = i.value - targetValue
                capitalGains += i.sell(valueSold)
            
            else:
                valueBought = targetValue - i.value
                i.invest(valueBought)
    
    return capitalGains

}
*/


export { normalSample, calculateIncome, calculateNonDiscretionaryExpenses, payNonDiscretionaryExpenses,
    payDiscretionaryExpenses, runInvestEvent, updateInvestments, calculateTaxes }