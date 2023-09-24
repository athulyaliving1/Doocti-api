const app = require("express"); //import express
const router = app.Router();

const SearchModule =  require("../controllers/dooctiapi")



router.post("/searchbymobilenumber", SearchModule.mobileNumberSearch);
















module.exports = router; 