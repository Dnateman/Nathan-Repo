frappe.ui.form.on('Compensatory Time Off', {
    refresh: function(frm) {
        if (frm.doc.docstatus == 1 && !frm.custom_button_added) {
            if(frm.doc.workflow_state = "Approved"){
                customButton(frm);
               frm.custom_button_added = true;
            }
        }
      },
      onload: async function(frm){
          //BlockFilling(frm)
      },
      async before_load(frm){
        await Modify_credits(frm)
      },
      async validate(frm){
         await BlockFilling(frm)
      }
    
})


async function BlockFilling(frm){
  let today = frappe.datetime.get_today();
  console.log(today)
    let custom_TKS = await frappe.db.get_doc("Customized Timekeeping Settings");
    let allowed_filling = custom_TKS.allowed_days_before_filling;
    console.log(allowed_filling)  
    let allowed  = allowed_filling * -1 
    const startDate = frm.doc.posting_date;
    const endDate = frm.doc.from_date;
    const diff = getDateDiff(today, endDate)
    console.log(diff)
    // Function to calculate the difference in days between two dates
  console.log(diff ,  allowed)
  console.log(' > ',diff  > allowed)
  console.log(' < ',diff < allowed)
  if(frm.doc.type == "File"){
    if(diff < allowed){
      frappe.throw({
        title: __('Notice'),
        indicator: 'orange',
        message: __(`Filing for CTO is only permitted <b>${allowed_filling}</b> days after your CTO date.`)
      });
      frappe.validated = false;
    }
  }
}


function getDateDiff(startDate, endDate) {
  // Convert both dates to JavaScript Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const timeDiff = end.getTime() - start.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  
  return dayDiff;
}

function customButton(frm) {
    // Function to get the dynamic link based on doctype
    function getLink() {
      return splitURL() + frm.doc.attachment;
    }
    // Create a custom button using jQuery
    var customButton = $('<button>')
      .text('View Attachment')
      .addClass('btn btn-primary')
      .css({
        'text-align' : 'center',
        'font-family': '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif',
        'font-size' : '12px',
        'width': '150px',
        'height': '30px',
         'background-color': '#718d8a',
         'border-color' :  'black'
      })
      .click(function() {
          if (frm.doc.attachment){
            var link = getLink(); // Get the dynamic link
            window.open(link);
            console.log(link);
          }
          else {
              frappe.msgprint({
                  title: __('Warning'),
                  indicator: 'orange',
                  message: __('Attachment must be filled first')
              });
          }
      });
      $(frm.fields_dict.attachment.wrapper).find('.custom-button-wrapper').remove();
      // Append the button to a specific element or container
      $(frm.fields_dict.attachment.wrapper).append(customButton)
    // $(frm.fields_dict.attachment.wrapper).append(customButton).css('color:black');
  }
  function splitURL(){
      const location = window.location.href
      // console.log(location)
      const url = new URL(location);
      // console.log(url.toString())
      // console.log(`${url.protocol}//${url.host}`);
      const split = `${url.protocol}//${url.host}`
      return split
  }

  async function Modify_credits(frm){
    const max_value = await frappe.db.get_single_value('Timekeeping Settings', 'cto_max'); 
    let option = [];
    
    // Populate options based on max_value
    for(let i = 0.5; i <= max_value; i += 0.5){
        option.push([i.toFixed(1)]); // Fix to one decimal place
    }
    
    console.log(max_value, option);

    // Fetch parent table (Compensatory Time Off) data
    let filters = {'name': frm.doc.name};
    let fields = ["*"];
    let parent = await frappe.db.get_list("Compensatory Time Off", {filters: filters, fields: fields, limit: 100});

    for(let i in parent){
        console.log(parent[i].name);

        // Fetch child table (Compensatory Time Off Targets) data linked to parent
        let _filters = {'parent': parent[i].name}; // Ensure the correct parent link
        let _fields = ["target_Date", "cto_override"];
        let child_data = await frappe.db.get_list("Compensatory Time Off Targets", {filters: _filters, fields: _fields, limit: 100});

        if(child_data.length > 0){
            // Iterate over the child data
            for(let j in child_data){
                console.log(child_data[j]);
                // Additional logic to modify the credits or process data
            }
        } else {
            console.log("No child data found for parent:", parent[i].name);
        }
    }
}
