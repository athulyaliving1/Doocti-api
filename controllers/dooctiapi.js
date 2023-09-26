const hcdb = require("../db/hcconnection").mysql_pool;
const aaldb = require("../db/aalconnection").mysql_pool;

const mobileNumberSearch = (req, res) => {
  const mobilenumber = req.body.mobilenumber;
  console.log(mobilenumber);



  if (mobilenumber === "") {
    res.status(400).json({
      error: "Please enter a valid mobile number"
    });
  } else {
    const queryHCDB = `SELECT patients.first_name, patients.enquirer_name, patients.patient_age, patients.patient_weight, patients.contact_number AS patient_contact_number, patients.email, patients.gender, patients.area, patients.city, patients.state, patients.zipcode, patients.contact_number, patients.relationship_with_patient, patients.alternate_number AS patient_alternate_number, leads.service_category, leads.status, patients.enquirer_name AS patient_enquirer_name, leads.lead_date, patients.alternate_number, master_services.service_name, DATE_FORMAT(leads.lead_date, '%Y-%m-%d') AS formatted_lead_date FROM patients JOIN leads ON patients.id = leads.patient_id JOIN master_services ON leads.service_required = master_services.id WHERE patients.contact_number = ?`;
    const queryAALDB = `SELECT patients.first_name, patients.enquirer_name, patients.age, patients.mobile_number, patients.weight, patients.email, patients.gender, master_enquiry_source.source_name, patients.current_area, patients.current_city, patients.current_state, patients.current_pin_code, patients.current_address, leads.followup_date, leads.comments, patients.relationship_with_patient, leads.enquirer_reference, leads.expected_accomodation_type, leads.proceed_to_assessment, master_branches.branch_name FROM patients JOIN leads ON patients.id = leads.patient_id JOIN master_branches ON leads.branch_id = master_branches.id JOIN master_enquiry_source ON leads.enquiry_source = master_enquiry_source.id WHERE patients.mobile_number = ?;`;

    // Create a Promise to query hcdb
    const hcdbPromise = new Promise((resolve, reject) => {
      hcdb.query(queryHCDB, [mobilenumber], (err, results) => {
        if (err) {
          console.error("Error fetching data from hcdb:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Create a Promise to query aaldb
    const aaldbPromise = new Promise((resolve, reject) => {
      aaldb.query(queryAALDB, [mobilenumber], (err, results) => {
        if (err) {
          console.error("Error fetching data from aaldb:", err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    // Execute both queries and handle the results
    Promise.all([hcdbPromise, aaldbPromise])
      .then(([hcdbResults, aaldbResults]) => {
        const response = {
          hcdbResults,
          aaldbResults,
        };
        res.json(response);
        console.table(response);
        console.log(response);
      })
      .catch((error) => {
        console.error("Error:", error);
        res.status(500).send("An error occurred");
      });
  }





};

module.exports = {
  mobileNumberSearch,
};
