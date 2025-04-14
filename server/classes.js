/* This was generated from ScenarioModel.js using ChatGPT */

/**
 * @typedef {Object} ValueDistribution
 * @property {'fixed'|'normal'|'uniform'} distType - The type of distribution
 * @property {Number} value - The fixed value, if the distribution is fixed
 * @property {Number} mean - The mean, if the distribution is normal
 * @property {Number} sigma - The standard deviation, if the distribution is normal
 * @property {Number} lower - The lower part of the range, if the distribution is uniform
 * @property {Number} upper - The upper part of the range, if the distribution is uniform
 */
class ValueDistribution {
  /**
   * Accepts either a `distType` or `type` key for the distribution type.
   *
   * @param {Object} options
   * @param {'normal'|'fixed'|'GBM'|'uniform'} [options.distType] - The type of distribution.
   * @param {'normal'|'fixed'|'GBM'|'uniform'} [options.type] - Alternative key for distribution type.
   * @param {number|undefined} options.value - Only defined if distribution is fixed.
   * @param {number|undefined} options.mean - Defined if distribution is normal or GBM.
   * @param {number|undefined} options.stdev - Defined if distribution is normal or GBM.
   * @param {number|undefined} options.mu - Alternative to mean if needed.
   * @param {number|undefined} options.sigma - Alternative to stdev if needed.
   * @param {number|undefined} options.lower - Defined if distribution is uniform.
   * @param {number|undefined} options.upper - Defined if distribution is uniform.
   */
  constructor({ type, distType, value, mean, mu, stdev, sigma, lower, upper } = {}) {
    // Support both distType and type in the incoming object.
    const distributionType = distType || type;
    this.distType = (distributionType === "GBM" ? "normal" : distributionType);
    this.value = value;
    this.mean = mean ?? mu;
    this.sigma = stdev ?? sigma;
    this.lower = lower;
    this.upper = upper;
    // Add any additional custom validation if needed.
  }
}


class InvestmentType {
  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {string} options.description
   * @param {'percent'|'amount'} options.returnAmtOrPct
   * @param {Object} options.returnDistribution
   * @param {number} options.expenseRatio
   * @param {'percent'|'amount'} options.incomeAmtOrPct
   * @param {Object} options.incomeDistribution
   * @param {boolean} options.taxability
   */
  constructor({ name, description, returnAmtOrPct = 'amount', returnDistribution, expenseRatio = 0, incomeAmtOrPct = 'amount', incomeDistribution, taxability = true }) {
    this.name = name;
    this.description = description
    this.returnAmtOrPct = returnAmtOrPct
    if (returnDistribution) {
      this.returnDistribution = new ValueDistribution(returnDistribution)
    }
    this.expenseRatio = expenseRatio
    this.incomeAmtOrPct = incomeAmtOrPct
    if (incomeDistribution) {
      this.incomeDistribution = new ValueDistribution(incomeDistribution)
    }
    this.taxability = taxability
  }
}

class Investment {
  /**
   * @param {Object} options
   * @param {InvestmentType} options.investmentType
   * @param {number} options.value
   * @param {'non-retirement'|'pre-tax'|'after-tax'} options.taxStatus
   * @param {string} [options.id] - If not provided, computed from investmentType.name and taxStatus.
   */
  constructor({ investmentType, value = 0, taxStatus = 'non-retirement', id, costBasis }) {
    this.investmentType = investmentType;
    this.value = value;
    this.taxStatus = taxStatus;
    this.id = id ?? `${investmentType.name} ${taxStatus}`;
    this.costBasis = costBasis ?? value;
  }
}

class EventStart {
  /**
   * @param {Object} options
   * @param {ValueDistribution|undefined} options.startDistribution - A ValueDistribution instance.
   * @param {{ eventSeries: string }|undefined} options.startWith - An object with an eventSeries property.
   * @param {ValueDistribution} options.duration - A ValueDistribution instance.
   */
  constructor({ type, value, mean, sigma, lower, upper, eventSeries }) {
    if (type === 'startWith') {
      this.startWith = eventSeries
    }
    else {
      this.startDistribution = new ValueDistribution({ type, value, mean, sigma, lower, upper });
    }
  }
}

class IncomeEvent {
  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {EventStart} options.start
   * @param {ValueDistribution} options.duration
   * @param {number} options.initialAmount
   * @param {'amount'|'percent'} options.changeAmtOrPct
   * @param {ValueDistribution} options.changeDistribution
   * @param {boolean} options.inflationAdjusted
   * @param {number} [options.userFraction=1.0]
   * @param {boolean} options.socialSecurity
   */
  constructor({ name, start, duration, initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction = 1.0, socialSecurity }) {
    this.name = name;
    this.start = new EventStart(start);
    this.duration = new ValueDistribution(duration);
    this.initialAmount = initialAmount;
    this.changeAmtOrPct = changeAmtOrPct;
    this.changeDistribution = new ValueDistribution(changeDistribution);
    this.inflationAdjusted = inflationAdjusted;
    this.userFraction = userFraction;
    this.socialSecurity = socialSecurity;
  }
}

class ExpenseEvent {
  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {EventStart} options.start
   * @param {ValueDistribution} options.duration
   * @param {number} options.initialAmount
   * @param {'amount'|'percent'} options.changeAmtOrPct
   * @param {ValueDistribution} options.changeDistribution
   * @param {boolean} options.inflationAdjusted
   * @param {number} [options.userFraction=1.0]
   * @param {boolean} options.discretionary
   */
  constructor({ name, start, duration, initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction = 1.0, discretionary }) {
    this.name = name;
    this.start = new EventStart(start);
    this.duration = new ValueDistribution(duration);
    this.initialAmount = initialAmount;
    this.changeAmtOrPct = changeAmtOrPct;
    this.changeDistribution = new ValueDistribution(changeDistribution);
    this.inflationAdjusted = inflationAdjusted;
    this.userFraction = userFraction;
    this.discretionary = discretionary;
  }
}

