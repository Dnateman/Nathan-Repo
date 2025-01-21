/*Modified by nathan: Blockings for leave application December 21 onwards until next year if the current year is not equal to the year applied*/
/*Modified by Sheena: Adjustment for Leave Type Trigger and Medical Record Fields*/
/*Deployed the policy for New Leave Policy */
/*Edited by Kent 2022/12/14 automate Anual leave */
/*Edited by Janella 2023/01/19 Filter of Leave Type based in Classification */

frappe.ui.form.on("Leave Application", {
    onload: function(frm) {
        
        // check_union_lv(frm)
        hideActionButton(frm)
		// blockMaternityLeave(frm)
        /*frappe.msgprint({
            title: __('Message'),
            indicator: 'red',
            message: __('Filing and approval of leave applications are temporarily blocked until further notice')
        });
        frappe.validated = false;*/
	var roles = frappe.user_roles;
	document.getElementsByClassName('form-message text-muted small')[0].style.visibility= 'hidden';
	frm.set_value('group',frm.doc.temp_group);
	/*if(!roles.includes('Admin Officer') && frappe.session.user == "Administrator") {
		if (frm.doc.owner == frappe.session.user) {
				document.getElementsByClassName('text-right col-md-5 col-sm-4 col-xs-6 page-actions')[0].style.visibility = 'hidden';
		}
	}*/

	/*if (frm.doc.workflow_state == "Approve")         
					   {  
							frappe.msgprint("Approve Clicked");
							console.log("insert");
							check_approver_list(frm);
						}*/
	cur_frm.set_df_property("year_of_birthday_for_application", "reqd", 0);
		if(frm.doc.leave_type == 'Birthday Leave'){
			cur_frm.set_df_property("year_of_birthday_for_application", "reqd", 1);
		} 
	//filterLeaveType(frm);
    filterLeaveTypeNewPolicy(frm);
	// blockAppliedConsecutivePaternalLeave(frm);
	block2consecutivepaternityleave(frm);
	},
	before_submit: async function(frm){
		//checks if the admin officer is in Employee 201 approver list
		await check_approver_list(frm);
		//Check if there is applied approved overtime application upon approval
		await check_overtime_app(frm);
		await blockifGreaterThanApprovalDueDate(frm);
		
	}, 
	on_submit: function(frm){
		//blockLASecApp(frm);
	}, 
	validate: async function(frm,cdt,cdn){
        // await blockBirthdayLeave(frm)
        if(frm.doc.leave_type == 'Birthday Leave') { await getRange(frm) }
        /*frappe.msgprint({
            title: __('Message'),
            indicator: 'red',
            message: __('Filing and approval of leave applications are temporarily blocked until further notice')
        });
        frappe.validated = false;*/
		//Check if there is applied approved overtime application upon saving Leave application
		check_pending_overtime_app(frm);
		check_vlp_group(frm);
		blockPrevConvertibleLeave(frm);
		//blockHoliday(frm,cdt,cdn);
		blockHolidayforDaily(frm,cdt,cdn);
		//blockLASecApp(frm);
		checkReservedLeaveType(frm);
		//block if wedding leave is 2 consecutive leave
		blockNotTwoConsecutiveWedLeave(frm);
		blockAppliedConsecutivePaternalLeave(frm);
		block2consecutivepaternityleave(frm);
		//Block more than 1 day for menstrual leave for the month
		blockMoreThanOneMenstrualLeave(frm);
		blockifwithfiledOneMenstrualLeave(frm);
		if(frm.is_new()){
			blockifGreaterThanFillingDueDate(frm);
		}
		disableExclude(frm)
	},
	before_load: function(frm) {
	//frm.doc_reload()
	//filterLeaveTypeNewPolicy(frm);
        /*frappe.msgprint({
            title: __('Message'),
            indicator: 'red',
            message: __('Filing and approval of leave applications are temporarily blocked until further notice')
        });
        frappe.validated = false;*/
		//filterLeaveType(frm);
        filterLeaveTypeNewPolicy(frm);
		restrictParentFields(frm)
        hideShowfields(frm);
	},
	before_cancel: async function(frm){
		await blockTKStatusClosed(frm);
	},
	leave_type: async function(frm){
	clearMedicalRelatedFields(frm)
        hideShowfields(frm);
		cur_frm.set_df_property("year_of_birthday_for_application", "reqd", 0);
		if(frm.doc.leave_type == 'Birthday Leave'){
			cur_frm.set_df_property("year_of_birthday_for_application", "reqd", 1);
		}
        if(frm.doc.leave_type == 'Annual Leave' || frm.doc.leave_type == 'Carry-over Leave'){
			cur_frm.set_df_property("annual_type", "reqd", 1);
		}
		filterLeaveTypeNewPolicy(frm);
	}, 
	employee: function(frm){
        filterLeaveTypeNewPolicy(frm);
		//filterLeaveType(frm);
	},
	refresh: function(frm){
        filterLeaveTypeNewPolicy(frm);
       
		//filterLeaveType(frm);
	},
	before_save: async function(frm){
		await autoOnTimeSubmission(frm);
		await autoOnTimeApproval(frm);
		await blocklateyear(frm);
		BlocksFillingtoSpecificDate(frm);
		// if (frm.doc.leave_type == 'Maternity Leave') {
		// 	let value = 105
		// 	await blockMaternityLeave(frm, value)
		// }
		// await blockMaternityLeave(frm)
	},
	annual_type(frm){
		clearMedicalRelatedFields(frm)
	},
	onload_post_render : async function(frm){
		filterLeaveTypeNewPolicy(frm);
	},
    annual_type: function(frm){
        hideShowfields(frm);
    },
    before_workflow_action : function(frm){

    },
	before_approve: function(frm){
		
	}
    
})
// //TODO: This function will block the birthday leave 
// async function blockBirthdayLeave(frm) {
//     // Fetch employee data including their birthday
//     const employeeData = await frappe.db.get_list('Employee', {
//         filters: { 'name': frm.doc.employee },
//         fields: ['birthday']
//     });
//     // Extract the birthdate from the fetched data
//     const birthDate = employeeData[0].birthday;
//     // Get the current year
//     const currentYear = (new Date()).getFullYear();
//     // Update the birthdate to the current year
//     const updatedBirthDate = new Date(birthDate);
//     updatedBirthDate.setFullYear(currentYear);
//     // NOTE: Calculate the start date (15 days before the birthday)
//     const startDate = new Date(updatedBirthDate);
//     startDate.setDate(startDate.getDate() - 15)
//     const startFormattedDate = startDate.toISOString().split('T')[0];
//     // NOTE: Calculate the end date (15 days after the birthday)
//     const endDate = new Date(updatedBirthDate);
//     endDate.setDate(endDate.getDate() + 15);
//     const endFormattedDate = endDate.toISOString().split('T')[0];

//     if(frm.doc.leave_type === 'Birthday Leave'){
//         if(frm.doc.from_date < startFormattedDate){ //TODO block application if from date is lesser than the supposed start date of leave
//             frappe.validated = false;
//             frappe.throw(`You can only file Birthday Leave between ${startFormattedDate} and ${endFormattedDate}`)
//         }
//         else if(frm.doc.from_date > endFormattedDate){ //TODO block application if from date is greater than the supposed end date of leave
//             frappe.validated = false;
//             frappe.throw(`You can only file Birthday Leave between ${startFormattedDate} and ${endFormattedDate}`)
//         }
//     }
// }

async function firstLastDays(year, month) {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    return { firstDay, lastDay }
}

async function subDays(_date, days) {
    let date = new Date(_date)
    _date.setDate(date.getDate() - days)
    return date
}

async function addDays(_date, days) {
    let date = new Date(_date)
    _date.setDate(date.getDate() + days)
    return date
}

async function getRange(frm) {
    let date = new Date(frm.doc.birthday)
    let birthyear = frm.doc.year_of_birthday_for_application
    let birthmonth = date.getMonth() + 1
    let { firstDay, lastDay } = await firstLastDays(birthyear, birthmonth)
    let range_from = await subDays(firstDay, 15)
    let range_to = await addDays(lastDay, 15)

    /* Console Viewing */
        console.log("First Day of the Month: ", firstDay)
        console.log("Last Day of the Month: ", lastDay)
        console.log("Range From: ", range_from)
        console.log("Range To: ", range_to)
        console.log(frm.doc.from_date < firstDay)
        console.log(frm.doc.to_date > lastDay)
    /* End Console View */

    if(frm.doc.from_date < firstDay || frm.doc.to_date > lastDay) {
        frappe.throw(__("Birthday Leave filing is between 15 days before and after your Birth Month"))
        frappe.validated = false
    }
}



async function blocklateyear(frm) {
	let freeMe = ['Work From Home','CTO Leave']
	let from = new Date(frm.doc.from_date)
	let from_year = from.getFullYear()
	let cur_date = new Date()
	let cur_year = cur_date.getFullYear()
        if (!freeMe.includes(frm.doc.leave_type)) {
            if (from_year != cur_year) {
                frappe.msgprint(__("Last Year Filings are now Closed"))
                frappe.validated = false
            }
        }
}

async function clearMedicalRelatedFields(frm){
	if(frm.doc.leave_type != 'Annual Leave'){
		frm.set_value('annual_type', '')
	} 
	if(frm.doc.annual_type != 'Sick Leave'){
		frm.set_value('medical_record', '')	
	}
	frm.set_value('medical_record_date', '')
	frm.set_value('medical_record', '')
	frm.set_value('medical_cert', '')
}

//Filter Leave Type New Policy
async function filterLeaveTypeNewPolicy(frm){
	let type_emp = typeof frm.doc.employee;
	//console.log(type_emp, frm.doc.employee)
	if(type_emp != 'undefined'){
		let list = [];
		let _filters = {"do_not_show_in_leave_application_form": 0, "reserve": ["!=", 1]};
		let _fields  = ["name","female_only", "male_only", "married_only", "solo_parent_only"]
		let _data = await frappe.db.get_list("Leave Type",{filters: _filters, fields: _fields, order_by: 'name asc', limit: 1000});
		
		//console.log("Leave Type List", _data, _data.length)
		if (_data.length != 0) {
			for (var i = 0; i < _data.length; i++) {
				let _emp = await frappe.db.get_value('Employee', frm.doc.employee, ['classification','gender', 'civil_status', 'is_solo_parent'])
				if((_data[i].female_only == 1 && _emp.message.gender == 'Female') || (_data[i].male_only == 1 && _emp.message.gender == 'Male')
					|| (_data[i].married_only == 1 && _emp.message.civil_status == 'Married')
					|| (_data[i].solo_parent_only == 1 && _emp.message.is_solo_parent == 1)
					|| (_data[i].female_only == 0 && _data[i].male_only == 0 && _data[i].married_only == 0 && _data[i].solo_parent_only == 0)){
					//console.log("i", i, _data[i].name)
					let classification = [];
					let _filters_class = {"parent": _data[i].name};
					let _fields_class  = ["classification"]
					let _data_class = await frappe.db.get_list("Leave Type Classification",{filters: _filters_class, fields: _fields_class, order_by: 'classification asc', limit: 1000});
					let _type_class = typeof _data_class;
					//console.log("_type_class", _type_class)
					if (_type_class != 'undefined') {
						for (var j = 0; j < _data_class.length; j++) {
							//console.log("parent", _data_class[j].parent)
							//console.log("_emp",_emp, _emp.message.classification);
							if(_data_class[j].classification == _emp.message.classification){
								list.push(_data[i].name);
							}
						}
					} else {
						list.push(_data[i].name);
					}	
				} 
			}
		} 
		//console.log("list", list)
		frm.set_query("leave_type", function() {
			return {
				filters: [
						["Leave Type","name", "IN", list]
				]
			}
		});

		let chck_lvtype = typeof frm.doc.leave_type;
		if(chck_lvtype != 'undefined'){
			let _lv_type = frm.doc.leave_type;
			if(!list.includes(_lv_type)){
				frm.set_value('leave_type', '');
			}
		}
	}
}

