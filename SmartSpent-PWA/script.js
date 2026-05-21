const screenButtons = document.querySelectorAll("[data-screen]");
const screens = document.querySelectorAll("[data-panel]");
const stepLinks = document.querySelectorAll(".step-link");

const fields = {
  customerName: document.querySelector("#customerName"),
  monthlyIncome: document.querySelector("#monthlyIncome"),
  savingGoalName: document.querySelector("#savingGoalName"),
  billsBudget: document.querySelector("#billsBudget"),
  savingsBudget: document.querySelector("#savingsBudget"),
  foodBudget: document.querySelector("#foodBudget"),
  transportBudget: document.querySelector("#transportBudget"),
  entertainmentBudget: document.querySelector("#entertainmentBudget"),
  billOneName: document.querySelector("#billOneName"),
  billOneAmount: document.querySelector("#billOneAmount"),
  billTwoName: document.querySelector("#billTwoName"),
  billTwoAmount: document.querySelector("#billTwoAmount"),
  billThreeName: document.querySelector("#billThreeName"),
  billThreeAmount: document.querySelector("#billThreeAmount"),
  newExpenseAmount: document.querySelector("#newExpenseAmount"),
  newExpenseCategory: document.querySelector("#newExpenseCategory"),
};

function money(value) {
  const number = Number(value) || 0;
  const prefix = number < 0 ? "-EUR " : "EUR ";

  return `${prefix}${Math.abs(number).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function valueOf(field) {
  return Number(field?.value) || 0;
}

function showScreen(screenName) {
  updatePlan();

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.panel === screenName);
  });

  stepLinks.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screenName);
  });
}

function updatePlan() {
  const income = valueOf(fields.monthlyIncome);
  const bills = valueOf(fields.billsBudget);
  const savings = valueOf(fields.savingsBudget);
  const food = valueOf(fields.foodBudget);
  const transport = valueOf(fields.transportBudget);
  const entertainment = valueOf(fields.entertainmentBudget);
  const spendingTotal = food + transport + entertainment;
  const remaining = income - bills - savings - spendingTotal;
  const hasPlanDetails = income || bills || savings || food || transport || entertainment;

  const actualBills =
    valueOf(fields.billOneAmount) +
    valueOf(fields.billTwoAmount) +
    valueOf(fields.billThreeAmount);

  document.querySelector("#remainingAfterSplit").textContent = money(remaining);
  document.querySelector("#remainingAfterSplit").parentElement.classList.toggle("alert", remaining < 0);
  document.querySelector("#splitMessage").textContent =
    !hasPlanDetails
      ? "Enter income and budgets to see what money is left."
      : remaining >= 0
      ? "This can be kept as flexible money or added to savings."
      : "The planned split is higher than the income. Reduce spending or savings.";

  document.querySelector("#enteredBillsTotal").textContent = money(actualBills);
  document.querySelector("#planIncome").textContent = money(income);
  document.querySelector("#planBills").textContent = money(bills);
  document.querySelector("#planSavings").textContent = money(savings);
  document.querySelector("#planFlexible").textContent = money(remaining);
  document.querySelector("#planName").textContent = `Plan for ${fields.customerName.value || "customer"}`;
  document.querySelector("#planGoal").textContent = fields.savingGoalName.value || "Savings goal";

  document.querySelector("#foodLimit").textContent = money(food);
  document.querySelector("#transportLimit").textContent = money(transport);
  document.querySelector("#entertainmentLimit").textContent = money(entertainment);

  const maxSpend = Math.max(food, transport, entertainment, 1);
  document.querySelector("#foodBar").style.width = `${Math.round((food / maxSpend) * 100)}%`;
  document.querySelector("#transportBar").style.width = `${Math.round((transport / maxSpend) * 100)}%`;
  document.querySelector("#entertainmentBar").style.width = `${Math.round((entertainment / maxSpend) * 100)}%`;

  document.querySelector("#smartSuggestion").textContent =
    !hasPlanDetails
      ? "Enter your income and budgets to generate a smart suggestion."
      : remaining < 0
      ? "Your plan is over budget. Lower entertainment or savings until the total fits your income."
      : actualBills > bills
        ? "Your bills are higher than the bills budget. Increase the bills budget before spending elsewhere."
        : "Your plan is balanced. Keep flexible money separate so you do not overspend.";

  document.querySelector("#billOneOutput").textContent = fields.billOneName.value || "Bill 1";
  document.querySelector("#billTwoOutput").textContent = fields.billTwoName.value || "Bill 2";
  document.querySelector("#billThreeOutput").textContent = fields.billThreeName.value || "Bill 3";
  document.querySelector("#billOneOutputAmount").textContent = money(fields.billOneAmount.value);
  document.querySelector("#billTwoOutputAmount").textContent = money(fields.billTwoAmount.value);
  document.querySelector("#billThreeOutputAmount").textContent = money(fields.billThreeAmount.value);
}

function previewExpense() {
  updatePlan();

  const category = fields.newExpenseCategory.value;
  const expense = valueOf(fields.newExpenseAmount);
  const budgetField = {
    food: fields.foodBudget,
    transport: fields.transportBudget,
    entertainment: fields.entertainmentBudget,
  }[category];
  const budget = valueOf(budgetField);
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  if (!expense) {
    document.querySelector("#expensePreview").textContent =
      "Enter an expense amount to preview the spending check.";
    document.querySelector("#expenseAdvice").textContent =
      "Smart Spent checks the budget before the customer spends more.";
    return;
  }

  if (!budget) {
    document.querySelector("#expensePreview").textContent =
      `Set a ${category} budget before checking this expense.`;
    document.querySelector("#expenseAdvice").textContent =
      "A category budget is needed before Smart Spent can compare the expense.";
    return;
  }

  document.querySelector("#expensePreview").textContent =
    expense <= budget
      ? `This expense fits inside your ${category} budget.`
      : `This expense is higher than your ${category} budget.`;
  document.querySelector("#expenseAdvice").textContent =
    expense <= budget
      ? `${categoryName} budget after this example expense: ${money(budget - expense)}.`
      : "Smart Spent would warn the customer before they overspend.";
}

screenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});

Object.values(fields).forEach((field) => {
  field?.addEventListener("input", updatePlan);
});

document.querySelector("#previewExpense").addEventListener("click", previewExpense);

updatePlan();
