# SmartStock AI

## Multi-Agent AI System for Demand-Aware Pricing, Inventory Coordination, and Retail Decision Support

---

## 1. Problem Statement

Small and medium-sized businesses (SMBs) often have sales, inventory, competitor pricing, and seasonal/festival data, but they may not have enough analytical expertise to convert this data into useful business decisions.

For example:

* Milk sales decreased from 140 to 109 packets.
* A competitor reduced the price from ₹30 to ₹27.
* A festival is coming in 3 days.
* The store has limited inventory.
* Another store has excess inventory.

The business owner needs to understand:

> Should I increase or decrease the price?
> Will demand increase or decrease?
> Do I have enough inventory?
> Should I transfer stock between stores?
> What will happen if I make a different decision?

SmartStock AI addresses these problems using a multi-agent AI architecture.

---

# 2. Core Idea

SmartStock AI uses multiple specialized AI agents that analyze the same business situation from different perspectives.

Instead of asking one AI to make every decision, each AI has a specific responsibility.

```text
                         Business Data
                              |
                              v
                    +-------------------+
                    | Data Analyst AI   |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |   Pricing AI      |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |  Inventory AI     |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |  Logistics AI     |
                    +---------+---------+
                              |
                              v
                    +-------------------+
                    |     Boss AI       |
                    | Decision + Chat   |
                    +-------------------+
```

The first four agents analyze different aspects of the business, while the Boss AI combines their outputs and communicates the final decision to the business owner.

---

# 3. The Five AI Agents

## 3.1 Data Analyst AI

### Responsibility

The Data Analyst AI looks at raw business data and explains what is happening.

It does **not** make the final recommendation.

### Input

* Historical sales
* Current sales
* Current inventory
* Product price
* Competitor price
* Festival/season information
* Store information

### Example

```text
Store 1
Product: Milk

Previous sales: 140 packets
Current sales: 109 packets
Current price: ₹30
Competitor price: ₹27
Festival: 3 days away
```

### Output

```text
Milk sales have decreased by approximately 22%.

The competitor is selling milk for ₹27 compared with
our current price of ₹30.

A festival is expected in 3 days, which may increase demand.
```

The Data Analyst provides factual information for the other agents.

---

# 4. Pricing AI

## Responsibility

Pricing AI evaluates whether the product price should:

* Increase
* Decrease
* Stay the same

It considers:

* Current demand
* Demand trend
* Competitor price
* Festival/seasonal demand
* Profit margin
* Inventory availability

### Example

```text
Current price: ₹30
Competitor price: ₹27
Sales trend: -22%
Festival: 3 days
Current stock: 250
Cost price: ₹20
```

### Output

```text
Action: DECREASE

Recommended price: ₹28

Reason:
The competitor is priced at ₹27 and current sales have
declined by approximately 22%. The upcoming festival
may increase demand.

Confidence: 82%
```

---

# 5. Inventory AI

## Responsibility

Inventory AI checks whether the proposed pricing decision is supported by the available inventory.

It does not necessarily fix the problem.

It raises concerns such as:

* Stockout risk
* Overstock
* Insufficient inventory
* Normal inventory

### Example

```text
Current stock: 250
Predicted daily demand: 150
```

Inventory AI may report:

```text
WARNING

The proposed price reduction may increase demand.

Current inventory may only support approximately
1.6 days of predicted demand.

Stockout risk detected.
```

---

# 6. Logistics AI

## Responsibility

Logistics AI looks across stores and determines whether inventory can be moved from a surplus store to a shortage store.

### Example

```text
Store 1
Stock: 80
Expected demand: 150/day

Store 2
Stock: 800
Expected demand: 100/day
```

Logistics AI can identify:

```text
Store 1 → Inventory shortage

Store 2 → Inventory surplus
```

Possible recommendation:

```text
Transfer: 200 units

From: Store 2
To: Store 1

Transportation cost: ₹500

Expected avoided loss: ₹1,800

Estimated net benefit: ₹1,300
```

---

# 7. Boss AI

## Responsibility