//block more than 1 leave days for Menstrual Leave
function blockMoreThanOneMenstrualLeave(frm){
	if(frm.doc.leave_type == 'Menstrual Leave'){
		if(frm.doc.total_leave_days > 1){
			frappe.msgprint({
				title: __('Error Message'),
				indicator: 'red',
				message: __('Filling for ' + frm.doc.leave_type + ' allows 1 leave credit per month only.')
				});
			frappe.validated = false;
		}
	}
}

//block if one day is already applied for the month
async function blockifwithfiledOneMenstrualLeave(frm){
	if(frm.doc.leave_type == 'Menstrual Leave') {
		let date = new Date(frm.doc.from_date);
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		let new_first_date = await format_dates(frm, firstDay)
		let new_last_date = await format_dates(frm, lastDay)
		
		let filter =  {
						'employee': frm.doc.employee, 
						'leave_type': 'Menstrual Leave', 
						'workflow_state': ["IN",['Pending','Approved']], 
						'from_date': ["between", [new_first_date,new_last_date]], 
						'name': ["!=",frm.doc.name]
					}

		let fields = ['name', 'employee', 'leave_type', 'sum(total_leave_days) "total_leave_days"', 'from_date']
		let data_ = await frappe.db.get_list('Leave Application', {filters: filter, fields: fields , limit : 100})
		let data = data_.filter(doc => new Date(doc.from_date).getMonth() == date.getMonth())

		if(data.length > 0){
			let cnt = 0;
			for (var i = 0; i < data.length; i++) {
				
				if(data[i].employee != null){
					cnt = cnt + 1;
				} 
				
			}

			if(cnt > 0){
				frappe.msgprint({
					title: __('Error Message'),
					indicator: 'red',
					message: __('Already have an existing application for Menstrual Leave for the month.')
					});
				frappe.validated = false;
			}
		}
		/* Console Viewing  */
			console.log(`First Day: ${new_first_date}`)
			console.log(`Last Day: ${new_last_date}`)
			console.log("Data: ", data)
			console.log(`Data Lenght: ${data.length}`)
		/* End Console View */
	}
}

//format_dates func: formats date values into YYYY-mm-dd
async function format_dates(frm, value) {
    let date_value = new Date(value)
    let day = String(date_value.getDate()).padStart(2, '0')
    let month = String(date_value.getMonth() + 1).padStart(2, '0')
    let year = String(date_value.getFullYear())
    let formatted_date = `${year}-${month}-${day}`

    return formatted_date
}

//block two consecutive wed leave
function blockNotTwoConsecutiveWedLeave(frm){
	if(frm.doc.leave_type == 'Wedding Leave'){
		let cnt = 0;
		$.each(frm.doc.leave_application_table, async function(i, row){
			if(row.is_excluded == 1){
				cnt = cnt + 1;
			}
		})
		if(cnt > 0){
			frappe.msgprint({
				title: __('Notification'),
				indicator: 'red',
				message: __('Wedding Leave Must be applied in 2 consecutive days.')
				});
			frappe.validated = false;
		}
	}
}
async function blockAppliedConsecutivePaternalLeave(frm){
	if(frm.doc.leave_type == 'Pawternity Leave'){
		if(frm.doc.total_leave_days >= 2){
			frappe.msgprint({
				title: __('Notification'),
				indicator: 'red',
				message: __('Pawternity Leave is not allowed to be applied in 2 consecutive days.')
				});
			frappe.validated = false;
		}
	}
}

async function block2consecutivepaternityleave(frm){
	// let filter = {'leave_type': 'Paternity Leave', 'employee': frm.doc.employee}
	// let field  = ['name','employee']
	// let data   = await frappe.db.get_list('Leave Application', {filters: filter, fields: field, limit: 1, })
	// console.log(data)
  
	// 	let filter_tab = {'parent' : data[0].name}
	// 	let field_tab  = ['leave_date', 'parent'] 
	// 	let data_tab   =  await frappe.db.get_list('Leave Application Table', {filters: filter_tab, fields: field_tab})
	
	// $.each(frm.doc.leave_application_table, async function(i, row){
	// 	console.log(row)
	// })	

	let filter = {'leave_type': 'Pawternity Leave', 'employee': frm.doc.employee}
	let field  = ['name','employee']
	let data   = await frappe.db.get_list('Leave Application', {filters: filter, fields: field, limit: 100000})
	//console.log(data)

	let leave_dates = []

	$.each(data, async function(i, row){
		let filters = {'parent': row.name}
		let fields  = ['*']
		let child   = await frappe.db.get_list('Leave Application Table', {filters: filters, fields: fields, limit: 100000})
		//console.log('CHILD',child)

		$.each(child, async function(ix, rowx){
			if(rowx.is_excluded != 1){
				leave_dates.push(rowx.leave_date)
			}
		})

		//console.log('len', data.length, i)
		if(data.length == i+1){
			//console.log('leave dates', leave_dates)
			$.each(frm.doc.leave_application_table, async function(iz, rowz){
				let date = rowz.leave_date
				let prev = frappe.datetime.add_days(date, -1)
				let fwd = frappe.datetime.add_days(date, 1)

				//console.log('HEY', prev, fwd)

				if(leave_dates.includes(prev) || leave_dates.includes(fwd)){
					frappe.validated = false
					msgprint('Pawternity Leave is not allowed to be applied in 2 consecutive days. You have a filing on other application.');
				}
			})
		}
	})
}

function restrictParentFields(frm) {
	//console.log(frm.doc)
	//console.log(frappe.session.user)
	var fields = Object.keys(frm.doc)
	//console.log(fields)
	var roles = frappe.user_roles;
	if (frappe.session.user.toLowerCase() != frm.doc.owner.toLowerCase() && !roles.includes('HR Timekeeper (MHO)') && !roles.includes('Admin Officer') && !roles.includes('Administrator')) {
		for (i = 0; i < fields.length; i++) {
			var type = typeof frappe.meta.get_docfield(frm.doc.doctype, fields[i], frm.doc.name)
			//console.log(fields[i])
			//console.log(frappe.meta.get_docfield(frm.doc.doctype, fields[i], frm.doc.name))
			if (type != 'undefined') {
				if (fields[i] == 'reason' || fields[i] == 'remarks') {} 
				else {
					frappe.meta.get_docfield(frm.doc.doctype, fields[i], frm.doc.name).read_only=1;
					if (frappe.meta.get_docfield(frm.doc.doctype, fields[i], frm.doc.name).fieldtype == 'Table') {
						restrictChildFields(frm,fields[i],frappe.meta.get_docfield(frm.doc.doctype, fields[i], frm.doc.name).options)
					}
				}
			}
		}
	}
}

function restrictChildFields(frm, child_table, child_table_name) {
	//console.log(child_table)
	//console.log(child_table_name)
	$.each(frm.doc[child_table], function(i,row) {
		//console.log(row)
	var fields = Object.keys(row)
	//frappe.meta.get_docfield(child_table, fields[], frm.doc.name).read_only=1;
	//console.log(fields)
	for (k = 0; k < fields.length; k++) {
		var type = typeof frappe.meta.get_docfield(child_table_name, fields[k], frm.doc.name)
		//console.log(fields[k])
		//console.log(type)
		if (type != 'undefined') {
			frappe.meta.get_docfield(child_table_name, fields[k], frm.doc.name).read_only=1;
		}
	}
	})
}

//Hide and Show fields
function hideShowfields(frm) {
	frm.set_value('group',frm.doc.temp_group);
	if(frm.doc.leave_type == 'Sick Leave' || 
        frm.doc.annual_type == 'Sick Leave') {
            //console.log("Show Medical Record")
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).hidden=0;
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).reqd=1;
		frm.set_df_property('medical_record', 'reqd', 1)
		frm.set_df_property('medical_record', 'hidden', 0)

	} else if (frm.doc.leave_type == 'CTO Leave'){
		// frappe.meta.get_docfield('Leave Application', 'cto_type', frm.doc.name).reqd=1;
		// frappe.meta.get_docfield('Leave Application', 'cto_type', frm.doc.name).hidden=0;
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).reqd=0;
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).hidden=1;
		frm.set_df_property('cto_type', 'reqd', 1)
		frm.set_df_property('cto_type', 'hidden', 0)
		frm.set_df_property('medical_record', 'reqd', 0)
		frm.set_df_property('medical_record', 'hidden', 1)

	} else {
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).hidden=1;
		// frappe.meta.get_docfield('Leave Application', 'medical_record', frm.doc.name).reqd=0;
		// frappe.meta.get_docfield('Leave Application', 'cto_type', frm.doc.name).hidden=1;
		// frappe.meta.get_docfield('Leave Application', 'cto_type', frm.doc.name).reqd=0;
		frm.set_df_property('medical_record', 'hidden', 1)
		frm.set_df_property('medical_record', 'reqd', 0)
		frm.set_df_property('cto_type', 'hidden', 1)
		frm.set_df_property('cto_type', 'reqd', 0)
	}
}


frappe.ui.form.on('Leave Application','from_date', function(frm,cdt,cdn) {
	frm.set_value('group',frm.doc.temp_group);
	approvers = frappe.call({
			method: "frappe.client.get_value",
			args: {
					"doctype": "Employee Approvers",
					"filters": {"parent": frm.doc.employee,
					"level": "1"},
					"fieldname": "approver"
			},
		 callback: function (data) {
			//console.log(data.message.approver);
			approvers = frappe.call({
				method: "frappe.client.get_value",
				args: {
						"doctype": "Employee",
						"filters": {"name": data.message.approver},
						"fieldname": "user_id"
				},
			 callback: function (data) {
				//console.log(data.message.user_id);
				frm.set_value('approver_email_list',data.message.user_id);
					}
				});
				}
			});
})

frappe.ui.form.on('Leave Application Table','is_first_half', function(frm,cdt,cdn) {
	var checked = frappe.model.get_value(cdt,cdn ,"is_first_half");
	if(checked == 1) {
		frappe.model.set_value(cdt,cdn ,"is_half_day", 1);
	} else if(checked == 0) {
		frappe.model.set_value(cdt,cdn ,"is_half_day", 0);
	}
})

frappe.ui.form.on('Leave Application Table','is_second_half', function(frm,cdt,cdn) {
	var checked = frappe.model.get_value(cdt,cdn ,"is_second_half");
	if(checked == 1) {
		frappe.model.set_value(cdt,cdn ,"is_half_day", 1);
	} else if(checked == 0) {
		frappe.model.set_value(cdt,cdn ,"is_half_day", 0);
	}
})

