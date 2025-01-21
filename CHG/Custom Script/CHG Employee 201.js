var employee_id = "";
var year_id = "";
var month_id = "";
frappe.ui.form.on("Employee", {
    validate: async function(frm) {
        let series_id = "";
        let class_list = [];
        let current_count = 0;
        let date_hired = new Date(frm.doc.date_hired);

        let mydate = "";
        mydate = new Date(date_hired.getFullYear(), date_hired.getMonth(), 1);
        let firstDay = getDate(mydate);
        let lastDay = getDate(
            new Date(date_hired.getFullYear(), date_hired.getMonth() + 1, 0)
        );
        // console.log("firstDay", firstDay);
        // console.log("lastDay", lastDay);

        series_id = await getSeriesCode(frm.doc.company, frm.doc.classification);
        if (series_id == "undefined") {
            frappe.msgprint(
                "<strong>Series No. not found. Please Check Employee Numbering Matrix</strong>."
            );
            frappe.validated = false;
            return;
        }

        class_list = await get_class_valid_value(series_id);

        // console.log("current_count", current_count);
        year_id = padDigits(date_hired.getFullYear().toString().substr(2, 2), 2);
        month_id = padDigits(date_hired.getMonth() + 1, 2);
        let series_name = year_id + "-" + month_id + series_id;
        current_count = await checkCount(
            series_name,
            class_list,
            firstDay,
            lastDay
        );

        let xxx = frm.doc.__unsaved;
        let status = typeof xxx;
        // console.log(status);
        if (status != "undefined") {
            employee_id = year_id + "-" + month_id + series_id + current_count;
            frm.set_value("employee_id", employee_id);
            

        } else {
            frappe.msgprint("<strong>Employee already have an employee id</strong>.");
            frappe.validated = false;
        }
    },
    company: function(frm) {
        filter_location(frm);
        filter_branch(frm);
    },
    location: async function(frm) {
        await filter_branch(frm);
    },
    onload: async function(frm) {
        await filter_location(frm);
        await filter_branch(frm);
    },
    classification: async function(frm) {
        let series_id = "";
        let class_list = [];
        let current_count = 0;
        let date_hired = new Date(frm.doc.date_hired);

        let mydate = "";
        mydate = new Date(date_hired.getFullYear(), date_hired.getMonth(), 1);
        let firstDay = getDate(mydate);
        let lastDay = getDate(
            new Date(date_hired.getFullYear(), date_hired.getMonth() + 1, 0)
        );
        // console.log("firstDay", firstDay);
        // console.log("lastDay", lastDay);

        series_id = await getSeriesCode(frm.doc.company, frm.doc.classification);
        if (series_id == "undefined") {
            frappe.msgprint(
                "<strong>Series No. not found. Please Check Employee Numbering Matrix</strong>."
            );
            frappe.validated = false;
            return;
        }

        class_list = await get_class_valid_value(series_id);

        // console.log("current_count", current_count);
        year_id = padDigits(date_hired.getFullYear().toString().substr(2, 2), 2);
        month_id = padDigits(date_hired.getMonth() + 1, 2);
        let series_name = year_id + "-" + month_id + series_id;
        current_count = await checkCount(
            series_name,
            class_list,
            firstDay,
            lastDay
        );

        employee_id = year_id + "-" + month_id + series_id + current_count;
        console.log("employee_id:", employee_id);

        let xxx = frm.doc.__unsaved;
        let status = typeof xxx;
        // console.log(status);
        if (status != "undefined") {
            employee_id = year_id + "-" + month_id + series_id + current_count;
            frm.set_value("employee_id", employee_id);
        } else {
            frappe.msgprint("<strong>Employee already have an employee id</strong>.");
            frappe.validated = false;
        }
    },
    classification: async function(frm){
        blockAutomateBiometricsID(frm)
    },
    before_save(frm){
        const addressComponents = [
            frm.doc.house_no_lot_no,
            frm.doc.street_name,
            frm.doc.village_subdivision,
            frm.doc.barangay,
            frm.doc.municipality_city,
            frm.doc.zip_code,
            frm.doc.region
        ];
        const perm_address = addressComponents.filter(Boolean).join(" ");
            if(perm_address.trim() !== ''){
                console.log('True')
                frm.set_value("complete_address", perm_address);
                frm.refresh_field("complete_address");
            }
            else{
                console.log('False')
            }
    },
    get_complete_address(frm){
        completeAddress(frm)
    },
    async refresh(frm){
	await SensitivityFilter(frm)
        if (frm.doc.role_profile != null && !frappe.user_roles.includes('System Manager')) {
            //console.log(frm.doc.role_profile);
            frm.set_df_property('role_profile', 'read_only', 1);
        }
    },
   async department(frm){
        const empRole = await frappe.db.get_value('Department', { 'name': frm.doc.department }, 'cost_center'); 
        console.log(empRole.message.cost_center)
        if(empRole.message.cost_center){
            frm.set_value('cost_center', empRole.message.cost_center)
        }
        else{
            frm.set_value('cost_center', '')
	    frm.set_value('pccc_code', '')
        }
    },
    async after_save(frm){
        let filters = {'employee_id': frm.doc.name};                                           
        let fields  = ['employee_id']
        let data = await frappe.db.get_list("Employee ID Monitoring", {filters: filters, fields: fields, limit: 1000000});
        if(data !== undefined){
            console.log('Existing')
        }
        else{

            RecordTo201(frm);
        }
    }
});
async function SensitivityFilter(frm){
    let results = []
    let filter = {'parent': frm.doc.sensitivity}
    let LoggedInUser = frappe.session.user_email
    //console.log('04', LoggedInUser)
    let response = await frappe.db.get_list("Sensitivity Users", {filters:filter, fields:['allow_user'],  limit: 10000})
    //console.log('sagot: ', response)
    for (let i = 0; i < response.length; i++) {
        // Add the result to the array
        results.push(response[i].allow_user);
    }
    //console.log('testing ko lang', results)
    if (results.includes(LoggedInUser) || frappe.user.name == 'Administrator'){
        //console.log('Di Palpak')
        frm.set_df_property('other_benefits', 'hidden', 0) 
    }
    else{
        //console.log('palpak')
        frm.set_df_property('other_benefits', 'hidden', 1) 
    }
}
function pad2(n) {
    return (n < 10 ? "0" : "") + n;
}

