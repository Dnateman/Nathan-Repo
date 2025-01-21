SQLQuery = "Select payrollreports.* FROM(" & vbNewLine
SQLQuery = SQLQuery & "SELECT pay_data.*" & vbNewLine
SQLQuery = SQLQuery & "FROM (" & vbNewLine
SQLQuery = SQLQuery & "    SELECT" & vbNewLine
SQLQuery = SQLQuery & "        payperiod.name AS `Payroll Period`," & vbNewLine
SQLQuery = SQLQuery & "        CASE" & vbNewLine
SQLQuery = SQLQuery & "            WHEN payregs_entries.pay_code IN ('BS', 'UT', 'LT', 'SA-ADJ-I', 'Double_Holiday_OT', 'Special_Holiday_OT') THEN '1. Salary'" & vbNewLine
SQLQuery = SQLQuery & "            WHEN payregs_entries.pay_code IN ('OT', 'Rest_Day_OT', 'ND', 'Rest_Day_ND_OT') THEN '2. Overtime'" & vbNewLine
SQLQuery = SQLQuery & "            WHEN payregs_entries.pay_code IN ('SA', 'HA', 'Cola', 'COM.ALLOW', 'OS', 'TA', 'MA', 'V ALLOWANCE', 'PA') THEN '3. Allowance'" & vbNewLine
SQLQuery = SQLQuery & "            WHEN payregs_entries.pay_code IN ('13TH_BONUS', 'SSSE', 'PHICE', 'HDMFE', 'SALLOAN', 'SCL', 'HDMFL', 'HCL', 'WHTAX', 'CA', 'ID', 'Coop', 'SDS', 'MC', 'HMO', 'SSS', 'PHIC', 'HDMF') THEN '5. Net Pay'" & vbNewLine
SQLQuery = SQLQuery & "        END AS `Group`," & vbNewLine
SQLQuery = SQLQuery & "        IFNULL(dept.cost_center, '') AS `Cost Center`," & vbNewLine
SQLQuery = SQLQuery & "        cost_center.cost_center `Cost Center Code`," & vbNewLine
SQLQuery = SQLQuery & "        dept.name AS `Department`," & vbNewLine
SQLQuery = SQLQuery & "        emps.branch AS `Branch`," & vbNewLine
SQLQuery = SQLQuery & "        IFNULL(accs.account_number, '') AS `GL`," & vbNewLine
SQLQuery = SQLQuery & "        payregs_entries.pay_type AS `Pay Type`," & vbNewLine
SQLQuery = SQLQuery & "        payregs_entries.pay_code AS `Transaction Type`," & vbNewLine
SQLQuery = SQLQuery & "        payregs_entries.pay_description AS `Description`," & vbNewLine
SQLQuery = SQLQuery & "        SUM(payregs_entries.amount) AS `Amount`," & vbNewLine
SQLQuery = SQLQuery & "        emps.mode_of_payment `Mode`" & vbNewLine
SQLQuery = SQLQuery & "    FROM `tabUser Permission` userperm " & vbNewLine
SQLQuery = SQLQuery & "        INNER JOIN `tabEmployee` emps ON userperm.for_value = emps.sensitivity" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabCost Center` cost_center ON emps.cost_center = cost_center.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabPayroll Register` payregs ON emps.name = payregs.employee" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabPayroll Period` payperiod ON payregs.period = payperiod.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabPayroll Register Entries` payregs_entries ON payregs.name = payregs_entries.parent" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabCompany` company ON emps.company = company.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabDepartment` dept ON emps.department = dept.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabBranch List` branch ON emps.branch = branch.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabTransaction Type` transac_type ON payregs_entries.pay_code = transac_type.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabTransaction Type Accounts` transac_accs ON transac_type.name = transac_accs.parent" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabAccount` accs ON (transac_accs.debit_account = accs.name OR transac_accs.credit_account = accs.name)" & vbNewLine
SQLQuery = SQLQuery & "        " & vbNewLine
SQLQuery = SQLQuery & "    WHERE" & vbNewLine
SQLQuery = SQLQuery & "        emps.company = payperiod.company " & vbNewLine
SQLQuery = SQLQuery & "       # AND emps.sensitivity IN ('LOW', 'MEDIUM')" & vbNewLine
SQLQuery = SQLQuery & "       AND userperm.user = 'nerissa.segovia@chgglobal.com.ph' " & vbNewLine
SQLQuery = SQLQuery & "       AND userperm.allow = 'Sensitivity Level'" & vbNewLine
SQLQuery = SQLQuery & "    GROUP BY" & vbNewLine
SQLQuery = SQLQuery & "        payregs.period," & vbNewLine
SQLQuery = SQLQuery & "        payregs_entries.pay_code," & vbNewLine
SQLQuery = SQLQuery & "        dept.name" & vbNewLine
SQLQuery = SQLQuery & ") AS pay_data" & vbNewLine

SQLQuery = SQLQuery & "UNION ALL" & vbNewLine