frappe.ui.form.on('Leave Application','validate',function(frm) {
	frm.set_value('group',frm.doc.temp_group);

	if(frm.doc.leave_type == 'Sick Leave' || frm.doc.annual_type == 'Sick Leave') { check_mds(frm); }
	if(frm.doc.leave_type == 'Birthday Leave') { check_birthday_lv(frm); }
	if(frm.doc.leave_type == 'Union Leave') { check_union_lv(frm); }
	if(frm.doc.leave_type == 'Emergency Leave') { check_emergency_lv(frm); }
	if(frm.doc.leave_type == 'Leave Without Pay') { check_lwop(frm); }
	if(frm.doc.leave_type == 'Maternity Leave') { blockMaternityLeave(frm); }
	if(frm.doc.leave_type == 'Maternity Leave for Solo Parent') { blockMaternityLeave(frm); }
	if(frm.doc.leave_type == 'Maternity Leave - Miscarriage') { blockMaternityLeave(frm); }
    if(frm.doc.leave_type == 'Annual Leave') { check_annual_leave_carry_over(frm); }
	//if(frm.doc.leave_type == 'Official Business') { check_ob_application(frm); }	
})

//get OVerused Leave Credits Details
async function get_OLEDet(frm,name){
return new Promise(resolve => {
  let _empDet = [];
  let emp_filters = {"employee": name};
  let emp_fields  = ["name", "employee", "employee_name", "leave_type", "overused_credits", "deducted_credits", "remaining_overused_credits"]
  let emp_data = frappe.db.get_list("Overused LB Entry",{filters: emp_filters, fields: emp_fields, limit: 100});
  var emp_type = typeof emp_data;
  if(emp_type != 'undefined') {
	_empDet = emp_data;
  }
  resolve(_empDet);
});
}

//blocks LWOP if there's remaining VL credits
// var check_lwop = function(frm) { 
// 	var cur_date = new Date(frm.doc.from_date)
// 	//var cur_year = new Date(cur_date.getFullYear() + '-12-31')
// 	var cur_year = cur_date.getFullYear()
// 	frappe.call({
// 		method: "frappe.client.get_list",
// 		args: {
// 				"doctype": "LB Entry",
// 				"filters": {"employee": frm.doc.employee,
// 							"leave_type": "Annual Leave"},
// 				   "fields": ["employee","balance_type","credits","leave_type","to_date"]
// 				},
// 		async: false,
// 		callback: async function (lv_data) {
// 				var type = typeof lv_data.message
				
// 				if (type != 'undefined') {
// 					var total_vl = 0;
// 					//console.log(lv_data.message);
// 					for (var i = 0; i < lv_data.message.length; i++) {
// 						var to_date = new Date(lv_data.message[i].to_date)
// 						cred_year = to_date.getFullYear();

// 						//console.log(cred_year , ' ' ,cur_year)
// 						if (cred_year == cur_year) {
// 							if (lv_data.message[i].balance_type == "Less") {
// 								total_vl = total_vl - lv_data.message[i].credits
// 							}
// 							if (lv_data.message[i].balance_type == "Add") {
// 								total_vl = total_vl + lv_data.message[i].credits
// 							}
// 						}
// 					}

// 					let _overused_details = await get_OLEDet(frm, frm.doc.employee);
// 					let type_olb = typeof _overused_details;
// 					if(type_olb != 'undefined'){
// 						//console.log("overused", _overused_details);
// 						var olb_to_date = new Date(frm.doc.to_date)
// 						let olb_cred_year = olb_to_date.getFullYear();
// 						//console.log("before", total_vl , olb_cred_year, _overused_details[0].deducted_credits)
// 						if(olb_cred_year == 2022 && (_overused_details[0].leave_type == 'Vacation Leave' || _overused_details[0].leave_type == 'Sick Leave')){
// 							total_vl = total_vl - _overused_details[0].deducted_credits;
// 						}
// 						//console.log("after", total_vl , olb_cred_year, _overused_details[0].deducted_credits)
// 					}
					
// 					if (total_vl > 0.25) {
// 						frappe.msgprint({
// 								title: __('Error'),
// 								indicator: 'red',
// 								message: __('You cannot file LWOP if you have remaining VL credit/s')
// 								});
// 						frappe.validated = false;
// 					}
// 				}
// 			}
// 		});
// }

//blocks LWOP if there's remaining VL credits
var check_lwop = async function(frm) { 
	var cur_date = new Date(frm.doc.from_date)
	//var cur_year = new Date(cur_date.getFullYear() + '-12-31')
    let filter = {'name': frappe.user_defaults.employee}
    let cur_user = await frappe.db.get_list('Employee', {filters: filter, fields:['*'], limit: 1})
	var cur_year = cur_date.getFullYear()

    if(cur_user[0].classification == 'NON-UNION') { var leave_type = 'Annual Leave' }
    else { var leave_type = 'Vacation Leave' }

	frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "LB Entry",
				"filters": {"employee": frm.doc.employee,
							"leave_type": leave_type},
				   "fields": ["employee","balance_type","credits","leave_type","to_date"]
				},
		async: false,
		callback: async function (lv_data) {
				var type = typeof lv_data.message
				
				if (type != 'undefined') {
					var total_vl = 0;
					//console.log(lv_data.message);
					for (var i = 0; i < lv_data.message.length; i++) {
						var to_date = new Date(lv_data.message[i].to_date)
						cred_year = to_date.getFullYear();

						//console.log(cred_year , ' ' ,cur_year)
						if (cred_year == cur_year) {
							if (lv_data.message[i].balance_type == "Less") {
								total_vl = total_vl - lv_data.message[i].credits
							}
							if (lv_data.message[i].balance_type == "Add") {
								total_vl = total_vl + lv_data.message[i].credits
							}
						}
					}

					// let _overused_details = await get_OLEDet(frm, frm.doc.employee);
					// let type_olb = typeof _overused_details;
					// if(type_olb != 'undefined'){
					// 	//console.log("overused", _overused_details);
					// 	var olb_to_date = new Date(frm.doc.to_date)
					// 	let olb_cred_year = olb_to_date.getFullYear();
					// 	//console.log("before", total_vl , olb_cred_year, _overused_details[0].deducted_credits)
					// 	if(olb_cred_year == 2022 && (_overused_details[0].leave_type == 'Vacation Leave' || _overused_details[0].leave_type == 'Sick Leave')){
					// 		total_vl = total_vl - _overused_details[0].deducted_credits;
					// 	}
					// 	//console.log("after", total_vl , olb_cred_year, _overused_details[0].deducted_credits)
					// }
					
					if (total_vl > 0.25) {
                        frappe.validated = false;
						frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('You cannot file LWOP if you have remaining VL credit/s')
								});
						frappe.validated = false;
					}
				}
			}
		});
}

//blocks Annual Leave if with remaining credits in Annual Leave carry over
var check_annual_leave_carry_over = function(frm) { 
	var cur_date = new Date(frm.doc.from_date)
	//var cur_year = new Date(cur_date.getFullYear() + '-12-31')
	var cur_year = cur_date.getFullYear()
	frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "LB Entry",
				"filters": {"employee": frm.doc.employee,
							"leave_type": "Carry-over Leave"},
				   "fields": ["*"]
				},
		async: false,
		callback: async function (lv_data) {
				console.log(lv_data.message)
				var type = typeof lv_data.message
				let today = new Date()
				if (type != 'undefined') {
					var total_vl = 0;
					//console.log(lv_data.message);
					for (var i = 0; i < lv_data.message.length; i++) {
						var to_date = new Date(lv_data.message[i].to_date)
						cred_year = to_date.getFullYear();

						//console.log(cred_year , ' ' ,cur_year)
						if (cred_year == cur_year) {
							if (lv_data.message[i].balance_type == "Less") {
								total_vl = total_vl - lv_data.message[i].credits
								console.log("Less")
							}
							// if (today >= lv_data.message[i].from_date && today <= lv_data.message[i].to_date) {
								if (lv_data.message[i].balance_type == "Add") {
									total_vl = total_vl + lv_data.message[i].credits
									console.log("Add")
								}
							// }
						}
					}
                    console.log("total_carry_over",total_vl);
					let year = new Date().getFullYear()
                    const firstDay = new Date(year, 0, 1);
                    const lastDay = new Date(year, 11, 31);
                    let filter      =  {'employee': frm.doc.employee, 'leave_type': 'Carry-over Leave', 'workflow_state': ["IN",['Pending','Approved']], 'from_date': ['BETWEEN',[firstDay, lastDay]]}
                    let fields =  ['employee', 'leave_type', 'sum(total_leave_days) "total_leave_days"']
                    let data =  await frappe.db.get_list('Leave Application', {filters: filter, fields: fields , limit : 100})
                    //console.log(data, data.length)
                    let applied_carry_over = 0;
                    if(data[0].total_leave_days != null){
                        applied_carry_over = data[0].total_leave_days;
                    }
                    
                    console.log("applied_carry_over", applied_carry_over);
                    console.log("less carry over", total_vl - applied_carry_over);
                    
					if (total_vl - applied_carry_over > 0) {
						frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('You cannot file Annual Leave if you have remaining Carry Over credit/s')
								});
						frappe.validated = false;
					}
				}
			}
		});
}