Boss AI is the main decision-making and communication layer.

It receives:

* Data Analyst output
* Pricing AI output
* Inventory AI output
* Logistics AI output

It then summarizes the complete situation for the business owner.

The owner can also chat with Boss AI.

---

## Example Boss AI Output

```text
RECOMMENDATION

Reduce the milk price from ₹30 to ₹28 for the upcoming
festival period.

WHY?

1. Milk sales have decreased by approximately 22%.
2. The competitor is currently selling at ₹27.
3. A festival is expected in 3 days.
4. The proposed price may improve demand.
5. Current inventory creates a possible stockout risk.

INVENTORY ACTION

Transfer approximately 200 units from Store 2 to Store 1.

TRANSFER COST

₹500

RISK

Demand may increase more than predicted, causing a stockout.

CONFIDENCE

82%
```

---

# 8. Boss AI Chat

The business owner can ask questions directly.

### Question

```text
Why are you reducing the price?
```

### Boss AI

```text
The proposed reduction is mainly based on the competitor's
₹27 price, the recent 22% sales decline, and the upcoming
festival that may increase demand.
```

---

### Question

```text
What if I keep the price at ₹30?
```

### Boss AI

```text
Keeping the price at ₹30 preserves the current margin,
but the system identifies a higher risk of losing demand
to the competitor.
```

---

### Question

```text
What if I reduce it to ₹25?
```

### Boss AI

```text
A ₹25 price may increase demand, but it would significantly
reduce the margin. The current inventory constraint also
makes a large demand increase risky.
```

---

# 9. What-If Simulation

One of the major innovative features of SmartStock AI is a business scenario simulator.

Instead of directly changing a price, the owner can ask:

```text
What happens if I reduce the price to ₹27?
```

The system can compare different scenarios.

```text
                 ₹30          ₹28          ₹27
------------------------------------------------
Expected Demand   350          400          430
Revenue          ₹10,500      ₹11,200      ₹11,610
Estimated Profit  ₹3,500       ₹3,200       ₹3,010
Stockout Risk      Low         Medium        High
```

The owner can then understand the trade-offs before making a decision.

---

# 10. Decision Memory

SmartStock AI can store previous decisions and their actual outcomes.

Example:

```text
Previous Decision

Product: Milk
Old price: ₹30
New price: ₹27

Predicted demand increase: 20%

Actual demand increase: 31%

Actual profit increase: 14%
```

The system can later use this historical information to understand the specific business better.

This makes SmartStock more personalized over time.

---

# 11. Risk / Critic Layer

An optional additional AI can challenge the proposed decision.

Example:

```text
PROPOSED DECISION

Reduce price from ₹30 → ₹27

RISKS

- Stockout probability: 61%
- Competitor may reduce price further
- Profit margin decreases
- Demand prediction confidence is limited
```

The Boss AI can consider these risks before presenting the final recommendation.

---

# 12. Important Technical Architecture

For the 24-hour MVP, SmartStock AI should NOT train five separate AI models.

Instead, use:

```text
OpenAI API
     |
     +-- Data Analyst Agent
     |
     +-- Pricing Agent
     |
     +-- Inventory Agent
     |
     +-- Logistics Agent
     |
     +-- Boss Agent
```

Each agent uses the same general AI model but has:

* Different system instructions
* Different input data
* Different responsibilities
* Different structured output format

This creates specialized AI agents without requiring five separate trained models.

---

# 13. Do Not Let the LLM Do Everything

Important numerical calculations should be handled by the backend.

Use Python for:

```text
Sales percentage change
Profit calculation
Revenue calculation
Profit margin
Stock coverage
Stockout calculation
Surplus calculation
Transfer quantity
Transportation cost
Scenario calculations
```

Then send the calculated information to the AI.

The AI should primarily:

```text
Understand
Reason
Interpret
Compare
Explain
Summarize
```

This makes the system more reliable.

---

# 14. Backend Architecture

