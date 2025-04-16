import { ValueDistribution, InvestmentType, Investment, Scenario } from "../classes.js"
import { getValueFromDistribution } from "./util.js"

/**
 * Preprocesses a scenario for financialSim, determining values for distributions, creating a cash investment if not defined, and setting undefined values for defaults.
 * @param {Scenario} scenario 
 */
export default function scenarioProcessor(Scenario) {

    let newScenario = structuredClone(Scenario)

    if (newScenario.investments == null) {
        newScenario.investments = []
    }
    if (newScenario.incomeEvents == null) {
        newScenario.incomeEvents = []
    }
    if (newScenario.expenseEvents == null) {
        newScenario.expenseEvents = []
    }
    if (newScenario.investEvents == null) {
        newScenario.investEvents = []
    }
    if (newScenario.rebalanceEvents == null) {
        newScenario.rebalanceEvents = []
    }
    if (newScenario.expenseWithdrawalStrategy == null) {
        if (newScenario.investments.length > 0) {
            newScenario.expenseWithdrawalStrategy = newScenario.investments.map(i => i.id)
        }
        else {
            newScenario.expenseWithdrawalStrategy = []
        }
    }

    // Event preprocessing
    let allEvents = newScenario.incomeEvents
        .concat(newScenario.expenseEvents)
        .concat(newScenario.investEvents)
        .concat(newScenario.rebalanceEvents)

    // Determine the start/end year of events that have a distribution as a start year.
    for (let event of allEvents) {

        //Determine the duration of the event
        if (event.duration.distType === "fixed") continue;
        else {
            let duration = getValueFromDistribution(event.duration)
            event.duration = new ValueDistribution({ type: "fixed", value: duration })
        }
    }

    for (let event of allEvents) {
        //Determine the start year of the event (if it doesn't have a startWith)
        if (!event.start.startWith) {
            if (event.start.startDistribution.distType === "fixed") continue;
            else {
                let startYear = getValueFromDistribution(event.start.startDistribution)
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
        let startYear = getValueFromDistribution(startDist)

        //Set the start year for all events in the stack
        for (let event of eventStack) {
            event.start.startDistribution = new ValueDistribution({ type: "fixed", value: startYear })
            event.start.startWith = undefined
        }
    }

    //Get the cash investment
    let cash_investment;

    for (const investment of newScenario.investments) {

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

        newScenario.investments.push(cash_investment)
    }

    //Calculate the user and the spouse's remaining years based on life expectancy and current year
    let presentYear = new Date().getFullYear()

    //Get the user's estimated years left
    let userLifeExpectancy = getValueFromDistribution(newScenario.lifeExpectancy[0])
    let birthYear = newScenario.birthYears[0]
    let userRemainingYears = birthYear + userLifeExpectancy - presentYear

    let spouseRemainingYears = null
    if (newScenario.maritalStatus) {
        //Get the spouse's estimated years left
        let spouseLifeExpectancy = getValueFromDistribution(newScenario.lifeExpectancy[1])
        let spouseBirthYear = newScenario.birthYears[1]
        spouseRemainingYears = spouseBirthYear + spouseLifeExpectancy - presentYear
    }

    return { processedScenario: newScenario, cash_investment, presentYear, userRemainingYears, spouseRemainingYears }
}