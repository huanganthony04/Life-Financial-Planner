import { useState, useEffect } from 'react'
import { median } from 'simple-statistics'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

/**
 * 
 * @param {{result: {scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {results: Map<String, Number>[]}[]}}} props
 */
const SuccessChart = ({result}) => {

    const [labels, setLabels] = useState([])
    const [datasets, setDatasets] = useState([])

    const createSuccessData = (result) => {

        let startYear = result.startYear
        let numYears = result.simulationResults[0].results.length

        let labels = []
        for(let i = 0; i < numYears; i++) {
            labels.push(startYear + i)
        }

        let goal = result.financialGoal

        let datapoints = []
        for (let year = 0; year < numYears; year++) {
            let netWorths = result.simulationResults.map((sim) => {
                let netWorth = 0;
                Object.values(sim.results[year]).forEach(value => {
                    netWorth += value
                })
                return netWorth;
            })
            let successRate = netWorths.filter((value) => value >= goal).length / netWorths.length
            datapoints.push(successRate)
        }
        
        let dataset = {
            label: 'Success Rate',
            data: datapoints,
            backgroundColor: '#81b4ff',
            borderColor: '#1e3a8a',
        }
        return { labels, datasets: [dataset] }
    }

    useEffect(() => {
        
        if (result) {
            const data = createSuccessData(result)
            setLabels(data.labels)
            setDatasets(data.datasets)
        }

    }, [result])
    return (
        <Line
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
                    top: 10,
                }
            },
            scales: {
                x: {
                stacked: true,
                },
                y: {
                    // Add breathing room so the data points can render fully instead of being clipped by the top of the chart
                    afterDataLimits: (scale) => {
                        scale.max = 1.01
                    },
                    ticks: {
                        format: {
                            style: 'percent'
                        }
                    },
                    min: 0,
                    max: 1,
                    startAtZero: true
                }
            }
        }}
      />
    )
}

export default SuccessChart