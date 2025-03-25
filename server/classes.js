/* This was generated from ScenarioModel.js using ChatGPT */

class ValueDistribution {
    /**
     * @param {'normal'|'fixed'|'GBM'|'uniform'} distType
     * @param {number|undefined} value - Only defined if distType is 'fixed'
     * @param {number|undefined} mean - Defined if distType is 'normal' or 'GBM'
     * @param {number|undefined} sigma - Defined if distType is 'normal' or 'GBM'
     * @param {number|undefined} lower - Defined if distType is 'uniform'
     * @param {number|undefined} upper - Defined if distType is 'uniform'
     */
    constructor(distType, value, mean, sigma, lower, upper) {
      this.distType = distType;
      this.value = value;
      this.mean = mean;
      this.sigma = sigma;
      this.lower = lower;
      this.upper = upper;
      //custom validation here if needed.
    }
}
  

class InvestmentType {
    /**
     * @param {string} name
     * @param {string} description
     * @param {'percent'|'amount'} returnAmtorPct
     * @param {ValueDistribution} returnDistribution
     * @param {number} expenseRatio
     * @param {'percent'|'amount'} incomeAmtorPct
     * @param {ValueDistribution} incomeDistribution
     * @param {boolean} taxability
     */
    constructor(name, description, returnAmtorPct, returnDistribution, expenseRatio, incomeAmtorPct, incomeDistribution, taxability) {
      this.name = name;
      this.description = description;
      this.returnAmtorPct = returnAmtorPct;
      this.returnDistribution = returnDistribution;
      this.expenseRatio = expenseRatio;
      this.incomeAmtorPct = incomeAmtorPct;
      this.incomeDistribution = incomeDistribution;
      this.taxability = taxability;
    }
}
  
class Investment {
    /**
     * @param {InvestmentType} investmentType
     * @param {number} value
     * @param {'non-retirement'|'pre-tax'|'after-tax'} taxStatus
     * @param {string} [id] - If not provided, computed from investmentType.name and taxStatus.
     */
    constructor(investmentType, value, taxStatus, id) {
      this.investmentType = investmentType;
      this.value = value;
      this.taxStatus = taxStatus;
      this.id = id || `${this.investmentType.name} ${this.taxStatus}`;
    }
}

class EventStart {
    /**
     * @param {ValueDistribution|undefined} startDistribution - A ValueDistribution instance.
     * @param {{ eventSeries: string }|undefined} startWith - An object with an eventSeries property.
     * @param {ValueDistribution} duration - A ValueDistribution instance.
     */
    constructor(startDistribution, startWith, duration) {
      this.startDistribution = startDistribution;
      this.startWith = startWith;
      this.duration = duration;
    }
}

class IncomeEvent {
    /**
     * @param {string} name
     * @param {EventStart} start
     * @param {ValueDistribution} duration
     * @param {number} initialAmount
     * @param {'amount'|'percent'} changeAmtOrPct
     * @param {ValueDistribution} changeDistribution
     * @param {boolean} inflationAdjusted
     * @param {number} [userFraction=1.0]
     * @param {boolean} socialSecurity
     */
    constructor(name, start, duration, initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction = 1.0, socialSecurity) {
      this.name = name;
      this.start = start;
      this.duration = duration;
      this.initialAmount = initialAmount;
      this.changeAmtOrPct = changeAmtOrPct;
      this.changeDistribution = changeDistribution;
      this.inflationAdjusted = inflationAdjusted;
      this.userFraction = userFraction;
      this.socialSecurity = socialSecurity;
    }
}

class ExpenseEvent {
    /**
     * @param {string} name
     * @param {EventStart} start
     * @param {ValueDistribution} duration
     * @param {number} initialAmount
     * @param {'amount'|'percent'} changeAmtOrPct
     * @param {ValueDistribution} changeDistribution
     * @param {boolean} inflationAdjusted
     * @param {number} [userFraction=1.0]
     * @param {boolean} discretionary
     */
    constructor(name, start, duration, initialAmount, changeAmtOrPct, changeDistribution, inflationAdjusted, userFraction = 1.0, discretionary) {
      this.name = name;
      this.start = start;
      this.duration = duration;
      this.initialAmount = initialAmount;
      this.changeAmtOrPct = changeAmtOrPct;
      this.changeDistribution = changeDistribution;
      this.inflationAdjusted = inflationAdjusted;
      this.userFraction = userFraction;
      this.discretionary = discretionary;
    }
}

class InvestEvent {
    /**
     * @param {string} name
     * @param {EventStart} start
     * @param {ValueDistribution} duration
     * @param {Map<string, number>|Object} assetAllocation - A map or plain object with numeric values.
     * @param {boolean|undefined} glidePath
     * @param {Map<string, number>|Object|undefined} assetAllocation2
     */
    constructor(name, start, duration, assetAllocation, glidePath, assetAllocation2) {
      this.name = name;
      this.start = start;
      this.duration = duration;
      this.assetAllocation = assetAllocation;
      this.glidePath = glidePath;
      this.assetAllocation2 = assetAllocation2;
    }
}

class RebalanceEvent {
    /**
     * @param {string} name
     * @param {EventStart} start
     * @param {ValueDistribution} duration
     * @param {Map<string, number>|Object} assetAllocation
     */
    constructor(name, start, duration, assetAllocation) {
      this.name = name;
      this.start = start;
      this.duration = duration;
      this.assetAllocation = assetAllocation;
    }
}

class Scenario {
    /**
     * @param {string} [name="Unnamed Scenario"]
     * @param {string} owner
     * @param {string[]} editors - At least one editor required.
     * @param {boolean} maritalStatus
     * @param {number[]} birthYears
     * @param {ValueDistribution} lifeExpectancy
     * @param {Investment[]} investments
     * @param {IncomeEvent[]} incomeEvents
     * @param {ExpenseEvent[]} expenseEvents
     * @param {InvestEvent[]} investEvents
     * @param {RebalanceEvent[]} rebalanceEvents
     * @param {ValueDistribution} inflationAssumption
     * @param {number} afterTaxContributionLimit
     * @param {string[]} spendingStrategy
     * @param {string[]} expenseWithdrawalStrategy
     * @param {number} [financialGoal=0] - Must be non-negative.
     * @param {string} residenceState - Must be of length 2.
     */
    constructor(
      name = "Unnamed Scenario",
      owner,
      editors,
      maritalStatus,
      birthYears,
      lifeExpectancy,
      investments,
      incomeEvents,
      expenseEvents,
      investEvents,
      rebalanceEvents,
      inflationAssumption,
      afterTaxContributionLimit,
      spendingStrategy,
      expenseWithdrawalStrategy,
      financialGoal = 0,
      residenceState
    ) {
      this.name = name;
      this.owner = owner;
      this.editors = editors;
      this.maritalStatus = maritalStatus;
      this.birthYears = birthYears;
      this.lifeExpectancy = lifeExpectancy;
      this.investments = investments;
      this.incomeEvents = incomeEvents;
      this.expenseEvents = expenseEvents;
      this.investEvents = investEvents;
      this.rebalanceEvents = rebalanceEvents;
      this.inflationAssumption = inflationAssumption;
      this.afterTaxContributionLimit = afterTaxContributionLimit;
      this.spendingStrategy = spendingStrategy;
      this.expenseWithdrawalStrategy = expenseWithdrawalStrategy;
      this.financialGoal = financialGoal;
      this.residenceState = residenceState;
    }
}

export { ValueDistribution, InvestmentType, Investment, EventStart, IncomeEvent, ExpenseEvent, InvestEvent, RebalanceEvent, Scenario };
  
  