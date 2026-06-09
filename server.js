import express from "express";
import cors from "cors";
import mongoose from "mongoose";
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://nitikaa2006_db_user:niti1812@airportsurveydb.4240rjb.mongodb.net/?appName=AirportSurveyDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const SurveySchema = new mongoose.Schema({
  airportName: String,
  airportCode: String,
  tripReason: String,
  travelClass: String,
  returnTrips: String,
  comments: String,
  submittedAt: String,
});

const Survey = mongoose.model("Survey", SurveySchema);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.post("/submitSurvey", async (req, res) => {
  try {
    const survey = new Survey(req.body);
    await survey.save();

    res.json({
      message: "Survey Saved Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Saving Survey",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});