class InvestEvent {
  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {EventStart} options.start
   * @param {ValueDistribution} options.duration
   * @param {Map<string, number>|Object} options.assetAllocation - A map or plain object with numeric values.
   * @param {boolean|undefined} options.glidePath
   * @param {Map<string, number>|Object|undefined} options.assetAllocation2
   */
  constructor({ name, start, duration, assetAllocation, glidePath, assetAllocation2, maxCash = 0 }) {
    this.name = name;
    this.start = new EventStart(start);
    this.duration = new ValueDistribution(duration);
    this.assetAllocation = assetAllocation;
    this.glidePath = glidePath;
    this.assetAllocation2 = assetAllocation2;
    this.maxCash = maxCash;
  }
}

class RebalanceEvent {
  /**
   * @param {Object} options
   * @param {string} options.name
   * @param {EventStart} options.start
   * @param {ValueDistribution} options.duration
   * @param {Map<string, number>|Object} options.assetAllocation
   */
  constructor({ name, start, duration, assetAllocation }) {
    this.name = name;
    this.start = new EventStart(start);
    this.duration = new ValueDistribution(duration);
    this.assetAllocation = assetAllocation;
  }
}

class Scenario {
  /**
   * Constructor for the scenario class. Supply pure vanilla object representations of Scenario. 
   * Do not use subclasses in fields like ValueDistribution, InvestmentType, etc.
   * @param {Object} options
   * @param {string} [options.name="Unnamed Scenario"]
   * @param {string} options.owner
   * @param {string[]} options.editors
   * @param {boolean} options.maritalStatus
   * @param {number[]} options.birthYears
   * @param {Array<Object>} options.lifeExpectancy - Each element is passed to `ValueDistribution`
   * @param {Array<Object>} [options.investmentTypes=[]] - Each element is passed to `InvestmentType`
   * @param {Array<Object>} [options.eventSeries=[]] - Each element must have a `type` property ('income', 'expense', 'invest', or 'rebalance')
   * @param {Array<Object>} [options.investments=[]] - Each element is passed to `Investment`
   * @param {ValueDistribution} options.inflationAssumption - Passed to `ValueDistribution`
   * @param {number} options.afterTaxContributionLimit
   * @param {string[]} options.spendingStrategy
   * @param {string[]} options.expenseWithdrawalStrategy
   * @param {number} [options.financialGoal=0] - Must be non-negative
   * @param {string} options.residenceState - Must be 2 letters long
   */
  constructor({
    name = "Unnamed Scenario",
    owner,
    editors,
    maritalStatus,
    birthYears,
    lifeExpectancy,
    investmentTypes = [],
    eventSeries = [],
    investments = [],
    inflationAssumption,
    afterTaxContributionLimit,
    spendingStrategy,
    expenseWithdrawalStrategy,
    financialGoal = 0,
    residenceState
  }) {
    this.name = name;
    this.owner = owner;
    this.editors = editors;
    this.maritalStatus = maritalStatus;
    this.birthYears = birthYears;
    
    if (
      !Array.isArray(lifeExpectancy) ||
      !(lifeExpectancy.length === 1 || lifeExpectancy.length === 2)
    ) {
      console.warn('Setting to default lifeExpectancy value.');
      // For a fixed distribution, only include distType and value.
      lifeExpectancy = [
        {
          distType: 'fixed', // Must be 'fixed' (or 'normal' or 'uniform') per the enum.
          value: 75
        }
      ];
    }
    this.lifeExpectancy = lifeExpectancy.map(obj => new ValueDistribution(obj));

    this.investmentTypes = investmentTypes.map((type) => new InvestmentType(type));

    // Link up investments with their corresponding investment types
    this.investments = investments.map((investment) => {
      const investmentType = this.investmentTypes.find((type) => type.name === investment.investmentType);
      if (!investmentType) {
        throw new Error(`Investment type ${investment.investmentType.name} not found`);
      }
      return new Investment({ ...investment, investmentType });
    })

    // Filter eventSeries based on type and create corresponding event instances
    this.incomeEvents = eventSeries.filter((event) => event.type === 'income').map((event) => new IncomeEvent(event));
    this.expenseEvents = eventSeries.filter((event) => event.type === 'expense').map((event) => new ExpenseEvent(event));
    this.investEvents = eventSeries.filter((event) => event.type === 'invest').map((event) => new InvestEvent(event));
    this.rebalanceEvents = eventSeries.filter((event) => event.type === 'rebalance').map((event) => new RebalanceEvent(event));

    if (!inflationAssumption) {
      console.warn('Setting to default inflation assumption.');
      inflationAssumption = {
        distType: 'fixed',
        value: 2.0 // Representing a 2% inflation rate.
        // Again, leave out any fields not applicable for a fixed distribution.
      };
    }
    this.inflationAssumption = new ValueDistribution(inflationAssumption);

    this.afterTaxContributionLimit = afterTaxContributionLimit;
    this.spendingStrategy = spendingStrategy;
    this.expenseWithdrawalStrategy = expenseWithdrawalStrategy;
    this.financialGoal = financialGoal;
    this.residenceState = residenceState;
  }
}

export { ValueDistribution, 
  InvestmentType, 
  Investment, 
  EventStart, 
  IncomeEvent, 
  ExpenseEvent, 
  InvestEvent, 
  RebalanceEvent, 
  Scenario };