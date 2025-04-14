import { useState, useEffect } from 'react'
import { median } from 'simple-statistics'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

/**
 * 
 * @param {{result: {scenarioId: String, startYear: Number, simulationResults: {results: Map<String, Number>[]}[]}}} props
 */
const AssetChart = ({result}) => {

    const [labels, setLabels] = useState([])
    const [datasets, setDatasets] = useState([])

    const createAssetData = (result) => {
        const colors = ["#bcff85", "#81b4ff", "#ff6b5f", "#ffd000", "#d531d5"]
        let colorIndex = 0

        let startYear = result.startYear
        let numYears = result.simulationResults[0].results.length

        let labels = []
        for(let i = 0; i < numYears; i++) {
            labels.push(startYear + i)
        }

        let assets = Object.keys(result.simulationResults[0].results[0])

        let datasets = []
        for(let asset of assets) {
            let data = []
            for (let year = 0; year < numYears; year++) {
                let values = result.simulationResults.map((sim) => {
                    return sim.results[year][asset]
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
            const data = createAssetData(result)
            setLabels(data.labels)
            setDatasets(data.datasets)
        }

    }, [result])
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