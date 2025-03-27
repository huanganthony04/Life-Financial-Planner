import { ValueDistribution, InvestmentType, Investment, Scenario } from '../classes.js'

//Generate a normal distribution using Box-Muller transform
function normalSample(mean, sigma) {
    let u1 = Math.random()
    let u2 = Math.random()
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return mean + sigma * z0
}

function financialSim(Scenario, TaxRates) {

    let inflation_rate = 0
    let prevYearIncome = 0
    let prevYearSS = 0
    let curYearIncome = 0
    let curYearSS = 0
    let prevYearGains = 0
    let curYearGains = 0
    let prevYearTaxes = 0
    let results = []
    let simTaxRates = structuredClone(TaxRates)

    let presentYear = new Date().getFullYear()

    //Get the cash investment
    let cash_investment;

    for (const investment of Scenario.investments) {

        if (investment.investmentType.name == "cash") {
            cash_investment = investment
            break
        }
    }

    //Add cash investment if no cash investment exists
    if (cash_investment == null) {
        it = new InvestmentType({
            name: "cash",
            description: "Cash investment",
            returnAmtOrPct: "amount",
            returnDistribution: new ValueDistribution({ type: "fixed", value: 0 }),
            expenseRatio: 0,
            incomeAmtOrPct: "amount",
            incomeDistribution: new ValueDistribution({ type: "fixed", value: 0 }),
            taxability: false
        })
        cash_investment = new Investment({
            investmentType: it,
            value: 0,
            taxStatus: "non-retirement",
            id: "cash"
        })
    }

    //Get the life expectancy
    let lifeExpectancy;
    if (Scenario.lifeExpectancy[0].distType == "fixed") {
        lifeExpectancy = Scenario.lifeExpectancy[0].value
    }
    else {
        //Create normal distribution for life expectancy
        let mean = Scenario.lifeExpectancy[0].mean
        let sigma = Scenario.lifeExpectancy[0].sigma
        lifeExpectancy = normalSample(mean, sigma)
    }

    //Get the birth year of the user
    let birthYear = Scenario.birthYears[0]

    let remainingYears = birthYear + lifeExpectancy - presentYear

    console.log(remainingYears)

    // Event preprocessing
    let allEvents = Scenario.incomeEvents
        .concat(Scenario.expenseEvents)
        .concat(Scenario.investEvents)
        .concat(Scenario.rebalanceEvents)

    // Replace all events with 'startWith' with the year of the event that it starts with
    // And determine the start/end year of events that have a distribution as a start year.
    for (let event of allEvents) {

        //Determine the duration of the event
        if (event.duration.distType == "fixed") continue;
        else if (event.duration.distType == "normal") {
            let mean = event.duration.mean
            let sigma = event.duration.sigma
            let duration = normalSample(mean, sigma)
            event.duration = new ValueDistribution({ type: "fixed", value: duration })
        }
        else {
            let lower = event.duration.lower
            let upper = event.duration.upper
            let duration = Math.random() * (upper - lower) + lower
            event.duration = new ValueDistribution({ type: "fixed", value: duration })
        }

        //Determine the start year of the event (if it doesn't have a startWith)
        if (!event.start.startWith) {
            if (event.start.startDistribution.distType == "fixed") continue;
            else if (event.start.startDistribution.distType === "normal") {
                let mean = event.start.startDistribution.mean
                let sigma = event.start.startDistribution.sigma
                let startYear = normalSample(mean, sigma)
                event.start.startDistribution = new ValueDistribution({ type: "fixed", value: startYear })
            }
            else {
                let lower = event.start.startDistribution.lower
                let upper = event.start.startDistribution.upper
                let startYear = Math.random() * (upper - lower) + lower
                event.start.startDistribution = new ValueDistribution({ type: "fixed", value: startYear })
            }
        }

        //Since an event's startWith can also have another startWith, we need to traverse up 
        //the events by their startWith until we reach an event with an actual year.
        let eventStack = []
        let eventPtr = event
        while (eventPtr.start.startWith) {
            eventStack.push(eventPtr)
            eventPtr = allEvents.find(e => e.name === eventPtr.start.startWith)
        }

        //We have an event with a start year, and all the events that depend on it.
        let startDist = eventPtr.start.startDistribution
        let startYear;
        if (startDist.distType == "fixed") {
            startYear = startDist.value
        }
        else if (startDist.distType == "normal") {
            startYear = normalSample(startDist.mean, startDist.sigma)
        }
        else {
            startYear = Math.random() * (startDist.upper - startDist.lower) + startDist.lower
        }

        //Set the start year for all events in the stack
        for (let event of eventStack) {
            event.start.startDistribution = new ValueDistribution({ type: "fixed", value: startYear })
            event.start.startWith = undefined
        }
    }

    // Beginning of the main simulation loop

    for (let i = 0; i < remainingYears; i++) {

        currentYear = presentYear + i

        if (Scenario.inflationAssumption.type === "fixed") {
            inflation_rate = Scenario.inflationAssumption.value
        }
        else {
            let mean = Scenario.inflationAssumption.mean
            let sigma = Scenario.inflationAssumption.sigma
            inflation_rate = normalSample(mean, sigma)
        }

        // Get income from income events
        [ curYearIncome, curYearSS ] = calculateIncome(currentYear, Scenario.incomeEvents)
        cash_investment.value += curYearIncome + curYearSS

        // Update investments
        investmentIncome = updateInvestments(Scenario.investments)
        curYearIncome += investmentIncome

        // Pay non-discretionary expenses

        // Calculate last year's taxes
        prevYearTaxes = calculateTaxes(prevYearIncome, prevYearSS, prevYearGains, simTaxRates, Scenario.maritalStatus)

        let expensesND = calculateExpensesND(currentYear, Scenario.expenseEvents)
        curYearGains = payExpensesND(expensesND + prevYearTaxes, Scenario.investments, cash_investment, Scenario.expenseWithdrawalStrategy)

        // Pay discretionary expenses
        payExpensesD(currentYear, Scenario.expenseEvents, cash_investment, Scenario.financialGoal)

        // Run investment event
        runInvestEvent(i, Scenario.events, cash_investment, Scenario.investments)

        // Run rebalance event
        curYearGains += runRebalanceEvent(events, Scenario.investments)
        
        prevYearIncome = curYearIncome
        prevYearGains = curYearGains

        // Adjust everything affected by inflation
        adjustInflation(Scenario.incomeEvents, Scenario.expenseEvents, simTaxRates, inflation_rate)

    }

    return results

}