SQLQuery = SQLQuery & "SELECT leave_data.*" & vbNewLine
SQLQuery = SQLQuery & "FROM (" & vbNewLine
SQLQuery = SQLQuery & "    SELECT" & vbNewLine
SQLQuery = SQLQuery & "        T2.name AS `Payroll Cut Off`," & vbNewLine
SQLQuery = SQLQuery & "        '4. Leave' AS `Group`," & vbNewLine
SQLQuery = SQLQuery & "        ifnull(T3.cost_center, '') AS `Cost Center`," & vbNewLine
SQLQuery = SQLQuery & "        cost_center.cost_center `Cost Center Code`," & vbNewLine
SQLQuery = SQLQuery & "        T3.name AS `Department`," & vbNewLine
SQLQuery = SQLQuery & "        T0.branch AS `Branch`," & vbNewLine
SQLQuery = SQLQuery & "        '' AS `GL`," & vbNewLine
SQLQuery = SQLQuery & "        IF(T6.leave_code IN ('VL', 'BL', 'SPL', 'PL', 'Bereavement_Leave', 'SL'), 'Paid Leave', 'Unpaid Leave') AS `Pay Type`," & vbNewLine
SQLQuery = SQLQuery & "        T6.name AS `Leave Type`," & vbNewLine
SQLQuery = SQLQuery & "        T6.leave_code AS `Code`," & vbNewLine
SQLQuery = SQLQuery & "        SUM(" & vbNewLine
SQLQuery = SQLQuery & "            CASE" & vbNewLine
SQLQuery = SQLQuery & "                WHEN T0.rate_type = 'Monthly Rate' THEN ((T0.rate / T0.total_yr_days) * 12) * CASE WHEN T1.lv_status > 1 THEN 0.5 ELSE 1 END" & vbNewLine
SQLQuery = SQLQuery & "                WHEN T0.rate_type = 'Daily Rate' THEN T0.rate * CASE WHEN T1.lv_status > 1 THEN 0.5 ELSE 1 END" & vbNewLine
SQLQuery = SQLQuery & "                WHEN T0.rate_type = 'Hourly Rate' THEN ((T0.rate * T0.no_hours) * CASE WHEN T1.lv_status > 1 THEN 0.5 ELSE 1 END)" & vbNewLine
SQLQuery = SQLQuery & "                ELSE 0" & vbNewLine
SQLQuery = SQLQuery & "            END" & vbNewLine
SQLQuery = SQLQuery & "        ) AS `Amount`," & vbNewLine
SQLQuery = SQLQuery & "       T0.mode_of_payment `Mode`" & vbNewLine
SQLQuery = SQLQuery & "    FROM `tabUser Permission` userperm" & vbNewLine
SQLQuery = SQLQuery & "        Inner JOIN `tabEmployee` T0 ON userperm.for_value = T0.sensitivity " & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabCost Center` cost_center ON T0.cost_center = cost_center.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabAttendance Register` T1 ON T0.name = T1.employee" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabPayroll Period` T2 ON T1.target_date BETWEEN T2.attendance_from AND T2.attendance_to" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabBranch List` T5 ON T0.branch = T5.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabDepartment` T3 ON T0.department = T3.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabLeave Application` T4 ON T1.linked_leave = T4.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabLeave Type` T6 ON T4.leave_type = T6.name" & vbNewLine
SQLQuery = SQLQuery & "        LEFT JOIN `tabCompany` T7 ON T0.company = T7.name" & vbNewLine
SQLQuery = SQLQuery & "         " & vbNewLine
SQLQuery = SQLQuery & "    WHERE" & vbNewLine
SQLQuery = SQLQuery & "        T0.company = T2.company" & vbNewLine
SQLQuery = SQLQuery & "        #AND T0.sensitivity IN ('LOW', 'MEDIUM')" & vbNewLine
SQLQuery = SQLQuery & "        AND userperm.user = 'nerissa.segovia@chgglobal.com.ph' " & vbNewLine
SQLQuery = SQLQuery & "        AND userperm.allow = 'Sensitivity Level'" & vbNewLine
SQLQuery = SQLQuery & "        AND T6.leave_code IN ('VL', 'BL', 'SPL', 'PL', 'Bereavement_Leave', 'SL')" & vbNewLine
SQLQuery = SQLQuery & "    GROUP BY" & vbNewLine
SQLQuery = SQLQuery & "        T2.name," & vbNewLine
SQLQuery = SQLQuery & "        T3.name," & vbNewLine
SQLQuery = SQLQuery & "        T6.leave_code" & vbNewLine
SQLQuery = SQLQuery & ") AS leave_data ) payrollreports" & vbNewLine
SQLQuery = SQLQuery & "    " & vbNewLine
SQLQuery = SQLQuery & "    WHERE payrollreports.`Payroll Period` = '" & ComboBox1.Text & "'" & vbNewLine
SQLQuery = SQLQuery & "    AND payrollreports.`Mode` = 'Bank'" & vbNewLine
SQLQuery = SQLQuery & "    AND payrollreports.`Group` IS NOT NULL " & vbNewLine
SQLQuery = SQLQuery & "    " & vbNewLine
SQLQuery = SQLQuery & "    " & vbNewLine
SQLQuery = SQLQuery & "ORDER BY payrollreports.`Group`, payrollreports.`Department`" & vbNewLine
