import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://nitikaa2006_db_user:niti1812@airportsurveydb.4240rjb.mongodb.net/?appName=AirportSurveyDB"
  )
  .then(() => {
    console.log("CONNECTED");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit();
  });