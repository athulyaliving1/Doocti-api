const app = require("express"); //import express
const router = app.Router();

const SearchModule = require("../controllers/dooctiapi")



router.post("/searchbymobilenumber", SearchModule.mobileNumberSearch);
router.post("/sourcedbconnectionhc", SearchModule.postApiData);
router.post("/sourcedbconnectionaal", SearchModule.postAALApiData);
















module.exports = router; 