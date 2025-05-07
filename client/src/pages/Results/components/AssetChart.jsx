import { useState, useEffect } from 'react'
import { median } from 'simple-statistics'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

/**
 * Create a bar chart showing the values of all investments over time.
 * @param {{result: {scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {results: {investments, incomes, expenses}[]}[]}}} props
 */
const AssetChart = ({result, selection}) => {

    const [labels, setLabels] = useState([])
    const [datasets, setDatasets] = useState([])

    const createAssetData = (result, selection) => {
        
        const colors = ["#bcff85", "#81b4ff", "#ff6b5f", "#ffd000", "#d531d5"]
        let colorIndex = 0

        let startYear = result.startYear
        let numYears = result.simulationResults[0].results.length

        let labels = []
        for(let i = 0; i < numYears; i++) {
            labels.push(startYear + i)
        }

        if (result.simulationResults[0].results[0][selection] == null) {
            return { labels: labels, datasets: null }
        }

        let assets = Object.keys(result.simulationResults[0].results[0][selection])

        let datasets = []
        for(let asset of assets) {
            let data = []
            for (let year = 0; year < numYears; year++) {
                let values = result.simulationResults.map((sim) => {
                    return sim.results[year][selection][asset]
                })
                data.push(median(values))
            }
            let dataset = {
                label: asset,
                data: data,
                backgroundColor: colors[colorIndex++ % colors.length],
            }
            datasets.push(dataset)
        }

        return { labels, datasets }
    }

    useEffect(() => {

        if (result) {
            if (selection === 'Investments') {
                const data = createAssetData(result, 'investments')
                setLabels(data.labels)
                setDatasets(data.datasets)
            }
            else if (selection === 'Incomes') {
                const data = createAssetData(result, 'incomes')
                setLabels(data.labels)
                setDatasets(data.datasets)
            }
            else if (selection === 'Expenses') {
                const data = createAssetData(result, 'expenses')
                setLabels(data.labels)
                setDatasets(data.datasets)
            }
        }

    }, [result, selection])
    return (
        <Bar
        datasetIdKey={result? result._id : null}
        data={{
          labels: labels,
          datasets: datasets,
        }}
        options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            scales: {
                x: {
                stacked: true,
                },
                y: {
                stacked: true,
                startAtZero: true,
                }
            }
        }}
      />
    )
}

export default AssetChart