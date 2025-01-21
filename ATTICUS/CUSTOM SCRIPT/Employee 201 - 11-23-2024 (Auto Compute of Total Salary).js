frappe.ui.form.on('Employee', {
    refresh: function(frm) {
        toggle_read_only_main(frm);
        monthsInService(frm);
        
        //showMySlary(frm);
        governmentNumbersFormat(frm);
        // autoIncrementID(frm);

    },
    before_load(frm){
        //AUTO COMPUTE THE TOTAL SALARY BASED ON THE RATE AND NON TAX ALLOWANCE
        if(frm.doc.total_salary == null || frm.doc.total_salary == 0){
            Onload_Update_Total_Salary(frm);
                frm.save();
        }
    },
    onload: function(frm) {
        hideFields(frm)
        toggle_read_only_main(frm);
        monthsInService(frm);
        //showMySlary(frm);
        governmentNumbersFormat(frm);

        
    },
    sss_no: function(frm){
        frm.set_value('sss_no', governmentNumberFormat(frm.doc.sss_no, 'sss_no'));
    },
    hdmf_no: function(frm){
        frm.set_value('hdmf_no', governmentNumberFormat(frm.doc.hdmf_no, 'hdmf_no'));
    },
    phic_no: function(frm){
        frm.set_value('phic_no', governmentNumberFormat(frm.doc.phic_no, 'phic_no'));
    },
    tin: function(frm){
        frm.set_value('tin', governmentNumberFormat(frm.doc.tin, 'tin'));
    },
    non_taxable_allowance: function(frm) {
        updateTotalSalary(frm);
    },
    rate: function(frm) {
        updateTotalSalary(frm);
    },
    date_hired: function(frm) {
        monthsInService(frm);
    },

});

// ============================= this is the function for employee_id auto increment 
// function autoIncrementID(frm){
//     if (!frm.doc.employee_id){
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "Employee",
//                 fields: ["employee_id"],
//                 limit_page_length: 1,
//                 order_by: "creation desc"
//             },
//             callback: function(response){
//                 if(response.message && response.message){
//                     let latestID = parseInt(response.message[0].employee_id, 10);

//                     frm.set_value("employee_id", (latestID + 1).toString().padStart(3, '0'));
//                 }else{
//                     frm.set_value("employee_id", "0001");
//                 }
//             }
//         });
//     }
// }
// ========================================= end 

// ======================================= Function to Format Government numbers [Dash Spacing]
function governmentNumberFormat(number, type){
    if(!number) return '';

    switch(type){
        case 'sss_no':
            // format ng sss = ##-#######-#
            number = number.replace(/\D/g, '').slice(0, 10);
            return number.replace(/(\d{2})(\d{7})(\d{1})/, '$1-$2-$3');
        case 'hdmf_no':
            // format ng hdmf = ####-####-####
            number = number.replace(/\D/g, '').slice(0, 12);
            return number.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
        case 'phic_no':
            // format ng phic = ##-#########-#
            number = number.replace(/\D/g, '').slice(0, 12);
            return number.replace(/(\d{2})(\d{9})(\d{1})/, '$1-$2-$3');
        case 'tin':
            // format ng tin = "###-###-###-###"
            number = number.replace(/\D/g, '').slice(0, 12);
            return number.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4');
        default:
            return number;
    }
}

function governmentNumbersFormat(frm){
    frm.set_value('sss_no', governmentNumberFormat(frm.doc.sss_no, 'sss_no'));
    frm.set_value('hdmf_no', governmentNumberFormat(frm.doc.hdmf_no, 'hdmf_no'));
    frm.set_value('phic_no', governmentNumberFormat(frm.doc.phic_no, 'phic_no'));
    frm.set_value('tin', governmentNumberFormat(frm.doc.tin, 'tin'));
}

// Function to show employee's salary 
// function showMySlary(frm){
//     console.log("I'm in")
    
//     const allowedRoles = ['HR','HRBP','Administrator','Admin','Finance','System Admin'];
//     const isOwnAccount = frappe.user.name === frm.doc.user_id;
//     const hasAllowedRoles = frappe.user_roles.some(role => allowedRoles.includes(role));

//     console.log(allowedRoles)
//     console.log(isOwnAccount)
//     console.log(hasAllowedRoles)