//blocks applcation if advanced filing 
var check_emergency_lv = function(frm) {  
	var cur_date = new Date(get_today())
	//console.log(cur_date)
	frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "LB Entry",
				"filters": {"employee": frm.doc.employee,
							"leave_type": "Vacation Leave"},
				   "fields": ["employee","balance_type","credits","leave_type"]
				},
		callback: function (lv_data) {
				var type = typeof lv_data.message
				if (type != 'undefined') {
					var total_vl = 0;
					//console.log(lv_data.message);
					for (var i = 0; i < lv_data.message.length; i++) {
						if (lv_data.message[i].balance_type == "Less") {
							total_vl = total_vl - lv_data.message[i].credits
						}
						if (lv_data.message[i].balance_type == "Add") {
							total_vl = total_vl + lv_data.message[i].credits
						}
					}
					$.each(frm.doc.leave_application_table, function(i,row) {
					var leave_date = new Date(row.leave_date)
						//console.log(total_vl);
						if (leave_date > cur_date && total_vl > 4 && frm.doc.group == 'Sales') {
						 frappe.msgprint("You cannot file in advance for Emergency Leave");
						 frappe.validated = false;
						}
						if (leave_date > cur_date && total_vl > 4 && frm.doc.group == 'MHO') {
						 frappe.msgprint("You cannot file in advance for Emergency Leave");
						 frappe.validated = false;
						}
						if (frm.doc.group == 'SPL' && leave_date > cur_date) {
						 frappe.msgprint("You cannot file in advance for Emergency Leave");
						 frappe.validated = false;
						}
					})
				}
			}
		});
}
// checks if selected medical record is tagged as fit to work.
var check_mds = function(frm) {   // checks if selected medical record is tagged as fit to work.
  var leave_type = frm.doc.leave_type
  var med_rec = frm.doc.medical_record
  if(leave_type == 'Sick Leave' || frm.doc.annual_type == 'Sick Leave') {
	lv_applied = frappe.call({
		  method: "frappe.client.get_list",
		  args: {
				"doctype": "Employee Medical Record",
		  "filters": {"employee": frm.doc.employee,
			"name": frm.doc.medical_record},
		  "fields": "med_status"
	  },
	 callback: function (data) {
	  //console.log(data);
	  var temp = typeof data.message;
	  //console.log(temp);
	  //var med_status = data.message[0].med_status;
				  /*if(data.message[0].med_status !== "Fit to Work" || temp == 'undefined') {
		frappe.msgprint('The selected medical record is not tagged as Fit to Work');
		frappe.validated = false;
	  }*/ 
	  if (temp == 'undefined') {
		frappe.msgprint('Invalid medical record');
		frappe.validated = false;
	  }
	  if(temp != 'undefined') {
	  frappe.call({
		  method: "frappe.client.get_list",
		  args: {
				"doctype": "Leave Application",
		  "filters": {"employee": frm.doc.employee,
			"medical_record": frm.doc.medical_record,
			"workflow_state": ["in",["Approved","Pending"]],
			"name": ["!=",frm.doc.name]},
		  "fields": "medical_record"
	  },
	 callback: function (used_med) {
	  var used_med_type = typeof used_med.message;
	  if(used_med_type != 'undefined') {
		//var medical_record = used_med.message[0].medical_record;
		//console.log('used_med',used_med_type);
		//console.log('used_meds',used_med);
		frappe.msgprint('Medical Record should be unique');
		frappe.validated = false;
	  }
	  }
			 
		  });
	} 
			  }
		  });
  }
}
//filters the dropdown on medical record field
frappe.ui.form.on("Leave Application", {
  leave_type: function(frm) {
  lv_applied = frappe.call({
		  method: "frappe.client.get_list",
		  args: {
				"doctype": "Leave Application",
				  "filters": {"employee": frm.doc.employee,
				"workflow_state": ["in",["Approved","Pending"]]},
				  "fields": "medical_record"
	  },
	callback: function (data) {
	  //console.log(data.message[0]);
	  var temp = typeof data.message;
	  //console.log(data.message);
	  //console.log(temp);
	  if(temp != 'undefined') {
		var used_emr = [];
		var i;
		for (i = 0; i < data.message.length; i++) {
		  used_emr.push(data.message[i].medical_record); 
		}
		//console.log(used_emr);
		frm.set_query("medical_record", function() {
			return {
				  filters: [
						  ["Employee Medical Record","employee", "=", frm.doc.employee],
						  ["Employee Medical Record","for_sick_leave", "=", 1],
						  ["Employee Medical Record","name", "not in", used_emr]
				  ]
			}
		});
	  } else if(temp == 'undefined') {
		  frm.set_query("medical_record", function() {
			   return {
			  filters: [
					  ["Employee Medical Record","employee", "=", frm.doc.employee],
					  ["Employee Medical Record","for_sick_leave", "=", 1],
					  ["Employee Medical Record","name", "not in", used_emr]
			  ]
			}
		});
	  }
	}
		  });
  }
});

	//checks if the the applied birthday leave is 15 days before and after of birthdate
 check_birthday_lv = function(frm){
	var leave_date = new Date(frm.doc.from_date)
	var d = new Date(frm.doc.birthday)
	var bday = frm.doc.birthday;
	var bdayMonth = d.getMonth() + 1;
	var curDate = new Date()
	
	var endDate = new Date()
	var startDate = new Date()
	//endDate.setDate(birthDate.getDate()+15);
	//startDate.setDate(birthDate.getDate()-15);
	//var start = new Date(frappe.datetime.add_days(frm.doc.birthday, -15))
	//var end = new Date(frappe.datetime.add_days(frm.doc.birthday, 15))
	//startDate = new Date(curDate.getFullYear(),start.getMonth(),start.getDate())
	//endDate = new Date(curDate.getFullYear(),end.getMonth(),end.getDate())

	var fdate = '';
	var tdate = '';
	var year = frm.doc.year_of_birthday_for_application;//curDate.getFullYear();
	//var fbd = year + '-' + d.getMonth()+ '-' + '01';
	var birthDate = new Date(year,d.getMonth(),'');

	var leapyear = 28;
	var month = 1;
	var day = 31;

	if(year==2012){ leapyear = 29;
	} else if(year==2016){ leapyear = 29;
	} else if(year==2020){ leapyear = 29;
	} else if(year==2024){ leapyear = 29;
	} else if(year==2028){ leapyear = 29;
	} else { leapyear == 28;
	}
	//To Month
	var tbdayMonth = bdayMonth + 1;
	//From Month
	var fbdayMonth = bdayMonth - 1;

	if(fbdayMonth==1){day = 31-15;} 
	else if(fbdayMonth==2){day = leapyear -15;} 
	else if(fbdayMonth==3){day = 31-15;} 
	else if(fbdayMonth==4){day = 30-15;} 
	else if(fbdayMonth==5){day = 31-15;} 
	else if(fbdayMonth==6){day = 30-15;} 
	else if(fbdayMonth==7){day = 31-15;} 
	else if(fbdayMonth==8){day = 31-15;} 
	else if(fbdayMonth==9){day = 30-15;} 
	else if(fbdayMonth==10){day = 31-15;} 
	else if(fbdayMonth==11){day = 30-15;} 
	else if(fbdayMonth==12){day = 31-15;}

	//startDate = new Date(year + '-' + fbdayMonth + '-' + day);
	//endDate = new Date(year + '-' + tbdayMonth + '-15')

	var y = birthDate.getFullYear(), m = birthDate.getMonth() + 1;
	var firstDay = new Date(y, m, 1);
	var lastDay = new Date(y, m + 1, 0);

	var startDate = new Date(frappe.datetime.add_days(firstDay, -15))
	var endDate = new Date(frappe.datetime.add_days(lastDay, 15))

	//console.log(bday);
	//console.log(bdayMonth);
	//console.log(firstDay , ' - ', lastDay);
	//console.log(startDate , ' - ', endDate);
	//console.log('birthday',birthDate)
	//console.log('end',endDate)
	//console.log('start',startDate)
	if (leave_date < startDate || leave_date > endDate) {
		//console.log("pumasok")
		frappe.msgprint("You can't apply birthday leave not within "+startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+" to "+endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate());
		frappe.validated = false;
	}
}	

	//checks if the the applied birthday leave is 15 days before and after of birthdate
/*var check_birthday_lv = function(frm){
	var leave_date = new Date(frm.doc.from_date)
	var d = new Date(frm.doc.birthday)
	var curDate = new Date()
	var birthDate = new Date(curDate.getFullYear(),d.getMonth(),d.getDate())
	var endDate = new Date()
	var startDate = new Date()
	endDate.setDate(birthDate.getDate()+15);
	startDate.setDate(birthDate.getDate()-15);
	//var start = birthDate.getDay() - 15
	//var end = frappe.datetime.add_days(frm.doc.birthday, 15)
	console.log('birthday',birthDate)
	console.log('end',endDate)
	console.log('start',startDate)
	if (leave_date < startDate || leave_date > endDate) {
		frappe.msgprint("You can't apply birthday leave not within "+startDate.getFullYear()+"-"+(startDate.getMonth()+1)+"-"+startDate.getDate()+" to "+endDate.getFullYear()+"-"+(endDate.getMonth()+1)+"-"+endDate.getDate());
		frappe.validated = false;
	}

}*/



// var check_union_lv = function(frm){
// 	var leave_type = frm.doc.leave_type;
// 	if(leave_type == 'Union Leave') {
// 		//console.log(leave_type);
// 		ulc_applied = frappe.call({
// 			method: "frappe.client.get_list",
// 			args: {
// 					"doctype": "Union Leave Credit Request",
// 				"filters": {"employee": frm.doc.employee,
// 					"workflow_state": "Approved"},
// 			"fields": "leave_credits"
// 			},
// 		 callback: function (data) {
// 			//console.log(data);
// 			var temp = typeof data.message;
// 			//console.log(temp);
// 			if(temp == 'undefined') {
// 				frappe.msgprint('You do not have approved Union Leave Credit Request');
// 				frappe.validated = false;
// 			}
// 			if(frm.doc.employee == '19-0113') { var total_credits = 2}
// 			else { var total_credits = 0; }
// 			var i;
// 			for (i = 0; i < data.message.length; i++) {
// 					total_credits += data.message[i].leave_credits;
// 			}
// 			console.log("total credits",total_credits);
// 		lv_applied = frappe.call({
// 			method: "frappe.client.get_list",
// 			args: {
// 					"doctype": "Leave Application",
// 				"filters": {"employee": frm.doc.employee,
// 					"leave_type": "Union Leave",
// 					"workflow_state": ["in",["Approved"]]},
// 			"fields": ["name","total_leave_days"]
// 			},
// 		 callback: function (data) {
// 			//console.log(data);
// 			var used_credits = 0;
// 			var x;
// 			for (x = 0; x < data.message.length; x++) {
// 				//if(data.message[x].name != frm.doc.name) {
// 						used_credits += data.message[x].total_leave_days;
// 				//}
// 			}
// 			console.log("used",used_credits);
// 			var cur_credits = total_credits - used_credits;
//             if(cur_credits < 0){
//                 Math.abs(cur_credits)
//             }
//             // if(frm.doc.employee == '19-0113'){cur_credits + 1}
// 			console.log("current",cur_credits);
// 			if(cur_credits < frm.doc.total_leave_days) {
// 				frappe.msgprint('Insufficient Union Leave Credits');
// 				frappe.validated = false;
// 			}
// 		}	
// 			});
// 				}
// 			});
// 	}
// }

async function check_union_lv(frm) {
    // Compute Remaining Union Leave Credits
    if (frm.doc.leave_type == 'Union Leave') {
        // Get Union Leave Credits
        let ufilters = {'employee': frm.doc.employee, 'workflow_state': 'Approved'}
        let uData = await frappe.db.get_list("Union Leave Credit Request", {filters:ufilters, fields:['*'], limit: 100000})
        let unionCredits = 0
            for (let x = 0; x < uData.length; x++) { unionCredits += parseInt(uData[x].leave_credits) }

        // Get Used Union Leave Credits
        let lfilters = {'employee': frm.doc.employee, 'workflow_state': 'Approved', 'leave_type': 'Union Leave'}
        let ldata = await frappe.db.get_list("Leave Application", {filters: lfilters, fields:['*'], limit: 100000})
        let usedLeaves = 0
            for (let i = 0; i < ldata.length; i++) { usedLeaves += parseInt(ldata[i].total_leave_days) }

        // Get Remaining Credits
        let totalCredits = 0
            totalCredits = Math.abs(unionCredits - usedLeaves)
                if ((unionCredits - usedLeaves) == 0) { totalCredits += 1 }

        // Apply Blockings
        if (totalCredits <= 0) {
            frappe.msgprint('Insufficient Union Leave Credits');
			frappe.validated = false;
        } 

        /* Console Viewing  */
            // console.log("Union Leave Credit Request: ", uData)
            // console.log("Union Credits: ", unionCredits)
            // console.log("=====================")
            // console.log("Leave Applications - Union: ", ldata)
            // console.log("Used Leaves: ", usedLeaves)
            // console.log("=====================")
            // console.log("Total Remaining Credits: ", totalCredits)
        /* End Console View */
    }
}

