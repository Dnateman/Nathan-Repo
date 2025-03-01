SELECT t0.employee AS 'Employee ID',
       t1.biometrics_id AS 'Biometrics ID',
       t1.full_name AS 'Employee Name',
       t0.target_date,
       CASE
       	  WHEN t0.work < 0 THEN 'No Work'
           WHEN t0.undertime > 0 THEN 'Has Undertime'
           WHEN t0.late > 0 THEN 'Late'
           WHEN t0.is_leave > 0 THEN 'On Leave'
           WHEN t0.is_absent > 0 THEN 'Absent'
           WHEN t0.is_lwop > 0 THEN 'LWOP'
           WHEN t0.cto > 0 THEN 'CTO'
           WHEN t0.is_halfday > 0 THEN 'Halfday'
           ELSE 'No Issues'
       END AS 'Attendance Status'
FROM `tabAttendance Register` t0
INNER JOIN `tabEmployee` t1
ON t0.employee = t1.name
WHERE t0.work >= 8
  AND (t0.cto = 0 OR t0.cto IS NOT NULL)
  AND (t0.is_ob = 0 OR t0.is_ob IS NOT NULL)
  AND t0.undertime = 0
  AND t0.late = 0
  AND t0.is_absent = 0
  AND t0.is_lwop = 0
  AND t0.is_halfday = 0
  AND t0.has_issue = 0;