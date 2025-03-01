frappe.ui.form.on("Employee Movement", {
    employee: async function(frm) {
        additionalChanges(frm)
        await frm.clear_table("allowance_and_other_benefits_table");
        await frm.refresh_fields("allowance_and_other_benefits_table");
        //console.log(empBranch.message.branch)
        let ctable = frm.doc.allowance_and_other_benefits_table;
        let employee = frm.doc.employee;
        var temp = typeof table;
        let list = [];
        list = await getCompBenList(employee);
        var temp = typeof list;
        if (temp != "undefined") {
            console.log(list);
            await autoFill("allowance_and_other_benefits_table", list);
        }

        //FUNCTION
        if(frappe.session.user != "Administrator"){ 
            automateSign(frm);
        }
    },
    // get_allowance_and_other_benefits: async function(frm) {
    //     let ctable = frm.doc.allowance_and_other_benefits_table;
    //     let employee = frm.doc.employee;
    //     var temp = typeof table;
    //     let list = [];
    //     list = await getCompBenList(employee);
    //     var temp = typeof list;
    //     if (temp != "undefined") {
    //         console.log(list);
    //         await autoFill("allowance_and_other_benefits_table", list);
    //     }
    // },
    before_save: function(frm) {
        let table = frm.doc.allowance_and_other_benefits_table;
        let parents = table.map((item) => item.transaction_type);
        console.log(parents);

        let is_duplicate_found = checkDuplicate(parents);

        if (is_duplicate_found == true) {
            frappe.msgprint("<strong>Duplicate Transation Type Found</strong>.");
            frappe.validated = false;
        }
    },
    validate: async function(frm) {
        let is_exist = typeof frappe.get_doc("Employee", frm.doc.employee);

        let employee = frm.doc.employee;
        let full_name = frm.doc.employee_name;
        let company = frm.doc.company;
        let table = frm.doc.allowance_and_other_benefits_table;
        let table_count = table.length;
        let istrue = frm.doc.__unsaved;

        console.log("table", table);
        console.log(frm.doc);

        if (frm.doc.workflow_state == "Approved") {
            //await getCompensationtable(frm, table, company, employee, full_name);
        }
    },
    on_submit:async function(frm){
        let is_exist = typeof frappe.get_doc("Employee", frm.doc.employee);

        let employee = frm.doc.employee;
        let full_name = frm.doc.employee_name;
        let company = frm.doc.company;
        let table = frm.doc.allowance_and_other_benefits_table;
        let table_count = table.length;
        let istrue = frm.doc.__unsaved;

        console.log("table", table);
        console.log(frm.doc);

        //if (frm.doc.docstatus == 1) {
            //await getCompensationtable(frm, table, company, employee, full_name);
        //}
    },
    refresh:async function(frm) {

        hidePrint(frm)
        if(frm.doc.employee !== null || frm.doc.employee !== undefined || frm.doc.employee !== ''){
            SensitivityFilter(frm)
        }
        console.log(frappe.user_roles.includes('HR User'));
        console.log(frappe.user_roles)
        if (frappe.user_roles.includes('HR User') && !frappe.user_roles.includes('System Manager')) {
            if (frm.doc.movement_type == 'Job Rotation' || frm.doc.movement_type == 'Salary Adjustment') {
                frm.set_df_property('section_break_17', 'hidden', 1);
                frm.set_df_property('movement_options', 'hidden', 1);
                frm.set_df_property('section_break_18', 'hidden', 1);
                frm.set_df_property('rehire_job_grade', 'hidden', 1);
                frm.set_df_property('section_break_19', 'hidden', 1);
                frm.set_df_property('section_break_25', 'hidden', 1);
                frm.set_df_property('transfer_position_break', 'hidden', 1);
                frm.set_df_property('section_break_31', 'hidden', 1);
                frm.set_df_property('sectionbreak_extensionofservices', 'hidden', 1);
                frm.set_df_property('rehired_section', 'hidden', 1);
                frm.set_df_property('section_break_57', 'hidden', 1);
                frm.set_df_property('additional_changes_section', 'hidden', 1);
                frm.set_df_property('section_break_88', 'hidden', 1);
                frm.set_df_property('allowances_and_other_benefits', 'hidden', 1);
                frm.set_df_property('signatories', 'hidden', 1);
              
                console.log('hide');
            }
        }
    },
    new_classification: async function(frm){
        const empNewBranch = await frappe.db.get_value('Classification', { 'name': frm.doc.new_classification }, 'classification_code');
        if(frm.doc.new_classification !== ''){ 
            frm.set_value('new_classification_code', empNewBranch.message.classification_code);
        }
        else{
            frm.set_value('new_classification_code', '');
        }
        console.log(empNewBranch.message.classification_code)
    },
    sensitivity_level(frm){
        SensitivityFilter(frm)
    }
});
async function hidePrint(frm){
    //made by jelo
    let hideMeHRG = ['End of Contract','Resignation','Transfer']
    let hideMeHRM = ['Regularization','Transfer','Job Rotation']
    const empRole = await frappe.db.get_value('User', { 'name': frappe.user.name }, 'role_profile_name'); 
    console.log(empRole.message.role_profile_name)
    if(empRole.message.role_profile_name == 'HR Generalist / Timekeeping Application'){
        if(!hideMeHRG.includes(frm.doc.movement_type)){
            $('.fa.fa-print').hide()
        }
        else{$('.fa.fa-print').show()}
    }
    if(empRole.message.role_profile_name == 'HR Movements / Timekeeping Applications'){
        if(!hideMeHRM.includes(frm.doc.movement_type)){
            $('.fa.fa-print').hide()
        }
        else{$('.fa.fa-print').show()}
    }
}
async function SensitivityFilter(frm){
    let results = []
    let filter = {'parent': frm.doc.sensitivity_level}
    let LoggedInUser = frappe.session.user_email
    //console.log('04', LoggedInUser)
    let response = await frappe.db.get_list("Sensitivity Users", {filters:filter, fields:['allow_user'],  limit: 10000})
    //console.log('sagot: ', response)
    for (let i = 0; i < response.length; i++) {
        // Add the result to the array
        results.push(response[i].allow_user);
    }
    //console.log('testing ko lang', results)
    if (results.includes(LoggedInUser) ||  frappe.user.name == 'Administrator'){
        //console.log('Di Palpak')
        frm.set_df_property('section_break_17', 'hidden', 0) 
    }
    else{
        //console.log('palpak')
        if(frm.doc.movement_type == 'Transfer' || frm.doc.movement_type == 'Regularization' || frm.doc.movement_type == 'Job Rotation' || frm.doc.movement_type == 'Salary Adjustment'){
            $('.fa.fa-print').hide()
            var element = document.evaluate('/html/body/div[1]/div/div[1]/div[1]/div/div/div[2]/div[1]/ul/li[1]/a', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (element) {
                $(element).hide();  // Use jQuery to hide the element
            }
        }
        else{$('.fa.fa-print').show()}
        var element = document.evaluate('/html/body/div[1]/div/div[1]/div[1]/div/div/div[2]/div[1]/ul/li[1]/a', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) {
            $(element).show();  // Use jQuery to hide the element
        }
        frm.set_df_property('section_break_17', 'hidden', 1) 
    }
}

function currentUser(frm){
    let cur_user = frappe.session.user;
    console.log(cur_user)
    frm.set_value('current_user', cur_user)
}

function getCompBenList(employee) {
    return new Promise((resolve) => {
        let list = [];
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Other Compensation and Benefits Table",
                filters: { parent: employee, is_active: "1" },
                fields: [
                    "transaction_type",
                    "amount",
                    "recurring_entry",
                    "remarks",
                    "effective_from_date",
                    "name",
                ],
            },
            async: false,
            callback: function(data) {
                list = data.message;
            },
        });
        resolve(list);
    });
}

