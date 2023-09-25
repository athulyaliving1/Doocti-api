const hcdb = require("../db/hcconnection").mysql_pool;
const aaldb = require("../db/aalconnection").mysql_pool;

const mobileNumberSearch = (req, res) => {
  const mobilenumber = req.body.mobilenumber;
  console.log(mobilenumber);

  const queryHCDB = `SELECT * FROM patients WHERE contact_number = ?`;
  const queryAALDB = `SELECT * FROM patients WHERE mobile_number = ?`;

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
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).send("An error occurred");
    });
};

module.exports = {
  mobileNumberSearch,
};
