const hcdb = require("../db/hcconnection").mysql_pool;
const aaldb = require("../db/aalconnection").mysql_pool;

const mobileNumberSearch = (req, res) => {
  // Use req.query instead of req.body
  const mobilenumber = req.query.mobilenumber;
  console.log(mobilenumber);

  if (!mobilenumber) {
    res.status(400).json({
      error: "Please enter a valid mobile number",
    });
  } else {
    const queryHCDB = `SELECT patients.first_name, patients.enquirer_name, patients.patient_age, patients.patient_weight, patients.contact_number AS patient_contact_number, patients.email, patients.gender, patients.area, patients.city, patients.state, patients.zipcode, patients.contact_number, patients.relationship_with_patient, patients.alternate_number AS patient_alternate_number, leads.service_category, leads.status, patients.enquirer_name AS patient_enquirer_name, leads.lead_date, patients.alternate_number, master_services.service_name, DATE_FORMAT(leads.lead_date, '%Y-%m-%d') AS formatted_lead_date FROM patients JOIN leads ON patients.id = leads.patient_id JOIN master_services ON leads.service_required = master_services.id WHERE patients.contact_number = ?`;

    const queryAALDB = `SELECT patients.first_name, patients.enquirer_name, patients.age, patients.mobile_number, patients.weight, patients.email, patients.gender, master_enquiry_source.source_name, patients.current_area, patients.current_city, patients.current_state, patients.current_pin_code, patients.current_address, leads.followup_date, leads.comments, patients.relationship_with_patient, leads.enquirer_reference, leads.expected_accomodation_type, leads.proceed_to_assessment, master_branches.branch_name FROM patients JOIN leads ON patients.id = leads.patient_id JOIN master_enquiry_source ON leads.enquiry_source_branch= master_enquiry_source.id JOIN master_branches ON leads.branch_id = master_branches.id WHERE patients.mobile_number =  ?`;

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

const postApiData = (req, res) => {
  const {
    service_required,
    case_type,
    gender_preference,
    language_preference,
    status,
    remarks,
    lead_date,
    first_name,
    enquirer_name,
    patient_age,
    patient_weight,
    contact_number,
    email,
    gender,
    area,
    city,
    state,
    zipcode,
    relationship_with_patient,
    alternate_number,
  } = req.query;

  console.log(req.query);

  if (contact_number === "") {
    res.status(400).json({
      error: "Contact number is required.",
    });
  } else {
    const patientsQuery = `
      INSERT INTO patients (
        first_name,
        enquirer_name,
        patient_age,
        patient_weight,
        contact_number,
        email,
        gender,
        area,
        city,
        state,
        zipcode,
        relationship_with_patient,
        alternate_number,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

    hcdb.query(
      patientsQuery,
      [
        first_name,
        enquirer_name,
        patient_age,
        patient_weight,
        contact_number,
        email,
        gender,
        area,
        city,
        state,
        zipcode,
        relationship_with_patient,
        alternate_number,
      ],
      (err, patientsResults) => {
        if (err) {
          console.error("Error inserting data into patients:", err);
          res.status(500).json({
            error: "Internal server error.",
          });
        } else {
          const patientId = patientsResults.insertId;

          const leadsQuery = `
          INSERT INTO leads (
            patient_id,
            service_required,
            case_type,
            gender_preference,
            language_preference,
            status,
            remarks,
            lead_date,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
        `;

          hcdb.query(
            leadsQuery,
            [
              patientId,
              service_required,
              case_type,
              gender_preference,
              language_preference,
              status,
              remarks,
              lead_date,
            ],
            (err, leadsResults) => {
              if (err) {
                console.error("Error inserting data into leads:", err);
                res.status(500).json({
                  error: "Internal server error.",
                });
              } else {
                res.status(200).json({
                  message: "Data inserted successfully.",
                  patientId,
                  leadsResults,
                });
              }
            }
          );
        }
      }
    );
  }
};

const postAALApiData = (req, res) => {
  const {
    first_name,
    enquirer_name,
    age,
    mobile_number,
    weight,
    email,
    gender,
    current_area,
    current_city,
    current_state,
    current_pin_code,
    current_address,
    relationship_with_patient,
    followup_date,
    comments,
    enquirer_reference,
    expected_accomodation_type,
  } = req.query;

  console.table(req.query);

  if (mobile_number === "") {
    res.status(400).json({
      error: "Mobile number is required.",
    });
  } else {
    const patientsQuery = `
      INSERT INTO patients (
        first_name,
        enquirer_name,
        age,
        mobile_number,
        weight,
        email,
        gender,
        current_area,
        current_city,
        current_state,
        current_pin_code,
        current_address,
        relationship_with_patient,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

    // Execute patients query
    aaldb.query(
      patientsQuery,
      [
        first_name,
        enquirer_name,
        age,
        mobile_number,
        weight,
        email,
        gender,
        current_area,
        current_city,
        current_state,
        current_pin_code,
        current_address,
        relationship_with_patient,
      ],
      (err, patientsResults) => {
        if (err) {
          console.error("Error inserting data into patients:", err);
          res.status(500).json({
            error: "Internal server error.",
          });
        } else {
          // If you don't need patientId, you can skip this step
          const patientId = patientsResults.insertId;

          const leadsQuery = `
            INSERT INTO leads (
              patient_id,
              followup_date,
              comments,
              enquirer_reference,
              expected_accomodation_type,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, NOW(), NOW());
          `;

          // Execute leads query
          aaldb.query(
            leadsQuery,
            [
              patientId, // Include this line if you need patientId
              followup_date,
              comments,
              enquirer_reference,
              expected_accomodation_type,
            ],
            (err, leadsResults) => {
              if (err) {
                console.error("Error inserting data into leads:", err);
                res.status(500).json({
                  error: "Internal server error.",
                });
              } else {
                res.status(200).json({
                  message: "Data inserted successfully.",
                  patientId,
                  leadsResults,
                });
              }
            }
          );
        }
      }
    );
  }
};

module.exports = {
  mobileNumberSearch,
  postApiData,
  postAALApiData,
};
