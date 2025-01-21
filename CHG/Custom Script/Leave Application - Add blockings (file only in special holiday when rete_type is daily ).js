frappe.ui.form.on("Leave Application", {
    
	validate: async function(frm, cdt, cdn) {

	  block_lv_application(frm,cdt,cdn);
	  blockBdayLeave(frm, cdt, cdn);
	  checkHalfDay(frm);
	  await holidayFilter(frm);
	  let row = frappe.get_doc(cdt, cdn);
	  var employee = frm.doc.employee;
  
	  let lv_list = [];
  
	  for (i in row.leave_application_table) {
		var target_date = row.leave_application_table[i].leave_date;
		var is_excluded = row.leave_application_table[i].is_excluded;
		var is_first_half = row.leave_application_table[i].is_first_half;
		var is_second_half = row.leave_application_table[i].is_second_half;
  
		if (is_excluded == 0) {
		var item_list = {
			"target_date": target_date ,
			"is_first_half": is_first_half ,
			"is_second_half": is_second_half ,
		  };
  
		await lv_list.push(item_list);
		}
	  }
  
  
  
	  let ob_list = await get_ob_list(frm, lv_list);
	  let ob_app_list = await get_ob_app(frm, ob_list, employee);
	  let names = await ob_app_list.map((item) => item.name);
  
	  const filter_ob = await ob_list.filter((person) => names.includes(person.parent))
  
	  var invalid_dates = ''
	  filter_ob.forEach(function(ob_list) {
		if (invalid_dates == '') {
		  invalid_dates = ob_list.target_date
		} else {
		  invalid_dates = invalid_dates + ", "+ ob_list.target_date
		}
	  });
  
  
	  if (invalid_dates != '') {
		frappe.msgprint("<strong>Invalid Application</strong>. You have an exising Official Business Application for the following date/s ( " + invalid_dates + " )");
		frappe.validated = false;
	  }
	  //await holidayFilter(frm)
	},

  })
  
  
  
  async function get_ob_list(frm, lv_list){
	return await new Promise(async resolve => {
	  let official_list = [];
	  await lv_list.forEach(async function(ob_data) {
  
		if (ob_data.is_first_half == 0 && ob_data.is_second_half == 0) {
  
		  let list = await get_ob_on_the_day(frm, ob_data.target_date);
		  list.forEach(async function(data_list) {
			var item_list = {
					"parent": data_list.parent ,
					"target_date": data_list.target_date ,
					"is_first_half": data_list.is_first_half ,
					"is_second_half": data_list.is_second_half ,
			};
			await official_list.push(item_list);
		  });
		} else {
		  let count = typeof get_ob(frm, ob_data.target_date, 0 , 0).length;
		  if (count != 'undefined') {
  
			let list = await get_ob(frm, ob_data.target_date, 0 , 0);
			list.forEach(async function(data_list) {
			  var item_list = {
					  "parent": data_list.parent ,
					  "target_date": data_list.target_date ,
					  "is_first_half": data_list.is_first_half ,
					  "is_second_half": data_list.is_second_half ,
			  };
			  await official_list.push(item_list);
			});
		  } else {
  
			let list = await get_ob(frm, ob_data.target_date, ob_data.is_first_half , ob_data.is_second_half);
			list.forEach(async function(data_list) {
			  var item_list = {
					  "parent": data_list.parent ,
					  "target_date": data_list.target_date ,
					  "is_first_half": data_list.is_first_half ,
					  "is_second_half": data_list.is_second_half ,
			  };
			  await official_list.push(item_list);
			});
		  }
		}
  
	  });
  
	  await resolve(official_list);
	});
  }
  
  
  function get_ob(frm, target_date, is_first_half, is_second_half){
	return new Promise(async resolve => {
	  let official_list = [];
  
	  await frappe.call({
		  method: "frappe.client.get_list",
		  args: {
			  "doctype": "Official Business Application Table",
			  "filters": {"target_date": target_date,
			  "is_excluded": 0,
			  "is_first_half": is_first_half,
			  "is_second_half": is_second_half},
			  "fields": ["target_date", "parent", "is_first_half", "is_second_half"]
		  },
		  async: false, 
		  callback: function (data) {
			var temp = typeof data.message;
			if(temp != 'undefined') {
			  data.message.forEach(function(lv_data) {
				  var item_list = {
					"parent": lv_data.parent ,
					"target_date": lv_data.target_date ,
					"is_first_half": lv_data.is_first_half ,
					"is_second_half": lv_data.is_second_half ,
				  };
				  official_list.push(item_list);
			  });
			}
		  }
	  });
  
	  resolve(official_list);
	});
  }
  
  function get_ob_on_the_day(frm, target_date){
	return new Promise(resolve => {
	  let official_list = [];
  
	  frappe.call({
		  method: "frappe.client.get_list",
		  args: {
			"doctype": "Official Business Application Table",
			"filters": {"target_date": target_date,
			"is_excluded": 0},
			"fields": ["target_date", "parent", "is_first_half", "is_second_half"]
		  },
		  async: false, 
		  callback: function (data) {
			var temp = typeof data.message;
			if(temp != 'undefined') {
			  data.message.forEach(function(lv_data) {
				  var item_list = {
					"parent": lv_data.parent ,
					"target_date": lv_data.target_date ,
					"is_first_half": lv_data.is_first_half ,
					"is_second_half": lv_data.is_second_half ,
				  };
				  official_list.push(item_list);
			  });
			}
		  }
	  });
  
	  resolve(official_list);
	});
  }
  
  

