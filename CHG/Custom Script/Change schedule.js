frappe.ui.form.on("Change Schedule Application", {
  validate: async function(frm, cdt, cdn) {

    //FUNCTION
      block_csa_application(frm,cdt,cdn);
    //END

    let employee = frm.doc.employee;
    let app_details = frappe.get_doc(cdt, cdn);
    let list_details = app_details.change_list;

    let target_date = '';
    let work_shift = '';
    let week_no = '';
    let rest_day = 0;

    let valid_dates = [];
    let valid_weeks = [];
    let weekinyear = '';
    let weekyear = '';
    let weekOut = '';

    let date_list = [];
    let week_list = [];

    for (row in list_details) {
        target_date = list_details[row].target_date;
        work_shift = list_details[row].new_shift;
        week_no = getWeek(target_date);
        rest_day = await get_is_restday(frm, work_shift);

        date_list = {
            "target_date": target_date,
            "work_shift": work_shift,
            "week_no": week_no,
            "is_restday": rest_day
        };
        valid_dates.push(date_list);
    }

    let def_sched = '';
    for (row in list_details) {
        target_date = list_details[row].target_date;
        week_no = getWeek(target_date);
        weekyear = getWeekYear(target_date);
        weekOut = getISOWeek(week_no, weekyear); 

        // console.log(weekOut);

        var index;
        for (i in weekOut) {
            def_sched = await get_as(frm, employee, weekOut[i]);
            rest_day = await get_is_restday(frm, def_sched);

            date_list = {
                "target_date": weekOut[i],
                "work_shift": def_sched,
                "week_no": week_no,
                "is_restday": rest_day
            };

            week_list = {
                "week_no": week_no,
                "year_no": weekyear
            };

            index = valid_dates.findIndex(x => x.target_date == date_list.target_date)
            if (index === -1) {
                valid_dates.push(date_list);
            }


            index = valid_weeks.findIndex(x => x.week_no == week_list.week_no)
            if (index === -1) {
                valid_weeks.push(week_list);
            }
        }
    }
    console.log(valid_dates);
    console.log(valid_weeks);

    for (i in valid_weeks) {
        let week_no = valid_weeks[i].week_no;
        let year_no = valid_weeks[i].year_no;
        const restday_count = valid_dates.filter(e => e.week_no == week_no && e.is_restday == "1").length;

        if (restday_count > 2) {
           weeks = getISOWeek(week_no, year_no); 
           let start_date = weekOut[0];
           let end_date = weekOut[6];
           let msg = "<strong>Invalid Application</strong>. You already have " + restday_count + " number of rest day for the week " + week_no + ", " + year_no + " : " + start_date + " - " + end_date;
           frappe.msgprint(msg);
           frappe.validated = false;
        }
    }
  }
})

function get_is_restday(frm, name){
  return new Promise(resolve => {
      let is_restday = 0;
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Work Shift",
              "filters": {"name": ["=", name]},
              "fields": ["is_restday"]
            },
            async: false, 
            callback: function (data) {
              var temp = typeof data.message;
              if(temp != 'undefined') {
                is_restday = data.message[0].is_restday;
              }
          }
      });

      resolve(is_restday);
  });
}


function get_cs_list(frm, target_date){
  return new Promise(resolve => {
      var cs_list = [];
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Change Schedule Application Table",
              "filters": {"target_date": ["=", target_date]},
              "fields": ["new_shift","parent"]
            },
            async: false, 
            callback: function (data) {
              var temp = typeof data.message;
              if(temp != 'undefined') {
                cs_list = data.message;
              }
          }
      });

      resolve(cs_list);
  });
}

function get_cs_app(frm, names, employee){
  return new Promise(resolve => {
      let parents = names.map((item) => item.parent);

      let cs_name = '';
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Change Schedule Application",
              "filters": {"name": ["in", parents],
                          "employee": employee},
              "fields": ["name", "employee","workflow_state"],
              "order_by": 'approved_on desc'
            },
            async: false, 
            callback: function (cs_data) {
              var temp = typeof cs_data.message;
              if(temp != 'undefined') {
                cs_name = cs_data.message[0].name;
              }
            }
      });

      var new_shift = ''
      if (cs_name != '') {
          var name_list = names.filter((data) =>  JSON.stringify(data).toLowerCase().indexOf(cs_name.toLowerCase()) !== -1);
          new_shift = name_list[0].new_shift;
      }

      resolve(new_shift);
  });
}

function get_ws(frm, employee, target_date){
  return new Promise(resolve => {
      var ws_list = '';
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Work Schedule",
              "filters": {"target_date": ["=", target_date],
                          "employee": employee},
              "fields": ["work_shift","target_date"]
            },
            async: false, 
            callback: function (ws_data) {
              var temp = typeof ws_data.message;
              if(temp != 'undefined') {
                ws_list = ws_data.message[0].work_shift;
              }
          }
      });

      resolve(ws_list);
  });
}

