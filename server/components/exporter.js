import { Document } from 'yaml';

/**
 * Formats a distribution object for export, renaming distType to type,
 * and assigning mu, sigma, value, mean, stdev, lower, and upper as appropriate.
 * @param {Object} dist 
 */
function formatDistribution(dist) {

    if (dist.distType === 'GBM') {
        return {
            type: dist.distType,
            mu: dist.mean,
            sigma: dist.sigma
        }
    }
    else {
        return {
            type: dist.distType,
            value: dist.value,
            mean: dist.mean,
            stdev: dist.sigma,
            lower: dist.lower,
            upper: dist.upper
        }
    }

}
/**
 * Formats an imported scenario for export.
 * All events are combined into a single array, fields are renamed appropriately, and the structure is simplified.
 * @param {Object} scenario - The scenario object to format for export
 * @returns {Object} - The formatted scenario object ready for export
 */
function formatScenarioForExport(scenario) {

    let formattedScenario = {
        name: scenario.name,
        maritalStatus: (scenario.maritalStatus? 'couple' : 'individual'),
        birthYears: scenario.birthYears,
        lifeExpectancy: scenario.lifeExpectancy.map((dist) => formatDistribution(dist)),
        inflationAssumption: formatDistribution(scenario.inflationAssumption),
        afterTaxContributionLimit: scenario.afterTaxContributionLimit,
        spendingStrategy: scenario.spendingStrategy,
        expenseWithdrawalStrategy: scenario.expenseWithdrawalStrategy,
        financialGoal: scenario.financialGoal,
        residenceState: scenario.residenceState,
    }

    // Separate investment Types from investments
    let investmentTypeSet = new Set()
    let investmentTypes = []
    scenario.investments.forEach((investment) => {
        if (!investmentTypeSet.has(investment.investmentType.name)) {
            investmentTypeSet.add(investment.investmentType.name)
            investmentTypes.push({
                ...investment.investmentType,
                returnDistribution: formatDistribution(investment.investmentType.returnDistribution),
                incomeDistribution: formatDistribution(investment.investmentType.incomeDistribution)
            })
        }
    })
    formattedScenario.investmentTypes = investmentTypes

    formattedScenario.investments = scenario.investments.map((investment) => {
        return {
            investmentType: investment.investmentType.name,
            value: investment.value,
            taxStatus: investment.taxStatus,
            id: investment.id
        }
    })

    //Combine all events into one array
    let eventSeries = []
    for(let event of scenario.incomeEvents) {
        eventSeries.push({
            ...event,
            type: 'income',
        })
    }

    for(let event of scenario.expenseEvents) {
        eventSeries.push({
            ...event,
            type: 'expense'
        })
    }
    for(let event of scenario.investEvents) {
        eventSeries.push({
            ...event,
            type: 'invest'
        })
    }
    for(let event of scenario.rebalanceEvents) {
        eventSeries.push({
            ...event,
            type: 'rebalance'
        })
    }

    for(let formattedEvent of eventSeries) {
        if (formattedEvent.start.startDistribution) {
            formattedEvent.start = formatDistribution(formattedEvent.start.startDistribution)
        }
        else {
            formattedEvent.start = {
                type: 'startWith',
                eventSeries: formattedEvent.start.startWith
            }
        }
        formattedEvent.duration = formatDistribution(formattedEvent.duration)
        if (formattedEvent.changeDistribution) {
            formattedEvent.changeDistribution = formatDistribution(formattedEvent.changeDistribution)
        }
    }
    formattedScenario.eventSeries = eventSeries

    return formattedScenario;
}

/**
 * Exports a scenario object to a YAML file.
 * Provide only a vanilla object representation of scenario.
 * Accepts objects retrieved from Mongoose/MongoDB.
 * @param {Object} scenario 
 */
function exportScenario(scenario) {

    const formattedScenario = formatScenarioForExport(scenario);
    const doc = new Document(formattedScenario);
    return doc.toString();

}
export default exportScenario