function get_ob_app(frm, names, employee){
	return new Promise(resolve => {
		let parents = names.map((item) => item.parent);
		let official_list = [];
		frappe.call({
			  method: "frappe.client.get_list",
			  args: {
				"doctype": "Official Business Application",
				"filters": {"name": ["in", parents],
							"employee": employee,
							"workflow_state": ["NOT IN", ["Rejected","Cancelled"]]},
				"fields": ["name", "employee"],
				"order_by": 'approved_on desc'
			  },
			  async: false, 
			  callback: function (ob_data) {
				var temp = typeof ob_data.message;
				if(temp != 'undefined') {
				  official_list = ob_data.message;
				}
			  }
		});
		resolve(official_list);
	});
  }
  
  
  function checkHalfDay(frm) {
	$.each(frm.doc.leave_application_table, function(i,row) {
	  // console.log(row.is_first_half);
	  if (row.is_first_half == 1 || row.is_second_half == 1 ) {
		row.is_half_day = 1
		//checkOBs(frm,row.is_first_half,row.is_second_half) 
	  } else {
		row.is_half_day = 0
		//checkOBs(frm,row.is_first_half,row.is_second_half) 
	  }
	})
  }
  
  //block if the the applied birthday leave is more than the set up number of days before and after of birthdate
  function blockBdayLeave(frm, cdt, cdn) {
	if(frm.doc.leave_type == 'Birthday Leave'){
	frappe.call({
		method: "frappe.client.get_value",
		args: {
				"doctype": "Leave Type Before Filing Table",
			  "filters": {"parent": frm.doc.leave_type},
				"fieldname": ["parent","days_before_filing", "from_leave_day", "to_leave_day"]
			},
		async: false, 
		callback: function (bltype_data) {
		  var bl_type = typeof bltype_data.message;
		  var less_days = bltype_data.message.from_leave_day;
		  var add_days =bltype_data.message.to_leave_day;
		  
		  if(bl_type != 'undefined') {
			//console.log(bltype_data.message);
			$.each(frm.doc.leave_application_table, function(i,row) {
			//console.log(row.leave_date);
  
			frappe.call({
					method: "frappe.client.get_value",
					args: {
					  "doctype": "Employee",
					  "filters": {"name": frm.doc.employee},
					  "fieldname": ["name", "birthday"]
					},
					async: false, 
					callback: function (e_data) {
					  var emp = typeof e_data.message;
					  if(emp != 'undefined') {
						var d = new Date(e_data.message.birthday);
						var curDate = new Date();
						var fromDate = new Date(frm.doc.from_date);
						var birthDate = new Date(fromDate.getFullYear(),d.getMonth(),d.getDate())
						var from_date = frappe.datetime.add_days(birthDate, less_days *-1);
				var to_date = frappe.datetime.add_days(birthDate, add_days);
  
				if(row.leave_date < from_date || row.leave_date > to_date){
				  frappe.msgprint({
							title: __('Error Message'),
							indicator: 'red',
							message: __("You can't apply Birthday Leave not within " + from_date + " and " + to_date + ".")
						  });
				  frappe.validated = false;
				}
					  }
					}
			  });
		  })
		  }
		}
		})
	}
  }
  
  //Block if target date already exist in applied Leave Application
  function block_lv_application(frm,cdt,cdn) {
  $.each(frm.doc.leave_application_table, function(i,row) {
	  var lv_target_date = row.leave_date;
	  frappe.call({
		method: "frappe.client.get_list",
		args: {
			  "doctype": "Leave Application",
			  "filters": {"employee": frm.doc.employee,
			  "name": ["!=",frm.doc.name],
			  "workflow_state": ["in",["Pending","Approved"]]},
			  "order_by": "name desc",
			  "limit_page_length": 1000,
			  "fields": ["name","employee", "full_name","workflow_state","from_date","to_date"]
		  },
		async: false, 
		callback: function (data) {
		  //console.log('applied_ob',data.message);
		  var temp = typeof data.message;
		  if(temp != 'undefined') {
		  var i;
		  for (i = 0; i < data.message.length; ++i) {
			//console.log('parent ', data.message[i].name);
			//console.log(ob_target_date);
			var status = data.message[i].workflow_state;
			frappe.call({
			  method: "frappe.client.get_list",
			  args: {
				  "doctype": "Leave Application Table",
				  "filters": {"parent": ["=",data.message[i].name],
				  "leave_date": ["=",lv_target_date],
		  "is_excluded": ["=", 0]},
				  "fields": ["name","parent","leave_date", "is_first_half", "is_second_half", "is_half_day"]
			  },
			  async: false, 
			  callback: function (datax) {
				var datax_temp = typeof datax.message;
				//console.log(datax.messag);
				if(datax_temp != 'undefined') {
				  if(datax.message.length > 0) {
					for (j = 0; j < datax.message.length; ++j) {
						if(datax.message[j].is_first_half == row.is_first_half && datax.message[j].is_second_half == row.is_second_half){
						frappe.msgprint({
						  title: __('Error Message'),
						  indicator: 'red',
						  message: __('<b> Leave Application: ' + datax.message[j].parent + '</b> <hr>You have an existing '+ status.toLowerCase() + ' application on '+ datax.message[j].leave_date)
						});
						frappe.validated = false;
						frm.refresh();
						  }
					}
				  } 
				}
			  }
			});
		  } 
		  }
		}
	  });
  })
  }
  
  async function holidayFilter(frm){
    const companyInfo = await frappe.db.get_value('Employee', { 'name': frm.doc.employee }, 'company');
    const empRate = await frappe.db.get_value('Employee', { 'name': frm.doc.employee }, 'rate_type');
    const empLoc = await frappe.db.get_value('Employee', { 'name': frm.doc.employee }, 'location');

    let compInf = /AMB MANPOWER SERVICES/.test(companyInfo.message.company) ? 'AMB MANPOWER SERVICES' : 'CHG GLOBAL INC.';
    let compLoc = empLoc.message.location;


    // Fetch holidays without filtering based on is_special
    const filters = {"company": compInf, "location": compLoc};
    const fields = ["holiday_name", "holiday_date", "is_special", "recurring_yearly"];
    const data = await frappe.db.get_list("Holiday", { filters: filters, fields: fields, limit: 1000 });

	if (Array.isArray(data)) {
		// Iterate over the data array and log each holiday_date
		data.forEach(item => {
			console.log(item.holiday_date);
		});
	} else {
		console.log('No holiday data found or data is not in the expected format.');
	}
	
    if (data && data.length > 0) {
	console.log(data && data.length > 0);
		const holidayList = data.map(item => item.holiday_date);
        const leaveArray = frm.doc.leave_application_table
            .filter(row => row.is_excluded === 0)
            .map(row => row.leave_date);
		
		console.log(data.map(item => item.holiday_date));

        for (const leaveDate of leaveArray) {
			console.log(leaveDate);
			console.log(holidayList);
			console.log(holidayList.includes(leaveDate))
            if (holidayList.includes(leaveDate)) {
                const holiday = data.find(item => item.holiday_date === leaveDate);

                if (holiday.is_special === 1 && empRate.message.rate_type === 'Daily Rate') {
					console.log("tignin kung pumasok dito");
					continue;
                }else if (holiday.is_special === 1 && empRate.message.rate_type === 'Monthly Rate') {
                    frappe.throw({
                        title: __('Error'),
                        indicator: 'red',
                        message: __('You are not allowed to file Leave on a Special Holiday.')
                    });
                    return;
                }else if (holiday.is_special === 0 && empRate.message.rate_type === 'Daily Rate') {
                    frappe.throw({
                        title: __('Error'),
                        indicator: 'red',
                        message: __('You are not allowed to file Leave on a Legal Holiday.')
                    });
                    return;
                }else if (holiday.is_special === 0 && empRate.message.rate_type === 'Monthly Rate') {
                    frappe.throw({
                        title: __('Error'),
                        indicator: 'red',
                        message: __('You are not allowed to file Leave on a Legal Holiday.')
                    });
                    return;
                }
			
            }
			console.log("tignin kung dito naman");
        }
    }

    // Other validations or logic can follow here
}

