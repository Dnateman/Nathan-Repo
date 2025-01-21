frappe.ui.form.on('Employee', {
    onload: function(frm) {
        
        hideRowTest(frm)
        // Check if the current user is not an Administrator
        if (frappe.session.user !== 'Administrator') {
            make_fields_read_only(frm);
        }
        // get_summaries(frm)
    },
    archive_records(frm) {
        evaluation_summary_main(frm)
    }
});
async function hideRowTest(frm){
    // Loop through child table rows
    $.each(frm.doc.rate_table || [], function(i, row) {
        // Apply your condition here
        //console.log(frappe.user_defaults.Employee == row.rate)
        if (frappe.session.user == 'Administrator') {
            $(frm.fields_dict.rate_table.grid.wrapper).find('.grid-row[data-name="' + row.name + '"]').find('input, textarea, select').attr('disabled', 'disabled');
        } else {
            $(frm.fields_dict.rate_table.grid.wrapper).find('.grid-row[data-name="' + row.name + '"] .grid-static-col').each(function() {
                $(this).attr('contenteditable', 'true'); // Make the field read-only
            });            
        }
    });
}
/* 3 YEAR EVALUATION SUMMARIES */
//evaluation_summary_main func: main function for deleting and re-posting evaluation summaries
async function evaluation_summary_main(frm) {
    let eval_summaries = await get_summaries(frm)
    let documents = await create_summary_documents(frm, eval_summaries)
        await post_records(frm, documents)
        await delete_records(frm, eval_summaries)

    /* Console Viewing: */
        console.log("Evaluation Summaries: ", eval_summaries)
        console.log("Records: ", documents)
    /* End Console View */
}

//get_summaries func: function to retrieve evaluation summaries 
async function get_summaries(frm) {
    let table = frm.doc.evaluation_table
    let data = []

        if(typeof table == "undefined") {
            return
        }
        
        for(let x = 0; x < table.length; x++) {
            let creation_date = new Date(table[x].creation)
            let date_today = new Date()
            let timediff = Math.abs(creation_date - date_today) / (24 * 60 * 60 * 1000)
            let max = 365 * 3

                if(timediff >= max) {
                    data.push(table[x])
                }

            /* Console Viewing: */
                console.log(`Creation Date: ${creation_date}`)
                console.log(`Date Today: ${date_today}`)
                console.log(`Time Difference: ${timediff}`)
            /* End Console View */
        }
    
    return data
}

//create_summary_documents func: makes a document of the employee evaluation summaries to post in another doctype
async function create_summary_documents(frm, data) {
    let docs = []
        for(let x = 0; x < data.length; x++) {
            let doc = {
                "doctype": "Evaluation History",
                "employee": data[x].employee,
                "employeE_name": data[x].employee_name,
                "average": data[x].average,
                "remarks": data[x].remarks,
                "academic_year": data[x].academic_year,
                "frequency_type": data[x].frequency_type,
                "frequency": data[x].frequency
            }
            docs.push(doc)
        }
    return docs
}

//post_records func: post evaluations to another doctype
async function post_records(frm, documents) {
    frappe.call({
        method: "frappe.client.insert_many",
        args: {
            docs: documents
        },
    callback: function(response) { 
        console.log("Document Updated: ", response.message)
        frappe.msgprint(__("Posted Documents"))
    },
    error: function(response) { console.log("Error Occured: ", response.error) } })
}

//delete_records func: delete evaluations over 3 years
async function delete_records(frm, data) {
    for(let x = 0; x < data.length; x++) {
        frappe.call({
            method: 'frappe.client.delete',
            args: {
                'doctype' : "Performance Evaluation History",
                'name': data[x].name
            },
            async : false,
            callback: async function(r) {
                console.log('Succesfully Deleted')
            }
        }) 
    }
}
/* END OF 3 YEAR EVALUATION SUMMARIES */