var check_cto_lv = function(frm) {  
	var temp = typeof frm.doc.ot_application;
	//console.log(temp);
	if(frm.doc.ot_employee == frm.doc.employee && frm.doc.leave_type == 'CTO Leave') {
	if(frm.doc.leave_type == 'CTO Leave' && frm.doc.total_leave_days > 1) {
		frappe.msgprint("You can't apply CTO Leave for multiple dates");
		frappe.validated = false;
	}
	if(temp == 'undefined' && frm.doc.leave_type == 'CTO Leave') {
		frappe.msgprint("You don't have an approved OT Application");
		frappe.validated = false;
	} else if(frm.doc.total_hours_worked < 1425 && frm.doc.leave_type == 'CTO Leave') {
		frappe.msgprint('Insufficient Work Hours');
		frappe.validated = false;
	}
	} else if(frm.doc.ot_employee != frm.doc.employee && frm.doc.leave_type == 'CTO Leave') {
		frappe.msgprint('Invalid OT Application');
		frappe.validated = false;
	} 
}

//checks if the admin officer is in Employee 201 approver list
var check_approver_list = function(frm){
	 var role = frappe.user_roles;
	 //console.log(role);
	 var user_name = [];
	 var string = '';

	 if(role.includes('Admin Officer') && frappe.session.user != "Administrator") {//
		emplyee_approver = frappe.call({
			method: "frappe.client.get_list",
			args: {
					"doctype": "Employee Approvers",
					"filters": {"parent": frm.doc.employee},
					"fields": ["approver", "approver_name"]
			},
			 callback: function (data) {
				 //console.log(data.message);

				 for(var i = 0; i < data.message.length; i++){
					 user_name.push(data.message[i].approver);
				 }

				 employee_approver_email = frappe.call({
					 method: "frappe.client.get_list",
					args: {
							"doctype": "Employee",
							"filters": {"user_id": frappe.session.user},
							"fields": ["name", "full_name", "user_id"]
					},
					 callback: function (e_data) {
						 //console.log(e_data);
						 string = user_name.toString();
						 //console.log("z " + string);

						if(!string.includes(e_data.message[0].name) ) {
							 frappe.msgprint("Not authorize to approve this employee's application.");
							frappe.validated = false;
							return false;
						 }
					 }
				});
			 }
		});
	}	
}

//Check if there is applied Overtime application upon Approval of Leave Application
var check_overtime_app = function(frm){
	var date = frm.doc.target_date;
	var emp = frm.doc.employee;
	var status = [];
	//console.log("pumasok");

	emp_lvtapplication = frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "Leave Application Table",
				"filters": {"is_excluded": ["=", 0],
							"parent": frm.doc.name,
							},
				"fields": ["leave_date"]
		},
		 callback: function (lv_data) {
			 //console.log(lv_data)
			 for (var i = 0; i < lv_data.message.length; i++) {
				emp_otapplication = frappe.call({
					method: "frappe.client.get_list",
					args: {
							"doctype": "Overtime Application",
							"filters": {"target_date": ["=", lv_data.message[i].leave_date],
										"employee": emp,
										"workflow_state": ["in", ["Approved", "Pending"]]
										},
							"fields": ["workflow_state", "from_date", "to_date", "target_date", "employee", "full_name"]
					},
					 callback: function (data) {
						 //console.log(data)
						 var is_invalid = typeof data.message;   
						 //console.log(is_invalid)
						 if (is_invalid != 'undefined' && (frm.doc.leave_type != 'Work From Home' && frm.doc.leave_type != 'Official Business')) {
							 for (var j = 0; j < data.message.length; j++) {
								 status.push(data.message[j].workflow_state);
							 }

							 if(is_invalid == 'object'){
								 if(status.includes("Approved")){
									 frappe.msgprint('With applied approved Overtime Application.');
									 frappe.validated = false;
								 } else if (status.includes("Pending")) {
									 frappe.msgprint('With applied pending Overtime Application.');
									 setTimeout(function(){ console.log("delay");}, 10000); 
								 }
							 }
						 }
					 }
				});
			}
		}
	});
}

//Check if there is applied Overtime application upon saving Leave Application
var check_pending_overtime_app = function(frm){
	var from_date = frm.doc.from_date;
	var to_date = frm.doc.to_date;
	var emp = frm.doc.employee;
	var status = [];
	//console.log("pumasok dito" );


	for(var i = from_date; i <= to_date; i = frappe.datetime.add_days(i, 1)) {
		//console.log(i);

		emp_otapplication = frappe.call({
			method: "frappe.client.get_list",
			args: {
					"doctype": "Overtime Application",
					"filters": {"target_date": ["=", i],
								"employee": emp,
								"workflow_state": ["in", ["Approved", "Pending"]]
								},
					"fields": ["workflow_state","from_date", "to_date", "target_date", "employee", "full_name"]
			},
			 callback: function (data) {
				 //console.log(data)
				 var is_invalid = typeof data.message;   
				 //console.log(is_invalid)
				 if (is_invalid != 'undefined' && (frm.doc.leave_type != 'Work From Home' && frm.doc.leave_type != 'Official Business')) {
					 for (var j = 0; j < data.message.length; j++) {
						 status.push(data.message[j].workflow_state);
					 }

					 //console.log(status)
					 if(is_invalid == 'object'){
						 if(status.includes("Approved")){
							 frappe.msgprint('With applied approved Overtime Application.');
							 frappe.validated = false;
						 } else if (status.includes("Pending")) {
							 frappe.msgprint('With applied pending Overtime Application.');
							 setTimeout(function(){ console.log("delay");}, 10000); 
						 }
					 }
				 }
			 }
		});
	}
}

//get work shift tagged
/*
frappe.ui.form.on("Leave Application", {
	validate: function(frm,doctype,name) {
		$.each(frm.doc.leave_application_table, function(i,row) {
			frm.set_value('c_total_leave_days',0)   
			getWorkShift(frm,row,i,doctype,name)
			//console.log(i)
		})
		checkReservedLeaveType(frm);
		checkTotalLvDays(frm);
	},
	on_submit: function(frm,doctype,name) {
		//console.log('on_submit')
		createLBEntry(frm)
		checkTotalLvDays(frm)
		//frm.set_value('total_leave_days',frm.doc.c_total_leave_days) 
		//getWorkShift(frm,row,i,doctype,name)
		//createLBEntry(frm)
	},
	before_submit: function(frm,doctype,name){
		checkTotalLvDays(frm)
		//checkAttachment(frm)
	},
	after_cancel: function(frm,doctype,name) {
		deleteLBEntry(frm)
	},
	before_load: function(frm){
		checkTotalLvDays(frm)
		filterLeaveType(frm)
	},
	leave_type: function(frm){
		//if(frm.doc.leave_type == "Vacation Leave" && frm.doc.leave_type == "Sick Leave"){
		checkTotalLvDays(frm)	
		//} else {
		//	frappe.meta.get_docfield('Leave Application', 'c_total_leave_days', frm.doc.name).hidden=1;
		//}
	},
	from_date: function(frm,doctype,name) {
		//checkTotalLvDays(frm)
		$.each(frm.doc.leave_application_table, function(i,row) {
			frm.set_value('c_total_leave_days',0)   
			getWorkShift(frm,row,i,doctype,name)
			//console.log(i)
		})
		
	},
	to_date: function(frm,doctype,name) {
		//checkTotalLvDays(frm)
		$.each(frm.doc.leave_application_table, function(i,row) {
			frm.set_value('c_total_leave_days',0)   
			getWorkShift(frm,row,i,doctype,name)
			//console.log(i)
		})
	}//,
	//leave_type: function(frm,doctype,name) {
	  //  checkTotalLvDays(frm)
	//}
});
*/
// frappe.ui.form.on("Leave Application", {
//     before_save: function(frm,doctype,name) {
//     var total_credits = 0
//     $.each(frm.doc.leave_application_table, function(i,row) {
//     	total_credits += flt(row.leave_credits);
//     	//console.log(i)
//     })
//     frm.set_value('c_total_leave_days',total_credits)
// 	}
// });


