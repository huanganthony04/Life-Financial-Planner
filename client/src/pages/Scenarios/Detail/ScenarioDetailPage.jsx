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
      {dist.distType === 'fixed' &&  <div><strong>Value:</strong> {dist.value}</div>}
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
  position: 'fixed',
  top: 0, left: 0,
  width: '100vw', height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};
const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '6px',
  width: '600px',
  maxWidth: '95vw',
  maxHeight: '85vh',
  overflowY: 'auto'
};
const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  fontSize: '1rem',
  margin: '0 4px'
};

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
const ScenarioDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioId = searchParams.get('id');

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Modals & selection state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isInvestmentWizardOpen, setIsInvestmentWizardOpen] = useState(false);
  const [isInvestEditOpen, setIsInvestEditOpen]             = useState(false);
  const [selectedInvestIdx, setSelectedInvestIdx]           = useState(null);

  const [isIncomeEditOpen, setIsIncomeEditOpen]         = useState(false);
  const [selectedIncomeIdx, setSelectedIncomeIdx]       = useState(null);

  const [isExpenseEditOpen, setIsExpenseEditOpen]       = useState(false);
  const [selectedExpenseIdx, setSelectedExpenseIdx]     = useState(null);

  const [isInvestEventEditOpen, setIsInvestEventEditOpen]     = useState(false);
  const [selectedInvestEventIdx, setSelectedInvestEventIdx]   = useState(null);

  const [isRebalanceEditOpen, setIsRebalanceEditOpen]     = useState(false);
  const [selectedRebalanceIdx, setSelectedRebalanceIdx]   = useState(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/scenario2/?id=${scenarioId}`, { withCredentials: true })
      .then((response) => {
        if (response.data.scenario) {
          setScenario(response.data.scenario);
        } else {
          throw new Error('No scenario found.');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [scenarioId]);

  const updateScenario = async updates => {
    const payload = { scenarioId: scenario._id, ...updates };
    const res     = await axios.post(`${BACKEND_URL}/api/scenario/save/`, payload, { withCredentials: true });
    if (res.data.success) {
      const sc = res.data.scenario || { ...scenario, ...updates };
      setScenario(sc);
      return sc;
    }
  };

  // Handlers
  const handleInvestmentSubmit = async newInv => {
    const invs = scenario.investments ? [...scenario.investments, newInv] : [newInv];
    console.log(newInv)
    let ews = scenario.expenseWithdrawalStrategy;
    if (newInv.name.toLowerCase() !== 'cash') {
      ews = [ ...ews, newInv.investmentType.name + " " + newInv.taxStatus ]
    }
    await updateScenario({ investments: invs, expenseWithdrawalStrategy: ews });
    setIsInvestmentWizardOpen(false);
  };
  const handleInvestUpdate = async inv => {
    const invs = [...scenario.investments];
    invs[selectedInvestIdx] = inv;
    await updateScenario({ investments: invs });
    setIsInvestEditOpen(false);
    setSelectedInvestIdx(null);
  };
  const handleIncomeUpdate = async inc => {
    const incs = [...scenario.incomeEvents];
    incs[selectedIncomeIdx] = inc;
    await updateScenario({ incomeEvents: incs });
    setIsIncomeEditOpen(false);
    setSelectedIncomeIdx(null);
  };
  const handleExpenseUpdate = async exp => {
    const exps = [...scenario.expenseEvents];
    exps[selectedExpenseIdx] = exp;
    await updateScenario({ expenseEvents: exps });
    setIsExpenseEditOpen(false);
    setSelectedExpenseIdx(null);
  };
  const handleInvestEventUpdate = async evt => {
    const evts = [...scenario.investEvents];
    evts[selectedInvestEventIdx] = evt;
    await updateScenario({ investEvents: evts });
    setIsInvestEventEditOpen(false);
    setSelectedInvestEventIdx(null);
  };
  const handleRebalanceUpdate = async rb => {
    const rbs = [...scenario.rebalanceEvents];
    rbs[selectedRebalanceIdx] = rb;
    await updateScenario({ rebalanceEvents: rbs });
    setIsRebalanceEditOpen(false);
    setSelectedRebalanceIdx(null);
  };

  if (loading) return <div>Loading scenario...</div>;
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
        {(!scenario.investments || scenario.investments.length === 0) ? (
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
        {(!scenario.incomeEvents || scenario.incomeEvents.length === 0) ? (
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
        {(!scenario.expenseEvents || scenario.expenseEvents.length === 0) ? (
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
        {(!scenario.investEvents || scenario.investEvents.length === 0) ? (
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
            {evt.assetAllocation2 && (
              <div>
                <strong>Asset Allocation 2:</strong>
                {Object.entries(evt.assetAllocation2).map(([k, v]) => <div key={k} style={{ marginLeft:'1rem' }}>{k}: {v}</div>)}
              </div>
            )}
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
        {(!scenario.rebalanceEvents || scenario.rebalanceEvents.length === 0) ? (
          <div>N/A</div>
        ) : scenario.rebalanceEvents.map((rb, idx) => (
          <div key={idx} style={{ border:'1px solid #ccc', padding:'10px', marginBottom:'10px' }}>
            <div><strong>Name:</strong> {rb.name}</div>
            <div><strong>Description:</strong> {rb.description}</div>
            <div><strong>Start:</strong> {rb.start?.startDistribution ? renderValueDistribution(rb.start.startDistribution) : 'N/A'}</div>
            <div><strong>Duration:</strong> {rb.duration ? renderValueDistribution(rb.duration) : 'N/A'}</div>
            <div><strong>Asset Allocation:</strong>
              {rb.assetAllocation
                ? Object.entries(rb.assetAllocation).map(([k, v]) => <div key={k} style={{ marginLeft:'1rem' }}>{k}: {v}</div>)
                : 'N/A'}
            </div>
            <button onClick={() => { setSelectedRebalanceIdx(idx); setIsRebalanceEditOpen(true); }} style={buttonStyle}>Edit</button>
            <button onClick={() => {
              if (!window.confirm('Delete this rebalance event?')) return;
              const rbs = scenario.rebalanceEvents.filter((_, i) => i !== idx);
              updateScenario({ rebalanceEvents: rbs });
            }} style={buttonStyle}>Delete</button>
          </div>
        ))}
      </section>

      {/* Other Settings */}
      <section style={{ margin: '20px 0' }}>
        <h2>Other Settings</h2>
        <div><strong>Inflation Assumption:</strong> {renderValueDistribution(scenario.inflationAssumption)}</div>
        <div><strong>After-Tax Contribution Limit:</strong> {scenario.afterTaxContributionLimit}</div>
        <div><strong>Spending Strategy:</strong> {Array.isArray(scenario.spendingStrategy) ? scenario.spendingStrategy.join(', ') : 'N/A'}</div>
        <div><strong>Expense Withdrawal Strategy:</strong> {Array.isArray(scenario.expenseWithdrawalStrategy) ? scenario.expenseWithdrawalStrategy.join(', ') : 'N/A'}</div>
        <div><strong>Financial Goal:</strong> {scenario.financialGoal}</div>
        <div><strong>Residence State:</strong> {scenario.residenceState}</div>
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
