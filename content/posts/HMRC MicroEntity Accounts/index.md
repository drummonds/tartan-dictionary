---
title: "Filing MicroEntity Accounts   "
tags: ["accounts", "hmrc", "tax"]
date: 2022-10-20
---

# Filing microentity accounts
This is meant to document how to use HMRC's service
to input accounts and company house data when using
 Beancount and HMRC.

 1. Get Beancount up to date
 2. Generate annual accounts by editing report
 3. Input data here by hand
 
## Opening questions
These are the questions and the answers to which this process applies.
1. What is your organisation?
    - ***Company***
1. Do you want to make changes to a Company Tax Return you've already filed?
    - ***No***
1. Have your company accounts been audited?
    - ***No***
1. What type of company are you?
    - ***Private Limited Company***
1. Is your company one of the following? (insurance, investment, credit union, commercial property)
    - ***No***
1. Is your company part of a group?
    - ***No***
1. Is your company registered in the UK?
    - ***Yes***
1. Is your company in liquidation or receivership?
    - ***No***
1. Do you need to report any of the following? foreign currency transactions, adjustment for prior year,
financial instruments, restructuring?
    - ***No***
1. Do you need to report income or expenditure from shares?  (called up share capital not paid, share-based payments
 share premium)
    - ***No***
1. Do you need to report income or expenditure from investment assets?      
    - ***No***
1. Do you need to report contingent assets?
    - ***No***
1. Do you need to report any of   
    -   the following:  
        - Charity turnover above £6.5 million per year
        - Company turnover above £632,000 per year
        - Research and Development (R&D) costs
        - Income over £1,000 that doesn't come from your organisation's main trade
        - Non-trading income (except interest received)
        - Gross income from property over £5,200
        - Annual Investment Allowance (AIA) above £200,000
        - Income from property where expenses are greater than income
        - Complex loan relationships
        - Leased car
    - ***No***
1. Do you need to claim capital allowances?
    - ***No***
1. Choose your filing type
    - ***Companies House and HMRC***
1. Where was the company registered? 
    - ***England and Wales***
Enter company registration number and e filing code
1.Confirm your company accounts dates
    - ***confirmed***
1. Confirm your Corporation Tax filing dates
    - ***confirmed***
1. Was the company dormant for the entire period you're filing for?
    - ***No***
1. Was your turnover £632,000 or less?  
    - ***Yes***
1. Was your balance sheet total £316,000 or less? 
    - ***Yes***
1. Did you have an average of 10 employees or fewer in the period? 
    - ***Yes***
1. What type of accounts have you prepared?
    - ***Micro Entity***
## You've started your filing
And HMRC says: `If you leave the service, your saved entries will be here when you return.`

1. Did you have any turnover from inside off-payroll working (OPW) engagements in this period?
   - ***No***
1. `AC8023` Have you prepared a directors' report?
    - ***No***
 
## First page - Profit and Loss

Name | Code this year | Value, £| Code last year | Value, £
-----|----------------|---------|----------------|---------
Turnover | `AC12` | | `AC13` | 
Other Income | `AC405` | | `AC406` | 
Cost of raw materials and consumables | `AC410` | | `AC411` | 
Staff Costs | `AC415` | | `AC416` | 
Depreciation and other amounts written off assets | `AC420` | | `AC421` | 
Other Charges | `AC425` | | `AC426` | 
Tax on Profit | `AC35` | | `AC36` | 
Profit |  | |  | 

 ![Accounts 1](./images/MicroEntityAccountsStep1.PNG)
 
 Accounts | In Xero
 ---------|--------
 AC12 | P & L
 
 
 In drummonds.net I have created a version of the
 new Profit and Loss layout that exactly matches the
 requirements of the profit and loss statement.
 
 I have a spreadsheet (Working Sheet.xlsx) that calculates the tax rate
 This then needs to be put in as a bill.
 
 - To HMRC corporation tax
-  Dated at the last day of the oprevious year
- due 9 months later
 
 1. Yes - File my profit and loss account to Companies House 
    - ***Yes***

 
 ## Second page - Balance Sheet

This is like the profit and loss.

 ![Accounts 2](./images/MicroEntityAccountsStep2BalanceSheet.PNG)

Again we can replicate this in the Balance Sheet
report in Beancount / Xero.

Name | Code this year | Value, £| Code last year | Value, £
-----|----------------|---------|----------------|---------
Called up share capital not paid  | `AC460` | | `AC461` | 
Total Fixed Assets  | `AC450` | | `AC451` | 
Total Current Assets  | `AC455` | | `AC456` | 
Prepayments and accrued income   | `AC465` | | `AC466` | 
Creditors - amounts falling due within one year   | `AC58` | | `AC59` | 
Net current assets or (liabilities)   | `AC60` *| | `AC61` *| 
Total assets less current liabilities   | `AC62`* | | `AC63` | 
Creditors - amounts falling due after more than one year   | `AC64` | | `AC65` | 
Provision for liabilities   | `AC66` | | `AC67` | 
Accruals and deferred income   | `AC470` | | `AC471` | 
Total net assets or (liabilities)   | `AC68`*| | `AC69`* |
Capital and reserves     | `AC490` | | `AC491` |
\* Items are calculated

## Employee information

1.What was the average number of employees of your company during the period?
Number eg 0 or 1
1.Off balance sheet disclosure
    - ***No***

## Tracking progress
Once you have completed the first stage eg the profit and loss statement then you 
get more information about what you have completed and the ability to go back and edit parts.

[Progress](!b324ea0f.png)