//get the work shift per leave date
function getWorkShift(frm,row,i,doctype,name) {
	var employee = frm.doc.employee;
	//var temp_date = typeof frm.doc.row.target_date;
	/*if (temp_date == 'undefined') {
	  var row.target_date = frm.doc.from_date;
	} else {
	  var row.target_date = frm.doc.row.target_date;
	}*/
	frappe.call({
		method: "frappe.client.get_list",
		args: {
			  "doctype": "Change Schedule Application",
		  "filters": {"employee": employee,
				"workflow_state": "Approved"},
			"fields": "name"
		},
	 callback: function (csa_data) {
	  //console.log('target_date',row.leave_date);
	  var csa_app = typeof csa_data.message
	  if (csa_app != 'undefined') {
		var csa_array = [];
		for (var k = 0; k < csa_data.message.length; k++) {
			csa_array.push(csa_data.message[k].name);
		  }
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				"doctype": "Change Schedule Application Table",
			"filters": {"parent": ["in",csa_array],
				  "target_date": row.leave_date},
			  "fields": ["target_date","new_shift","parent"]
			},
		callback: function (cdate_data) {
		  //console.log(csa_array)
		  var cdate_data_type = typeof cdate_data.message
		  if(cdate_data_type != 'undefined') {
			//console.log("dates",cdate_data.message);
			row.work_shift = cdate_data.message[0].new_shift
			getLeaveCredit(frm,cdate_data.message[0].new_shift,row)
			}	
			if(cdate_data_type == 'undefined') {
				frappe.call({
				method: "frappe.client.get_value",
				args: {
					"doctype": "Work Schedule",
				"filters": {"target_date": row.leave_date,
							"employee": employee},
				  "fieldname": ["work_shift","target_date"]
				},
			callback: function (ws_data) {
			  var ws_data_type = typeof ws_data.message;
			  //console.log('ws_data',ws_data_type)
			  //console.log(ws_data.message)
			  if (ws_data_type != 'undefined') {
			   row.work_shift = ws_data.message.work_shift
			   getLeaveCredit(frm,ws_data.message.work_shift,row)
				 frm.refresh_fields()
				}
			  if (ws_data_type == 'undefined') {
				frappe.call({
					method: "frappe.client.get_value",
					args: {
						"doctype": "Employee",
					"filters": {"name": employee},
					  "fieldname": ["default_schedule"]
					},
				callback: function (default_data) {
				  var dfs_type = typeof default_data.message;
				  if (dfs_type == 'undefined') {
					//frappe.msgprint("You have NO WORK SCHEDULE assigned for "+row.target_date);
					//frappe.validated = false;
					//console.log('default_data',dfs_type)
				  } 
				  if (dfs_type != 'undefined') {
					  //console.log('default_data',default_data.message)
					frappe.call({
						method: "frappe.client.get_value",
						args: {
							"doctype": "Work Schedule Template",
						"filters": {"name": default_data.message.default_schedule},
						  "fieldname": ["name","sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
						},
					callback: function (default_sched) {
						var dfsc = typeof default_sched.message
						if (dfsc != 'undefined') {
							var date = new Date(row.leave_date);
							var day = date.getDay()
							switch(day) {
							  case 0:
								row.work_shift = default_sched.message.sunday
								getLeaveCredit(frm,default_sched.message.sunday,row)
								  frm.refresh_fields()
								break;
							  case 1:
								row.work_shift = default_sched.message.monday
								getLeaveCredit(frm,default_sched.message.monday,row)
								  frm.refresh_fields()
								break;
							  case 2:
								row.work_shift = default_sched.message.tuesday
								getLeaveCredit(frm,default_sched.message.tuesday,row)
								  frm.refresh_fields()
								break;
							  case 3:
								row.work_shift = default_sched.message.wednesday
								getLeaveCredit(frm,default_sched.message.wednesday,row)
								  frm.refresh_fields()
								break;
							  case 4:
								row.work_shift = default_sched.message.thursday
								getLeaveCredit(frm,default_sched.message.thursday,row)
								  frm.refresh_fields()
								break;
							  case 5:
								row.work_shift = default_sched.message.friday
								getLeaveCredit(frm,default_sched.message.friday,row)
								  frm.refresh_fields()
								break;
							  case 6:
								row.work_shift = default_sched.message.saturday
								getLeaveCredit(frm,default_sched.message.saturday,row)
								  frm.refresh_fields()
								break;
							  default:
								row.work_shift = ""
								  frm.refresh_fields()
							}
						}	
					}
					})
				  }
				}
			  })
			  }
			}
		  });
			}			
		}
	  })
	  }
	  if (csa_app == 'undefined') {
			frappe.call({
				method: "frappe.client.get_value",
				args: {
					"doctype": "Work Schedule",
				"filters": {"target_date": row.leave_date,
							"employee": employee},
				  "fieldname": ["work_shift","target_date"]
				},
			callback: function (ws_data) {
			  var ws_data_type = typeof ws_data.message;
			  //console.log('ws_data',ws_data_type)
			  //console.log(ws_data.message)
			  if (ws_data_type != 'undefined') {
			   row.work_shift = ws_data.message.work_shift
			   getLeaveCredit(frm,ws_data.message.work_shift,row)
				 frm.refresh_fields()
				}
			  if (ws_data_type == 'undefined') {
				frappe.call({
					method: "frappe.client.get_value",
					args: {
						"doctype": "Employee",
					"filters": {"name": employee},
					  "fieldname": ["default_schedule"]
					},
				callback: function (default_data) {
				  var dfs_type = typeof default_data.message;
				  if (dfs_type == 'undefined') {
					//frappe.msgprint("You have NO WORK SCHEDULE assigned for "+row.target_date);
					//frappe.validated = false;
					//console.log('default_data',dfs_type)
				  } 
				  if (dfs_type != 'undefined') {
					  //console.log('default_data',default_data.message)
					frappe.call({
						method: "frappe.client.get_value",
						args: {
							"doctype": "Work Schedule Template",
						"filters": {"name": default_data.message.default_schedule},
						  "fieldname": ["name","sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
						},
					callback: function (default_sched) {
						var dfsc = typeof default_sched.message
						if (dfsc != 'undefined') {
							//console.log('def_sched',default_sched.message);
							var date = new Date(row.leave_date);
							var day = date.getDay()
							switch(day) {
							  case 0:
								row.work_shift = default_sched.message.sunday
								getLeaveCredit(frm,default_sched.message.sunday,row)
								  frm.refresh_fields()
								break;
							  case 1:
								row.work_shift = default_sched.message.monday
								getLeaveCredit(frm,default_sched.message.monday,row)
								  frm.refresh_fields()
								break;
							  case 2:
								row.work_shift = default_sched.message.tuesday
								getLeaveCredit(frm,default_sched.message.tuesday,row)
								  frm.refresh_fields()
								break;
							  case 3:
								row.work_shift = default_sched.message.wednesday
								getLeaveCredit(frm,default_sched.message.wednesday,row)
								  frm.refresh_fields()
								break;
							  case 4:
								row.work_shift = default_sched.message.thursday
								getLeaveCredit(frm,default_sched.message.thursday,row)
								  frm.refresh_fields()
								break;
							  case 5:
								row.work_shift = default_sched.message.friday
								getLeaveCredit(frm,default_sched.message.friday,row)
								  frm.refresh_fields()
								break;
							  case 6:
								row.work_shift = default_sched.message.saturday
								getLeaveCredit(frm,default_sched.message.saturday,row)
								  frm.refresh_fields()
								break;
							  default:
								row.work_shift = ""
								  frm.refresh_fields()
							}
						} else {
							row.work_shift = "NO WORK SCHEDULE"
							  frm.refresh_fields()
						}	
					}
					})
				  }
				}
			  })
			  }
			}
		  });
		  }   
		 }
		}); 
	}

//get the leave credit deduction per leave date
function getLeaveCredit(frm,work_shift,row) {
	frappe.call({
	 method: "frappe.client.get_value",
		args: {
			"doctype": "Work Shift",
		"filters": {"name": work_shift},
		  "fieldname": ["name","work_hours","deduct_leave_credits_based_on_work_hours"]
		},
	callback: function (wrks_data) {
		var ws_type = typeof wrks_data.message
		if(ws_type != 'undefined' && row.is_excluded == 0 && row.is_holiday == 0 && (frm.doc.leave_type == "Vacation Leave" || frm.doc.leave_type == "Sick Leave")) {
			//console.log(wrks_data.message)
			if(work_shift == "NO WORK SCHEDULE" || work_shift == "Flexi") {
				if (row.is_half_day == 0) {
					//console.log("whole day")
					var leave_credits = 1 + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)
				} else {
					//console.log("half day")
					var leave_credits = 0.5 + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)    				
				}
			} else if (wrks_data.message.deduct_leave_credits_based_on_work_hours == 0) {
				if (row.is_half_day == 0) {
					//console.log("whole day")
					var leave_credits = 1 + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)
				} else {
					//console.log("half day")
					var leave_credits = 0.5 + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)    				
				}
			} else if (wrks_data.message.deduct_leave_credits_based_on_work_hours == 1) { 
				if (row.is_half_day == 0) {
					//console.log("whole day")
					var leave_credits = (wrks_data.message.work_hours/8) + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)
				} else {
					//console.log("half day")
					var leave_credits = ((wrks_data.message.work_hours/8)/2) + frm.doc.c_total_leave_days
					frm.set_value('c_total_leave_days',leave_credits)    				
				}
			}
		}
	}
	})
}

//delete LB Entry upon cancellation
function deleteLBEntry(frm) {
	frappe.call({
	 method: "frappe.client.get_value",
	 args: {
			"doctype": "LB Entry",
			"filters": {"linked_document": frm.doc.name},
			"fieldname": ["name","linked_document"]
		},
	  callback: function(lb_entry_data) {
		  //console.log('delete_lb',lb_entry_data.message)
		  var lv_applied = lb_entry_data.message.name
		  //console.log(lv_applied)

		  frappe.call({
			 method: 'frappe.client.delete',
			 args: {
				doctype: 'LB Entry',
				name: lv_applied,
				ignore_missing: "False"
			}
		});
	  }
	});
}


//add LB Entry deduction for compressed work shift
function createLBEntry(frm) {
	var total_lv = frm.doc.c_total_leave_days
	if (total_lv > 0 && total_lv != frm.doc.total_leave_days && (frm.doc.leave_type == "Vacation Leave" || frm.doc.leave_type == "Sick Leave")) {
		deleteLBEntry(frm);

		//console.log('update-lv')
		/*frappe.call({
			method: 'frappe.desk.doctype.bulk_update.bulk_update.update',
			args: {
				doctype: 'LB Entry',
				field: 'credits',
				value: total_lv,
				condition: "name='"+frm.doc.linked_lb_entry+"'",
				limit: 1
				},
			callback:function(res){
				   console.log(res)

			}
		});*/
		/*frappe.call({
			"method": "frappe.client.set_value",
			"args": {
				"doctype": "LB Entry",
				"name": frm.doc.linked_document,
				"fieldname": "credits",
				"value": total_lv
			}, callback: function (lv_data) {
				console.log('callback')
			}
		});*/
		var doc = {
				"doctype" : 'LB Entry',
								"employee": frm.doc.employee,
								"employee_name": frm.doc.full_name,
								"posting_date": frm.doc.posting_date,
								"company": frm.doc.company,
								"leave_type": frm.doc.leave_type,
								"balance_type": "Less",
								"created_from": "Leave Application",
								"linked_document": frm.doc.name,
								"from_date": frm.doc.from_date,
								"to_date": frm.doc.to_date,
								"credits": total_lv,
								"deduct_credits_to": frm.doc.leave_type
				}; 
		frappe.call({
				method: "frappe.client.insert",
				args: {"doc": doc}, // use JSON.parse(JSON.stringify(doc)) for parsing to json object
				callback: function(r) {
						if(r.exc) {
								msgprint(__("There were errors."));
						} else {
								//msgprint(__("Document inserted."));

						}
				}
		});
	}
	else if (total_lv < 0 && (frm.doc.leave_type == "Vacation Leave" || frm.doc.leave_type == "Sick Leave")) {
		var add_lv = total_lv * -1;
		deleteLBEntry(frm);
		//console.log('update-lv')
		/*frappe.call({
			method: 'frappe.desk.doctype.bulk_update.bulk_update.update',
			args: {
				doctype: 'LB Entry',
				field: 'credits',
				value: total_lv,
				condition: "name='"+frm.doc.linked_lb_entry+"'",
				limit: 1
				},
			callback:function(res){
				   console.log(res)

			}
		});*/
		/*frappe.call({
			"method": "frappe.client.set_value",
			"args": {
				"doctype": "LB Entry",
				"name": frm.doc.linked_document,
				"fieldname": "credits",
				"value": total_lv
			}, callback: function (lv_data) {
				console.log('callback')
			}
		});*/
		var doc = {
				"doctype" : 'LB Entry',
								"employee": frm.doc.employee,
								"employee_name": frm.doc.full_name,
								"posting_date": frm.doc.posting_date,
								"company": frm.doc.company,
								"leave_type": frm.doc.leave_type,
								"balance_type": "Less",
								"created_from": "Leave Application",
								"linked_document": frm.doc.name,
								"from_date": frm.doc.from_date,
								"to_date": frm.doc.to_date,
								"credits": add_lv,
								"deduct_credits_to": frm.doc.leave_type
				}; 
		frappe.call({
				method: "frappe.client.insert",
				args: {"doc": doc}, // use JSON.parse(JSON.stringify(doc)) for parsing to json object
				callback: function(r) {
						if(r.exc) {
								msgprint(__("There were errors."));
						} else {
								//msgprint(__("Document inserted."));
						}
				}
		});
	}
}

