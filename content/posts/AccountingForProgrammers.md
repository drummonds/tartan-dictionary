---
title: "Accounting for Programmers"
date: "2016-10-30"
categories: ["Humphrey"]
tags: ["Humphrey"]
slug: "AccountingForProgrammers"
author: "Humphrey Drummond"
summary: "An introduction to accounting for programmers."
---
# Accounting for Programmers


This is a book to introduce the concepts of accounting o programmers.  It is born of my own exploration into the subject.  It take a somewhat different approach to most books in that we will be looking at accounting

Structure
- The PiggyBank
- Time series data
- Historical and current  state
- Single Entry and Double entry accounting
- Petty cash accounting
- The trial balance (and the accounting equation)
- Reporting for Taxes
- Reporting for maanagement info
- Stock
- Invoicing
- Free and commercial software packages

The PiggyBank
Intro
When you are looking at an accounting system it usually applies to a specific entity.  This is the bounds of the system.  So often this is a limited or public company.  This can range from the smallest micro company to the largest quoted company eg Google or Exxon.
- Summerian
- Restrictions
The piggy bank is the simplest model of an accounting system you have a single box into which you can put money in or take money out.  At any one point in time there is so much money in the piggy.
You could imagine a business selling oranges on the street and supposing you are able to get oranges on a sale or return basis from friendly green grocers.  At the beginning of the day you borrow a box of oranges and go out onto the street.  During the day you sell your oranges and put the money in the piggy bank. You sell your oranges and at the end of the day your return to your friendly green grocers.  You return the unsold oranges, pay the green grocer.  The money left over in your piggy bank at the end of the day is your profit.
There is also a limitation in that you only have the cuurent value of the profit and there is not historical record.  If this was a virtual poggy bank you would have no record of what you had made in a week month or a year.  This leads onto time series data.
Time Series Data
When you measure something at some point in time the measurement can be of a number of  different types.  A stock will have a price every day.  If you want to know the price for a time period you might either choose the end of the period, (closing price on Friday which is simple to measure) or the average price (a more robust measurement but more difficult to measure).  Over a longer period you can average the data or pick a single point to represent it.
There is another type of data period which is more cummulative.  An example might be world CO2 emissions.  Over a period of time you emit a certain amount of CO2.  At a constant rate if you double the period you emit twice as much.  So to aggregate over a longer period you sum the amounts over a shorter period.
In accounting you have the same type of differences.  So the amount of money in a bank account, an asset, is a point in time data point.  I don’t have 52 times as much money in the bank in a year that I do in a week.   However the amount of profit I make is exactly that.  To work out the profit for a year I would addup the profit (or loss) I made for each week.
In fact the two main financial summaries that are produced, the profit and loss is a period and the balance sheet is mostly point in time data.
Single Entry and Double entry accounting systems
Single entry accounting systems represent each fact with a single entry.  This is the simplest method and actually corresponds to the common Python metaphor of DRY “Don’t Repeat Yourself”.  The downside of this is that you have no additional information to check that what you have entered is correct.  For very simple systems this can be ok.  Often you can actually get a check by verifying the information to another source.  So very simple accounting systems that are essentially driven from bank statements – the bank statement provides redundancy.
In computer terms old serial sytems used to transmit bytes with parity.  The parity bit was an additional bit added to each byte so that the number of bits that were one was either odd or even.  This additional information gave you information that the information was correct.
Petty Cash Accounting
Trial Balance
A trial balance is a critical accounting output from a set of accounts. It is a named vector of account balances that in total should add up to zero.  In a manual set of accounts it was a trial balance as you would test to see that they did add up to zero before going on to the next stage of accounts preparation.  A simple mathematical manipulation will map a trial balance to a profit and loss statement and to a balance sheet.

The profit and loss data is all for a period and all the trial balance data is point in time data of the balance sheet at the end of the period except for the retained profit figure.  The retained profit figure  is an owners equity figure which appears on the balance sheet.
Invoicing
When you invoice you create an entry against a debtors control account to indicate that your customer owes you money until they pay.  The debtors control account is cleared when money is transferred into your bank account.

Stock
In a simple buiness all the stock is represented in a single account.  At the end of the accounting period the stock is revalued and the difference beween the beginning plus the purchases and end valuations is then  cost of goods sold.
In a more elaborate stock taking system the value of each stock item will be measured in real time.

Free and Commerical packages
This is an eclectic list and is just those which I have been familiar with.

Gnucash
I have used this both directly and va piecash.  Piecash is a very nice SQLAlchemy based ORM which hides many of the idyosyncracies of GnuCash.  From a database point of view the problem is that the dataase definition has been frozen for a while and all the changes have been done by adding key value pairs in a generic KVP data.
Sage line 50
This has an OBC connection although it is 32bits.

Beancount
I don’t know a lot about this
