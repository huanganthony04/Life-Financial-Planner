import { useState, useEffect } from 'react'
import { median, quantile } from 'simple-statistics'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

/**
 * Create a line chart showing the average value of the selection over time, with shaded regions depicting ranges from the average.
 * @param {{result: {scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {results: {investments, incomes, expenses}[]}[]}}} props
 */
const ShadedAssetChart = ({result, selection = 'investments'}) => {

    const [labels, setLabels] = useState([])
    const [datasets, setDatasets] = useState([])
    const [selectedAsset, setSelectedAsset] = useState(selection)

    const createInvestmentData = (result) => {

        let startYear = result.startYear
        let numYears = result.simulationResults[0].results.length

        let labels = []
        for(let i = 0; i < numYears; i++) {
            labels.push(startYear + i)
        }

        let data = []
        // Stores the min-max values for shading for the 10%-90%, 20%-80%, 30%-70%, and 40%-60% ranges
        let tenQuantileShadeRange = []
        let twentyQuantileShadeRange = []
        let thirtyQuantileShadeRange = []
        let fortyQuantileShadeRange = []

        for (let year = 0; year < numYears; year++) {
            let values = result.simulationResults.map((sim) => {
                let sum = 0
                Object.values(sim.results[year].investments).forEach((value) => {
                    sum += value
                })
                return sum
            })
            data.push(median(values))
            tenQuantileShadeRange.push({min: quantile(values, 0.1), max: quantile(values, 0.9)})
            twentyQuantileShadeRange.push({min: quantile(values, 0.2), max: quantile(values, 0.8)})
            thirtyQuantileShadeRange.push({min: quantile(values, 0.3), max: quantile(values, 0.7)})
            fortyQuantileShadeRange.push({min: quantile(values, 0.4), max: quantile(values, 0.6)})
        }
        let dataset = {
            label: 'Value',
            data: data,
            backgroundColor: '#3FD872',
            borderColor: '#3CBE67',
            tension: 0.2,
            tenQuantileShadeRange: tenQuantileShadeRange,
            twentyQuantileShadeRange: twentyQuantileShadeRange,
            thirtyQuantileShadeRange: thirtyQuantileShadeRange,
            fortyQuantileShadeRange: fortyQuantileShadeRange
        }

        datasets.push(dataset)

        return { labels, datasets }
    }

    useEffect(() => {
        
        if (result) {
            if (selectedAsset === 'investments') {
                const data = createInvestmentData(result)
                setLabels(data.labels)
                setDatasets(data.datasets)
            }
            else if (selectedAsset === 'incomes') {

            }
            else if (selectedAsset === 'expenses') {

            }
        }

    }, [result, selectedAsset])
    return (
        <Line
        datasetIdKey={result? result._id : null}
        data={{
          labels: labels,
          datasets: datasets,
        }}
        options={{
            responsive: true,
            maintainAspectRatio: true,
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            scales: {
                y: {
                    startAtZero: true
                }
            }
        }}
      />
    )
}

export default ShadedAssetChart