```text
                    React Frontend
                          |
                          v
                    FastAPI Backend
                          |
             +------------+------------+
             |                         |
             v                         v
        PostgreSQL                 AI Services
                                      |
                    +-----------------+----------------+
                    |        |        |        |       |
                    v        v        v        v       v
                  Data    Pricing Inventory Logistics Boss
                  AI        AI       AI        AI      AI
```

---

# 15. Database

Recommended PostgreSQL tables:

```text
stores
products
sales
inventory
competitor_prices
festivals
decisions
decision_results
```

### Example

```text
stores
------------------
id
name
location

products
------------------
id
name
cost_price
current_price

sales
------------------
id
store_id
product_id
date
quantity

inventory
------------------
id
store_id
product_id
quantity

competitor_prices
------------------
id
product_id
competitor
price
date

decisions
------------------
id
product_id
old_price
new_price
reason
date
```

---

# 16. Technology Stack

## Frontend

```text
React
Tailwind CSS
Chart.js
Axios
```

## Backend

```text
Python
FastAPI
Pandas
NumPy
```

## Database

```text
PostgreSQL
```

## AI

```text
OpenAI API
```

## Optional ML

If time permits:

```text
Scikit-learn
```

for simple demand prediction.

---

# 17. MVP Scope for 24 Hours

Do NOT attempt to build everything.

Focus on a working end-to-end demonstration.

## Must Have

### 1. Dashboard

Show:

```text
Total Stores
Total Products
Current Revenue
Inventory Status
AI Recommendations
```

### 2. Data Analyst AI

Show a factual analysis.

### 3. Pricing AI

Show:

```text
Old Price
Recommended Price
Reason
Confidence
```

### 4. Inventory AI

Show:

```text
Stock Status
Stockout Risk
Overstock Warning
```

### 5. Logistics AI

Show:

```text
Source Store
Destination Store
Transfer Quantity
Transfer Cost
```

### 6. Boss AI

Show:

```text
Final Recommendation
Reasons
Risks
Expected Impact
```

### 7. Boss AI Chat

Allow the user to ask:

```text
Why?
What if?
Why not?
What happens if I change the price?
```

---

# 18. The Key Innovation

SmartStock AI is not simply:

```text
AI → Price Recommendation
```

It is:

```text
BUSINESS DATA
      |
      v
UNDERSTAND WHAT IS HAPPENING
      |
      v
PROPOSE A PRICE
      |
      v
CHECK INVENTORY
      |
      v
CHECK LOGISTICS
      |
      v
IDENTIFY RISKS
      |
      v
SIMULATE CONSEQUENCES
      |
      v
EXPLAIN THE DECISION
      |
      v
HUMAN APPROVAL
      |
      v
TRACK ACTUAL RESULT
      |
      v
LEARN FROM THE RESULT
```

---

# 19. Final Project Pitch

> **SmartStock AI is a multi-agent AI decision-support system designed for small and medium-sized retailers. Instead of relying on a single AI to make business decisions, SmartStock assigns specialized agents to analyze sales, pricing, inventory, and logistics. A Boss AI combines their outputs, identifies risks, explains the trade-offs, supports what-if simulations, and allows the business owner to interact with the decision through natural language.**

---

# 20. One-Line Pitch

> **"SmartStock AI doesn't just tell a business what to do — it shows what could happen before the business does it."**

---

# 21. 24-Hour Development Strategy

```text
Hour 1–3
Database + sample dataset

Hour 3–6
FastAPI backend + calculations

Hour 6–9
Data Analyst + Pricing AI

Hour 9–12
Inventory + Logistics AI

Hour 12–15
Boss AI

Hour 15–18
React dashboard

Hour 18–20
Boss AI chat + What-If simulation

Hour 20–22
Integration + testing

Hour 22–24
Demo preparation + presentation
```

---

# 22. Most Important Decision

Do NOT train five individual AI models for this hackathon.

Use:

```text
OpenAI
   +
Python calculations
   +
Business rules
   +
PostgreSQL
   +
Multi-agent architecture
```

The AI agents provide reasoning and explanations, while your backend handles the numerical calculations and business constraints.

This gives you a realistic, demonstrable MVP within 24 hours.