// Functions
// Functions
function autoDelete(table, table_name) {
    return new Promise((resolve) => {
        // let table = frm.doc.allowance_and_other_benefits_table;
        var temp = typeof table;
        if (temp != "undefined") {
            console.log(table.length);

            for (var i = 0; i < table.length; i++) {
                cur_frm.get_field(table_name).grid.grid_rows[i].remove();
                cur_frm.refresh_fields(table_name);
            }
            cur_frm.refresh();
        }
        resolve();
    });
}

function autoFill(table_name, transactions) {
    return new Promise(async(resolve) => {
        var i;
        for (i = 0; i < transactions.length; i++) {
            console.log(transactions[i]);

            let recc_no = transactions[i].recurring_entry;
            let status = await get_recurring_status(recc_no);
            console.log(status);
            if (status == "Enabled") {
                var childTable = await cur_frm.add_child(table_name);
                childTable.transaction_type = transactions[i].transaction_type;
                childTable.old_amount = transactions[i].amount;
                childTable.recurring_entry = transactions[i].recurring_entry;
                childTable.employee_comp_ben_id = transactions[i].name;
                childTable.is_active = 1;

                cur_frm.refresh_fields(childTable);
                cur_frm.refresh_fields(table_name);
            } else {
                // childTable.is_active = 0;
            }
        }
        resolve();
    });
}

