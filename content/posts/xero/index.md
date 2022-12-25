---
title: "Xero Accounting Tips"
date: "2018-03-10"
---
# Directors loan

## Directors loan Pay money in.

The standard directors loan account is NC 835.  This can be marked
so that you can `Enable payments to this account`

When you pay money into the company for working capital.

### From other source
Set up a liability account in Xero. Code the 600 pounds to this account
and the monthly payments. You then need to do a journal Debit equipment
purchases and Credit the liability account. You may need to consider
interest on the loan - not sure how your tax laws work, would be worth discussing with your accountant.

# Client Account

This is very similar to a directors loan.  However it is where Company A, the parent,
holds money on account in bare trust for another eg Company B.


The important point is that every transaction in the nominal code in A
should have an equal transaction in company B.  This is a bit of a pain to enter manually.

## Reconciliation
This is currently manual - just do an Account Transactions report for the nominal code in each company.  The final
balance should be the same.

## Receiving money

When money is received this is a current liability for drummonds.net as this is money which is payable on demand.  This
is modelled in Xero as a current liability account. eg:


Nominal Code| Company    | Type
------------|------------|------------
110         | Drummonds  | Current Liability
110         | Pumba      | Bank account, Current asset


The transactions are like this:

Company | Details | Transaction
--------|---------|------------
Drummonds | Receive money for account Client A/C eg NC 110 from X|
Pumba | Receive money from X |

### Step by Step

- Snip the image of the receipt for storage
- Receipt of money to parent (click on plus sign &#8594; Receive Money). This needs to coded to the correct nominal code.
    - Current account
    - Received as Direct Payment
    - Name Pumba Client account
    - N/C 110
    - Description eg Receipt from SARL
- Receipt of money to client
    
#### Receipt of money to parent

So in Drummonds you will have a bank reconciliation entry for money received:
[Money Received](Money received.png)

which will end up:

[Transaction Receive Money](2018-02-24TransactionReceiveMoney.png)

Type                 | NC | Value before  | Value After
---------------------|----|---------------|------------
Pumba Client account | Record | 0.0 | Marked as Due 
Pumba Client         |110| 1,475.36 | 3,093.98 | Marked as Due
P&L                  | PBT | 9,708| 9,708
BS                   | Net Assets | 18,104 | 18,104

#### Receipt of money to client
Goto invoice and mark as paid.  Any overpayment will turn up as an overpayment.  Which will need to be written off.
If paying a number of deposits mark as an overpayment to the account and then pay off each invoice.


## Paying fees by client account
Eg Pumba.

- login in to Pumba
- Go to unpaid invoice
# Importing Banking statements by hand into Xero

This saves £36 per account per year.

Xero has an import feature which accepts OFX, QIF or CSV
file formats.

Barclays Bank has an export feature which exports
in the following formats:

Barclays Description  | Downloaded file format
----------------------|-----------------------
Clearlybookkeeping / Quickbooks 2005 | .qbo
Microsoft Money 98    | .ofx
Microsoft Money 99    | .ofx
Microsoft Money 2000  | .ofx
Microsoft Money 2001  | .ofx
Microsoft Money 2002  | .ofx
Sage Line 50          | .ofx
Spreadsheet           | .csv

All the .ofx file formats are the same (tested on a single download)

## Barclays Website download entry points
Once the account is up there are two entry points

- Export all button above list of transactions (exports only the range)
- Manage accounts -> Export my transaction data


## Barclays moving sort codes

You need to be very careful.

20-67-83 70501123 can export data from 16/01/2018 to 06/04/2018.   
20-67-59 70501123 has been moved and the export is not working


## Importing data
If the account code has changed then the duplicate account code prevention
doesn't work.

# Drummonds.net client invoicing

## Pumba

This is set up as an auto invoicing in Drummonds.net
They also auto appear in Pumba (but not matched to invoices)

## In Pumba:

- Click on each bill
- Make date paid date of invoice
- paid from 110 Drummonds.net trust account 
- no Ref
- Click Add Payment
- **After all bill paid** go to bank statement
- reconcile each one in turn 
    - right click open in new tab
    - use option mark as reconciled
    - close tab (all at end)


## In drummonds.net

- find invoice in Awaiting payment and click on each one
- Make date paid date of invoice
- paid from 110 pumba client account 
- no Ref
- Click Add Payment






