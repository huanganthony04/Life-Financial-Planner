import simulation from './simulation.js';

/**
 * Runs a series of simulations given a scenario.
 * Not to be confused with simulation() from simulation.js, which runs only a single simulation.
 * @param {Object} Scenario - The scenario to simulate
 * @param {Number} num - The number of simulations to run
 * @param {Object} federalTaxRates - The federal tax rates to use for the simulation
 * @param {Object} stateTaxRates - The state tax rates to use for the simulation
 * @returns {{investments: Object, incomes: Object, expenses: Object}[][]} An array of results for each year of the simulation
 */
export default function runSimulations(Scenario, num = 10, federalTaxRates, stateTaxRates) {

    let results = []
    for (let i = 0; i < num; i++) {
        results.push({ results: simulation(Scenario, federalTaxRates, stateTaxRates)})
    }
    return results

}