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
    let curYearIncome = 0
    let curYearSS = 0
    let prevYearGains = 0
    let curYearGains = 0
    let prevYearTaxes = 0
    let results = []

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
    let currentYear = new Date().getFullYear()
    let lifeExpectancy;
    if (Scenario.lifeExpectancy[0].distType == "fixed") {
        lifeExpectancy = Scenario.lifeExpectancy.value
    }
    else {
        //Create normal distribution for life expectancy
        let mean = Scenario.lifeExpectancy[0].mean
        let sigma = Scenario.lifeExpectancy[0].sigma
        lifeExpectancy = normalSample(mean, sigma)
    }
    let remainingYears = lifeExpectancy - currentYear

    // Event preprocessing
    let allEvents = Scenario.incomeEvents
        .concat(Scenario.expenseEvents)
        .concat(Scenario.investEvents)
        .concat(Scenario.rebalanceEvents)

    console.dir(allEvents, {depth: null})

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

    for (i = 0; i < remainingYears; i++) {

        if (Scenario.inflationAssumption.type === "fixed") {
            inflation_rate = Scenario.inflationAssumption.value
        }
        else {
            let mean = Scenario.inflationAssumption.mean
            let sigma = Scenario.inflationAssumption.sigma
            inflation_rate = normalSample(mean, sigma)
        }

        // Get income from income events

        [ curYearIncome, curYearSS ] = calculateIncome(i, Scenario.incomeEvents)

        cash_investment.value += income

        // Update investments

        investmentIncome = updateInvestments(Scenario.investments)

        curYearIncome += investmentIncome

        // Pay non-discretionary expenses

        // Calculate last year's taxes
        prevYearTaxes = calculateTaxes(prevYearIncome, prevYearGains, TaxRates, inflation_rate)

        expenses = calculateExpensesND(i, Scenario.events, inflation_rate)
        curYearGains = payExpensesND(expenses + prevYearTaxes, investments, cash_investment, Scenario.expwithdrawal)

        // Pay discretionary expenses

        payExpensesD(i, Scenario.events, cash_investment, Scenario.goal)

        // Run investment event
        runInvestEvent(i, Scenario.events, cash_investment, Scenario.investments)

        // Run rebalance event
        curYearGains += runRebalanceEvent(events, Scenario.investments)
        
        prevYearIncome = curYearIncome
        prevYearGains = curYearGains

    }
}

