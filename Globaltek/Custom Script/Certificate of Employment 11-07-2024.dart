frappe.ui.form.on("Certificate of Employment", {
    employee: async function(frm) {
        SalaryPackage(frm);
        filterMovement(frm);
    },
    onload: async function(frm) {
        filterMovement(frm);
        setMovementReqd(frm);
    },
    coe_type: async function(frm){
        setMovementReqd(frm);
    }
});

async function filterMovement(frm){
    //Filter list of Employee Movement to employee and movement type is regularization
    frm.set_query("employee_movement", function() {
        return {
        filters: [
            ["Employee Movement","employee", "=", frm.doc.employee],
            ["Employee Movement", "movement_type", "=", 'Regularization']
        ]
        }
    });
}

//Set Employee Movement as required if COE Type is with Salary
async function setMovementReqd(frm){
    cur_frm.set_df_property("employee_movement", "reqd", 0);
    if(frm.doc.coe_type == 'with Salary'){
        cur_frm.set_df_property("employee_movement", "reqd", 1);
    }
}

//compute all transaction type that is Income
async function SalaryPackage(frm) {
    console.group('Salary Package');

    // Step 1: Fetch all income transaction types
    const transactionData = await frappe.db.get_list("Transaction Type", {
        filters: { type: 'Income' },
        fields: ["code"],
        limit: 1000000
    });

    // Extract transaction codes to use in bulk query for recurring entries
    const transactionCodes = transactionData.map(item => item.code);

    // Step 2: Fetch all recurring entries in a single query
    const recurringData = await frappe.db.get_list("Recurring Entry", {
        filters: { transaction_type: ["in", transactionCodes] },
        fields: ["name", "transaction_type"],
        limit: 1000000
    });

    // Extract recurring entry names to use in bulk query for recurring entry employees
    const recurringEntryNames = recurringData.map(item => item.name);

    // Step 3: Fetch all recurring entry employees in a single query
    const recurringEmployees = await frappe.db.get_list("Recurring Entry Employees", {
        filters: { parent: ["in", recurringEntryNames], employee: frm.doc.employee },
        fields: ["amount"],
        limit: 1000000
    });

    // Step 4: Calculate the total recurring amount
    const total = recurringEmployees.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    // Step 5: Get Employee Salary Rate
    const employeeData = await frappe.db.get_list("Employee", {
        filters: { employee_id: frm.doc.employee },
        fields: ["rate"],
        limit: 1
    });

    // Ensure employee rate exists and extract the rate value
    const employeeRate = employeeData.length ? employeeData[0].rate : 0;
    // Step 6: Calculate and set the total monthly salary package
    const monthlySalaryPackage = total + employeeRate;
    console.log('Total Recurring Amount:', total);
    console.log('Total Monthly Salary Package:', monthlySalaryPackage);

// Set the 'monthly_salary_package' field value
    frappe.db.set_value(frm.doc.doctype, frm.doc.name, 'monthly_salary_package', monthlySalaryPackage)

    console.groupEnd();
}