var getCompensationtable = async function(
    frm,
    table,
    company,
    employee,
    full_name
) {
    for (var i = 0; i < table.length; i++) {
        let employee_comp_ben_id = table[i].employee_comp_ben_id;
        let recurring_id = table[i].recurring_entry;
        let transaction_type = table[i].transaction_type;
        let remarks = table[i].remarks;
        let effective_from_date = table[i].effective_from_date;
        let amount = table[i].new_amount;

        let temp_amt = typeof table[i].new_amount;
        let temp_rec_id = typeof table[i].recurring_entry;
        let temp_from_date = typeof table[i].effective_from_date;

        console.log(effective_from_date);
        console.log(temp_amt);
        console.log(temp_rec_id);
        console.log(temp_from_date);

        if (temp_amt != "undefined") {
            if (amount != 0) {
                if (temp_from_date == "undefined") {
                    frappe.msgprint(__("Invalid Effectivity Date"));
                } else {
                    var n = new Date(effective_from_date);
                    let year = n.getFullYear();
                    let month = n.getMonth() + 1;
                    let day = n.getDate();
                    let c = new Date(year + 1000, month, day);
                    let effective_to_date = frappe.datetime.add_days(c, 30);

                    console.log(company,
                        employee,
                        full_name,
                        transaction_type,
                        amount,
                        effective_from_date,
                        effective_to_date);

                    recurring_entry = await create_reccuring(
                        company,
                        employee,
                        full_name,
                        transaction_type,
                        amount,
                        effective_from_date,
                        effective_to_date
                    );

                    if (recurring_entry.exc) {} else {
                        recurring_no = recurring_entry.message.name;
                    }

                    let doc = {
                        parent: employee,
                        transaction_type: transaction_type,
                        recurring_entry: recurring_no,
                        amount: amount,
                        effective_from_date: effective_from_date,
                        effective_to_date: effective_to_date,
                        doctype: "Other Compensation and Benefits Table",
                        parentfield: "other_compensation_and_benefits",
                        parenttype: "Employee",
                        is_active: 1,
                    };

                    console.log(recurring_id);
                    if (temp_rec_id != "undefined") {
                        // updateRec_Status(recurring_id);
                        updateRec_FromDate(recurring_id, effective_from_date);
                        updateCompBen_Date(employee_comp_ben_id, effective_from_date);
                        updateCompBen_status(employee_comp_ben_id);
                    }
                    console.log(employee_comp_ben_id);
                    //insertEmployee_compben(doc);
                }
            }
        }
    }
    // console.log("after saving : ", table);
    // await frm.refresh_fields("other_compensation_and_benefits");
};

var create_reccuring = async function(
    company,
    employee,
    full_name,
    transaction_type,
    amount,
    date_from,
    date_to
) {
    var doc = {
        doctype: "Recurring Entry",
        employee_id: employee,
        method: "Standard",
        company: company,
        rate: 0,
        recurring_type: "Range",
        date_from: date_from,
        date_to: date_to,
        transaction_type: transaction_type,
        employees: [
            { amount: amount, employee: employee, employee_name: full_name },
        ],
    };
    console.log("adding", doc)
    let recurring_no = await insert_data(doc);
    return recurring_no;
};

var insert_data = function(doc_value) {
    return new Promise(async(resolve) => {
        await frappe.call({
            method: "frappe.client.insert",
            args: { doc: doc_value },
            callback: async function(r) {
                console.log("insert_data : ", r);
                recurring_no = await r;
            },
        });

        resolve(recurring_no);
    });
};

async function get_reccuringid(frm, table, employee_id) {
    for (var i = 0; i < table.length; i++) {
        let employee_compben_id = table[i].name;
        console.log("employee_compben_id :", employee_compben_id);

        recurring_no = await get_recurring_no(employee_id, employee_compben_id);
        console.log("name :", recurring_no);
        table[i].recurring_entry = recurring_no;
    }

    frm.refresh_fields("other_compensation_and_benefits");
}

var get_recurring_no = function(employee_id, employee_compben_id) {
    return new Promise(async(resolve) => {
        let recurring_no = "";

        await frappe.call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Recurring Entry",
                filters: {
                    employee_id: employee_id,
                    employee_compben_id: employee_compben_id,
                },
                fieldname: ["name"],
            },
            callback: function(data) {
                var temp = typeof data.message;
                if (temp != "undefined") {
                    recurring_no = data.message.name;
                }
            },
        });

        resolve(recurring_no);
    });
};