function checkTotalLvDays(frm) {
	var posting_date = new Date(frm.doc.posting_date)
	var deployment_date = new Date('2021-02-25')
	//console.log(posting_date)
	//console.log(deployment_date)
	if (posting_date <= deployment_date) {
			//console.log("pumasok 1")
			frappe.meta.get_docfield('Leave Application', 'c_total_leave_days', frm.doc.name).hidden=1;
	} else {
		if(frm.doc.leave_type != "Vacation Leave" && frm.doc.leave_type != "Sick Leave"){
			//console.log("pumasok 3")
			frappe.meta.get_docfield('Leave Application', 'c_total_leave_days', frm.doc.name).hidden=1;
		} 
		if (frm.doc.leave_type == "Vacation Leave" || frm.doc.leave_type == "Sick Leave"){
			//console.log("pumasok 2")
			frappe.meta.get_docfield('Leave Application', 'total_leave_days', frm.doc.name).hidden=1;
		}  
	}
	
}

//exclude reserved leave types on dropdown
function filterLeaveType(frm) {
	frm.set_query("leave_type", function() {
			return {
				  filters: [
						  ["Leave Type","reserve", "!=", 1]
				  ]
			}
		});
}

//block leave application if reserved leave type is used
function checkReservedLeaveType(frm) {
	frappe.call({
	 method: "frappe.client.get_value",
		args: {
			"doctype": "Leave Type",
		"filters": {"name": frm.doc.leave_type},
		  "fieldname": ["name","reserve"]
		},
	callback: function (ltype_data) {
		var lv_type = typeof ltype_data.message
		if(lv_type != 'undefined') {
			if (ltype_data.message.reserve == 1) {
				frappe.msgprint("Reserve leave types can't be used on leave applications");
				frappe.validated = false;
			}
		}
	}
	})
}

//block approval if leave has no attachment
function checkAttachment(frm) {
	frappe.call({
	 method: "frappe.client.get_value",
		args: {
			"doctype": "Leave Type",
		"filters": {"name": frm.doc.leave_type},
		  "fieldname": ["name","require_attachment_before_approval"]
		},
	callback: function (ltype_data) {
		var lv_type = typeof ltype_data.message
		if(lv_type != 'undefined') {
			if (frm.doc.attachment == null && ltype_data.message.require_attachment_before_approval == 1) {
				frappe.msgprint(frm.doc.leave_type + " requires attachment before approval");
				frappe.validated = false
			}
		}
	}
	})
}

function check_vlp_group(frm) {
	if (frm.doc.leave_type == 'Vacation Leave (Probationary)') {
		if(frm.doc.group == 'SPL') {
			frappe.msgprint("You are not allowed to use this leave type");
			frappe.validated = false;
		}
		var counter = 0;
		$.each(frm.doc.leave_application_table, function(i,row) {
			if (row.leave_date > '2022-01-02') {
				counter = counter + 1
			} else if (row.leave_date < '2021-12-24') {
				counter = counter + 1
			}
		})
		if (counter > 0) {
			frappe.msgprint("Date range of application shoud be from December 24, 2021 to January 2, 2022 only");
			frappe.validated = false;
		}
	}
}

frappe.ui.form.on("Leave Application", "onload", function(frm){
cur_frm.set_query("leave_type", function(){
	return {
		"filters": [
			["Leave Type", "leave_code", "!=", "EL"],
						["Leave Type", "leave_code", "!=", "Bereavement_Leave"]
		]
	}
});
});

frappe.ui.form.on('Leave Application','from_date', async function(frm,cdt,cdn) {
var from_date = new Date(frm.doc.from_date);
var type = typeof from_date;

if(type != 'undefined'){
if(frm.doc.leave_type == 'Maternity Leave') {
	let value = 105
	var to_date = frappe.datetime.add_days(from_date, 104)
	//var to_date = from_date.setDate(from_date.getDate() + 10);
	//var lastDay = new Date(to_date.getFullYear(), to_date.getMonth(), from_date.getDate());  
	//console.log(to_date);
	frm.set_value('to_date',to_date);
	//frm.set_value('credits',105);
	// blockMaternityLeave(frm, value)
}
if(frm.doc.leave_type == 'Maternity Leave for Solo Parent') {
	let value = 120
	var to_date = frappe.datetime.add_days(from_date, 119)
	//var to_date = from_date.setDate(from_date.getDate() + 10);
	//var lastDay = new Date(to_date.getFullYear(), to_date.getMonth(), from_date.getDate());  
	//console.log(to_date);
	//console.log(from_date)
	frm.set_value('to_date',to_date);
	//frm.set_value('credits',120);
	// blockMaternityLeave(frm, value)
}
if(frm.doc.leave_type == 'Maternity Leave - Miscarriage') {
	let value = 60
	var to_date = frappe.datetime.add_days(from_date, 59)
	//var to_date = from_date.setDate(from_date.getDate() + 10);
	//var lastDay = new Date(to_date.getFullYear(), to_date.getMonth(), from_date.getDate());  
	//console.log(to_date);
	frm.set_value('to_date',to_date);
	//frm.set_value('credits',60);
	// blockMaternityLeave(frm, value)
}
}
})

// async function blockMaternityLeave(frm, total) {
// 	if(frm.doc.total_leave_days != total && frm.doc.leave_balance != total) {
// 		frappe.msgprint(__('Total Leave Days and Current Balance must be the same value.'))
//         frappe.validated = false
// 	}
// }

//Block Leave Application when leave Type is convertible 
function blockPrevConvertibleLeave(frm) {
frappe.call({
	 method: "frappe.client.get_value",
		args: {
			"doctype": "Leave Type",
			"filters": {"name": frm.doc.leave_type},
			  "fieldname": ["name","convertible"]
		},
	callback: function (ltype_data) {
		var lv_type = typeof ltype_data.message
		if(lv_type != 'undefined') {
			$.each(frm.doc.leave_application_table, function(i,row) {
			var leave_date = new Date(row.leave_date)
			var cur_date = new Date();
			var cur_year = new Date(cur_date.getFullYear() + '-01-01')
			//console.log(leave_date);
			//console.log(cur_year);
			if (ltype_data.message.convertible == 1 && leave_date < cur_year) {
				frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('Error: You cannot file for ' + ltype_data.message.name + ' for previous year ' + leave_date.getFullYear() + '.')
								});
				frappe.validated = false;
			}
			})
		}
	}
	})
}
/*
//Block Leave Application when holiday is included 
function blockHoliday(frm,cdt,cdn) {
frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "Leave Type",
				"filters": {"name": frm.doc.leave_type},
				   "fields": ["name","include_holidays"]
				},
		callback: function (lv_data) {
				var type = typeof lv_data.message
				var is_included = lv_data.message[0].include_holidays;
				console.log(type)
				if (type != 'undefined') {
					if (is_included == 0){
					$.each(frm.doc.leave_application_table, function(i,row) {
					//var leave_date = new Date(row.leave_date)
						if (row.is_holiday == 1 && row.is_excluded == 0) {
						 frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('You cannot file Leave Application on Holiday, it should be excluded!')
								});
						 frappe.validated = false;
						}
					})
					}
				}
			}
});
}*/

//Block Leave Application when posting date is within 3 days of current day and 2nd Approver is try to approve the application
/*function blockLASecApp(frm) {
frappe.call({
		method: "frappe.client.get_value",
		args: {
				"doctype": "Employee",
				"filters": {"user_id": frappe.session.user},
				"fieldname": "name"
			},
		 callback: function (data) {
			console.log(data.message.name);
			var user = data.message.name;

			frappe.call({
			method: "frappe.client.get_list",
			args: {
					"doctype": "Employee Approvers",
					"filters": {"parent": frm.doc.employee,
								"approver": user,
								"level": ["=", 2]
								},
					   "fields": ["parent","approver", "approver_name","level"]
					},
			callback: function (ea_data) {
				console.log(ea_data.message);
				var type = typeof ea_data.message;
				var cur_date = new Date(frappe.datetime.get_today());
				var within3days = new Date(frappe.datetime.add_days(frm.doc.posting_date, +3))
				console.log(within3days)

				if (type != 'undefined') {
					if (cur_date < within3days ){
						frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('Within three days policy of approval of the first level approver, you cannot approve this application yet.')
								});
						frappe.validated = false;
					}
				}		
				}
			});
			}
		});
}*/


//Block Leave Application when daily employee applied for leave application on holiday
function blockHolidayforDaily(frm,cdt,cdn) {
frappe.call({
		method: "frappe.client.get_list",
		args: {
				"doctype": "Employee",
				"filters": {"name": frm.doc.employee},
				   "fields": ["name","rate_type"]
				},
		callback: function (data) {
				var type = typeof data.message
				var rate_type = data.message[0].rate_type;
				//console.log(type)
				//console.log(rate_type)
				if (type != 'undefined') {
					if (rate_type == "Daily Rate"){
					$.each(frm.doc.leave_application_table, function(i,row) {
					//var leave_date = new Date(row.leave_date)
						if (row.is_holiday == 1 && row.is_excluded != 1) {
						 frappe.msgprint({
								title: __('Error'),
								indicator: 'red',
								message: __('You cannot file Leave Application on Holiday, it should be excluded!')
								});
						 frappe.validated = false;
						}
					})
					}
				}
			}
});
}

//get Employee Details
async function get_EmpDet(frm,name){
return new Promise(resolve => {
  let _empDet = [];
  let emp_filters = {"name": name};
  let emp_fields  = ["name", "full_name", "payroll_schedule","position_title","company"]
  let emp_data = frappe.db.get_list("Employee",{filters: emp_filters, fields: emp_fields, limit: 100});
  var emp_type = typeof emp_data;
  if(emp_type != 'undefined') {
	_empDet = emp_data;
  }
  resolve(_empDet);
});
}

//Block Cancellation if Timekeeping Status in Payroll Period is already closed.
async function blockTKStatusClosed(frm){	
let _emp_details = await get_EmpDet(frm, frm.doc.employee); 
//Payroll Period
let pp_filters = {"period_group": ["=", ""], "schedule": "Semi-Monthly"};
let pp_fields  = ["name", "schedule", "attendance_from", "attendance_to", "time_keeping_status", "period_group"];
let pp_data = await frappe.db.get_list("Payroll Period",{filters: pp_filters, fields: pp_fields, limit: 100000});
var pp_type = typeof pp_data;
if(pp_type != 'undefined') {
	$.each(frm.doc.leave_application_table, function(i,row) {
	//console.log("PPer ", pp_data);
	for (var i = 0; i < pp_data.length; i++) {
		var leave_date = row.leave_date;
		if(leave_date >= pp_data[i].attendance_from && leave_date <= pp_data[i].attendance_to 
			&& row.is_excluded == 0 && pp_data[i].time_keeping_status == 'Closed'){
			//console.log("pumasok: ", pp_data[i].name);
			frappe.msgprint({
				title: __('Error'),
				indicator: 'red',
				message: __('You cannot cancel Leave Application. Timekeeping for ' + pp_data[i].name + ' already Closed!')
				});
			frappe.validated = false;
		}
	}
	})
}
}
//Set On Time Submission
function autoOnTimeSubmission(frm){
	//console.log("save", frm.doc.workflow_state)
	const posting_date = new Date(frm.doc.posting_date);
	const from_date = new Date(frm.doc.from_date);
	var start = moment(posting_date);
	var end = moment(from_date);
	var diff = end.diff(start, 'days');
	let on_time_sub = '0';
	if(diff <= 0){
		on_time_sub = '0';
	} else if(diff >= 1 && diff <= 2){
		on_time_sub = '1';
	} else if(diff >= 3){
		on_time_sub = '2';
	}
	frm.set_value('on_time_submission', on_time_sub);
/*
	var current_date = new Date(frappe.datetime.get_today());
	const cur_date = current_date.getFullYear()+"-"+(current_date.getMonth()+1)+"-"+current_date.getDate()
	const _from_date = frm.doc.from_date;
	let on_time_app;
	if(_from_date < cur_date){
		on_time_app = '0';
	} else {
		on_time_app = '';
	}
	frm.set_value('on_time_approval', on_time_app);*/
}