function make_fields_read_only(frm) {
    var read_only_fields = [
        'transaction_type',
        'recurring_entry',
        'amount',
        'effective_from_date',
        'effective_to_date',
        'remarks',
        'bank_name',
        'bank_type',
        'bank_account',
        'account_type',
        'branch_code',

        'total_yr_days',
        'rate_type',
        'rate',
        'job_grade',
        'payroll_schedule',
        'rate_class',
        'period_group',
        'min_take_home',
        'cost_center',
        'mode_of_payment',
        'mwe_loc',
        'payroll_group',
        'mth_percentage',
		
        'sss_no',
        'sss_mode',
        'hdmf_no',
        'hdmf_mode',
        'phic_no',
        'phic_mode',
        'tin',
        'rdo_code',
        'sss_manual',
        'hdmf_manual',
        'whtax_mode',
        'phic_manual',
        'whtax_manual',
        'sss_freq',
        'hdmf_freq',
        'phic_freq',
        'whtax_freq',
        'part_time',
    ];

    var rate_table_fields = ["rate", "effective_until", "rate_type", "payroll_schedule", "nature", "trigger_by"];
    var banks_table_fields = ["bank_name", "bank_type", "bank_account", "account_type", "branch_code"];
    var family_members_fields = ["full_name", "birthday", "relationship", "fm_contact"];
    var education_fields = ["school_univ", "qualification", "level", "latin_honor", "year_of_passing", "class_per", "maj_opt_subj"];
    var license_records_fields = ["lic_type", "lic_title", "lic_no", "lic_taken", "lic_expiration", "lic_agency", "lic_goverment", "lic_remarks", "lic_attach"];
    var work_history_fields = ["company", "position", "from_date", "to_date", "address"];
    var trainings_seminar_fields = ["train_title", "train_venue", "train_start", "train_end", "train_cert", "train_remarks"];
    var approvers_fields = ["approver", "approver_name", "application", "level"];

    // Function to set fields as read-only
    function set_fields_read_only(fields) {
        fields.forEach(function(field) {
            frm.set_df_property(field, 'read_only', true);
        });
    }

    // Checking user roles and setting fields as read-only accordingly
    if (frappe.user.has_role('HR1')) {
        set_fields_read_only(read_only_fields);
        var rt = frappe.meta.get_docfield("rate_table", rate_table_fields, frm.doc.Employee);
        var bs = frappe.meta.get_docfield("bank_setup", banks_table_fields, frm.doc.Employee);
        set_fields_read_only(rt);
        set_fields_read_only(bs);
    } else if (frappe.user.has_role('HR2 Payroll Processor')) {
        var payroll_processor_fields = [
            'last_name', 'first_name', 'middle_name', 'full_name', 'age', 'profile_picture', 'gender',
            'suffix', 'maiden_name', 'birthday', 'birth_place', 'biometrics_id', 'email', 'personal_email',
            'role_profile', 'user_id', 'company', 'official_company', 'official_location', 'employment_status',
            'position_title', 'job_level', 'sensitivity', 'default_schedule', 'project', 'is_active',
            'is_under_agency', 'on_hold', 'location', 'category', 'area_of_study', 'date_hired', 'date_retired',
            'years_in_service', 'reports_to', 'department', 'section', 'frequency', 'religion', 'nationality',
            'blood_type', 'civil_status', 'spouse', 'is_solo_parent', 'is_widowed', 'contact_number',
            'current_address', 'current_address_postal_code', 'permanent_address', 'permanent_address_postal_code',
            'passport_number', 'date_of_issue', 'valid_upto', 'place_of_issue'
        ];

        set_fields_read_only(payroll_processor_fields);
        var family_members_df = frappe.meta.get_docfield("family_members", family_members_fields, frm.doc.Employee);
        var education_df = frappe.meta.get_docfield("education", education_fields, frm.doc.Employee);
        var license_records_df = frappe.meta.get_docfield("license_records", license_records_fields, frm.doc.Employee);
        var work_history_df = frappe.meta.get_docfield("work_history_table", work_history_fields, frm.doc.Employee);
        var trainings_seminar_df = frappe.meta.get_docfield("trainings_seminar", trainings_seminar_fields, frm.doc.Employee);
        var approvers_df = frappe.meta.get_docfield("approvers", approvers_fields, frm.doc.Employee);
        set_fields_read_only(family_members_df);
        set_fields_read_only(education_df);
        set_fields_read_only(license_records_df);
        set_fields_read_only(work_history_df);
        set_fields_read_only(trainings_seminar_df);
        set_fields_read_only(approvers_df);
    } else if (frappe.user.has_role('HR2 Timekeeping')) {
        set_fields_read_only(read_only_fields);
        set_fields_read_only(payroll_processor_fields);
        var family_members_df = frappe.meta.get_docfield("family_members", family_members_fields, frm.doc.Employee);
        var education_df = frappe.meta.get_docfield("education", education_fields, frm.doc.Employee);
        var license_records_df = frappe.meta.get_docfield("license_records", license_records_fields, frm.doc.Employee);
        var work_history_df = frappe.meta.get_docfield("work_history_table", work_history_fields, frm.doc.Employee);
        var trainings_seminar_df = frappe.meta.get_docfield("trainings_seminar", trainings_seminar_fields, frm.doc.Employee);
        var approvers_df = frappe.meta.get_docfield("approvers", approvers_fields, frm.doc.Employee);
        set_fields_read_only(family_members_df);
        set_fields_read_only(education_df);
        set_fields_read_only(license_records_df);
        set_fields_read_only(work_history_df);
        set_fields_read_only(trainings_seminar_df);
        set_fields_read_only(approvers_df);
        // Additional handling specific to HR2 Timekeeping can be added here if needed
    }
}

/*===============================================================================================================
NOTE: Use Blackbox AI to explain this code line by line or function by function if comments are unclear 
Change Logs:
    Date:               PIC:                    Remarks:
    2024-07-21          EJL                     Modified Script
=================================================================================================================*/
