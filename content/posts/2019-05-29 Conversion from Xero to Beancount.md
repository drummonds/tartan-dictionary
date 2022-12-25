---
title: "Converting from Xero to Beancount"
date: "2019-10-28"
---
<button type="button" class="buttonStyle1" onclick="location.href='/xero-to-beancount.html'" title="External page for Xero to Beancount journey">Xero->Beancount</button> 

# Converting from Xero to Beancount

This is about the journed of converting from Xero to Beancount.  This version is a scrappy version written for me.
The reason is cost,  I need to reduce my costs to the absolute limit and can no longer afford the ca£45 for the monthly
fee.


# Plan

- Install Beancount
- Repeat the following a few times until it works well
    - Export Data from Xero, CSV
    - Massage
    - Convert to Beancount

success criteria
- Make sure can product Trial Balance that agrees with Xero for end of year
- Make sure can do reports for year end accounts
- Make sure can import Barclays statements **DONE**


# Drummonds.net Overview

7 Apr 2015 to 31st May 2019

# Pumba



# Log Day 0
## Installation of beancount
Cloned and used a new virtualenv, building.  Going to run test suite.
**OOps** no test 

## 2019-06-05
xbrl and balance sheets

Although the maths is handled by beancount, I don't get a prettily formatted balance sheet report.  I want to verify 
gainst
my filed xbrl at companies house but don't have a way of doing balance sheet/ ledger arithmetic.  Reading this from 
David Kane on xbrl https://dkane.net//2018/working-with-xbrl/ .

A bit worried that I have actually solved this problem myself but it isn't out there from someone else.


## 2019-06-06
Multi currency transactions

https://www.mscs.dal.ca/~selinger/accounting/tutorial.html

Working on dealing with Euro transactions.
Also need to have better importing - using customer names where they are available

Look into using bean-price to get EUR/GBP pricing


## 2019-06-12
Import of transactions is going well.  Year end reporting is trickier.  I have two slightly interlinked issues:

- Should I create an end of year journal?
- Can I create reports that produce accounting results.

## 2019-06-24
In order to simplify the code for converting the accounting transaction history, I have been trying to merge the 
general ledger export which contains reversed transactions.  However it looks as though it is going to be tricky as
some reversed transactions are real and others are not.  I think a certain amount of manual input is going to be 
necessary so might as well do that on the conversion of the accounting transaction history.

The lesson is that there is some unavoidable hand editing of the file.  So I am going to make the code simpler
eg removing the requirment to singulate by making all unique description or reference fields hold.  This is feeling
much better.

## 2019-07-09
Getting ?

## 2019-10-29
Starting up again as need to Pumbas end of year accounts in two days.  I have lost a piece of code which used
beancount to import a file.

Managed to do Pumbas accounts.

## 2019-12-17
Started in earnest again for drummonds.net.  Now the best record of account is beancount. (18th)  have reconciled
bank accounts.


### Year End Journal - Probably a bad idea
I original thought I should put one in - although not sure how it will affect year end reporting.  I want to put in
checks at year end that the balances are correct.  I suppose there is no reason to put the actual balance sheet entries
I can just put in a Trial Balance check point.  This is a longer but allows other figures to run over years.

### Year end reports
I have been avoiding this but it is in Xero and the data I am getting from Fava is ok but needs more handling.
Also there are multiple reports to run which you need for one year end.

#### Precision of GBP (Fixed 2019-06-12)
By default the GBP seems to be doing precision to 1 decimal place, see extract from options in Fava:   
`dcontext    GBP             : sign=1   integer_max=5   fractional_common=1   fractional_max=2   "-00000.0" "-00000.00"`
This is leading to errors in reports.  This is inferred from the input.  By formatting the numbers to two significant
figues the right results in fava were found.

# Terminology

I am just looking at the terminology around books of accounts, ledgers and journal entries.

## General and Xero

- **[Ledger]** Book or file for recording economic transactions.
- **Manual Journal** This is an entry in the ledger.

[Ledger]: https://en.wikipedia.org/wiki/Ledger

## Beancount
Martin Blais documents his terminology in his [design document].

- **Ledger file**  A collection of transactions. Note: this differs from a traditional ledger in that all transactions
can be placed in it rather than sorted by account.
- **Transaction** these are journal entries and must balance to zero in each currency/commodity.  This balancing is the 
core of the double entry system.  Since each transaction balances then a collection of them must also balance.
- **Journal entry** see *Transaction*
- **Posting** or Each transaction is composed of muliple postings or legs.
- **Leg** see *posting*

[design document]: https://docs.google.com/document/d/1N7HDXuNWgLG2PqFS4Kkgv5LzAAtU6c97UVNT7tdTIjA/edit#heading=h.eel82eoz8myj

# Xero Document for exporting data:

## Overview

Export data and reports from individual areas in Xero to keep as an external backup 
or to import into another product.


## How it works

You can export certain data in a CSV format and most Xero reports in a spreadsheet or PDF format.

There isn’t a one-step feature to copy all of an organisation's data. You can however export data from individual 
areas of Xero and reports from our report centre. You might want to do this if you're cancelling your subscription, 
or if you want to keep your own external backup.

Your user role determines the data you can export. The adviser user role lets you run most exports, but you’ll 
need payroll admin access for payroll reports.

### Data and reports you can export

Before you stop using Xero, or if you want to back up your data, we recommend you export your chart of accounts, contacts, invoices and bills, general ledger data and fixed asset list.

We also recommend you export these reports:

- Balance Sheet (New) for each year
- Profit and Loss (New) for each year
- Trial Balance (New) including past periods
- Account Transactions report (New) for a list of all transactions
- Receivable Invoice Detail report (New) for details of invoices, credit notes, overpayments and prepayments
- Payable Invoice Detail report (New) for details of bills, credit notes, overpayments and prepayments
- VAT returns for each filed return period
- Payroll Activity Details report run for each year
- Fixed Asset Reconciliation (New) to show your asset and depreciation detail for each year
- Inventory Item List report (New) for item detail and transactions
- Bank reconciliation report to show reconciled bank transactions


Also need to export files


If you use multicurrency, we also suggest you export the older version of the reports, such as the Detailed Account 
Transactions report, that show the foreign currency detail.

Export items out of Xero in these file formats
Items you can export	How to	Export file format
 	 	CSV/
XLS	Google Sheets	MYE	Various	PDF	TXT/
XML
Batch payments	Export a batch file	 	 	 	✔	 	 
Budget	Export budget	✔	✔	 	 	 	 
Chart of accounts	Export COA	✔	 	 	 	 	 
Contacts	Export contacts	✔	 	 	 	 	 
Fixed assets	Export fixed assets	✔	 	 	 	 	 
GL data	Export GL data	✔	 	✔	 	 	✔
Inventory items	Export inventory items	✔	 	 	 	✔	 
Invoices and bills	Export invoices and bills	✔	 	 	 	 	 
Reports	Export reports	✔	✔	 	 	✔	 
Export formats for other accounting products

If you have the adviser user role, you can export the general ledger, chart of accounts, and trial balance data to 
import into other accounting products.

    In the Accounting menu, select Advanced, then click Export accounting data.
    Under Select product, select the product you want to import the data into.
    Select the date range to export.
    Click Download for each document you want to export. The file is saved to the downloads folder on your computer.


# Xero export detailed instructions

# Account transactions report
You are going to select all codes and all dates.
This needs to be customised to extract all the data (open report settings and click all columns and FX columns (group by
account is ok as will be resorted anyway))
