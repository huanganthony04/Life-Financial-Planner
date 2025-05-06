import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import SuccessChart from './SuccessChart'
import ShadedAssetChart from './ShadedAssetChart'
import AssetChart from './AssetChart'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const POLL_INTERVAL = 1000;

const ResultBody = ({scenario}) => {

    /**
    * @type {[{scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {String, Number}[][]}, React.Dispatch<React.SetStateAction<string|null>>]}
     */
    const [results, setResults] = useState(null)

    // For the run simulation button
    const [numberOfSimulations, setNumberOfSimulations] = useState(10)

    // For setting the option for viewing a result's value in the shaded Asset Value By Year char
    const [selectedOption, setSelectedOption] = useState('Investments')

    const handleChartOptionChange = (event) => {
    setSelectedOption(event.target.value)
    }

    const handleNumSimulationsChange = (event) => {
    setNumberOfSimulations(event.target.value)
    }

    const getResults = useCallback(async (scenarioId) => {
        const { data } = await axios.get(`${BACKEND_URL}/api/results?id=${scenarioId}`, {withCredentials: true})
        if (data) {
            setResults(data.results)
        }
    }, [])

    const runSimulation = useCallback(async (scenarioId, num = 10) => {
        const { data } = await axios.post(`${BACKEND_URL}/api/scenario/run`, {scenarioId: scenarioId, num: num}, {withCredentials: true})
        console.log(data)
        if (data) {
            setResults(data.results)
        }
    }, [])

    useEffect(() => {
        if (scenario) {
            getResults(scenario._id)
        }
    }, [scenario])

    useEffect(() => {
        if (!scenario || results?.status !== "Processing") return
        const timer = setTimeout(() => getResults(scenario._id), POLL_INTERVAL)

        return () => clearTimeout(timer)
    }, [results?.status, scenario?._id, getResults])

    const noScenario = () => {
        return (
            <div id="no-results-container">
                <h3>Select a scenario from above to see its results!</h3>
            </div>
        )
    }
    
    const noResults = () => {
        return (
            <div id="no-results-container">
                <h3>No results were found for this scenario.</h3>
                <h3>Click the button below to run a new simulation!</h3>
                <div id="run-simulation-container">
                    <h4>Number of Simulations:</h4>
                    <input id="num-simulations-input" type="text" onChange={(e) => handleNumSimulationsChange(e)} value={numberOfSimulations}/>
                    <button className="green-button" onClick={() => runSimulation(scenario._id, numberOfSimulations)}>
                    Run Simulation
                    </button>
                </div>
            </div>
        )
    }

    const resultsLoading = () => {
        return (
            <div id="no-results-container">
                <h3>Results are being calculated...</h3>
            </div>
        )
    }

    if (!scenario) {
        return (
            <div id="results-body">
                {noScenario()}
            </div>
        )
    }
    else if (!results) {
        return (
            <div id="results-body">
                {noResults()}
            </div>
        )
    }
    else if (results.status === 'Processing') {
        return (
            <div id="results-body">
                {resultsLoading()}
            </div>
        )
    }
    else {
        return (
            <>
                <div id="results-body">
                    <h4>Probability of Success by Year</h4>
                    <div id="success-chart-container" className="chart-container">
                        <div className="chart-wrapper">
                        <SuccessChart result={results}/>
                        </div>
                    </div>
                    <h4>Asset Value by Year</h4>
                    <div id="shaded-asset-chart-container" className="chart-container">
                        <div className="chart-wrapper">
                        <ShadedAssetChart result={results} selection={selectedOption}/>
                        </div>
                        <fieldset className="chart-selection">
                            <input type="radio" id="investments" name="chart-select" value="Investments" checked={selectedOption === 'Investments'} onChange={handleChartOptionChange}/>
                            <label htmlFor="investments">Investments</label>

                            <input type="radio" id="income" name="chart-select" value="Incomes" checked={selectedOption === 'Incomes'} onChange={handleChartOptionChange}/>
                            <label htmlFor="income">Income</label>

                            <input type="radio" id="expenses" name="chart-select" value="Expenses" checked={selectedOption === 'Expenses'} onChange={handleChartOptionChange}/>
                            <label htmlFor="expenses">Expenses</label>
                        </fieldset>
                    </div>
                    <h4>Median Asset Values by Year</h4>
                    <div className="chart-wrapper">
                        <AssetChart result={results}/>
                    </div>
                </div>
            </>
        )
    }
}

export default ResultBody