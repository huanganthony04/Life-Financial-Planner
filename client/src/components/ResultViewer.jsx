import { useState } from 'react'

const ResultViewer = ({resultList}) => {

  const [currentIndex, setCurrentIndex] = useState(0)


  const increment = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1)
  }
  const decrement = () => {
    setCurrentIndex((prevIndex) => prevIndex - 1)
  }

  return (
    <>
      {resultList.length > 0 ? (
        <div id="result-viewer">
          <p>{JSON.stringify(resultList[currentIndex])}</p>
        </div>
      ) : (
        <div id="no-results-container">
          <h3>No results were found for this scenario.</h3>
        </div>
      )}
      <div id="result-viewer-navigation">
        <button onClick={decrement}>Prev</button>
          {currentIndex}
        <button onClick={increment}>Next</button>
      </div>
    </>
  )
}

export default ResultViewer