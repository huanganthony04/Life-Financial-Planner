import { useState, useEffect } from 'react'
import { Chart as ChartJS } from 'chart.js/auto'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

const ResultViewer = ({resultId, resultList}) => {

  const [labels, setLabels] = useState([])
  const [datasets, setDatasets] = useState([])

  useEffect(() => {
    const { labels, datasets } = getInvestmentDatasets(resultList)
    setLabels(labels)
    setDatasets(datasets)
  }
  , [resultList])


  /**
   * Given the results for a simulation, return a dataset that can be used
   * by chart.js to display the results.
  **/
  const getInvestmentDatasets = (resultList) => {
    const colors = ["#bcff85", "#81b4ff", "#ff6b5f", "#ffd000", "#d531d5"]
    const labels = [], datasets = []

    for (const result of resultList) {

      labels.push(result.year)

      for (const investment of result.investments) {

        const asset = investment.investmentType
        const dataset = datasets.find((dataset) => dataset.label === investment.id)
        if (!dataset) {
          datasets.push({
            label: investment.id,
            data: [investment.value],
            backgroundColor: colors[datasets.length % colors.length],
          })
        }
        else {
          dataset.data.push(investment.value)
        }
      }
    }

    // Move the cash investment to the end of the dataset
    const cashIndex = datasets.findIndex((dataset) => dataset.label === 'Cash')
    const [ cashDataset ] = datasets.splice(cashIndex, 1)
    datasets.push(cashDataset)

    return { labels: labels, datasets: datasets }
  }

  const barChart = (labels, datasets) => {
    return (
      <Bar
        datasetIdKey={resultId}
        data={{
          labels: labels,
          datasets: datasets,
        }}
        options={{
          responsive: true,
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

  return (
    <>
      {resultList.length > 0 ? (

        // Elements to display if there are results

        <div id="bar-chart-container">
          {barChart(labels, datasets)}
        </div>
      ) : (
        <div id="no-results-container">
          <h3>No results were found for this scenario.</h3>
        </div>
      )}
    </>
  )
}

export default ResultViewer