//Set On Time Approval
function autoOnTimeApproval(frm){
	//console.log("submit", frm.doc.workflow_state)
	var current_date = new Date(frappe.datetime.get_today());
	const cur_date = current_date.getFullYear()+"-"+(current_date.getMonth()+1)+"-"+current_date.getDate()
	const from_date = frm.doc.from_date;
	let _on_time_app;
	if(cur_date > from_date && frm.doc.workflow_state == 'Approved'){
		_on_time_app = '0';
	} else if(cur_date <= from_date && frm.doc.workflow_state == 'Approved'){
		_on_time_app = '1';
	} else if(from_date < cur_date && frm.doc.workflow_state == 'Pending'){
		_on_time_app = '0';
	} else if (frm.doc.workflow_state == 'Pending'){
		_on_time_app = '';
	}
	frm.set_value('on_time_approval', "" +_on_time_app + "");
}

//block if Carry Over Leave filling based from allow file date
async function blockifGreaterThanFillingDueDate(frm){
	if(frm.doc.leave_type == 'Carry-over Leave'){
		var curDate = new Date();
		var due_month = 3;
		var due_day = 31;
		var due_year = curDate.getFullYear();
		let due_date = new Date(due_year + '-' + due_month + '-' + due_day);
		//console.log("Fill Due Date:",  curDate, ' >= ' ,due_date)
		if(curDate >= due_date){
			frappe.msgprint({
				title: __('Error Message'),
				indicator: 'red',
				message: __('Filling of ' + frm.doc.leave_type  + ' is already over.')
				});
			frappe.validated = false;
		}
	}
}

//block if Carry Over Leave approval based from allow file date
async function blockifGreaterThanApprovalDueDate(frm){
	if(frm.doc.leave_type == 'Carry-over Leave'){
		var curDate = new Date();
		var due_month = 3;
		var due_day = 31;
		var due_year = curDate.getFullYear();
		let due_date = new Date(due_year + '-' + due_month + '-' + due_day);
		//console.log("App Due Date:",  curDate, ' >= ' ,due_date)
		if(curDate >= due_date){
			frappe.throw({
				title: __('Error Message'),
				indicator: 'red',
				message: __('Approval of ' + frm.doc.leave_type  + ' is already over.')
				});
			frappe.validated = false;
		}
	}
}

function hideActionButton(frm) {
    frm.refresh()
        frappe.assets.clear_local_storage() //clears local storage
        // location.reload(true)
        if(frappe.session.user != 'Administrator') {
			if (frappe.user_defaults.Employee == frm.doc.employee) {
				$('.btn.btn-primary.btn-sm.dropdown-toggle').hide() //select class or ID of element //hide() function hides element selected
				frm.refresh()
			} else {
				$('.btn.btn-primary.btn-sm.dropdown-toggle').show() //select class or ID of element //show() function shows element selected
				frm.refresh()
			}
		}
    //===========================Console===========================
            console.log("Current EmpID: ", frappe.user_defaults.Employee)
            console.log("Current User: ", frappe.session.user)
            console.log("Form Owner: ", frm.doc.owner)
    //=============================================================
}


// async function hideActionButton(frm) {
//     let list = ['Leave Approver']
//         frappe.assets.clear_local_storage() //clears local storage
//         if (frappe.user_defaults.Employee == frm.doc.employee) {
//             $.each(frappe.user_roles, function(i,row) {
//                 if (list.includes(row)) {
//                     delete frappe.user_roles[i]
//                 }
//                 //=====================Console=====================
//                     // console.log("------------------------------")
//                     // console.log("Roles: ", row)
//             })
//         } else {
//             $.each(list, function(i,row) {
//                 frappe.user_roles.push(row)
//             })
//         }
//         frm.refresh()
//     //===========================Console===========================
//         // console.log("Current EmpID: ", frappe.user_defaults.Employee)
//         // console.log("Current User: ", frappe.session.user)
//         // console.log("Form Owner: ", frm.doc.owner)
//     //=============================================================
// }

// var check_ml = async function(frm) { 
// 	var cur_date = new Date(frm.doc.from_date)
// 	//var cur_year = new Date(cur_date.getFullYear() + '-12-31')
//     let filter = {'name': frappe.user_defaults.employee}
//     let cur_user = await frappe.db.get_list('Employee', {filters: filter, fields:['*'], limit: 1})
// 	var cur_year = cur_date.getFullYear()

//     if (frm.doc.leave_type == 'Maternity Leave') { 
// 		var leave_type = 'Maternity Leave'
// 		var total_ml = 105 
// 	}
// 	else if (frm.doc.leave_type == 'Maternity Leave for Solo Parent') { 
// 		var leave_type = 'Maternity Leave for Solo Parent'
// 		var total_ml = 120 
// 	}
// 	else if (frm.doc.leave_type == 'Maternity Leave - Miscarriage') { 
// 		var leave_type = 'Maternity Leave - Miscarriage'
// 		var total_ml = 60 
// 	}

// 	frappe.call({
// 		method: "frappe.client.get_list",
// 		args: {
// 				"doctype": "LB Entry",
// 				"filters": {"employee": frm.doc.employee,
// 							"leave_type": leave_type},
// 				   "fields": ["employee","balance_type","credits","leave_type","to_date"]
// 				},
// 		async: false,
// 		callback: async function (lv_data) {
// 				var type = typeof lv_data.message
				
// 				if (type != 'undefined') {
// 					var total_vl = 0;
// 					//console.log(lv_data.message);
// 					for (var i = 0; i < lv_data.message.length; i++) {
// 						var to_date = new Date(lv_data.message[i].to_date)
// 						cred_year = to_date.getFullYear();

// 						//console.log(cred_year , ' ' ,cur_year)
// 						if (cred_year == cur_year) {
// 							if (lv_data.message[i].balance_type == "Less") {
// 								total_vl = total_vl - lv_data.message[i].credits
// 							}
// 							if (lv_data.message[i].balance_type == "Add") {
// 								total_vl = total_vl + lv_data.message[i].credits
// 							}
// 						}
// 					}
					
// 					if (total_vl > total_ml) {
//                         frappe.validated = false;
// 						frappe.msgprint({
// 								title: __('Error'),
// 								indicator: 'red',
// 								message: __('You cannot file Maternity Leave w/o credit/s')
// 								});
// 						frappe.validated = false;
// 					}
// 				}
// 			}
// 		});
// }

async function blockMaternityLeave(frm) {
	let cur_date = new Date()
	let cur_year = cur_date.getFullYear()

		if (frm.doc.leave_type == 'Maternity Leave') { 
			var leave_type = 'Maternity Leave'
			var total_ml = 105 
		}
		else if (frm.doc.leave_type == 'Maternity Leave for Solo Parent') { 
			var leave_type = 'Maternity Leave for Solo Parent'
			var total_ml = 120 
		}
		else if (frm.doc.leave_type == 'Maternity Leave - Miscarriage') { 
			var leave_type = 'Maternity Leave - Miscarriage'
			var total_ml = 60 
		}
	
	let filters = {'employee': frm.doc.employee, 'leave_type': frm.doc.leave_type}
	let lb_data = await frappe.db.get_list("LB Entry", {filters: filters, fields:['*'], limit: 100000})

		if(typeof lb_data != 'undefined') {
			var total_credits = 0
				for(let x = 0; x < lb_data.length; x++) {
					var to_date = new Date(lb_data[x].to_date)
					var cred_year = to_date.getFullYear()
                    console.log('Credit Year', cred_year)
                    console.log('Current Year',cur_year)
					//if(cred_year == cur_year) { Uncomment the if you ever needed this condition
                        console.log(cred_year + ' = ' + cur_year)
						if(lb_data[x].balance_type == "Less") {
                            console.log('Less balance')
							total_credits = total_credits - lb_data[x].credits
						}
						if(lb_data[x].balance_type == "Add") {{
                            console.log('Add balance')
							total_credits = total_credits + lb_data[x].credits
						}}
					//}
					//-Console Viewing------------------------//
						// console.log("To Date: ", to_date)
						// console.log("Cred Yr: ", cred_year)
						// console.log("Total Credits: ", total_credits)
						// console.log("LB Data: ", lb_data)
				}
				console.log("Credit Call: ", total_credits)
                console.log("Total ML", total_ml)
				if (total_credits < total_ml) {
					frappe.msgprint({
						title: __('Error'),
						indicator: 'red',
						message: __('Maternity Credits Must be ' + total_ml + ' for this Leave Type')
					})
					frappe.validated = false;
				}
		}

	//=Console Viewing====================================================//
			console.log("Total Credits: ", total_credits)
			console.log("Total Maternity LB: ", total_ml)
	//====================================================================//

}

async function disableExclude(frm) {
	let matLeaves = ['Maternity Leave', 'Maternity Leave for Solo Parent', 'Maternity Leave - Miscarriage']
		
	if(matLeaves.includes(frm.doc.leave_type)) {
		let ctr = 0
		$.each(frm.doc.leave_application_table, function(i,row) {
			if(row.is_excluded == 1) {
				ctr++
			}
		})

		if (ctr > 0) {
			frappe.msgprint({
				title: __('Error'),
				indicator: 'red',
				message: __('Cannot Exclude days on this Leave Type')
			})
			frappe.validated = false;
		}
	}
}

async function BlocksFillingtoSpecificDate(frm) {
    let leave_type = frm.doc.leave_type;
    let leave_start_date = frm.doc.from_date;
    let leave_end_date = frm.doc.to_date;

	console.log("Leave Type", leave_type)
	console.log("leave_start_date", leave_start_date)
	console.log("leave_end_date", leave_end_date)

	console.log("leave_condition", leave_type === 'Annual Leave' || leave_type === 'Vacation Leave' || leave_type === 'Sick Leave')


    if (leave_type === 'Annual Leave' || leave_type === 'Vacation Leave' || leave_type === 'Sick Leave') {
        if (leave_start_date && leave_end_date) {
            const endDate = new Date(leave_end_date); // Convert leave_end_date to Date
			const currentYear = new Date().getFullYear(); // Get the current year
            const restrictionDate = new Date(`${new Date().getFullYear()}-12-20`); // December 21 of the current year

            // Check if leave_end_date is after December 20
            if (currentYear === 2024 && endDate > restrictionDate) {
                frappe.msgprint(__('You cannot file this leave as it exceeds December 20.'));
                frappe.validated = false; // Prevent form submission
            }
        }
    }
}
