var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mysql = require("mysql");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const routes = require("./routes/allroutes");

const hcdbConfig = require("./db/hcconnection");
const aalConfig = require("./db/aalconnection");

const hcdbPool = hcdbConfig.mysql_pool;
const aalPool = aalConfig.mysql_pool;

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/", routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 4050;


hcdbPool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to Homecare database :", err);
    return;
  }
  console.log("Connected to HomeCare Database");
  connection.release(); // Release the connection when done
});

aalPool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to AAL database :", err);
    return;
  }
  console.log("Connected to  AAL Database");
  connection.release(); // Release the connection when done
});

app.listen(PORT, () => {
  var datetime = new Date();
  console.log(datetime.toISOString().slice(0, 10));
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
