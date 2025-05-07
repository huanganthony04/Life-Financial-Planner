// ScenarioDetailPage.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import ScenarioEditModal from './ScenarioEditModal';
import InvestmentWizard from './InvestmentWizard';
import InvestmentEditModal from './InvestmentEditModal.jsx';
import EditIncomeEvent from './editIncomeEvent';
import EditExpenseEvent from './editExpenseEvent';
import EditInvestmentEvent from './editInvestmentEvent';
import EditRebalanceEvent from './editRebalanceEvent';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// --- Helpers ----------------------------------------------------------
const toNum = str => {
  const n = Number(str);
  return isNaN(n) ? null : n;
};
const buildDist = (type, val, mean, sigma, lower, upper) => {
  if (type === 'fixed')   return { distType: 'fixed',    value: toNum(val) };
  if (['normal','GBM'].includes(type)) return { distType: type, mean: toNum(mean), sigma: toNum(sigma) };
  return { distType: 'uniform', lower: toNum(lower), upper: toNum(upper) };
};
const renderValueDistribution = dist => {
  if (!dist) return 'N/A';
  return (
    <div style={{ marginLeft: '1rem' }}>
      <div><strong>Type:</strong> {dist.distType}</div>
      {dist.distType === 'fixed' && <div><strong>Value:</strong> {dist.value}</div>}
      {(dist.distType === 'normal' || dist.distType === 'GBM') && (
        <>
          <div><strong>Mean:</strong> {dist.mean}</div>
          <div><strong>Sigma:</strong> {dist.sigma}</div>
        </>
      )}
      {dist.distType === 'uniform' && (
        <>
          <div><strong>Lower:</strong> {dist.lower}</div>
          <div><strong>Upper:</strong> {dist.upper}</div>
        </>
      )}
    </div>
  );
};

// --- Shared styles ----------------------------------------------------
const overlayStyle = {
  position: 'fixed', top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};
const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '6px',
  width: '400px',
  maxWidth: '90vw'
};
const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  fontSize: '1rem',
  margin: '0 4px',
  cursor: 'pointer'
};
const itemStyle = {
  padding: '8px',
  margin: '4px 0',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '4px',
  cursor: 'grab'
};
const sectionRow = { display: 'flex', alignItems: 'flex-start', marginBottom: '12px' };
const labelCell = { width: '200px', fontWeight: 'bold' };
const controlCell = { flex: 1 };

const ScenarioDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioId = searchParams.get('id');

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Drag‐and‐drop & pop-up state
  const [withdrawalOrder, setWithdrawalOrder] = useState([]);
  const [spendingOrder, setSpendingOrder]     = useState([]);
  const [dragging, setDragging]               = useState({ list: null, idx: null });
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense]           = useState('');

  // Modals & selection
  const [isEditModalOpen, setIsEditModalOpen]               = useState(false);
  const [isInvestmentWizardOpen, setIsInvestmentWizardOpen] = useState(false);
  const [isInvestEditOpen, setIsInvestEditOpen]             = useState(false);
  const [selectedInvestIdx, setSelectedInvestIdx]           = useState(null);
  const [isIncomeEditOpen, setIsIncomeEditOpen]             = useState(false);
  const [selectedIncomeIdx, setSelectedIncomeIdx]           = useState(null);
  const [isExpenseEditOpen, setIsExpenseEditOpen]           = useState(false);
  const [selectedExpenseIdx, setSelectedExpenseIdx]         = useState(null);
  const [isInvestEventEditOpen, setIsInvestEventEditOpen]   = useState(false);
  const [selectedInvestEventIdx, setSelectedInvestEventIdx] = useState(null);
  const [isRebalanceEditOpen, setIsRebalanceEditOpen]       = useState(false);
  const [selectedRebalanceIdx, setSelectedRebalanceIdx]     = useState(null);

  useEffect(() => {

    axios.get(`${BACKEND_URL}/api/scenario/?id=${scenarioId}`, { withCredentials: true })
      .then(res => {
        if (!res.data.scenario) throw new Error('No scenario found');
        const sc = res.data.scenario;
        setScenario(sc);
        setWithdrawalOrder(
          sc.expenseWithdrawalStrategy?.length
            ? sc.expenseWithdrawalStrategy
            : sc.investments.map(i => i.name || i.investmentType?.name)
        );
        setSpendingOrder(
          sc.spendingStrategy?.length
            ? sc.spendingStrategy
            : sc.expenseEvents.filter(e => e.discretionary).map(e => e.name)
        );

      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [scenarioId]);

  const updateScenario = async updates => {
    const payload = { scenarioId: scenario._id, ...updates };
    const res = await axios.post(`${BACKEND_URL}/api/scenario/save/`, payload, { withCredentials: true });
    if (res.data.success) {
      const sc = res.data.scenario || { ...scenario, ...updates };
      setScenario(sc);
      return sc;
    }
  };

  // Modal submit handlers (stubs; reuse existing logic)
  const handleInvestmentSubmit = async newInv => { /* ... */ };
  const handleInvestUpdate      = async inv    => { /* ... */ };
  const handleIncomeUpdate      = async inc    => { /* ... */ };
  const handleExpenseUpdate     = async exp    => { /* ... */ };
  const handleInvestEventUpdate = async evt    => { /* ... */ };
  const handleRebalanceUpdate   = async rb     => { /* ... */ };

  // Drag-and-drop
  const handleDragStart = (_e, list, idx) => setDragging({ list, idx });
  const handleDragOver  = e => e.preventDefault();
  const handleDrop      = (_e, list, idx) => {
    const { list: fromList, idx: fromIdx } = dragging;
    if (fromList !== list || fromIdx == null) return;
    const arr = Array.from(list === 'withdrawal' ? withdrawalOrder : spendingOrder);
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(idx, 0, moved);
    if (list === 'withdrawal') {
      setWithdrawalOrder(arr);
      updateScenario({ expenseWithdrawalStrategy: arr });
    } else {
      setSpendingOrder(arr);
      updateScenario({ spendingStrategy: arr });
    }
    setDragging({ list: null, idx: null });

  };

  // Add discretionary expense
  const handleAddExpense = () => {
    if (newExpense && !spendingOrder.includes(newExpense)) {
      const updated = [...spendingOrder, newExpense];
      setSpendingOrder(updated);
      updateScenario({ spendingStrategy: updated });
    }
    setIsAddExpenseOpen(false);
    setNewExpense('');
  };

  if (loading) return <div>Loading scenario…</div>;
  if (error)   return <div>Error: {error}</div>;
  if (!scenario) return <div>No scenario data available</div>;

  const isMarried = scenario.maritalStatus;
  const yourBY    = scenario.birthYears?.[0] ?? 'N/A';
  const spouseBY  = isMarried && scenario.birthYears?.[1] ? scenario.birthYears[1] : 'N/A';

  return (
    <div style={{ padding: '20px' }}>
      <h1>Scenario Detail</h1>
      <button onClick={() => setIsEditModalOpen(true)}        style={buttonStyle}>Edit Scenario Details</button>
      <button onClick={() => setIsInvestmentWizardOpen(true)} style={buttonStyle}>Add New Investment</button>
      <button onClick={() => navigate(`/scenario/edit?id=${scenarioId}`)} style={buttonStyle}>Add Events</button>

      {/* General Information */}
      <section style={{ margin: '20px 0' }}>
        <h2>General Information</h2>
        <div><strong>Name:</strong> {scenario.name}</div>
        <div><strong>Marital Status:</strong> {isMarried ? 'Married' : 'Single'}</div>
        <div><strong>Your Birth Year:</strong> {yourBY}</div>
        {isMarried && <div><strong>Spouse Birth Year:</strong> {spouseBY}</div>}
      </section>

      {/* Life Expectancy */}
      <section style={{ margin: '20px 0' }}>
        <h2>Life Expectancy</h2>
        <div style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
          <h3>Your Life Expectancy</h3>
          {renderValueDistribution(scenario.lifeExpectancy?.[0])}
        </div>
        {isMarried && (
          <div style={{ border:'1px solid #ccc', padding:'10px' }}>
            <h3>Spouse Life Expectancy</h3>
            {renderValueDistribution(scenario.lifeExpectancy?.[1])}
          </div>
        )}
      </section>

      {/* Investments */}
      <section style={{ margin: '20px 0' }}>
        <h2>Investments</h2>
        {(!scenario.investments || !scenario.investments.length) ? (
          <div>N/A</div>
        ) : scenario.investments.map((inv, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {inv.investmentType?.name || inv.name}</div>
            <div><strong>Description:</strong> {inv.investmentType?.description || inv.description}</div>
            <div><strong>Tax Status:</strong> {inv.taxStatus}</div>
            <div><strong>Value:</strong> {inv.value}</div>
            <div><strong>Expense Ratio:</strong> {inv.investmentType?.expenseRatio}</div>
            <div><strong>Return Distribution:</strong> {renderValueDistribution(inv.investmentType?.returnDistribution)}</div>
            <div><strong>Return Amount or Percent:</strong> {inv.investmentType?.returnAmtOrPct}</div>
            <div><strong>Income Distribution:</strong> {renderValueDistribution(inv.investmentType?.incomeDistribution)}</div>
            <div><strong>Income Amount or Percent:</strong> {inv.investmentType?.incomeAmtOrPct}</div>
            <button onClick={() => { setSelectedInvestIdx(idx); setIsInvestEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this investment?')) return;
              const invs = scenario.investments.filter((_, i) => i !== idx);
              const ews = scenario.expenseWithdrawalStrategy.filter((id) => id.split(" ").slice(0, -1).join(" ") !== inv.investmentType.name)
              updateScenario({ investments: invs, expenseWithdrawalStrategy: ews });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Income Events */}
      <section style={{ margin: '20px 0' }}>
        <h2>Income Events</h2>
        {(!scenario.incomeEvents || !scenario.incomeEvents.length) ? (
          <div>N/A</div>
        ) : scenario.incomeEvents.map((inc, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {inc.name}</div>
            <div><strong>Description:</strong> {inc.description}</div>
            <div><strong>Start:</strong> {inc.start?.startDistribution ? renderValueDistribution(inc.start.startDistribution) : 'N/A'}</div>
            <div><strong>Duration:</strong> {inc.duration ? renderValueDistribution(inc.duration) : 'N/A'}</div>
            <div><strong>Initial Amount:</strong> {inc.initialAmount}</div>
            <div><strong>Change:</strong> {inc.changeAmtOrPct}</div>
            <div><strong>Change Distribution:</strong> {inc.changeDistribution ? renderValueDistribution(inc.changeDistribution) : 'N/A'}</div>
            <div><strong>Inflation Adjusted:</strong> {inc.inflationAdjusted ? 'Yes' : 'No'}</div>
            <div><strong>User Fraction:</strong> {inc.userFraction}</div>
            <div><strong>Social Security:</strong> {inc.socialSecurity ? 'Yes' : 'No'}</div>
            <button onClick={() => { setSelectedIncomeIdx(idx); setIsIncomeEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this income event?')) return;
              const evts = scenario.incomeEvents.filter((_, i) => i !== idx);
              updateScenario({ incomeEvents: evts });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Expense Events */}
      <section style={{ margin: '20px 0' }}>
        <h2>Expense Events</h2>
        {(!scenario.expenseEvents || !scenario.expenseEvents.length) ? (
          <div>N/A</div>
        ) : scenario.expenseEvents.map((exp, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {exp.name}</div>
            <div><strong>Description:</strong> {exp.description}</div>
            <div><strong>Start:</strong> {exp.start?.startDistribution ? renderValueDistribution(exp.start.startDistribution) : 'N/A'}</div>
            <div><strong>Duration:</strong> {exp.duration ? renderValueDistribution(exp.duration) : 'N/A'}</div>
            <div><strong>Initial Amount:</strong> {exp.initialAmount}</div>
            <div><strong>Change:</strong> {exp.changeAmtOrPct}</div>
            <div><strong>Change Distribution:</strong> {exp.changeDistribution ? renderValueDistribution(exp.changeDistribution) : 'N/A'}</div>
            <div><strong>Inflation Adjusted:</strong> {exp.inflationAdjusted ? 'Yes' : 'No'}</div>
            <div><strong>User Fraction:</strong> {exp.userFraction}</div>
            <div><strong>Discretionary:</strong> {exp.discretionary ? 'Yes' : 'No'}</div>
            <button onClick={() => { setSelectedExpenseIdx(idx); setIsExpenseEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this expense event?')) return;
              const evts = scenario.expenseEvents.filter((_, i) => i !== idx);
              updateScenario({ expenseEvents: evts });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Invest Events */}
      <section style={{ margin: '20px 0' }}>
        <h2>Invest Events</h2>
        {(!scenario.investEvents || !scenario.investEvents.length) ? (
          <div>N/A</div>
        ) : scenario.investEvents.map((evt, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {evt.name}</div>
            <div><strong>Description:</strong> {evt.description}</div>
            <div><strong>Start:</strong> {evt.start?.startDistribution ? renderValueDistribution(evt.start.startDistribution) : 'N/A'}</div>
            <div><strong>Duration:</strong> {evt.duration ? renderValueDistribution(evt.duration) : 'N/A'}</div>
            <div><strong>Asset Allocation:</strong>
              {evt.assetAllocation
                ? Object.entries(evt.assetAllocation).map(([k, v]) => <div key={k} style={{ marginLeft:'1rem' }}>{k}: {v}</div>)
                : 'N/A'}
            </div>
            <div><strong>Glide Path:</strong> {evt.glidePath ? 'Yes' : 'No'}</div>
            <button onClick={() => { setSelectedInvestEventIdx(idx); setIsInvestEventEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this invest event?')) return;
              const evts = scenario.investEvents.filter((_, i) => i !== idx);
              updateScenario({ investEvents: evts });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Rebalance Events */}
      <section style={{ margin: '20px 0' }}>
        <h2>Rebalance Events</h2>
        {(!scenario.rebalanceEvents || !scenario.rebalanceEvents.length) ? (
          <div>N/A</div>
        ) : scenario.rebalanceEvents.map((rb, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {rb.name}</div>
            <div><strong>Description:</strong> {rb.description}</div>
            <div><strong>Start:</strong> {rb.start?.startDistribution ? renderValueDistribution(rb.start.startDistribution) : 'N/A'}</div>
            <div><strong>Duration:</strong> {rb.duration ? renderValueDistribution(rb.duration) : 'N/A'}</div>
            <button onClick={() => { setSelectedRebalanceIdx(idx); setIsRebalanceEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this rebalance event?')) return;
              const rbs = scenario.rebalanceEvents.filter((_, i) => i !== idx);
              updateScenario({ rebalanceEvents: rbs });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Other Settings with drag-and-drop */}
      <section style={{ margin: '20px 0' }}>
        <h2>Other Settings</h2>

        {/* Spending Strategy */}
        <div style={sectionRow}>
          <div style={labelCell}><strong>Spending Strategy:</strong></div>
          <div style={controlCell}>
            {spendingOrder.map((name, idx) => (
              <div
                key={name}
                draggable
                onDragStart={e => handleDragStart(e, 'spending', idx)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, 'spending', idx)}
                style={itemStyle}
              >
                {name}
              </div>
            ))}
            <button onClick={() => setIsAddExpenseOpen(true)} style={{ ...buttonStyle, marginTop: '8px' }}>
              + Add Discretionary Expense
            </button>
          </div>
        </div>

        {/* Add Discretionary Expense Pop-up */}
        {isAddExpenseOpen && ReactDOM.createPortal(
          <div style={overlayStyle} onClick={() => setIsAddExpenseOpen(false)}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
              <h3>Add Discretionary Expense</h3>
              <select
                value={newExpense}
                onChange={e => setNewExpense(e.target.value)}
                style={{ width: '100%', padding: '8px', margin: '12px 0' }}
              >
                <option value="">— select expense —</option>
                {scenario.expenseEvents
                  .filter(e => e.discretionary)
                  .map(e => <option key={e.name} value={e.name}>{e.name}</option>)
                }
              </select>
              <div style={{ textAlign: 'right' }}>
                <button onClick={handleAddExpense} style={buttonStyle}>Add</button>
                <button onClick={() => setIsAddExpenseOpen(false)} style={buttonStyle}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Expense Withdrawal Strategy */}
        <div style={sectionRow}>
          <div style={labelCell}><strong>Expense Withdrawal Strategy:</strong></div>
          <div style={controlCell}>
            {withdrawalOrder.map((name, idx) => (
              <div
                key={name}
                draggable
                onDragStart={e => handleDragStart(e, 'withdrawal', idx)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, 'withdrawal', idx)}
                style={itemStyle}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Static Other Settings */}
        <div style={sectionRow}>
          <div style={labelCell}><strong>Inflation Assumption:</strong></div>
          <div style={controlCell}>{renderValueDistribution(scenario.inflationAssumption)}</div>
        </div>
        <div style={sectionRow}>
          <div style={labelCell}><strong>After-Tax Contribution Limit:</strong></div>
          <div style={controlCell}>{scenario.afterTaxContributionLimit}</div>
        </div>
        <div style={sectionRow}>
          <div style={labelCell}><strong>Financial Goal:</strong></div>
          <div style={controlCell}>{scenario.financialGoal}</div>
        </div>
        <div style={sectionRow}>
          <div style={labelCell}><strong>Residence State:</strong></div>
          <div style={controlCell}>{scenario.residenceState}</div>
        </div>
      </section>

      <button onClick={() => navigate('/scenario')} style={buttonStyle}>Back to Scenarios</button>

      {/* Modals */}
      <ScenarioEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        scenario={scenario}
        updateScenario={updateScenario}
      />
      <InvestmentWizard
        open={isInvestmentWizardOpen}
        onClose={() => setIsInvestmentWizardOpen(false)}
        onSubmit={handleInvestmentSubmit}
      />
      <InvestmentEditModal
        open={isInvestEditOpen}
        investment={scenario.investments?.[selectedInvestIdx]}
        onClose={() => setIsInvestEditOpen(false)}
        onSubmit={handleInvestUpdate}
      />
      <EditIncomeEvent
        open={isIncomeEditOpen}
        incomeEvent={scenario.incomeEvents?.[selectedIncomeIdx]}
        onClose={() => setIsIncomeEditOpen(false)}
        onSubmit={handleIncomeUpdate}
      />
      <EditExpenseEvent
        open={isExpenseEditOpen}
        expenseEvent={scenario.expenseEvents?.[selectedExpenseIdx]}
        onClose={() => setIsExpenseEditOpen(false)}
        onSubmit={handleExpenseUpdate}
      />
      <EditInvestmentEvent
        open={isInvestEventEditOpen}
        investEvent={scenario.investEvents?.[selectedInvestEventIdx]}
        onClose={() => setIsInvestEventEditOpen(false)}
        onSubmit={handleInvestEventUpdate}
      />
      <EditRebalanceEvent
        open={isRebalanceEditOpen}
        rebalanceEvent={scenario.rebalanceEvents?.[selectedRebalanceIdx]}
        onClose={() => setIsRebalanceEditOpen(false)}
        onSubmit={handleRebalanceUpdate}
      />
    </div>
  );
};

export default ScenarioDetailPage;