function get_employee_ds(frm, employee){
  return new Promise(resolve => {
      var default_schedule = '';
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Employee",
              "filters": {"name": ["=", employee]},
              "fields": ["default_schedule"]
            },
            async: false, 
            callback: function (data) {
              var temp = typeof data.message;
              if(temp != 'undefined') {
                default_schedule = data.message[0].default_schedule;
              }
          }
      });

      resolve(default_schedule);
  });
}

function get_ds(frm, default_schedule, target_date){
  return new Promise(resolve => {
      var def_sched = '';
      frappe.call({
            method: "frappe.client.get_list",
            args: {
              "doctype": "Work Schedule Template",
              "filters": {"name": default_schedule},
              "fields": ["name","sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
            },
            async: false, 
            callback: function (default_sched) {
              var temp = typeof default_sched.message;
              if(temp != 'undefined') {
                  // console.log(target_date, default_sched.message);
                  var date = new Date(target_date);
                  var day = date.getDay();
                  // console.log(day);
                  switch(day) {
                    case 0:
                      def_sched = default_sched.message[0].sunday;
                      break;
                    case 1:
                      def_sched = default_sched.message[0].monday;
                      break;
                    case 2:
                      def_sched = default_sched.message[0].tuesday;
                      break;
                    case 3:
                      def_sched = default_sched.message[0].wednesday;
                      break;
                    case 4:
                      def_sched = default_sched.message[0].thursday;
                      break;
                    case 5:
                      def_sched = default_sched.message[0].friday;
                      break;
                    case 6:
                      def_sched = default_sched.message[0].saturday;
                      break;
                    default:
                      def_sched = "";
                  } 
              }
          }
      });

      resolve(def_sched);
  });
}

function getISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 2);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay() + 1);
    const temp = {
      d: ISOweekStart.getDate(),
      m: ISOweekStart.getMonth(),
      y: ISOweekStart.getFullYear(),
    }

    const numDaysInMonth = new Date(temp.y, temp.m + 1, 0).getDate()

    return Array.from({length: 7}, _ => {
      if (temp.d > numDaysInMonth){
        temp.m +=1;
        temp.d = 1;
      }
      return new Date(temp.y, temp.m, temp.d++).toISOString().slice(0, 10);
    });
}

function getWeekYear(mydate) {
  const date = new Date(mydate);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

function getWeek(mydate) {
  const date = new Date(mydate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

function get_as(frm, employee, target_date){

  return new Promise(async resolve => {
    let output = ''
    let names = await get_cs_list(frm, target_date);
    let new_shift = await get_cs_app(frm, names, employee);
    console.log("Change Schedule", new_shift);

    let work_shift = await get_ws(frm, employee, target_date);
    // console.log("Work Schedule", work_shift);

    let default_schedule = await get_employee_ds(frm, employee);
    // console.log("Default Schedule", default_schedule);

    let def_sched = await get_ds(frm, default_schedule, target_date);
    // console.log("Def Sched", def_sched);

    if(new_shift == '')
    {
      if(work_shift == '')
      {
        if(def_sched == '')
        {
          output = 'No Default Schedule';
        }
        else
        { 
          output = def_sched;
        }
      }
      else
      { 
        output = work_shift;
      }
    }
    else
    {
      output = new_shift;
    }

    resolve(output);
  });
}

//Block if target date already exist in applied Change schedule Application
function block_csa_application(frm,cdt,cdn) {
$.each(frm.doc.change_list, function(i,row) {
    var csa_target_date = row.target_date;
    frappe.call({
      method: "frappe.client.get_list",
      args: {
            "doctype": "Change Schedule Application",
            "filters": {"employee": frm.doc.employee,
            "name": ["!=",frm.doc.name],
            "workflow_state": ["in",["Pending","Approved"]]},
            "order_by": "name desc",
            "limit_page_length": 1000,
            "fields": ["name","employee", "employee_name","workflow_state","from_date","to_date"]
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
                "doctype": "Change Schedule Application Table",
                "filters": {"parent": ["=",data.message[i].name],
                "target_date": ["=",csa_target_date]},
                "fields": ["name","parent","target_date"]
            },
            async: false, 
            callback: function (datax) {
              var datax_temp = typeof datax.message;
              //console.log(datax.messag);
              if(datax_temp != 'undefined') {
                if(datax.message.length > 0) {
                  for (j = 0; j < datax.message.length; ++j) {
                  frappe.msgprint({
                    title: __('Error Message'),
                    indicator: 'red',
                    message: __('<strong> Change Schedule Application: ' + datax.message[j].parent + '</strong> <hr>You have an existing '+ status.toLowerCase() + ' application on '+ datax.message[j].target_date)
                  });
                  frappe.validated = false;
                  frm.refresh();
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
