SELECT `Payroll Period` AS 'Payroll Period:Data:150'
, `Employee ID`
, `Employee Name` AS 'Employee Name:Data:200'
#, SUM(CASE WHEN `prev_work_hours` = 0 AND `worker hours` > 0 THEN 1 ELSE 0 END) AS 'Reversal In Days:Data:150'
, SUM(`worker hours` / `work_hours_curr`) AS 'Reversal In Days:Data:150'
, REPLACE(GROUP_CONCAT(unpaid_dates), ' ,', '') AS 'Unpaid Dates:Data:300'
, SUM(`Undertime`) AS 'Undertime In Hours:Data:150'
, `Affected Payroll Period` `Remarks` 
from (SELECT attendance.target_date
, (attendance.worker_hours + (attendance.undertime + attendance.late)) `worker hours`
, attendance.name `Attendance`
, attendance.work_hours_prev `prev_work_hours`
, attendance.work_hours_curr `work_hours_curr`
, attendance.payroll_period `Payroll Period`
, attendance.affected_payroll_period `Affected Payroll Period`
, attendance.employee `Employee ID`
, attendance.late `Late`
, IF(attendance.worker_hours != 0, attendance.target_date , ' ') `unpaid_dates`
, attendance.employee_name `Employee Name`
, IF(attendance.is_lwop_prev = 1 OR attendance.is_absent_prev = 1, 1, 0)`Absent`
, attendance.undertime + attendance.late `Undertime`
, ''`Remarks` 
FROM `tabAttendance Adjustment Register` attendance 
LEFT JOIN `tabPayroll Period` payperiod ON attendance.payroll_period = payperiod.name
WHERE 1 =1 
and payperiod.name = 'Oct11 Oct25 - AMC2024' 
#payperiod.name = 'Aug26 Sep10 - AMC2024' 
#AND attendance.worker_hours > 3 
#GROUP BY attendance.payroll_period, attendance.employee 
ORDER BY attendance.payroll_period, attendance.employee )att 
GROUP BY att.`Affected Payroll Period`, att.`Employee ID`
#HAVING 
#(SUM(`worker hours` / `work_hours_curr`) + (SUM(`Undertime`)) <> 0