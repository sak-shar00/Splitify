# Expense Splitter - How It Works

A simple explanation of how expenses are tracked and settled in this application.

---

## The Basic Idea

When friends share expenses, someone pays upfront and others owe them money. This app tracks who paid what and who owes whom, then figures out the simplest way to settle up.

---

## Creating an Expense

### What Happens When Someone Adds an Expense?

Let's say Alice, Bob, and Charlie go out for dinner. The bill is $90, and Alice pays.

**Step 1: Record who paid**
- Alice paid: $90

**Step 2: Split the cost**
- Each person's share: $90 ÷ 3 = $30

**Step 3: Update balances**
- Alice: She paid $90 but only owes $30, so she's owed **$60**
- Bob: He paid $0 but owes $30, so he owes **$30**
- Charlie: He paid $0 but owes $30, so he owes **$30**

**The Math:**
```
Alice's balance = $90 (paid) - $30 (her share) = +$60
Bob's balance = $0 (paid) - $30 (his share) = -$30
Charlie's balance = $0 (paid) - $30 (his share) = -$30
```

---

## Different Ways to Split

### 1. Equal Split
Everyone pays the same amount.

**Example:** $120 dinner, 4 people
- Each person pays: $120 ÷ 4 = **$30**

### 2. Exact Amounts
You specify exactly how much each person should pay.

**Example:** $100 groceries
- Alice pays $45
- Bob pays $30
- Charlie pays $25
- Total must equal $100 ✓

### 3. Percentage Split
Each person pays a percentage of the total.

**Example:** $200 hotel room
- Alice pays 50% = $100
- Bob pays 30% = $60
- Charlie pays 20% = $40
- Percentages must add up to 100% ✓

### 4. Ratio/Shares Split
Split based on ratios (useful when people consume different amounts).

**Example:** $300 rent, 3 roommates
- Alice gets 2 shares (bigger room)
- Bob gets 2 shares (bigger room)
- Charlie gets 1 share (smaller room)
- Total shares: 5

**Calculation:**
- Alice: (2 ÷ 5) × $300 = $120
- Bob: (2 ÷ 5) × $300 = $120
- Charlie: (1 ÷ 5) × $300 = $60

---

## Tracking Balances

### How We Calculate Who Owes What

For each person, we track:
```
Balance = Total Amount They Paid - Total Amount They Owe
```

**Positive balance** = They are owed money
**Negative balance** = They owe money
**Zero balance** = They're even

### Example with Multiple Expenses

**Group:** Alice, Bob, Charlie

**Expense 1:** Alice pays $90 for dinner (split equally)
- Alice: +$60
- Bob: -$30
- Charlie: -$30

**Expense 2:** Bob pays $60 for movie tickets (split equally)
- Alice: -$20
- Bob: +$40
- Charlie: -$20

**Final Balances:**
- Alice: $60 - $20 = **+$40** (owed)
- Bob: -$30 + $40 = **+$10** (owed)
- Charlie: -$30 - $20 = **-$50** (owes)

**What this means:**
- Charlie needs to pay $50 total
- Alice should receive $40
- Bob should receive $10

---

## Settlements - Closing the Books

### What is a Settlement?

A settlement is like creating a payment plan to settle all debts. There are **two stages**:

---

## Stage 1: Creating a Settlement (Status: Pending)

### What Happens:

1. **Captures all unsettled expenses** - Finds all expenses that haven't been included in any previous settlement

2. **Calculates balances** - Figures out who owes what based on those expenses

3. **Generates payment plan** - Creates optimized transactions (who should pay whom)

4. **Links expenses to settlement** - Marks all those expenses with the settlement ID

5. **Sets status to "pending"** - The settlement exists but payments haven't been made yet

6. **Sends notifications** - Everyone gets notified that a settlement was created

### Important:
- Expenses are now **linked to this settlement** (they have a settlementId)
- These expenses **won't be counted again** in future settlements
- But the settlement status is still **"pending"** - meaning people haven't actually paid yet
- New expenses added after this will be "unsettled" and counted in the next settlement

### Example:

**Before Creating Settlement:**
- 5 unsettled expenses in the group
- Alice is owed $40
- Bob is owed $10  
- Charlie owes $50

**After Creating Settlement:**
- Settlement created with status: **"pending"**
- Those 5 expenses now have settlementId (linked to this settlement)
- Payment plan shows:
  - Charlie should pay Alice $40
  - Charlie should pay Bob $10
- Everyone can see the settlement and knows what needs to be paid
- But money hasn't actually changed hands yet!

---

## Stage 2: Marking Settlement as Completed

### What Happens:

1. **Admin confirms payments** - Group admin verifies that people have actually paid

2. **Changes status to "completed"** - Settlement status updates from "pending" to "completed"

3. **Sends notifications** - Everyone gets notified that the settlement is complete

### Important:
- This is just a **status change** - no calculations happen
- It's a **confirmation** that the real-world payments have been made
- The expenses remain linked to this settlement
- This is for **record-keeping** - to know which settlements are done

### Example:

**After Marking as Completed:**
- Settlement status changes: **"pending" → "completed"**
- This tells everyone: "Yes, Charlie paid Alice and Bob in real life"
- No balance calculations change
- It's just marking the settlement as done

---