function calculateIncome(currentYear, incomeEvents, inflation_rate) {

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
        if (incomeEvent.inflationAdjusted) {
            incomeEvent.initialAmount *= (1 + inflation_rate)
        }

    return [ income, socialSecurity ]

    }
}

function updateInvestments(investments) {

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

        average_value = (new_value + investment.value) / 2

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
    
    }
    return dividends
}

function calculateTaxes(income, socialSecurity, capitalGains, taxRates, isMarried, inflation) {

    tax = 0
    previous_limit = 0

    if (isMarried) {
        income -= taxRates.standardDeductionMarried
    }
    else {
        income -= taxRates.standardDeductionSingle
    }

    // Each cell in taxRates has two fields, limit and rate.
    for (const bracket of taxRates.taxBrackets) {
        limit = bracket.max
        rate = bracket.rate

        if (income > limit) {
            tax += (limit - previous_limit) * rate
            previous_limit = limit
        }
        else {
            tax += (income - previous_limit) * rate
            break
        }
    }

    // Currently, we don't have the tax rates for states.
    /*
    previous_limit = 0

    for (let i = 0; i < taxRates.stateTaxBrackets.length; i++) {
        limit = taxRates.stateTaxBrackets[i].max
        rate = taxRates.stateTaxBrackets[i].rate

        if (income > limit) {
            tax += (limit - previous_limit) * rate
            previous_limit = limit
        }
        else {
            tax += (income - previous_limit) * rate
            break
        }
    }
    */

    // Calculate capital gains tax
    previous_limit = 0
    remaining_gains = capitalGains
    for (const bracket of taxRates.capitalGainsBrackets) {

        limit = bracket.max
        rate = bracket.rate

        if (income >= limit) {
            previous_limit = limit
            continue
        }

        let taxable_gains = min(remaining_gains, max(0, limit - max(previous_limit, income)))
        tax += taxable_gains * rate
        remaining_gains -= taxable_gains
        previous_limit = limit

        if (remaining_gains <= 0) {
            break
        }

    }

    // Adjust tax rates for inflation (for next year)
    for (let i = 0; i < taxRates.taxBrackets.length; i++) {
        taxRates.taxBrackets[i].max *= (1 + inflation)
    }
    taxRates.standardDeductionSingle *= (1 + inflation)
    taxRates.standardDeductionMarried *= (1 + inflation)

    for (let i = 0; i < taxRates.capitalGainsBrackets.length; i++) {
        taxRates.capitalGainsBrackets[i].max *= (1 + inflation)
    }

    return tax
}

