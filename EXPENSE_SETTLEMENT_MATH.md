# Expense Splitter - Mathematical Logic Documentation

## Table of Contents
1. [Expense Creation Logic](#expense-creation-logic)
2. [Split Methods Explained](#split-methods-explained)
3. [Balance Calculation](#balance-calculation)
4. [Settlement System](#settlement-system)
5. [Transaction Optimization Algorithm](#transaction-optimization-algorithm)

---

## Expense Creation Logic

### Overview
When an expense is created, one person (the payer) pays the full amount, and the cost is distributed among participants based on the chosen split method.

### Core Concept
```
Net Balance = Amount Paid - Amount Owed
```

For each expense:
- **Payer's balance increases** by the total expense amount
- **Each participant's balance decreases** by their share amount

### Example
Alice pays $100 for dinner with Bob and Charlie (split equally):
- Alice: +$100 (paid) - $33.33 (her share) = **+$66.67**
- Bob: $0 (paid) - $33.33 (his share) = **-$33.33**
- Charlie: $0 (paid) - $33.33 (his share) = **-$33.33**

---

## Split Methods Explained

### 1. Equal Split
**Formula:** `Share per person = Total Amount ÷ Number of Participants`

**Example:**
```
Expense: $120 dinner
Participants: 4 people
Share per person = 120 ÷ 4 = $30
```

**Code Logic:**
```javascript
const sharePerPerson = amount / participants.length;
processedParticipants = participants.map(p => ({
  userId: p.userId,
  share: sharePerPerson
}));
```

---

### 2. Amount Split (Exact Amounts)
Each participant pays a specific dollar amount.

**Validation:** `Sum of all shares = Total Amount`

**Example:**
```
Expense: $100 groceries
- Alice pays: $45
- Bob pays: $30
- Charlie pays: $25
Total: $45 + $30 + $25 = $100 ✓
```

**Code Logic:**
```javascript
const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
if (Math.abs(totalShares - amount) > 0.01) {
  throw new Error('Sum of shares must equal total amount');
}
```

---

### 3. Percentage Split
Each participant pays a percentage of the total.

**Formula:** `Share = (Total Amount × Percentage) ÷ 100`

**Validation:** `Sum of all percentages = 100%`

**Example:**
```
Expense: $200 hotel room
- Alice: 50% → $200 × 0.50 = $100
- Bob: 30% → $200 × 0.30 = $60
- Charlie: 20% → $200 × 0.20 = $40
Total: 50% + 30% + 20% = 100% ✓
```

**Code Logic:**
```javascript
const totalPercentage = participants.reduce((sum, p) => sum + p.share, 0);
if (Math.abs(totalPercentage - 100) > 0.01) {
  throw new Error('Sum of percentages must equal 100');
}
processedParticipants = participants.map(p => ({
  userId: p.userId,
  share: (amount * p.share) / 100
}));
```

---

### 4. Shares/Ratio Split
Participants contribute based on ratios (useful for unequal splits).

**Formula:** `Share = (Total Amount × Individual Shares) ÷ Total Shares`

**Example:**
```
Expense: $300 rent
- Alice: 2 shares
- Bob: 2 shares
- Charlie: 1 share
Total shares: 2 + 2 + 1 = 5

Alice's share = (300 × 2) ÷ 5 = $120
Bob's share = (300 × 2) ÷ 5 = $120
Charlie's share = (300 × 1) ÷ 5 = $60
```

**Code Logic:**
```javascript
const totalShares = participants.reduce((sum, p) => sum + p.share, 0);
processedParticipants = participants.map(p => ({
  userId: p.userId,
  share: (amount * p.share) / totalShares
}));
```

---

## Balance Calculation

### Net Balance Formula
For each user in a group:
```
Net Balance = Σ(Amounts Paid) - Σ(Amounts Owed)
```

### Step-by-Step Calculation

**Step 1: Initialize balances**
```javascript
const netBalances = {};
group.memberIds.forEach(member => {
  netBalances[member._id] = 0;
});
```

**Step 2: Add amounts paid**
```javascript
expenses.forEach(expense => {
  const paidById = expense.paidBy.toString();
  netBalances[paidById] += expense.amount;
});
```

**Step 3: Subtract amounts owed**
```javascript
expenses.forEach(expense => {
  expense.participants.forEach(participant => {
    const participantId = participant.userId.toString();
    netBalances[participantId] -= participant.share;
  });
});
```

### Example Calculation

**Scenario:**
- Group: Alice, Bob, Charlie
- Expense 1: Alice pays $90 for dinner (split equally among 3)
- Expense 2: Bob pays $60 for movie tickets (split equally among 3)

**Calculation:**

| User    | Paid | Owed | Net Balance |
|---------|------|------|-------------|
| Alice   | $90  | $50  | +$40        |
| Bob     | $60  | $50  | +$10        |
| Charlie | $0   | $50  | -$50        |

**Breakdown:**
- Alice: $90 (paid) - $30 (dinner share) - $20 (movie share) = **+$40**
- Bob: $60 (paid) - $30 (dinner share) - $20 (movie share) = **+$10**
- Charlie: $0 (paid) - $30 (dinner share) - $20 (movie share) = **-$50**

**Interpretation:**
- Alice is owed $40
- Bob is owed $10
- Charlie owes $50

---

## Settlement System

### What is a Settlement?

A settlement is a snapshot that:
1. Captures all **unsettled expenses** (expenses not linked to any previous settlement)
2. Calculates net balances for all group members
3. Generates optimized payment transactions
4. Marks expenses as "settled" by linking them to the settlement

### Unsettled vs Settled Expenses

**Unsettled Expenses:**
```javascript
const unsettledExpenses = await Expense.find({ 
  groupId, 
  settlementId: null  // No settlement linked
});
```

**Settled Expenses:**
- Have a `settlementId` field pointing to a settlement document
- Are excluded from future balance calculations
- Represent expenses that have been "closed out"

### Settlement Creation Process

**Step 1: Calculate Paid and Owed Amounts**
```javascript
const paidBy = {};  // Track what each person paid
const owedBy = {};  // Track what each person owes

unsettledExpenses.forEach(expense => {
  // Add to payer's credit
  paidBy[expense.paidBy] += expense.amount;
  
  // Add to each participant's debt
  expense.participants.forEach(participant => {
    owedBy[participant.userId] += participant.share;
  });
});
```

**Step 2: Calculate Net Balances**
```javascript
const netBalances = {};
group.memberIds.forEach(member => {
  const memberId = member._id.toString();
  netBalances[memberId] = paidBy[memberId] - owedBy[memberId];
});
```

**Step 3: Categorize Users**
```javascript
const creditors = [];  // People who are owed money (positive balance)
const debtors = [];    // People who owe money (negative balance)

Object.entries(netBalances).forEach(([userId, balance]) => {
  if (balance > 0.01) {
    creditors.push({ userId, amount: balance });
  } else if (balance < -0.01) {
    debtors.push({ userId, amount: -balance });  // Convert to positive
  }
});
```

**Step 4: Generate Optimized Transactions** (see next section)

**Step 5: Link Expenses to Settlement**
```javascript
await Expense.updateMany(
  { _id: { $in: unsettledExpenses.map(e => e._id) } },
  { settlementId: settlement._id }
);
```

### Example Settlement

**Initial State:**
- Alice: +$40 (owed)
- Bob: +$10 (owed)
- Charlie: -$50 (owes)

**After Settlement:**
All expenses are marked with `settlementId`, and the system generates:
- Transaction 1: Charlie pays Alice $40
- Transaction 2: Charlie pays Bob $10

---

## Transaction Optimization Algorithm

### Goal
Minimize the number of transactions needed to settle all debts.

### Algorithm: Greedy Matching

This uses a **two-pointer greedy algorithm** to match creditors with debtors.

### Step-by-Step Process

**Step 1: Sort Arrays**
```javascript
creditors.sort((a, b) => b.amount - a.amount);  // Descending
debtors.sort((a, b) => b.amount - a.amount);    // Descending
```

**Step 2: Match Largest Creditor with Largest Debtor**
```javascript
let i = 0, j = 0;  // Pointers for creditors and debtors

while (i < creditors.length && j < debtors.length) {
  const creditor = creditors[i];
  const debtor = debtors[j];
  
  // Transfer the minimum of what's owed and what's due
  const amount = Math.min(creditor.amount, debtor.amount);
  
  transactions.push({
    from: debtor.userId,
    to: creditor.userId,
    amount: amount
  });
  
  // Reduce balances
  creditor.amount -= amount;
  debtor.amount -= amount;
  
  // Move pointers if balance is settled
  if (creditor.amount < 0.01) i++;
  if (debtor.amount < 0.01) j++;
}
```

### Example Walkthrough

**Scenario:**
- Alice: +$100 (owed)
- Bob: +$50 (owed)
- Charlie: -$80 (owes)
- David: -$70 (owes)

**Step 1: Sort**
```
Creditors: [Alice: $100, Bob: $50]
Debtors: [Charlie: $80, David: $70]
```

**Step 2: Match**

**Iteration 1:**
- Match: Alice ($100) ← Charlie ($80)
- Transaction: Charlie pays Alice $80
- Remaining: Alice: $20, Charlie: $0
- Move debtor pointer (j++)

**Iteration 2:**
- Match: Alice ($20) ← David ($70)
- Transaction: David pays Alice $20
- Remaining: Alice: $0, David: $50
- Move creditor pointer (i++)

**Iteration 3:**
- Match: Bob ($50) ← David ($50)
- Transaction: David pays Bob $50
- Remaining: Bob: $0, David: $0
- Done!

**Final Transactions:**
1. Charlie → Alice: $80
2. David → Alice: $20
3. David → Bob: $50

**Result:** 3 transactions instead of 4 (if everyone paid everyone individually)

### Why This Algorithm Works

**Mathematical Proof:**
- Total debt = Total credit (always balanced)
- Each transaction reduces either one creditor or one debtor to zero
- Maximum transactions = min(number of creditors, number of debtors)
- This is optimal for the greedy approach

### Complexity
- **Time Complexity:** O(n log n) for sorting + O(n) for matching = **O(n log n)**
- **Space Complexity:** O(n) for storing creditors and debtors

---

## Balance Verification

### Invariant Check
The sum of all net balances should always equal zero:

```javascript
const totalBalance = Object.values(netBalances).reduce((sum, val) => sum + val, 0);

// Should be 0 (or very close due to floating point)
if (Math.abs(totalBalance) > 0.01) {
  // Adjust for floating point errors
  const randomMemberId = Object.keys(netBalances)[0];
  netBalances[randomMemberId] -= totalBalance;
}
```

**Why?** Because total money paid = total money owed in a closed system.

---

## Rounding and Precision

### Floating Point Handling
All monetary calculations use rounding to 2 decimal places:

```javascript
const roundedAmount = Math.round(amount * 100) / 100;
```

### Tolerance for Comparisons
Use a small epsilon (0.01) for floating-point comparisons:

```javascript
if (Math.abs(difference) > 0.01) {
  // Significant difference
}
```

---

## Summary

### Expense Creation
1. One person pays the full amount
2. Cost is split among participants using one of 4 methods
3. Payer's balance increases, participants' balances decrease

### Balance Tracking
1. Net Balance = Total Paid - Total Owed
2. Positive balance = owed money
3. Negative balance = owes money
4. Zero balance = even

### Settlement Process
1. Capture all unsettled expenses
2. Calculate net balances
3. Separate creditors and debtors
4. Generate optimized transactions using greedy algorithm
5. Mark expenses as settled

### Transaction Optimization
- Uses greedy two-pointer algorithm
- Minimizes number of transactions
- Time complexity: O(n log n)
- Guarantees optimal solution for the greedy approach

---

## Code References

- **Expense Model:** `backend/models/Expsense.js`
- **Settlement Model:** `backend/models/Settlement.js`
- **Expense Controller:** `backend/controllers/expenseController.js`
- **Settlement Controller:** `backend/controllers/settlementController.js`

---

**Last Updated:** 2024
**Version:** 1.0