## The Complete Flow

### Timeline:

**Day 1-7: Expenses Accumulate**
- Alice pays $90 for dinner
- Bob pays $60 for movie
- Charlie pays $30 for snacks
- All expenses have `settlementId: null` (unsettled)

**Day 8: Admin Creates Settlement**
- System calculates: Charlie owes $50 to Alice
- Settlement created with status: **"pending"**
- Those 3 expenses now have `settlementId: "settlement123"`
- Payment plan is visible to everyone
- Charlie knows he needs to pay Alice $50

**Day 9: Real-World Payment**
- Charlie transfers $50 to Alice via bank/cash
- (This happens outside the app)

**Day 10: Admin Marks Settlement Complete**
- Admin clicks "Mark as Complete"
- Settlement status changes to: **"completed"**
- Everyone gets notification: "Settlement completed!"
- This confirms the payment was made

**Day 11: New Expenses Start**
- Bob pays $40 for lunch
- This expense has `settlementId: null` (unsettled)
- Will be included in the next settlement

---

## Key Differences

| Action | Create Settlement | Mark as Completed |
|--------|------------------|-------------------|
| **When** | When you want to settle up | After real payments are made |
| **What it does** | Calculates balances & creates payment plan | Just changes status |
| **Expenses** | Links expenses to settlement | No change to expenses |
| **Status** | Sets to "pending" | Changes to "completed" |
| **Purpose** | Generate the payment plan | Confirm payments were made |
| **Calculations** | Yes - lots of math | No - just status update |

---

## Why Two Stages?

### Real-World Scenario:

**Problem:** People need time to make payments
- You can't instantly transfer money
- Some people pay cash, some use apps
- Takes time to coordinate

**Solution:** Two-stage process
1. **Create settlement** - Everyone knows what to pay
2. **Mark complete** - Confirm it's done

### Benefits:
- **Transparency:** Everyone sees the payment plan immediately
- **Flexibility:** People have time to make payments
- **Record-keeping:** Know which settlements are pending vs completed
- **Prevents double-counting:** Expenses are linked immediately, won't be counted twice

---

## Unsettled vs Settled Expenses

**Unsettled expenses:**
- Have `settlementId: null`
- Will be included in the next settlement
- Still counting toward current balances

**Settled expenses:**
- Have a `settlementId` (linked to a settlement)
- Won't be counted in future settlements
- Part of historical records

**Important:** Once expenses are linked to a settlement (even if pending), they're considered "settled" in terms of not being counted again.

---

## Optimizing Payments

### The Problem

Without optimization, everyone might need to pay everyone else. With 10 people, that could be 45 different payments!

### The Solution

We use a smart algorithm to minimize transactions:

**Step 1:** Make two lists
- **Creditors:** People who are owed money (positive balances)
- **Debtors:** People who owe money (negative balances)

**Step 2:** Sort both lists from largest to smallest

**Step 3:** Match them up
- Take the person who owes the most
- Match them with the person who is owed the most
- Create a payment for the smaller of the two amounts
- Repeat until everyone is settled

### Example

**Starting balances:**
- Alice: +$100 (owed)
- Bob: +$50 (owed)
- Charlie: -$80 (owes)
- David: -$70 (owes)

**Optimized payments:**
1. Charlie pays Alice $80 (Charlie is now even)
2. David pays Alice $20 (Alice is now even)
3. David pays Bob $50 (Everyone is even)

**Result:** Only 3 payments instead of potentially 6!

---

## Why This Matters

### Without This System
- Hard to remember who paid what
- Complicated to figure out who owes whom
- Many unnecessary transactions
- Easy to make mistakes

### With This System
- Automatic tracking of all expenses
- Clear view of balances
- Minimal payments needed
- Fair and transparent

---

## Key Points for Interview

1. **Expense Creation:** When someone pays, their balance goes up by the total amount, then everyone's balance (including theirs) goes down by their share.

2. **Balance Calculation:** Simple formula: `Paid - Owed = Balance`

3. **Multiple Split Methods:** Equal, exact amounts, percentages, or ratios - whatever fits the situation.

4. **Settlements:** Take a snapshot of all debts, create optimized payment plan, mark expenses as settled.

5. **Transaction Optimization:** Greedy algorithm matches biggest creditors with biggest debtors to minimize total number of payments.

6. **Always Balanced:** Total of all balances always equals zero (money paid = money owed in the group).

---

## Real-World Example

**Weekend Trip:**
- Day 1: Alice pays $150 for hotel
- Day 2: Bob pays $90 for dinner
- Day 3: Charlie pays $60 for gas

**Split equally among 3 people:**

| Person  | Paid | Owes | Balance |
|---------|------|------|---------|
| Alice   | $150 | $100 | +$50    |
| Bob     | $90  | $100 | -$10    |
| Charlie | $60  | $100 | -$40    |

**Settlement:**
- Bob pays Alice $10
- Charlie pays Alice $40
- Trip settled! ✓

---

## Technical Implementation

- **Database:** MongoDB stores expenses, settlements, and user data
- **Backend:** Node.js/Express handles calculations and API
- **Frontend:** React displays balances and manages UI
- **Real-time:** Notifications sent when expenses added or settlements created

---

**This document explains the core logic that makes fair expense splitting simple and automatic.**
