SELECT payperiod.name AS "Payroll Period:Data:200"
	, T0.docname AS "Employee Number:Data:200"
	, T1.full_name AS "Employee Name:Data:200"
	, REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), '",', 1),'"','')  AS "Basic Salary (Previous):Float:200"
	, SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1),LOCATE('",',SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1))+8,(CHAR_LENGTH(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1))-LOCATE('",',SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1)))-11)  AS "Basic Salary (Current):Float:200"
	, CASE WHEN SUBSTRING(T3.name, 1, 2) = 'MD' THEN REPLACE(REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(T3.dictionary, T0.docname, -1), '}', 1), 'effectivity_date', -1), ',',1),"'",''),':','') ELSE 0 END AS 'Effectivity Date:Data:150'
	, DATE_FORMAT(T0.creation, '%%m/%%d/%%Y') ` Posting Date`
	, "Change in Rate" AS "Remarks:Data:200"
	, T0.name
FROM `tabVersion` T0
LEFT JOIN `tabEmployee` T1 ON T0.docname = T1.name
LEFT JOIN `tabPayroll Period` payperiod ON T0.reference_date BETWEEN payperiod.last_process_date AND payperiod.to_date
LEFT JOIN `tabHorizon Files` T3 ON T0.reference_file = T3.name
WHERE T0.reference_file <> '' 
#AND YEAR(T0.creation) = '2024'
AND LOCATE('"rate"',T0.data) > 0
AND payperiod.name = 'Sep26 Oct10 - AMC2024'
AND CONVERT(REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), '",', 1),'"',''),DECIMAL) < CONVERT(SUBSTRING(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1),LOCATE('",',SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1))+8,(CHAR_LENGTH(SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1))-LOCATE('",',SUBSTRING_INDEX(SUBSTRING_INDEX(T0.data, '"rate",', -1), ']', 1)))-11),DECIMAL)
GROUP BY T0.docname, T0.reference_date
ORDER BY T0.reference_date DESC