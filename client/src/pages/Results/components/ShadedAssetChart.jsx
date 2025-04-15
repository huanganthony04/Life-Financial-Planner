import { useState, useEffect } from 'react'
import { median, quantile } from 'simple-statistics'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

/**
 * Create a line chart showing the average value of the selection over time, with shaded regions depicting ranges from the average.
 * @param {{result: {scenarioId: String, financialGoal: number, startYear: Number, simulationResults: {results: {investments, incomes, expenses}[]}[]}}} props
 */
const ShadedAssetChart = ({result, selection}) => {

    const [labels, setLabels] = useState([])
    const [datasets, setDatasets] = useState([])

    const createInvestmentData = (result, selection) => {

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
                Object.values(sim.results[year][selection]).forEach((value) => {
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
            label: selection,
            data: data,
            backgroundColor: '#3FD872',
            borderColor: '#3CBE67',
            tension: 0.2,
            tenQuantileShadeRange: tenQuantileShadeRange,
            twentyQuantileShadeRange: twentyQuantileShadeRange,
            thirtyQuantileShadeRange: thirtyQuantileShadeRange,
            fortyQuantileShadeRange: fortyQuantileShadeRange
        }

        return { labels, dataset }
    }

    useEffect(() => {
        
        if (result) {
            if (selection === 'Investments') {
                const data = createInvestmentData(result, 'investments')
                setLabels(data.labels)
                setDatasets([data.dataset])
            }
            else if (selection === 'Incomes') {
                const data = createInvestmentData(result, 'incomes')
                setLabels(data.labels)
                setDatasets([data.dataset])
            }
            else if (selection === 'Expenses') {
                const data = createInvestmentData(result, 'expenses')
                setLabels(data.labels)
                setDatasets([data.dataset])
            }
        }

    }, [selection])

    /**
     * Used in shadingArea plugin to shade in the percentile ranges of the given value
     */
    const drawShadedArea = (ctx, chart, x, y, min, max, tickHeight, shadeRange, alpha = 0.2) => {
        ctx.save()
        const numPoints = chart.getDatasetMeta(0).data.length
        ctx.beginPath()

        ctx.strokeStyle = `rgba(155, 155, 155, ${alpha})`
        ctx.fillStyle = `rgba(155, 155, 155, ${alpha})`

        ctx.moveTo(
            chart.getDatasetMeta(0).data[0].x, 
            Math.min(y.bottom - tickHeight * (shadeRange[0].min), y.bottom)
        )
        for(let i = 1; i < numPoints; i++) {
            ctx.lineTo(
                chart.getDatasetMeta(0).data[i].x, 
                // Avoid going below the bottom of the chart
                Math.min(y.bottom - tickHeight * (shadeRange[i].min), y.bottom)
            )
        }
        for(let i = numPoints - 1; i >= 0; i--) {
            ctx.lineTo(
                chart.getDatasetMeta(0).data[i].x, 
                // Avoid going above the top of the chart
                Math.max(y.bottom - tickHeight * (shadeRange[i].max), y.top)
            )
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
    }
    /**
     * Plugin to shade percentile ranges of the given value
     */
    const shadingArea = {
        id: 'shadingArea',
        beforeDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: {x, y} } = chart

            console.log(chart)

            const tickHeight = y.height / y.max

            drawShadedArea(ctx, chart, x, y, left, right, tickHeight, chart.data.datasets[0].tenQuantileShadeRange, 0.2)
            drawShadedArea(ctx, chart, x, y, left, right, tickHeight, chart.data.datasets[0].twentyQuantileShadeRange, 0.4)
            drawShadedArea(ctx, chart, x, y, left, right, tickHeight, chart.data.datasets[0].thirtyQuantileShadeRange, 0.6)
            drawShadedArea(ctx, chart, x, y, left, right, tickHeight, chart.data.datasets[0].fortyQuantileShadeRange, 0.8)
        }
    }

    const addPercentilesToLegend = {
        id: 'addPercentilesToLegend',

        // Disable hiding 'value' as that would break the chart
        beforeInit(chart) {
            chart.options.plugins.legend.onClick = (e) => {}
        }
    }

    if (labels.length === 0 || datasets.length === 0) {
        return null
    }

    else {
        console.log(datasets)
        return (
            <Line
            datasetIdKey={result? result._id : null}
            data={{
            labels: labels,
            datasets: datasets,
            }}
            options={{
                animation: false,
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
                        grace: '5%',
                        min: 0,
                        startAtZero: true,
                    }
                }
            }}
            plugins={
                [shadingArea, addPercentilesToLegend]
            }
        />
        )
    }
}

export default ShadedAssetChart