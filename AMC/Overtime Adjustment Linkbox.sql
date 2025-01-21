SELECT Z0.`Employee ID`
    , Z0.`Employee Name`
    , CAST(IF(SUM(Z0.`REG DAY OT`) < .5, 0, SUM(Z0.`REG DAY OT`)) AS DECIMAL(19,2)) 'REG DAY OT'
    , CAST(IF(SUM(Z0.`REST DAY OT 1st 8 Hrs`) < .5, 0, SUM(Z0.`REST DAY OT 1st 8 Hrs`)) AS DECIMAL(19,2)) 'REST DAY OT 1st 8 Hrs'
    , CAST(IF(SUM(Z0.`REST DAY OT OVER`) < .5, 0, SUM(Z0.`REST DAY OT OVER`)) AS DECIMAL(19,2)) 'REST DAY OT OVER'
    , CAST(IF(SUM(Z0.`SPECIAL HOLIDAY OT 1st 8 Hrs`) < .5, 0, SUM(Z0.`SPECIAL HOLIDAY OT 1st 8 Hrs`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY OT 1st 8 Hrs'
    , CAST(IF(SUM(Z0.`SPECIAL HOLIDAY OT OVER`) < .5, 0, SUM(Z0.`SPECIAL HOLIDAY OT OVER`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY OT OVER'
    , CAST(IF(SUM(Z0.`SPECIAL HOLIDAY & RD OT 1st 8 Hrs`) < .5, 0, SUM(Z0.`SPECIAL HOLIDAY & RD OT 1st 8 Hrs`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY & RD OT 1st 8 Hrs'
    , CAST(IF(SUM(Z0.`SPECIAL HOLIDAY & RD OT OVER`) <.5, 0, SUM(Z0.`SPECIAL HOLIDAY & RD OT OVER`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY & RD OT OVER'
    , CAST(IF(SUM(Z0.`REGULAR HOLIDAY OT 1st 8 Hrs`) <.5, 0, SUM(Z0.`REGULAR HOLIDAY OT 1st 8 Hrs`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY OT 1st 8 Hrs'
    , CAST(IF(SUM(Z0.`REGULAR HOLIDAY OT OVER`) < .5, 0, SUM(Z0.`REGULAR HOLIDAY OT OVER`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY OT OVER'
    , CAST(IF(SUM(Z0.`REGULAR HOLIDAY & RD OT 1st 8 Hrs`) < .5, 0, SUM(Z0.`REGULAR HOLIDAY & RD OT 1st 8 Hrs`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY & RD OT 1st 8 Hrs'
    , CAST(IF(SUM(Z0.`REGULAR HOLIDAY & RD OT OVER`) < .5, 0, SUM(Z0.`REGULAR HOLIDAY & RD OT OVER`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY & RD OT OVER'

    , CAST(IF(Z0.lt_nd = 0, 0, (SELECT SUM(X0.latenightdiff)
    FROM `tabAttendance Adjustment Register` X0 
    WHERE X0.target_date BETWEEN (SELECT X0.attendance_from FROM `tabPayroll Period` X0 WHERE X0.name = 'Sep26 Oct10 - AMC2024')
    AND (SELECT X0.attendance_to FROM `tabPayroll Period` X0 WHERE X0.name = 'Sep26 Oct10 - AMC2024')
    AND X0.employee = Z0.`Employee ID`)) AS DECIMAL(19,2)) 'ORDINARY ND TYPE 1'

    , CAST(IF(Z0.early_nd = 0, 0, (SELECT SUM(X0.earlynightdiff)
    FROM `tabAttendance Adjustment Register` X0 
    WHERE X0.target_date BETWEEN (SELECT X0.attendance_from FROM `tabPayroll Period` X0 WHERE X0.name = 'Sep26 Oct10 - AMC2024')
    AND (SELECT X0.attendance_to FROM `tabPayroll Period` X0 WHERE X0.name = 'Sep26 Oct10 - AMC2024')
    AND X0.employee = Z0.`Employee ID`)) AS DECIMAL(19,2)) 'ORDINARY ND TYPE 2'

    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`REGULAR ND TYPE 1`)) AS DECIMAL(19,2)) 'REGULAR ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`REGULAR ND TYPE 2`)) AS DECIMAL(19,2)) 'REGULAR ND TYPE 2'
    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`REST DAY ND TYPE 1`)) AS DECIMAL(19,2)) 'REST DAY ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`REST DAY ND TYPE 2`)) AS DECIMAL(19,2)) 'REST DAY ND TYPE 2'
    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`SPECIAL HOLIDAY ND TYPE 1`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`SPECIAL HOLIDAY ND TYPE 2`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY ND TYPE 2'
    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`SPECIAL HOLIDAY & RD ND TYPE 1`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY & RD ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`SPECIAL HOLIDAY & RD ND TYPE 2`)) AS DECIMAL(19,2)) 'SPECIAL HOLIDAY & RD ND TYPE 2'
    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`REGULAR HOLIDAY ND TYPE 1`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`REGULAR HOLIDAY ND TYPE 2`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY ND TYPE 2'
    , CAST(IF(Z0.lt_nd = 0, 0, SUM(Z0.`REGULAR HOLIDAY & RD ND TYPE 1`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY & RD ND TYPE 1'
    , CAST(IF(Z0.early_nd = 0, 0, SUM(Z0.`REGULAR HOLIDAY & RD ND TYPE 2`)) AS DECIMAL(19,2)) 'REGULAR HOLIDAY & RD ND TYPE 2'
    , Z0.`HAZARD PAY PER DAY`
    , Z0.`HAZARD PAY PER HOUR`
    , Z0.`REMARKS`
    #MAIN QUERY
    FROM (
    SELECT T2.name 'Employee ID'
    , T2.full_name 'Employee Name'
    , T2A.rate_class
    , T2A.early_nd
    , T2A.lt_nd
    , T1.ot_name 'Overtime Name'
    , SUM(T0.hrs) 'Hours'
    , SUM(T0.early_nd) 'END'
    , SUM(T0.late_nd) 'LND'
    , CASE WHEN T1.ot_name IN ('Ordinary Overtime','Ordinary Overtime Sat', 'Ordinary Overtime Sun', 'Ordinary Overtime Excess', 'Ordinary Overtime Sat Excess', 'Ordinary Overtime Sun Excess')
    THEN SUM(T0.hrs) ELSE 0 END 'REG DAY OT'
    , CASE WHEN T1.ot_name IN ('Rest Day OT', 'Rest Day Sat OT', 'Rest Day Sun OT') THEN SUM(T0.hrs) ELSE 0 END 'REST DAY OT 1st 8 Hrs'
    , CASE WHEN T1.ot_name IN ('Rest Day OT Excess', 'Rest Day Sat OT Excess', 'Rest Day Sun OT Excess') THEN SUM(T0.hrs) ELSE 0 END 'REST DAY OT OVER'
    , CASE WHEN T1.ot_name IN ('Special Holiday OT', 'Special Holiday Sat OT', 'Special Holiday Sun OT') THEN SUM(T0.hrs) ELSE 0 END 'SPECIAL HOLIDAY OT 1st 8 Hrs'
    , CASE WHEN T1.ot_name IN ('Special Holiday OT Excess', 'Special Holiday Sat OT Excess', 'Special Holiday Sun OT Excess') THEN SUM(T0.hrs) ELSE 0 END 'SPECIAL HOLIDAY OT OVER'
    , CASE WHEN T1.ot_name IN ('Special Holiday on RD OT', 'Special Holiday on RD OT Sat', 'Special Holiday on RD OT Sun') THEN SUM(T0.hrs) ELSE 0 END 'SPECIAL HOLIDAY & RD OT 1st 8 Hrs'
    , CASE WHEN T1.ot_name IN ('Special Holiday on RD OT Excess', 'Special Holiday on RD OT Excess Sat', 'Special Holiday on RD OT Excess Sun') THEN SUM(T0.hrs) ELSE 0 END 'SPECIAL HOLIDAY & RD OT OVER'
    , CASE WHEN T1.ot_name IN ('Legal Holiday OT', 'Legal Holiday Sat OT', 'Legal Holiday Sun OT') THEN SUM(T0.hrs) ELSE 0 END 'REGULAR HOLIDAY OT 1st 8 Hrs'
    , CASE WHEN T1.ot_name IN ('Legal Holiday OT Excess', 'Legal Holiday OT Excess Sat', 'Legal Holiday OT Excess Sun') THEN SUM(T0.hrs) ELSE 0 END 'REGULAR HOLIDAY OT OVER'
    , CASE WHEN T1.ot_name IN ('Legal Holiday on RD OT', 'Legal Holiday on RD OT Sat', 'Legal Holiday on RD OT Sun') THEN SUM(T0.hrs) ELSE 0 END 'REGULAR HOLIDAY & RD OT 1st 8 Hrs'
    , CASE WHEN T1.ot_name IN ('Legal Holiday on RD OT Excess', 'Legal Holiday on RD OT Excess Sat', 'Legal Holiday on RD OT Excess Sun') THEN SUM(T0.hrs) ELSE 0 END 'REGULAR HOLIDAY & RD OT OVER'
    , CASE WHEN T1.ot_name IN ('Ordinary Overtime ND','Ordinary Overtime Sat ND', 'Ordinary Overtime Sun ND')
    THEN SUM(T0.late_nd) ELSE 0 END 'REGULAR ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Ordinary Overtime ND','Ordinary Overtime Sat ND', 'Ordinary Overtime Sun ND')
    THEN SUM(T0.early_nd) ELSE 0 END 'REGULAR ND TYPE 2'
    , CASE WHEN T1.ot_name IN ('Rest Day ND OT','Rest Day Sat ND OT', 'Rest Day Sun ND OT')
    THEN SUM(T0.late_nd) ELSE 0 END 'REST DAY ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Rest Day ND OT','Rest Day Sat ND OT', 'Rest Day Sun ND OT')
    THEN SUM(T0.early_nd) ELSE 0 END 'REST DAY ND TYPE 2'
    , CASE WHEN T1.ot_name IN ('Special Holiday  ND OT','Special Holiday Sat ND OT', 'Special Holiday Sun ND OT')
    THEN SUM(T0.late_nd) ELSE 0 END 'SPECIAL HOLIDAY ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Special Holiday  ND OT','Special Holiday Sat ND OT', 'Special Holiday Sun ND OT')
    THEN SUM(T0.early_nd) ELSE 0 END 'SPECIAL HOLIDAY ND TYPE 2' 
    , CASE WHEN T1.ot_name IN ('Special Holiday on RD ND OT','Special Holiday on RD ND Sat OT', 'Special Holiday on RD ND Sun OT')
    THEN SUM(T0.late_nd) ELSE 0 END 'SPECIAL HOLIDAY & RD ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Special Holiday on RD ND OT','Special Holiday on RD ND Sat OT', 'Special Holiday on RD ND Sun OT')
    THEN SUM(T0.early_nd) ELSE 0 END 'SPECIAL HOLIDAY & RD ND TYPE 2'
    , CASE WHEN T1.ot_name IN ('Legal Holiday ND OT','Legal Holiday Sat ND OT', 'Legal Holiday Sun ND OT')
    THEN SUM(T0.late_nd) ELSE 0 END 'REGULAR HOLIDAY ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Legal Holiday ND OT','Legal Holiday Sat ND OT', 'Legal Holiday Sun ND OT')
    THEN SUM(T0.early_nd) ELSE 0 END 'REGULAR HOLIDAY ND TYPE 2'
    , CASE WHEN T1.ot_name IN ('Legal Holiday on RD ND OT','Legal Holiday on RD ND OT Sat', 'Legal Holiday on RD ND OT Sun')
    THEN SUM(T0.late_nd) ELSE 0 END 'REGULAR HOLIDAY & RD ND TYPE 1'
    , CASE WHEN T1.ot_name IN ('Legal Holiday on RD ND OT','Legal Holiday on RD ND OT Sat', 'Legal Holiday on RD ND OT Sun')
    THEN SUM(T0.early_nd) ELSE 0 END 'REGULAR HOLIDAY & RD ND TYPE 2'
    , NULL 'HAZARD PAY PER DAY'
    , NULL 'HAZARD PAY PER HOUR'
    , NULL 'REMARKS'
    FROM `tabEmployee` T2
    LEFT JOIN `tabRate Classification` T2A ON T2.rate_class = T2A.name
    LEFT JOIN `tabAttendance Adjustment Register` T0A ON T0A.employee = T2.name
    LEFT JOIN `tabOvertime Adjustment` T0 ON T0A.employee = T0.employee AND T0A.target_date = T0.target_date
    LEFT JOIN `tabOvertime Rates` T1 ON T0.ot_code = T1.ot_code
    LEFT JOIN `tabPayroll Period` T3 ON T0.payroll_period = T3.name
    WHERE T2.payroll_schedule = T3.schedule
    AND T2.is_active = 1
    #AND T2.period_group = (SELECT X0.period_group FROM `tabPayroll Period` X0 WHERE X0.name = 'Sep26 Oct10 - AMC2024')
    GROUP BY T2.name, T1.ot_name
    ORDER BY T2.full_name, T1.ot_name ) Z0
    GROUP BY Z0.`Employee ID`
    ORDER BY Z0.`Employee Name`