var get_recurring_status = function(recc_no) {
    return new Promise(async(resolve) => {
        let status = "";

        await frappe.call({
            method: "frappe.client.get_value",
            args: {
                doctype: "Recurring Entry",
                filters: {
                    name: recc_no,
                },
                fieldname: ["status"],
            },
            callback: function(data) {
                var temp = typeof data.message;
                if (temp != "undefined") {
                    status = data.message.status;
                }
            },
        });

        resolve(status);
    });
};

function updateRec_Status(recurring_entry) {
    console.log("recurring_entry", recurring_entry);
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Recurring Entry",
            name: recurring_entry,
            fieldname: "status",
            value: "Disabled",
        },
        callback: function(r) {
            console.log("r", r.message);
            if (r.exc) {
                frappe.msgprint(__("There were errors."));
            } else {
                frappe.msgprint(__("Reccurring Successfully Updated!"));
            }
        },
    });
}

function updateRec_FromDate(recurring_entry, from_date) {
    console.log("recurring_entry", recurring_entry);
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Recurring Entry",
            name: recurring_entry,
            fieldname: "date_to",
            value: from_date,
        },
        callback: function(r) {
            console.log("x", r.message);
            if (r.exc) {
                frappe.msgprint(__("There were errors."));
            } else {
                frappe.msgprint(__("Reccurring Date Successfully Updated!"));
            }
        },
    });
}

function updateCompBen_Date(compben_id, to_date) {
    console.log("recurring_entry", recurring_entry);
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Other Compensation and Benefits Table",
            name: compben_id,
            fieldname: "effective_to_date",
            value: to_date,
        },
        callback: function(r) {
            console.log("r", r.message);
            if (r.exc) {
                frappe.msgprint(__("There were errors."));
            } else {
                frappe.msgprint(__("Reccurring Status Successfully Updated!"));
            }
        },
    });
}


function updateCompBen_status(compben_id) {
    console.log("recurring_entry", recurring_entry);
    frappe.call({
        method: "frappe.client.set_value",
        args: {
            doctype: "Other Compensation and Benefits Table",
            name: compben_id,
            fieldname: "is_active",
            value: 0,
        },
        callback: function(r) {
            console.log("r", r.message);
            if (r.exc) {
                frappe.msgprint(__("There were errors."));
            } else {
                frappe.msgprint(__("Reccurring Status Successfully Updated!"));
            }
        },
    });
}


function insertEmployee_compben(doc) {
    frappe.call({
        method: "frappe.client.insert",
        args: {
            doc: doc,
        },
        callback: function(r) {
            console.log("c", r.message);
            if (r.exc) {
                frappe.msgprint(__("There were errors."));
            } else {
                frappe.msgprint(__("Compben Successfully Added!"));
            }
        },
    });
}

function checkDuplicate(list) {
    let map = {};
    let result = false;
    for (let i = 0; i < list.length; i++) {
        if (map[list[i]]) {
            result = true;
            break;
        }
        map[list[i]] = true;
    }
    return result;
}

function automateSign(frm) {
    frappe.call({
    method: "frappe.client.get_value",
    args: {
            "doctype": "Employee",
            "filters": {"user_id": frappe.session.user},
            "fieldname": ["name", "full_name"]
    },
    async: false,
    callback: function (data) {
    if(frappe.session.user != "Administrator"){ 
        frm.set_value('prepared_by',data.message.name);
        frm.set_value('prepared_by_name',data.message.full_name);
    }
        frm.set_value('confirmed_by',frm.doc.employee);
        frm.set_value('confirmed_by_name',frm.doc.employee_name);
    }
    });
}

function additionalChanges(frm){
    //frm.set_value('new_branch_transfer', frm.doc.current_branch_transfer);
    frm.set_value('new_classification_transfer', frm.doc.current_classification_transfer);
    frm.set_value('new_section_transfer', frm.doc.current_section_transfer);
    frm.set_value('new_brand_transfer', frm.doc.current_brand_transfer);
    frm.set_value('new_classification_code_transfer', frm.doc.current_classification_code_transfer);
    frm.set_value('new_original_date_hired_transfer', frm.doc.current_original_date_hired_transfer);
    frm.set_value('new_group_transfer', frm.doc.current_group_transfer);
    frm.set_value('transfer_new_position_title', frm.doc.transfer_cur_position_title)
    frm.set_value('new_company', frm.doc.current_company)
    frm.set_value('new_cost_center',frm.doc.current_cost_center)
}

