import React from 'react'

const ScenarioSelector = ({setSelectScenarioOpen, scenario}) => {
  return (
    <div id="results-header">
        <div id="scenario-selection">
        <div id="selected-scenario-title">{scenario ? scenario.name : `No Scenario Selected`}</div>
        <button className="green-button" onClick={() => setSelectScenarioOpen(true)}>
            <h4>
                Select Scenario
            </h4>
        </button>
        </div>
    </div>
  )
}

export default ScenarioSelector