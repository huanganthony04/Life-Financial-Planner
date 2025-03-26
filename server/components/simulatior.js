import { ValueDistribution, InvestmentType, Investment } from '../classes.js'

//Generate a normal distribution using Box-Muller transform
function normalSample(mean, sigma) {
    let u1 = Math.random()
    let u2 = Math.random()
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    return mean + sigma * z0
}

function financialSim(Scenario, TaxRates) {

    inflation_rate = 0
    prevYearIncome = 0
    curYearIncome = 0
    prevYearGains = 0
    curYearGains = 0
    prevYearTaxes = 0

    //Get the cash investment
    for (investment of Scenario.investments) {

        if (investment.investmentType.name == "Cash") {
            cash_investment = investment
            break
        }
    }

    //Add cash investment if no cash investment exists
    if (cash_investment == null) {
        vd = new ValueDistribution("fixed", 0, 0, 0, 0, 0)
        it = new InvestmentType("Cash", "Cash", "amount", vd, 0, "amount", vd, false)
        cash_investment = new Investment(it, 0, "non-retirement")
        Scenario.investments.push(cash_investment)
    }

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
}
/*

    for i = 1 to Scenario.lifeExpectancy do:

        if Scenario.inflation is defined:
            inflation_rate = Scenario.inflation
        else:
            inflation_rate = normal.sample()

        ###Get income from income events###

        curYearIncome = calculateIncome(i, Scenario.events)

        cash_investment.value += income

        ###Update Investments###
        investmentIncome = updateInvestments(Scenario.investments)

        curYearIncome += investmentIncome

        ###Pay Non-Discretionary Expenses###

        #Calculate last year's taxes
        prevYearTaxes = calculateTaxes(prevYearIncome, prevYearGains, TaxRates, inflation_rate)

        expenses = calculateExpensesND(i, Scenario.events, inflation_rate)
        curYearGains = payExpensesND(expenses + prevYearTaxes, investments, cash_investment, Scenario.expwithdrawal)

        ###Pay Discretionary Expenses###
        payExpensesD(i, Scenario.events, cash_investment, Scenario.goal)

        ###Run Invest Event###
        runInvestEvent(i, Scenario.events, cash_investment, Scenario.investments)

        ###Run Rebalance Event###
        curYearGains += runRebalanceEvent(event, Scenario.investments)
        
        prevYearIncome = curYearIncome
        prevYearGains = curYearGains

}

function calculateIncome(yearsElapsed, events):

    currentYear = Date().getFullYear() + yearsElapsed

    income = 0

    for event in events:

        if event.startYear > currentYear || event.duration + event.startYear < currentYear
            continue

        if event.type is INCOME:
            if event.expectedAnnualChange is percentage:
                event.amount = event.amount * event.expectedAnnualChange
            else if event.expectedAnnualChange is fixed number:
                event.amount += event.expectedAnnualChange
            if event.useInflation:
                event.amount = event.amount * (1 + inflation)
        
            if event.isMarried:
                if event.spouseAnnualChange is percentage:
                    event.spouseAmount = event.spouseAmount * (1 + event.spouseAnnualChange)
                else if event.expectedAnnualChange is fixed number:
                    event.spouseAmount = event.spouseAmount + event.spouseAnnualChange
                if event.useInflation:
                    event.spouseAmount = event.spouseAmount * (1 + inflation)

                income += event.amount + event.spouseAmount
            else:
                income += event.amount

    return income

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