function calculateIncome(yearsElapsed, incomeEvents) {

    currentYear = Date().getFullYear() + yearsElapsed

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

        if (incomeEvent.expectedAnnualChange.distType == "fixed") {
            if (incomeEvent.changeAmtOrPct == "amount") {
                incomeEvent.initialAmount += incomeEvent.expectedAnnualChange.value
            }
            else {
                incomeEvent.initialAmount *= incomeEvent.expectedAnnualChange.value
            }
        }
        if (incomeEvent.inflationAdjusted) {
            incomeEvent.initialAmount *= (1 + inflation_rate)
        }

    return [ income, socialSecurity ]
    
    }
}
/*
function calculateTaxes(income, capitalGains, taxRates, inflation):

    tax = 0
    previous_limit = 0
    #Each cell in taxRates has two fields, limit and rate.
    for rates in taxRates.federalRates:

        #adjust for inflation
        rates = [ rates.limit * (1 + inflation), rates.rate ]

        if income > limit:
            tax += (limit - previous_limit) * rate
            previous_limit = limit
        else:
            tax += (income - previous_limit) * rate
            break

    previous_limit = 0
    for rates in taxRates.stateRates:

        #adjust for inflation
        rates = [ rates.limit * (1 + inflation), rates.rate ]

        if income > limit:
            tax += (limit - previous_limit) * rate
            previous_limit = limit
        else:
            tax += (income - previous_limit) * rate
            break

    #Calculate capital gains tax
    previous_limit = 0
    remaining_gains = capitalGains
    for rates in taxRates.cgRates:

        #adjust for inflation
        rates = [ rates.limit * (1 + inflation), rates.rate ]

        if income >= limit:
            previous_limit = limit
            continue
        
        taxable_gains = min(remaining_gains, max(0, limit - max(previous_limit, income)))
        tax += taxable_gains * rate
        remaining_gains -= taxable_gains
        previous_limit = limit

        if remaining_gains <= 0:
            break

    return tax
    
function updateInvestments(investments):

    #Expected drift
    mu = investments.expectedAnnualReturn
    #Volatility factor
    sigma = 0.2
    #Steps (one per year)
    steps = 1
    #Delta time (years / steps, so just one)
    dt = 1

    #normal distribution
    normal = new Normal(0, sqrt(dt))

    dividends = 0

    for investment in investments:

        if investment.useGBM is false:
            new_value = investment.value * (1 + ExpectedAnnualReturn)
        else:

            #get random sample from normal distribution
            dw = normal.sample()

            new_value = investment.value * exp((mu - 0.5 * sigma ^ 2) * dt + sigma + dW)

        average_value = (new_value + investment.value) / 2

        investment.invest(new_value - investment.value)

        #Pay expense ratio
        if investment.expenseRatio is a number:
            investment.value -= average_value * investment.expenseRatio

        #Reinvest dividends and interest
        if investment.ExpectedAnnualIncome is a percentage:
            investment.invest(average_value * (1 + ExpectedAnnualIncome))
            dividends += average_value * (1 + ExpectedAnnualIncome)
        else if investment.ExpectedAnnualIncome is a number:
            investment.value = investment.value + ExpectedAnnualIncome
            dividends += investment.value + ExpectedAnnualIncome
    
    return dividends
        


function calculateExpensesND(yearsElapsed, events, inflation):

    currentYear = Date().getFullYear() + yearsElapsed

    expenses = 0

    for event in events:

        if event.startYear > currentYear || event.duration + event.startYear < currentYear
            continue
        
        if event.type is EXPENSE and event.isDiscretionary is false:
            if event.expectedAnnualChange is percentage:
                new_amount = event.amount * event.expectedAnnualChange
            else if event.expectedAnnualChange is fixed number:
                new_amount += event.expectedAnnualChange
            if event.useInflation:
                new_amount = new_amount * (1 + inflation)
        
            if event.isMarried:
                if event.spouseAnnualChange is percentage:
                    new_spouseAmount = event.spouseAmount * (1 + event.spouseAnnualChange)
                else if event.expectedAnnualChange is fixed number:
                    new_spouseAmount = event.spouseAmount + event.spouseAnnualChange
                if event.useInflation:
                    event.new_spouseAmount = event.new_spouseAmount * (1 + inflation)
            
            average_amount = (new_amount + event.amount) / 2
            average_spouseAmount = (new_spouseAmount + event.spouseAmount) / 2

            expenses += average_amount + average_spouseAmount
    
    return expenses
        
function payExpensesND(amount, investments, cash_investment, withdrawalStrategy):

    if cash_investment.value < amount:
        amount -= cash_investment.value
        cash_investment.value = 0

        cg_tax = 0

        for withdrawInvestment in withdrawalStrategy:
        find investment in investments such that withdrawInvestment.name == investment.name
        if investment.value < amount:
            amount -= investment.value
            capital_gains += investment.sell(investment.value)
        else:
            capital_gains += investment.sell(amount)
            break
    else:
        cash_investment.value -= amount

    return capital_gains
    
function payExpensesD(yearsElapsed, events, cash_investment, goal):

    cash_available = cash_investment.value - goal
    if cash_available <= 0 return

    currentYear = Date().getFullYear() + yearsElapsed

    for event in events:

        if event.type is EXPENSE:
            if event.isDiscretionary is true:
                if event.startYear > currentYear || event.duration + event.startYear < currentYear
                    continue
                if event.amount > cash_available:
                    event.amount -= cash_available
                    break
                else:
                    cash_available -= event.amount
                    event.amount = 0
    
    cash_investment.value = goal + cash_available
            
function runInvestEvent(yearsElapsed, events, cash_investment, investments):

    #Find active invest event
    investEvent = None

    currentYear = Date().getFullYear() + yearsElapsed

    for event in events:
        if event.startYear > currentYear || event.duration + event.startYear < currentYear
            continue
        if event.type is INVEST:
            investEvent = event
            break

    if investEvent is None:
        return

    excess_cash = cash_investment - investEvent.maxCash

    if excess_cash < 0:
        return

    target = investEvent.AssetAlloc.percentage
    if investEvent.AssetAlloc.useGlidePath is true:
        timeToFinal = (investEvent.startYear + investEvent.duration) - (Date().getFullYear() + i)
        finalPercentage = investEvent.AssetAlloc.glideFinalPercentage
        for [investment, percent] in target:
            find [finalInvestment, finalPercent] from finalPercentage such that finalInvestment.name == investment.name
            percent = percent + ((finalPercent - percent) / investEvent.duration * timeToFinal)

            find i in investments such that i.name == investment.name
            i.invest(excess_cash * percent)
    else:
        for [investment, percent] in target:
            find i in investments such that i.name == investment.name
            i.invest(excess_cash * percent)

function runRebalanceEvent(rebalanceEvent, investments):

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


*/

/* Test Code */
import importScenario from './importer.js'
import fs from 'fs'

const filePath = './scenario.yaml'
try {
    const data = fs.readFileSync(filePath, 'utf8')
    let scenario = importScenario(data)

    financialSim(scenario, null)
}
catch (error) {
    console.error("Error:", error)
}