//     if(isOwnAccount || hasAllowedRoles){
//         console.log((isOwnAccount || hasAllowedRoles));
//         console.log('Im in the if condition');
//         frm.toggle_display('section_break_29', true);

//         const listOfSalaryToView = ['total_yr_days','rate_type','rate','non_taxable_allowance','total_salary','job_grade','payroll_schedule',
//             'period_group','min_take_home','rate_classification','cost_center','mode_of_payment','mwe_loc','payroll_group', 
//         ];

//         listOfSalaryToView.forEach(field => {
//             console.log("im n the read only condition")
//             //frm.set_df_property(field, 'read_only', 1);
//             //frm.get_docfield(field).permlevel = 1;
//             if (isOwnAccount) {
//                 if(listOfSalaryToView === 'rate'){
//                     frm.fields_dict[field].df.permlevel = 0;
//                 }  
//             } else {
//                 frm.fields_dict[field].df.permlevel = 1;  
//             }
//         });

//         console.log("should be visible now. and read only is applied.");
//     }else{
//         frm.toggle_display('section_break_29', false);
//         console.log("Not permitted to view salary settings");
//     }

//     console.log("Conditions and configuration applied, I hope so.");
// }

// Function to update total salary
function updateTotalSalary(frm) {

    let total = frm.doc.rate + parseFloat(frm.doc.non_taxable_allowance || 0);
    let formatted_total = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    frm.set_value('total_salary', formatted_total);

}
//AUTO COMPUTE THE TOTAL SALARY BASED ON THE RATE AND NON TAX ALLOWANCE
function Onload_Update_Total_Salary(frm){
    let total = frm.doc.rate + parseFloat(frm.doc.non_taxable_allowance || 0);
    let formatted_total = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    frm.set_value('total_salary', formatted_total);
    console.log("total_salary :",formatted_total)

}

// Function to get the roles of the current logged-in user
async function getCurrentLoggedUserRole() {
    return frappe.user_roles;
}

// Function to hide fields for specific user roles
async function hideFields(frm) {
    const hideFieldsFor = ['HRBP', 'Immediate Head'];
    console.log('Hide fields for',hideFieldsFor);
    const userRolesData = await getCurrentLoggedUserRole();
    console.log('user roles data',userRolesData);
    const roleMatched = userRolesData.some(role => hideFieldsFor.includes(role));
    console.log('Role Matched',roleMatched);

    if (roleMatched) {
        console.log('Role Matched');
        // Additional logic to hide fields can be added here if needed
    }
}

// Toggle read-only fields for self record access
async function toggle_read_only_main(frm) {
    if (frappe.user.name === "Administrator") return;

    const user_data = await get_logged_user_data();
    await set_fields_property(frm, user_data);
}

// Retrieve current logged user data
async function get_logged_user_data() {
    return frappe.user_defaults.Employee;
}

// Set fields to read-only if user is editing their own record
async function set_fields_property(frm, user) {
    if (user === frm.doc.name) {
        $.each(frm.fields_dict, function(i) {
            frm.set_df_property(i, 'read_only', 1);
        });
    }
}

// Function to calculate months in servicemj
function monthsInService(frm) {
    if (!frm.doc.date_hired) return;

    const start_date = new Date(frm.doc.date_hired);
    const end_date = frm.doc.date_resigned ? new Date(frm.doc.date_resigned) : new Date();


    let months = (end_date.getFullYear() - start_date.getFullYear()) * 12;
    console.log("end",end_date.getFullYear())
    console.log("start",start_date.getFullYear())

    months += end_date.getMonth() - start_date.getMonth();
    console.log("end months",end_date.getMonth())
    console.log("start months",start_date.getMonth())
    console.log("months",months)
    if (end_date.getDate() < start_date.getDate()) {
        months--;
    }

    if (months !== frm.doc.months_in_service) {
        frm.set_value('months_in_service', months >= 0 ? months : 0);
    }
}


/* END TOGGLE READ-ONLY FIELDS FUNCTIONS */

/*========================================================================================================================
NOTE: Use Blackbox AI to explain this code line by line or function by function if comments are unclear 
Change Logs:
    Date:               PIC:                    Remarks:
    2024-07-09          EJL                     Added read_only functions for HR users on self edit
    2024-11-23          Nateman                 Added Auto Compute for total salary based on rate and non tax allowance
==========================================================================================================================*/
