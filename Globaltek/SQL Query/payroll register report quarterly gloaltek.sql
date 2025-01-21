
 SELECT Z0.`EMPLOYEE ID` 
   ,Z0.`EMPLOYEE NAME` 
   ,ROUND(Z0.`PRESENT DAYS`, 2) AS 'PRESENT DAYS' 
   ,Z0.`ALLOWANCE`
   #dispute
   #5k sign in bonus
   #attendance allowance
   ,Z0.`BASIC PAY`
   #cloathing Allowance
   #double holiday
   #employee appreciation gift
   #intake incentives
   #laundry allowance
   #leave conversion
   #leave encashment
   #legal holiday
   #daily meal allowance
   #night differential
   #other supplementary
   ,Z0.`OT`
   #packet bonus
   #QA incentives
   #rice allowance
   ,Z0.`REST DAY OT`
   #referal incentives
   #regular work
   #support award
   ,Z0.`ABSENT` 
   ,Z0.`LATE` 
   ,Z0.`UNDERTIME`
   ,Z0.`REST DAY_SPECIAL HOL.`
   ,Z0.`LEGAL SUN_REG. OT amount`
   ,Z0.`RESTDAYOTonSPECIALHOL.`
   
   ,Z0.`TOTAL INCOME`
   ,Z0.`TOTAL DEDUCTION`
   ,Z0.`TOTAL PAYROLL` 

 FROM 
 (SELECT T0.name AS 'EMPLOYEE ID' 
      ,T0.full_name AS 'EMPLOYEE NAME' 
      ,T3.present_days AS 'PRESENT DAYS' 
      ,SUM(CASE WHEN T4.entry_type = 'Allowance' THEN T4.amount ELSE 0.00 END) AS 'ALLOWANCE'
      ,SUM(CASE WHEN T4.pay_code = 'ND' THEN T4.amount ELSE 0.00 END) AS 'ND'
     	,SUM(CASE WHEN T4.pay_code = 'Ordinary_Overtime' THEN T4.amount ELSE 0.00 END) AS 'OT' 
     	
     	,SUM(CASE WHEN T4.pay_code = 'Special_Holiday_OT' THEN T4.amount ELSE 0.00 END) AS 'REST DAY_SPECIAL HOL.' 
     	,SUM(CASE WHEN T4.pay_code = 'Rest_Day_OT' THEN T4.amount ELSE 0.00 END) AS 'REST DAY OT'
     	,SUM(CASE WHEN T4.pay_code = 'Legal_Holiday_on_RD_OT_Excess' THEN T4.amount ELSE 0.00 END) AS 'LEGAL SUN_REG. OT amount'
     	
     	,SUM(CASE WHEN T4.pay_code = 'Special_Holiday_on_RD_OT_Excess' THEN T4.pay_time ELSE 0.00 END) AS 'RESTDAYOTonSPECIALHOL.' 
     	,SUM(CASE WHEN T4.pay_code = 'CTO' THEN T4.amount ELSE 0.00 END) AS 'CTO' 
     	,T3.govt_basic AS 'BASIC PAY' 
     	
     	     ,T3.total_income AS 'TOTAL INCOME' 
     ,T3.total_deduction AS 'TOTAL DEDUCTION' 
     ,SUM(CASE WHEN T4.pay_code = 'AT' THEN T4.amount ELSE 0.00 END) AS 'ABSENT' 
     ,SUM(CASE WHEN T4.pay_code = 'OTD' THEN T4.amount ELSE 0.00 END) AS 'OVERTIME DEDUCTION' 
     ,SUM(CASE WHEN T4.pay_code = 'LT' THEN T4.amount ELSE 0.00 END) AS 'LATE' 
     ,SUM(CASE WHEN T4.pay_code = 'UT' THEN T4.amount ELSE 0.00 END) AS 'UNDERTIME' 
     ,SUM(CASE WHEN T4.pay_code = 'SSS' THEN T4.amount ELSE 0.00 END) AS 'SSS PREMIUM' 
     ,SUM(CASE WHEN T4.pay_code = 'PHIC' THEN T4.amount ELSE 0.00 END) AS 'PHILHEALTH' 
     ,SUM(CASE WHEN T4.pay_code = 'HDMF' THEN T4.amount ELSE 0.00 END) AS 'PAG-IBIG CONTRI' 
     ,SUM(CASE WHEN T4.pay_code = 'HDMFCL' THEN T4.amount ELSE 0.00 END) AS 'PAGIBIG CALAMITY LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'HDMFL' THEN T4.amount ELSE 0.00 END) AS 'PAGIBIG LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'CL' THEN T4.amount ELSE 0.00 END) AS 'COMPANY  LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'VALE' THEN T4.amount ELSE 0.00 END) AS 'COMPANY VALE' 
     ,SUM(CASE WHEN T4.pay_code = 'SSSL' THEN T4.amount ELSE 0.00 END) AS 'SSS LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'SSSCL' THEN T4.amount ELSE 0.00 END) AS 'SSS CALAMITY LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'WHTAX' THEN T4.amount ELSE 0.00 END) AS 'WITHHOLDING TAX' 
     ,SUM(CASE WHEN T4.pay_code = 'Tax Payable' THEN T4.amount ELSE 0.00 END) AS 'Tax Payable' 
     ,SUM(CASE WHEN T4.pay_code = 'CBS LOAN' THEN T4.amount ELSE 0.00 END) AS 'CBS LOAN' 
     ,SUM(CASE WHEN T4.pay_code = 'CBS SAVINGS' THEN T4.amount ELSE 0.00 END) AS 'CBS SAVINGS' 
     ,SUM(CASE WHEN T4.pay_code = 'mobile phone gadget' THEN T4.amount ELSE 0.00 END) AS 'MOBILE PHONE GADGET' 
     ,SUM(CASE WHEN T4.pay_code = 'Communication Expense' THEN T4.amount ELSE 0.00 END) AS 'COMMUNICATION EXPENSE (CA)' 
     ,SUM(CASE WHEN T4.pay_code = 'CA' THEN T4.amount ELSE 0.00 END) AS 'CASH ADVANCE' 
     ,SUM(CASE WHEN T4.pay_code = 'CL' THEN T4.amount ELSE 0.00 END) AS 'COMPANY LOAN' 
    	,T3.net_payroll AS 'TOTAL PAYROLL'

 FROM `tabPayroll Period` T2 
 INNER JOIN `tabPayroll Register` T3 ON T3.period = T2.name 
 LEFT JOIN `tabPayroll Register Entries` T4 ON T3.name = T4.parent 
 LEFT JOIN `tabEmployee` T0 ON T3.employee = T0.name 
 LEFT JOIN `tabBank Setup Table` T5 ON T5.parent = T0.name AND T5.account_type = 'Primary' 
 WHERE T2.name = 'Aug16 Aug31 - GPC2024'  
 GROUP BY T0.name 
 ORDER BY T0.full_name) Z0 
