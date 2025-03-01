frappe.ui.form.on('Employee Info Update', {
    async employee(frm) { 
        await family_members_main(frm); 
    },
    async item_type(frm) { 
        await family_members_main(frm); 
        await license_records_main(frm); 
        await education_main(frm); 
    },  
    async before_workflow_action(frm) {
        if (frm.selected_workflow_action === 'Approve') {
            await update_employee_main(frm);
            await update_family_main(frm, frm.doc.new_family_members);
            await update_education_main(frm, frm.doc.new_education);
            await update_license_records_main(frm, frm.doc.new_license_records);
        } else if (frm.selected_workflow_action === 'Cancel') {
            await revert_changes_main(frm);
            await update_family_main(frm, frm.doc.current_family_members);
            await update_education_main(frm, frm.doc.current_education);
            await update_license_records_main(frm, frm.doc.current_license_records);
        }   
    }
});

/* GENERATE EMPLOYEE INFORMATION FUNCTIONS */
//get_employee_information func: gets the document of the employee in the form
async function get_employee_information(frm) {
    if(frm.doc.employee) {
        var data = await frappe.db.get_doc("Employee", frm.doc.employee)
        /* Console Viewing: */
            console.log("Employee Document: ", data)
        /* End Console View */
    }
    return data
}

//family_members_main func: main function for setting up employee current family members
async function family_members_main(frm) {
    if(frm.doc.item_type == "General and Personal Info") {
        let data = await get_current_family_setup(frm)
            if(frm.doc.__islocal) {
                await add_family_members(frm, data, "current_family_members")
                await add_family_members(frm, data, "new_family_members")
            }
        /* Console Viewing: */
            console.log("Family Members: ", data)
        /* End Console View */
    }
}

//get_current_family_setup func: gets current family members
async function get_current_family_setup(frm) {
    let list = []
    let data = await get_employee_information(frm)
        if(data.family_members) {
            for(let x = 0; x < data.family_members.length; x++) {
                list.push(data.family_members[x])
            }
        }
    return list
}

//add_family_members func: plots current family members to family members table for current
async function add_family_members(frm, family, table) {
    frm.clear_table(table)
        $.each(family, function(i,row) {
            frm.add_child(table, {
                full_name: row.full_name,
                birthday: row.birthday,
                relationship: row.relationship,
                fm_contact: row.fm_contact,
                is_dependent: row.is_dependent,
                is_pwd: row.is_pwd,
                adult: row.adult,
                is_qualified_dependent: row.is_qualified_dependent
            })
            frm.refresh_fields(table)
        })
}


async function get_tablicense_information(frm) {
    if(frm.doc.employee) {
        var data = await frappe.db.get_doc("Employee", frm.doc.employee)
        /* Console Viewing: */
            console.log("license_records", data)
        /* End Console View */
    }
    return data
}


//LICENSE RECORDS
async function license_records_main(frm) {
    if(frm.doc.item_type == "General and Personal Info") {
        let data = await get_license_records_setup(frm)
            if(frm.doc.__islocal) {
                await add_license_records_members(frm, data, "current_license_records")
                await add_license_records_members(frm, data, "new_license_records")
            }
    }
}

async function get_license_records_setup(frm) {
    let list = []
    let data = await get_tablicense_information(frm)
        if(data.license_records) {
            for(let x = 0; x < data.license_records.length; x++) {
                list.push(data.license_records[x])
            }
        }
    return list
}


async function add_license_records_members(frm, license, table) {
    frm.clear_table(table)
        $.each(license, function(i,row) {
            frm.add_child(table, {
                lic_type: row.lic_type,
                lic_title: row.lic_title,
                lic_no: row.lic_no,
                lic_taken: row.lic_taken,
                lic_expiration: row.lic_expiration,
                lic_agency: row.lic_agency,
                lic_government: row.lic_government,
                lic_remarks: row.lic_remarks,
                lic_attach: row.lic_attach,
            })
            frm.refresh_fields(table)
        })
}
//END


//EDUCATION
async function get_tabeducation_information(frm) {
    if(frm.doc.employee) {
        var data = await frappe.db.get_doc("Employee", frm.doc.employee)
        /* Console Viewing: */
            console.log("education", data)
        /* End Console View */
    }
    return data
}

async function education_main(frm) {
    if(frm.doc.item_type == "General and Personal Info") {
        let data = await get_education_setup(frm)
            if(frm.doc.__islocal) {
                await add_education_members(frm, data, "current_education")
                await add_education_members(frm, data, "new_education")
            }
    }
}

async function get_education_setup(frm) {
    let list = []
    let data = await get_tabeducation_information(frm)
        if(data.education) {
            for(let x = 0; x < data.education.length; x++) {
                list.push(data.education[x])
            }
        }
    return list
}


