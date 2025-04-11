import { ValueDistribution, InvestmentType, Investment } from "../classes.js"
import { normalSample } from "./util.js"

/**
 * Preprocesses a scenario for financialSim, determining values for distributions, creating a cash investment if not defined, and setting undefined values for defaults.
 * @param {Scenario} scenario 
 */
export default function scenarioProcessor(Scenario) {
    if (Scenario.investments == null) {
        Scenario.investments = []
    }
    if (Scenario.incomeEvents == null) {
        Scenario.incomeEvents = []
    }
    if (Scenario.expenseEvents == null) {
        Scenario.expenseEvents = []
    }
    if (Scenario.investEvents == null) {
        Scenario.investEvents = []
    }
    if (Scenario.rebalanceEvents == null) {
        Scenario.rebalanceEvents = []
    }
    if (Scenario.expenseWithdrawalStrategy == null) {
        if (Scenario.investments.length > 0) {
            Scenario.expenseWithdrawalStrategy = Scenario.investments.map(i => i.id)
        }
        else {
            Scenario.expenseWithdrawalStrategy = []
        }
    }

    // Event preprocessing
    let allEvents = Scenario.incomeEvents
        .concat(Scenario.expenseEvents)
        .concat(Scenario.investEvents)
        .concat(Scenario.rebalanceEvents)

    // Determine the start/end year of events that have a distribution as a start year.
    for (let event of allEvents) {

        //Determine the duration of the event
        if (event.duration.distType === "fixed") continue;
        else if (event.duration.distType === "normal") {
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
    }

    for (let event of allEvents) {
        //Determine the start year of the event (if it doesn't have a startWith)
        if (!event.start.startWith) {
            if (event.start.startDistribution.distType === "fixed") continue;
            else if (event.start.startDistribution.distType === "normal") {
                let mean = event.start.startDistribution.mean
                let sigma = event.start.startDistribution.sigma
                let startYear = normalSample(mean, sigma)
                event.start.startDistribution = new ValueDistribution({ type: "fixed", value: Math.round(startYear) })
            }
            else {
                let lower = event.start.startDistribution.lower
                let upper = event.start.startDistribution.upper
                let startYear = Math.random() * (upper - lower) + lower
                event.start.startDistribution = new ValueDistribution({ type: "fixed", value: Math.round(startYear) })
            }
        }
    }

    // Replace all events with 'startWith' with the year of the event that it starts with
    for (let event of allEvents) {
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

    //Get the cash investment
    let cash_investment;

    for (const investment of Scenario.investments) {

        if (investment.id == "cash") {
            cash_investment = investment
            break
        }
    }

    //Add cash investment if no cash investment exists
    if (cash_investment == null) {
        let it = new InvestmentType({
            name: "cash",
            description: "cash",
            returnAmtOrPct: "amount",
            returnDistribution: { type: "fixed", value: 0 },
            expenseRatio: 0,
            incomeAmtOrPct: "amount",
            incomeDistribution: { type: "fixed", value: 0 },
            taxability: false
        })
        cash_investment = new Investment({
            investmentType: it,
            value: 0,
            taxStatus: "non-retirement",
            id: "cash"
        })
    }

    Scenario.investments.push(cash_investment)

    //Calculate the user's remaining years based on life expectancy and current year
    let presentYear = new Date().getFullYear()

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

    return { Scenario, cash_investment, presentYear, remainingYears }
}