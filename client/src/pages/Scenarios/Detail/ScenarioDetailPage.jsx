// scenarioDetailPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScenarioEditModal from './ScenarioEditModal';
import InvestmentWizard from './InvestmentWizard';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to render a valueDistribution object.
const renderValueDistribution = (dist) => {
  if (!dist) return 'N/A';
  return (
    <div style={{ marginLeft: '1rem' }}>
      <div><strong>Distribution Type:</strong> {dist.distType}</div>
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
}

const ScenarioDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioId = searchParams.get('id');

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInvestmentWizardOpen, setInvestmentWizardOpen] = useState(false);

  // Always fetch the full scenario data from the backend.
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
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [scenarioId]);

  // Update the scenario using the POST save endpoint.
  const updateScenario = async (updatedScenario) => {
    try {
      // Build a complete payload by merging the scenario ID with the updated full scenario.
      const payload = {
        scenarioId: scenario._id,
        ...updatedScenario
      };
      const response = await axios.post(
        `${BACKEND_URL}/api/scenario/save/`,
        payload,
        { withCredentials: true }
      );
      if (response.data.success) {
        if (response.data.scenario) {
          setScenario(response.data.scenario);
          return response.data.scenario;
        } else {
          setScenario({ ...scenario, ...updatedScenario });
          return { ...scenario, ...updatedScenario };
        }
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Handler for new investment submission from the InvestmentWizard.
  const handleInvestmentSubmit = async (newInvestment) => {
    console.log("Adding investment:", newInvestment);
    const updatedInvestments = scenario.investments
        ? [...scenario.investments, newInvestment]
        : [newInvestment];

    const updatedScenario = { ...scenario, investments: updatedInvestments };
    
    // 1) Save to the DB
    const saved = await updateScenario(updatedScenario);

    if (saved) {
        // 2) Now close the wizard
        setInvestmentWizardOpen(false);
    } else {
        // optionally show an error toast here
        console.error("Failed to save new investment");
    }
  };

  if (loading) return <div>Loading scenario...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!scenario) return <div>No scenario data available</div>;

  // Determine if the scenario is for a married person.
  const isMarried = scenario.maritalStatus;
  const yourBirthYear = scenario.birthYears ? scenario.birthYears[0] : 'N/A';
  const spouseBirthYear = isMarried && scenario.birthYears && scenario.birthYears[1] ? scenario.birthYears[1] : 'N/A';

  // Define a common button style
  const buttonStyle = {
    backgroundColor: 'rgb(175, 244, 198)',
    padding: '8px 16px',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px'
  };

  return (
    <div className="scenario-detail-page" style={{ padding: '20px' }}>
      <h1>Scenario Detail</h1>

      {/* Button to open the edit modal */}
      <button 
        onClick={() => setIsEditModalOpen(true)}
        style={buttonStyle}
      >
        Edit Scenario
      </button>

      {/* General Information */}
      <section style={{ marginBottom: '20px' }}>
        <h2>General Information</h2>
        <div><strong>Name:</strong> {scenario.name}</div>
        <div><strong>Marital Status:</strong> {isMarried ? 'Married' : 'Single'}</div>
        <div><strong>Your Birth Year:</strong> {yourBirthYear}</div>
        {isMarried && <div><strong>Spouse Birth Year:</strong> {spouseBirthYear}</div>}
      </section>

      {/* Life Expectancy */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Life Expectancy</h2>
        {isMarried ? (
          <>
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>Your Life Expectancy</h3>
              {scenario.lifeExpectancy && scenario.lifeExpectancy[0]
                ? renderValueDistribution(scenario.lifeExpectancy[0])
                : 'N/A'}
            </div>
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>Spouse Life Expectancy</h3>
              {scenario.lifeExpectancy && scenario.lifeExpectancy[1]
                ? renderValueDistribution(scenario.lifeExpectancy[1])
                : 'N/A'}
            </div>
          </>
        ) : (
          <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {scenario.lifeExpectancy && scenario.lifeExpectancy[0]
              ? renderValueDistribution(scenario.lifeExpectancy[0])
              : 'N/A'}
          </div>
        )}
      </section>

      {/* Investments */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Investments</h2>
        {Array.isArray(scenario.investments) && scenario.investments.length > 0 ? (
          scenario.investments.map((inv, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div>
                <strong>Investment:</strong> {inv.investmentType?.name || inv.name} ({inv.taxStatus})
              </div>
              <div>
                <strong>Description:</strong> {inv.investmentType ? inv.investmentType.description : inv.description}
              </div>
              <div><strong>Value:</strong> {inv.value}</div>
              <div><strong>Expense Ratio:</strong> {inv.investmentType?.expenseRatio}</div>
              <div>
                <strong>Return Distribution:</strong>{' '}
                {inv.investmentType?.returnDistribution && renderValueDistribution(inv.investmentType.returnDistribution)}
              </div>
              <div>
                <strong>Income Distribution:</strong>{' '}
                {inv.investmentType?.incomeDistribution && renderValueDistribution(inv.investmentType.incomeDistribution)}
              </div>
            </div>
          ))
        ) : (
          <div>N/A</div>
        )}
        {/* Button to open the Investment Wizard */}
        <button 
          onClick={() => setInvestmentWizardOpen(true)}
          style={{ ...buttonStyle, marginTop: '10px', marginBottom: '10px' }}
        >
          Add Investment
        </button>
      </section>

      {/* Add Events Button */}
      <button 
        onClick={() => navigate(`/scenario/edit?id=${scenarioId}`)}
        style={buttonStyle}
      >
         Add Events
      </button>

      {/* Income Events */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Income Events</h2>
        {Array.isArray(scenario.incomeEvents) && scenario.incomeEvents.length > 0 ? (
          scenario.incomeEvents.map((income, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div><strong>Name:</strong> {income.name}</div>
              <div><strong>Description:</strong> {income.description}</div>
              <div>
                <strong>Start:</strong>{' '}
                {income.start?.startDistribution ? renderValueDistribution(income.start.startDistribution) : 'N/A'}
              </div>
              <div>
                <strong>Duration:</strong>{' '}
                {income.duration ? renderValueDistribution(income.duration) : 'N/A'}
              </div>
              <div><strong>Initial Amount:</strong> {income.initialAmount}</div>
              <div><strong>Change (Amt or %):</strong> {income.changeAmtOrPct}</div>
              <div>
                <strong>Change Distribution:</strong>{' '}
                {income.changeDistribution ? renderValueDistribution(income.changeDistribution) : 'N/A'}
              </div>
              <div><strong>Inflation Adjusted:</strong> {income.inflationAdjusted ? 'Yes' : 'No'}</div>
              <div><strong>User Fraction:</strong> {income.userFraction}</div>
              <div><strong>Social Security:</strong> {income.socialSecurity ? 'Yes' : 'No'}</div>
            </div>
          ))
        ) : (
          <div>N/A</div>
        )}
      </section>

      {/* Expense Events */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Expense Events</h2>
        {Array.isArray(scenario.expenseEvents) && scenario.expenseEvents.length > 0 ? (
          scenario.expenseEvents.map((expense, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div><strong>Name:</strong> {expense.name}</div>
              <div><strong>Description:</strong> {expense.description}</div>
              <div>
                <strong>Start:</strong>{' '}
                {expense.start?.startDistribution ? renderValueDistribution(expense.start.startDistribution) : 'N/A'}
              </div>
              <div>
                <strong>Duration:</strong>{' '}
                {expense.duration ? renderValueDistribution(expense.duration) : 'N/A'}
              </div>
              <div><strong>Initial Amount:</strong> {expense.initialAmount}</div>
              <div><strong>Change (Amt or %):</strong> {expense.changeAmtOrPct}</div>
              <div>
                <strong>Change Distribution:</strong>{' '}
                {expense.changeDistribution ? renderValueDistribution(expense.changeDistribution) : 'N/A'}
              </div>
              <div><strong>Inflation Adjusted:</strong> {expense.inflationAdjusted ? 'Yes' : 'No'}</div>
              <div><strong>User Fraction:</strong> {expense.userFraction}</div>
              <div><strong>Discretionary:</strong> {expense.discretionary ? 'Yes' : 'No'}</div>
            </div>
          ))
        ) : (
          <div>N/A</div>
        )}
      </section>

      {/* Invest Events */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Invest Events</h2>
        {Array.isArray(scenario.investEvents) && scenario.investEvents.length > 0 ? (
          scenario.investEvents.map((invest, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div><strong>Name:</strong> {invest.name}</div>
              <div><strong>Description:</strong> {invest.description}</div>
              <div>
                <strong>Start:</strong>{' '}
                {invest.start?.startDistribution ? renderValueDistribution(invest.start.startDistribution) : 'N/A'}
              </div>
              <div>
                <strong>Duration:</strong>{' '}
                {invest.duration ? renderValueDistribution(invest.duration) : 'N/A'}
              </div>
              <div>
                <strong>Asset Allocation:</strong>
                {invest.assetAllocation ? (
                  Array.from(Object.entries(invest.assetAllocation)).map(([key, value]) => (
                    <div key={key} style={{ marginLeft: '1rem' }}>
                      {key}: {value}
                    </div>
                  ))
                ) : (
                  'N/A'
                )}
              </div>
              <div><strong>Glide Path:</strong> {invest.glidePath ? 'Yes' : 'No'}</div>
              {invest.assetAllocation2 && (
                <div>
                  <strong>Asset Allocation 2:</strong>
                  {Array.from(Object.entries(invest.assetAllocation2)).map(([key, value]) => (
                    <div key={key} style={{ marginLeft: '1rem' }}>
                      {key}: {value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div>N/A</div>
        )}
      </section>

      {/* Rebalance Events */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Rebalance Events</h2>
        {Array.isArray(scenario.rebalanceEvents) && scenario.rebalanceEvents.length > 0 ? (
          scenario.rebalanceEvents.map((rebalance, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <div><strong>Name:</strong> {rebalance.name}</div>
              <div><strong>Description:</strong> {rebalance.description}</div>
              <div>
                <strong>Start:</strong>{' '}
                {rebalance.start?.startDistribution ? renderValueDistribution(rebalance.start.startDistribution) : 'N/A'}
              </div>
              <div>
                <strong>Duration:</strong>{' '}
                {rebalance.duration ? renderValueDistribution(rebalance.duration) : 'N/A'}
              </div>
              <div>
                <strong>Asset Allocation:</strong>
                {rebalance.assetAllocation ? (
                  Array.from(Object.entries(rebalance.assetAllocation)).map(([key, value]) => (
                    <div key={key} style={{ marginLeft: '1rem' }}>
                      {key}: {value}
                    </div>
                  ))
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          ))
        ) : (
          <div>N/A</div>
        )}
      </section>

      {/* Other Settings */}
      <section style={{ marginBottom: '20px' }}>
        <h2>Other Settings</h2>
        <div>
          <strong>Inflation Assumption:</strong>{' '}
          {scenario.inflationAssumption ? renderValueDistribution(scenario.inflationAssumption) : 'N/A'}
        </div>
        <div>
          <strong>After-Tax Contribution Limit:</strong> {scenario.afterTaxContributionLimit}
        </div>
        <div>
          <strong>Spending Strategy:</strong>{' '}
          {Array.isArray(scenario.spendingStrategy) ? scenario.spendingStrategy.join(', ') : 'N/A'}
        </div>
        <div>
          <strong>Expense Withdrawal Strategy:</strong>{' '}
          {Array.isArray(scenario.expenseWithdrawalStrategy)
            ? scenario.expenseWithdrawalStrategy.join(', ')
            : 'N/A'}
        </div>
        <div>
          <strong>Financial Goal:</strong> {scenario.financialGoal}
        </div>
        <div>
          <strong>Residence State:</strong> {scenario.residenceState}
        </div>
      </section>

      <button
        style={buttonStyle}
        onClick={() => navigate('/scenario')}
      >
        Back to Scenarios
      </button>

      {/* Edit Modal */}
      <ScenarioEditModal 
         open={isEditModalOpen} 
         onClose={() => setIsEditModalOpen(false)} 
         scenario={scenario} 
         updateScenario={updateScenario}
      />
    
      {/* Investment Wizard Modal */}
      {isInvestmentWizardOpen && (
        <InvestmentWizard 
          open={isInvestmentWizardOpen} 
          onClose={() => setInvestmentWizardOpen(false)} 
          onSubmit={handleInvestmentSubmit}
        />
      )}
    </div>
  );
}

export default ScenarioDetailPage;