function calculateExpensesND(currentYear, expenseEvents, inflation) {

    expenses = 0

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
        else if (expenseEvent.expectedAnnualChange.distType == "normal") {
            let mean = expenseEvent.expectedAnnualChange.mean
            let sigma = expenseEvent.expectedAnnualChange.sigma
            let change = normalSample(mean, sigma)
            if (expenseEvent.changeAmtOrPct == "amount") {
                expenseEvent.initialAmount += change
            }
            else {
                expenseEvent.initialAmount *= 1 + change
            }
        }
        else {
            let lower = expenseEvent.expectedAnnualChange.lower
            let upper = expenseEvent.expectedAnnualChange.upper
            let change = Math.random() * (upper - lower) + lower
            if (expenseEvent.changeAmtOrPct == "amount") {
                expenseEvent.initialAmount += change
            }
            else {
                expenseEvent.initialAmount *= 1 + change
            }
        }
    
    return expenses

    }

}
        
function payExpensesND(amount, investments, cash_investment, withdrawalStrategy) {

    //Check if there is enough cash to pay the expenses
    if (cash_investment.value > amount) {
        cash_investment.value -= amount
        return 0
    }

    amount -= cash_investment.value
    cash_investment.value = 0

    capitalGains = 0

    for (const assetName of withdrawalStrategy) {
        let investment = investments.find(i => i.investmentType.name == assetName)
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
    
function payExpensesD(currentYear, expenseEvents, cash_investment, financialGoal) {

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

    let assetAlloc = activeInvestEvent.AssetAllocation

    if (activeInvestEvent.AssetAlloc.useGlidePath) {

        let finalAssetAlloc = activeInvestEvent.assetAllocation2
        let progress = currentYear - activeInvestEvent.startYear / activeInvestEvent.duration.value

        for (const [asset, alloc] of assetAlloc) {

            let targetAlloc = alloc + ((finalAssetAlloc[asset] - alloc) * progress)

            let investment = investments.find(i => i.investmentType.name == asset)
            
            investment.value += excess_cash * targetAlloc
            investment.costBasis += excess_cash * targetAlloc
            excess_cash -= excess_cash * targetAlloc

        }
    }
    // If there is no glide path, just invest according to the asset allocation
    else {
        for(const [asset, alloc] of assetAlloc) {
            let investment = investments.find(i => i.name == asset)

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

function adjustInflation(incomeEvents, expenseEvents, simTaxRates, inflation) {
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

    for (let i = 0; i < simTaxRates.taxBrackets.length; i++) {
        simTaxRates.taxBrackets[i].max *= (1 + inflation)
    }

    simTaxRates.standardDeductionSingle *= (1 + inflation)
    simTaxRates.standardDeductionMarried *= (1 + inflation)

    for (let i = 0; i < simTaxRates.capitalGainsBrackets.length; i++) {
        simTaxRates.capitalGainsBrackets[i].max *= (1 + inflation)
    }

    simTaxRates.standardDeductionHeadOfHousehold *= (1 + inflation)
    simTaxRates.standardDeductionMarried *= (1 + inflation)
    simTaxRates.standardDeductionSingle *= (1 + inflation)
}


/* Test Code */
import importScenario from './importer.js'
import TaxModel from '../models/taxModel.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({path: '../.env'})
import fs from 'fs'
import { exit } from 'process'

const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL).then(() => {
    console.log("Connected to MongoDB")
})

const taxRates = await TaxModel.findOne({})
console.log("Tax rates:", taxRates)

const filePath = './scenario.yaml'
try {
    const data = fs.readFileSync(filePath, 'utf8')
    let scenario = importScenario(data)

    let results = financialSim(scenario, taxRates)

    console.log(results)
    exit(0)
}
catch (error) {
    console.error("Error:", error)
}