async function add_education_members(frm, education, table) {
    frm.clear_table(table)
        $.each(education, function(i,row) {
            frm.add_child(table, {
                school_univ: row.school_univ,
                qualification: row.qualification,
                level: row.level,
                latin_honor: row.latin_honor,
                year_of_passing: row.year_of_passing,
                class_per: row.class_per,
                maj_opt_subj: row.maj_opt_subj,
            })
            frm.refresh_fields(table)
        })
}
/* END OF GENERATE EMPLOYEE INFORMATION FUNCTIONS */

/* UPDATE EMPLOYEE FAMILY MEMBERs FUNCTIONS */
// Update family members function
async function update_family_main(frm, decision) {
    if(frm.doc.item_type == "General and Personal Info") {
        let data = await scan_family_docs(frm, await get_employee_information(frm), decision)
            if(data) {
                await update_employee(frm, data, "frappe.client.insert_many")
            }
    }
}


//scan_family_docs func: gets family docs to be deleted
async function scan_family_docs(frm, data, family_table) {
    let list = []
        if(data) {
            for(let x = 0; x < data.family_members.length; x++) {
                await delete_docs(frm, data.family_members[x].doctype, data.family_members[x].name)
            }
        }
        if(family_table) {
            for(let i = 0; i < family_table.length; i++) {
                let doc = {
                    "doctype": "Family Members",
                    "full_name": family_table[i].full_name,
                    "birthday": family_table[i].birthday,
                    "relationship": family_table[i].relationship,
                    "fm_contact": family_table[i].fm_contact,
                    "is_dependent": family_table[i].is_dependent,
                    "is_pwd": family_table[i].is_pwd,
                    "is_qualified_dependent": family_table[i].is_qualified_dependent,
                    parent: frm.doc.employee,
                    parenttype: "Employee",
                    parentfield: "family_members"
                }
                list.push(doc)
            }

        }
        else {console.log("No Family Members Found")}
    return list    
}

//delete_family_docs func: deletes family docs 
async function delete_docs(frm, doctype, name) {
    frappe.call({
        method: 'frappe.client.delete',
        args: {'doctype' : doctype,
                'name': name
        },
        async : false,
        callback: async function(r) {
            console.log('Succesfully Deleted')
        }
    })    
}


async function update_education_main(frm, decision) {
    if (frm.doc.item_type === "General and Personal Info") {
        let existingEducation = await get_employee_information(frm);
        let newData = decision === 'approve' ? frm.doc.new_education : frm.doc.current_education;

        if (existingEducation) {
            // Attempt to update existing education records
            await update_or_insert_education(frm, existingEducation.education, newData);
        } else {
            // If no existing data, add new education records directly
            await add_education_members(frm, newData, 'current_education');
        }
    }
}

// Function to update or insert education records
async function update_or_insert_education(frm, existingEducation, newData) {

    // After updating, refresh fields
    frm.refresh_fields('current_education');
}


async function scan_education_docs(frm, data, education_table) {
    let list = []
        if(data) {
            for(let x = 0; x < data.education.length; x++) {
                await delete_docs(frm, data.education[x].doctype, data.education[x].name)
            }
        }
        if(education_table) {
            for(let i = 0; i < education_table.length; i++) {
                let doc = {
                    "doctype": "Employee Education",
                    "school_univ": education_table[i].school_univ,
                    "qualification": education_table[i].qualification,
                    "level": education_table[i].level,
                    "latin_honor": education_table[i].latin_honor,
                    "year_of_passing": education_table[i].year_of_passing,
                    "class_per": education_table[i].class_per,
                    "maj_opt_subj": education_table[i].maj_opt_subj,
                    parent: frm.doc.employee,
                    parenttype: "Employee",
                    parentfield: "education"
                }
                list.push(doc)
            }

        }
        else {console.log("No Education Found")}
    return list    
}


async function update_license_records_main(frm, decision) {
    if (frm.doc.item_type === "General and Personal Info") {
        let existingLicenseRecords = await get_employee_information(frm);
        let newData = decision === 'approve' ? frm.doc.new_license_records : frm.doc.current_license_records;

        if (existingLicenseRecords) {
            // Attempt to update existing license records
            await update_or_insert_license_records(frm, existingLicenseRecords.license_records, newData);
        } else {
            // If no existing data, add new license records directly
            await add_license_records_members(frm, newData, 'current_license_records');
        }
    }
}

// Function to update or insert license records
async function update_or_insert_license_records(frm, existingLicenseRecords, newData) {
    // Logic to update existing license records if needed
    // Example logic: Compare and update existingLicenseRecords with newData
    // ...
    // After updating, refresh fields
    frm.refresh_fields('current_license_records');
}


