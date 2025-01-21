WITH LastTwoPeriods AS (
    SELECT
        t2.name AS period_name,
        t2.from_date,
        t2.to_date
    FROM `tabPayroll Period` t2
    ORDER BY t2.from_date DESC
    LIMIT 2
),
AttendanceData AS (
    SELECT
        t0.employee AS 'Employee ID',
        t1.biometrics_id AS 'Biometrics ID',
        t1.full_name AS 'Employee Name',
        t1.position_title AS 'Position',
        t1.department AS 'Department',
        t1.location AS 'Location',
        t1.employment_status AS 'Status',
        t0.work AS 'Working Hours',
        SUM(t0.late) AS `Late`,
        SUM(t0.undertime) AS `Undertime`,
        SUM(t0.is_absent) AS `Absent`,
        SUM(t0.is_lwop) AS `Lwop`,
        SUM(t0.is_halfday) AS `Half day`,
        MAX(t0.is_ob) AS 'OB File',
        MAX(t0.cto) AS 'CTO File'
    FROM LastTwoPeriods ltp
    JOIN `tabAttendance Register` t0
        ON t0.target_date BETWEEN ltp.from_date AND ltp.to_date
    INNER JOIN `tabEmployee` t1
        ON t0.employee = t1.name
    LEFT JOIN `tabAdjustment Register` t5
        ON t0.employee = t5.employee AND t0.target_date BETWEEN t5.from_date AND t5.to_date
    WHERE t1.location = 'CABUYAO, LAGUNA - RCSNI'
    GROUP BY t1.name, t1.biometrics_id, t1.full_name, t1.position_title, t1.department, t1.location, t1.employment_status, t0.work
)
SELECT
    ad.*,
    'Perfect Attendance' AS 'Status'
FROM AttendanceData ad
WHERE (
    ad.`Late` <= 0 AND
    ad.`Absent` <= 0 AND
    ad.`Lwop` <= 0 AND
    ad.`Half day` <= 0 AND
    ad.`Undertime` <= 0 AND
    (
        (t5.absent > 0 AND t5.unpaid_holiday > 0 AND t5.undertime > 0 AND t5.overtime > 0)
        OR
        (ad.`OB File` > 0 AND ad.`CTO File` > 0 AND t5.absent > 0 AND t5.unpaid_holiday > 0 AND t5.undertime > 0 AND t5.overtime > 0)
    )
);