function getDate(date) {
    let month = pad2(date.getMonth() + 1); //months (0-11)
    let day = pad2(date.getDate()); //day (1-31)
    let year = date.getFullYear();

    let formattedDate = year + "-" + month + "-" + day;
    return formattedDate;
}

async function checkCount(series_name, class_list, first_day, second_day) {
    console.log(series_name);
    return new Promise(async(resolve) => {
        var count = 0;
        let companys = class_list.map((item) => item.company);
        // console.log("companys", companys);
        let classifications = class_list.map((item) => item.classification);
        // console.log("classifications", classifications);
        // console.log("first_day 1", first_day);
        // console.log("second_day 1", second_day);
        await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee ID Monitoring",
                filters: {
                    company: ["in", companys],
                    classification: ["in", classifications],
                    date_hired: ["<=", second_day],
                    date_hired: [">=", first_day],
                    name: ["like", "%" + series_name + "%"],
                },
                fields: [
                    "replace(name,'" + series_name + "','')",
                    "name",
                    "employee_id",
                    "date_hired",
                    "company",
                    "classification",
                ],
                order_by: "CAST(replace(name,'" + series_name + "','') AS INTEGER)",
                limit_page_length: 100000,
            },
            async: false,
            callback: function(data) {
                var employee_count = 0;

                employee_count = data.message.length - 1;
                console.log(data.message);
                // console.log(parseInt(data.message[employee_count].name.replace(series_name, "")));
                // console.log("checkCount 1", data.message);
                var type = typeof data.message;
                if (type != "undefined") {
                    employee_count =
                        parseInt(
                            data.message[employee_count].name.replace(series_name, "")
                        ) + 1;
                    count = padDigits(employee_count, 2);
                } else {
                    employee_count = 0;
                    count = padDigits(employee_count, 2);
                }
            },
        });

        await resolve(count);
    });
}

function padDigits(number, digits) {
    return (
        Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number
    );
}

function getSeriesCode(company, classification) {
    return new Promise((resolve) => {
        let code_id = "";

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee Numbering Matrix",
                filters: { company: company, classification: classification },
                fields: ["code"],
                limit_page_length: 100000,
            },
            async: false,
            callback: function(data) {
                let type = typeof data.message;
                if (type != "undefined") {
                    code_id = data.message[0].code;
                } else {
                    code_id = "undefined";
                }
            },
        });

        resolve(code_id);
    });
}

async function get_class_valid_value(code) {
    return new Promise(async(resolve) => {
        let class_list = [];

        await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Employee Numbering Matrix",
                filters: { code: code },
                fields: ["classification", "company"],
                limit_page_length: 100000,
            },
            async: false,
            callback: function(data) {
                let type = typeof data.message;
                if (type != "undefined") {
                    class_list = data.message;
                }
            },
        });

        await resolve(class_list);
    });
}

//filter Location based on Company
function filter_location(frm) {
    var loc_list = [];
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Location",
            filters: { company: frm.doc.company },
            fields: ["name"],
            limit_page_length: 100000,
        },
        async: false,
        callback: function(data) {
            let type = typeof data.message;
            if (type != "undefined") {
                for (var i = 0; i < data.message.length; i++) {
                    loc_list.push(data.message[i].name);
                }
                //console.log(loc_list);;

                frm.set_query("location", function() {
                    return {
                        filters: [
                            ["Location", "name", "in", loc_list]
                        ],
                    };
                });
            }
        },
    });
}