async function scan_license_records_docs(frm, data, license_records_table) {
    let list = []
        if(data) {
            for(let x = 0; x < data.license_records.length; x++) {
                await delete_docs(frm, data.license_records[x].doctype, data.license_records[x].name)
            }
        }
        if(license_records_table) {
            for(let i = 0; i < license_records_table.length; i++) {
                let doc = {
                    "doctype": "Employee Licensure",
                    "lic_type": license_records_table[i].lic_type,
                    "lic_title": license_records_table[i].lic_title,
                    "lic_no": license_records_table[i].lic_no,
                    "lic_taken": license_records_table[i].lic_taken,
                    "lic_expiration": license_records_table[i].lic_expiration,
                    "lic_agency": license_records_table[i].lic_agency,
                    "lic_government": license_records_table[i].lic_government,
                    "lic_remarks": license_records_table[i].lic_remarks,
                    "lic_attach": license_records_table[i].lic_attach,
                    parent: frm.doc.employee,
                    parenttype: "Employee",
                    parentfield: "license_records"
                }
                list.push(doc)
            }

        }
        else {console.log("No Education Found")}
    return list    
}
/* END OF UPDATE EMPLOYEE FAMILY MEMBERS FUNCTIONS*/

/* GET FORM FIELDS FUNCTIONS */
//get_form_fields func: gets the fields of the form with existing values to update the employee document
async function get_form_fields(frm, startsWith) {
    let section = frm.fields_dict
    let data = []
        $.each(frm.fields_dict, function(i,row) {
            if(row.df.depends_on == `eval:doc.item_type=='${frm.doc.item_type}'`) {
                for(let x = 0; x < section[row.df.fieldname].fields_list.length; x++) {
                    let fieldname = section[row.df.fieldname].fields_list[x].df.fieldname
                    if(fieldname.startsWith(startsWith) && (fieldname != "amended_from" && fieldname != "new_family_members" && "current_family_members")) {
                        data.push(fieldname)
                    }
                }
            }
        })

    return data
}
/* END OF FORM FIELDS FUNCTIONS */

/* UPDATE EMPLOYEE 201 FUNCTIONS */
//update_employee_main func: updates the employee 201 based on the item_type on the form and fields with values
async function update_employee_main(frm) {
    let data = await get_fields_to_update(frm)
        await update_employee(frm, data, "frappe.client.bulk_update")
    /* Console Viewing: */
        console.log("Fields: ", data)
    /* End Console View */
}

//get_fields_to_update func: get fields with values
async function get_fields_to_update(frm) {
    let list = []
    let address = ['new_address','new_address_postal_code']
    let fields_list = {"doctype": "Employee", "docname": frm.doc.employee}
    let data = await get_form_fields(frm, 'new_')
        for(let x = 0; x < data.length; x++) {
            if((typeof frm.doc[data[x]] != 'undefined' && frm.doc[data[x]] != "") && !address.includes(data[x])) {
                var fieldname = data[x].replace("new_","")
                fields_list[fieldname] = frm.doc[data[x]]
            }
            if((typeof frm.doc[data[x]] != 'undefined' && frm.doc[data[x]] != "") && address.includes(data[x])) {
                var fieldname = data[x].replace("new_","current_")
                fields_list[fieldname] = frm.doc[data[x]]
            }          
        }
        list.push(fields_list)
    return list
}

//revert_changes_main func: reverts the changes made to the employee records based on the forms current values
async function revert_changes_main(frm) {
    let data = await get_fields_to_revert(frm)
        await update_employee(frm, data, "frappe.client.bulk_update")
    /* Console Viewing: */
        console.log("Fields: ", data)
    /* End Console View */
}

//get_fields_to_revert func: reverts changes made using the fields in the form
async function get_fields_to_revert(frm) {
    let list = []
    let address = ['current_address','current_address_postal_code']
    let fields_list = {"doctype": "Employee", "docname": frm.doc.employee}
    let _data = await get_form_fields(frm, 'current_')
    let data = await get_form_fields(frm, 'current_')
        for(let x = 0; x < data.length; x++) {
            if(!address.includes(data[x])) {
                var fieldname = data[x].replace("current_","")
                if(typeof frm.doc[_data[x]] == 'undefined') {fields_list[fieldname] = ""}
                else {fields_list[fieldname] = frm.doc[data[x]]}
            }
            if(address.includes(data[x])) {
                if(typeof frm.doc[_data[x]] == 'undefined') {fields_list[fieldname] = ""}
                else {fields_list[fieldname] = frm.doc[data[x]]}
            }          
        }
        list.push(fields_list)
    return list
}

//update_employee func: updates the employee records based on the new fields
async function update_employee(frm, data, call_method) {
    await frappe.call({
        method: call_method,
        args: {
            docs: data
        },
        callback: function(response) { 
            console.log("Document Updated: ", response.message)
            frappe.msgprint(__("Updated Records"))
        },
        error: function(response) { 
            console.log("Error Occured: ", response.error) 
            frappe.validated = false
        } 
    })
}
/* END OF UPDATE EMPLOYEE 201 FUNCTIONS */

/*===============================================================================================================
NOTE: Use Blackbox AI to explain this code line by line or function by function if comments are unclear 
Change Logs:
    Date:               PIC:                    Remarks:
    2024-06-11          EJL                     Created Script
=================================================================================================================*/