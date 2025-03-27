import './ScenarioListItem.css'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL


const ScenarioListItem = ({key, name, scenario, onClose, selectScenario}) => {


    return (
        <div key={key} className="scenario-modal-list-item">
            <h4 className="scenario-title">{name}</h4>
            <button className="scenario-modal-button" onClick={() => {selectScenario(scenario); onClose()}}>
                Select
            </button>
        </div>
    )
}

export default ScenarioListItem