//filter Branch based on Company
function filter_branch(frm) {
    var br_list = [];
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Branch",
            filters: { company: frm.doc.company, location: frm.doc.location },
            fields: ["name"],
            limit_page_length: 100000,
        },
        async: false,
        callback: async function(data) {
            let type = typeof data.message;
            if (type != "undefined") {
                console.log("BRANCH: ", data.message);
                for (var i = 0; i < data.message.length; i++) {
                    br_list.push(data.message[i].name);
                }
                console.log("filter: ", br_list);

                frm.set_query("branch", function() {
                    return {
                        filters: [
                            ["Branch", "name", "in", br_list]
                        ],
                    };
                });
                //frm.refresh_fields("branch");
            }
        },
    });
}

frappe.ui.form.on("Other Compensation and Benefits Table", {
    recurring_entry: async function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        let _recurring_entry = row.recurring_entry;
        let _employee = frm.doc.employee;
        await frappe.call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Recurring Entry",
                filters: {
                    name: _recurring_entry,
                },
                fieldname: ["transaction_type", "date_from", "date_to", "remarks"],
            },
            callback: function(data) {
                var temp = typeof data.message;
                if (temp != "undefined") {
                    console.log(data.message.transaction_type);
                    row.transaction_type = data.message.transaction_type;
                    row.effective_from_date = data.message.date_from;
                    row.effective_to_date = data.message.date_to;
                    row.remarks = data.message.remarks;
                }
            },
        });

        await frappe.call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Recurring Entry Employees",
                filters: {
                    parent: _recurring_entry,
                    employee: _employee,
                },
                fieldname: ["amount"],
            },
            callback: function(data) {
                var temp = typeof data.message;
                if (temp != "undefined") {
                    row.amount = data.message.amount;
                }
            },
        });

        frm.refresh_fields(row);
    },
});


async function automateBiometricsID(frm){
    let filters = {'classification': ["!=", 'Concession'], 'biometrics_id': ['!=', null], 'is_active': ['=', 1]};                                           
    let fields  = ['biometrics_id', 'classification']
    let data = await frappe.db.get_list("Employee", {filters: filters, fields: fields, limit: 1000000});
    // console.log('length', typeof data, data)

    console.log('data', data)
    let bios = []
    let highest = 0
    $.each(data, async function(i,row) {
        // if(row.biometrics_id != "NaN"){
        //     bios.push(parseInt(row.biometrics_id))
        // }
        if(parseInt(row.biometrics_id) > highest){
            highest = parseInt(row.biometrics_id)
        }
    })
    console.log('highest', highest, highest+1)
    // console.log('MAX BIO', data)
    // console.log('BIO ID', data[0], parseInt(data[0].max)+1)

    console.log('MAX', Math.max(bios))
    console.log('bios', bios)

    if(frm.doc.__unsaved == 1 && frm.doc.classification != "Concession") {
        frm.set_value('biometrics_id', highest+1)
    } else {
	    frm.set_value('biometrics_id', "")
    }
}

async function blockAutomateBiometricsID(frm) {
    //Run the automateBiometricsID function through here for extra validation
        if (typeof frm.doc.biometrics_id == 'undefined' || frm.doc.biometrics_id == '' || frm.doc.biometrics_id == null) {
            automateBiometricsID(frm)
        }
    //=Console Viewing======================================================================
            console.log("Biometrics ID: ", frm.doc.biometrics_id)
    //======================================================================================
}
function completeAddress(frm) {
    const addressComponents = [
        frm.doc.house_no_lot_no,
        frm.doc.street_name,
        frm.doc.village_subdivision,
        frm.doc.barangay,
        frm.doc.municipality_city,
        frm.doc.zip_code,
        frm.doc.region
    ];
    const perm_address = addressComponents.filter(Boolean).join(" ");
    if(perm_address.trim() !== ''){
        console.log('True')
        frm.set_value("complete_address", perm_address);
        frm.refresh_field("complete_address");
    }
    else{
        console.log('False')
    }
}
async function RecordTo201(frm) {

    let parent_obj = {
                'doctype': 'Employee ID Monitoring',
                'employee_id': frm.doc.employee_id,
                'company': frm.doc.company,  // company field
                'date_hired': frm.doc.date_hired,
                'classification': frm.doc.classification,
    }

    //Function for Posting Records
    frappe.call({
        method: "frappe.client.insert",
        args: {
            doctype: "Employee ID Monitoring",
            doc:parent_obj

        }
    });

}

//------------------------------------------------------------------VERSION LOGS------------------------------------------------------------------
/*
        VERSION                     MODIFIED BY                     MODIFIED DATE                   REMARKS/CHANGES
        TC-CS-ER-002                EJ                              2023-07-06                      Added blockings function to Bio ID Automation
*/
//------------------------------------------------------------------------------------------------------------------------------------------------