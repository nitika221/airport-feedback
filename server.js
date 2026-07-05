import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const SURVEY_DURATION_MS = 3 * 60 * 1000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://nitikaa2006_db_user:niti1812@airportsurveydb.4240rjb.mongodb.net/?appName=AirportSurveyDB"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const defaultAirports = [
  { name: "Safdarjung Airport", code: "VIDD", lat: 28.5845, lng: 77.2058 },
  {
    name: "Indira Gandhi International Airport",
    code: "VIDP",
    lat: 28.5562,
    lng: 77.1,
  },
  {
    name: "Chhatrapati Shivaji Maharaj International Airport",
    code: "VABB",
    lat: 19.0896,
    lng: 72.8656,
  },
  {
    name: "Kempegowda International Airport",
    code: "VOBL",
    lat: 13.1986,
    lng: 77.7066,
  },
  { name: "Chennai International Airport", code: "VOMM", lat: 12.9941, lng: 80.1709 },
  {
    name: "Netaji Subhas Chandra Bose International Airport",
    code: "VECC",
    lat: 22.6547,
    lng: 88.4467,
  },
  {
    name: "Rajiv Gandhi International Airport",
    code: "VOHS",
    lat: 17.2403,
    lng: 78.4294,
  },
  { name: "Cochin International Airport", code: "VOCI", lat: 10.152, lng: 76.4019 },
  {
    name: "Sardar Vallabhbhai Patel International Airport",
    code: "VAAH",
    lat: 23.0772,
    lng: 72.6347,
  },
  { name: "Pune International Airport", code: "VAPO", lat: 18.5821, lng: 73.9197 },
  { name: "Test Airport", code: "TEST", lat: 28.6255, lng: 77.11 },
];

const AirportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  city: String,
  state: String,
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const SurveySessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userIP: String,
  startedAt: Date,
  expiresAt: Date,
  submitted: { type: Boolean, default: false },
  submittedAt: Date,
});

const SurveySchema = new mongoose.Schema({
  airportName: String,
  airportCode: String,
  tripReason: String,
  travelClass: String,
  returnTrips: String,
  sessionId: String,
  clientSubmissionId: { type: String, unique: true, sparse: true },
  offlineQueued: { type: Boolean, default: false },

  ratings: {
    q1: Number,
    q2: Number,
    q3: Number,
    q4: Number,
    q5: Number,
    q6: Number,
    q7: Number,
  },

  comments: String,
  submittedAt: String,
  syncedAt: { type: Date, default: Date.now },
});

const Airport = mongoose.model("Airport", AirportSchema);
const SurveySession = mongoose.model("SurveySession", SurveySessionSchema);
const Survey = mongoose.model("Survey", SurveySchema);

const seedAirports = async () => {
  await Promise.all(
    defaultAirports.map((airport) =>
      Airport.findOneAndUpdate(
        { code: airport.code },
        { $setOnInsert: airport },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
};

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

app.get("/airports", async (req, res) => {
  try {
    await seedAirports();
    const airports = await Airport.find({ status: "active" }).sort({ name: 1 });
    res.json(airports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Airports" });
  }
});

app.post("/airports", async (req, res) => {
  try {
    const { name, code, lat, lng, city, state } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Airport name and code are required.",
      });
    }

    const airport = await Airport.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        name,
        code: code.toUpperCase(),
        lat: Number(lat ?? 0),
        lng: Number(lng ?? 0),
        city,
        state,
        status: "active",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Airport Saved Successfully", airport });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Saving Airport" });
  }
});

app.post("/startSurvey", async (req, res) => {
  try {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + SURVEY_DURATION_MS);
    const sessionId = crypto.randomUUID();

    await SurveySession.create({
      sessionId,
      userIP: req.ip,
      startedAt,
      expiresAt,
      submitted: false,
    });

    res.json({ sessionId, startedAt, expiresAt, durationSeconds: 180 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Starting Survey" });
  }
});

app.post("/submitSurvey", async (req, res) => {
  try {
    const { sessionId, clientSubmissionId, submittedAt, offlineQueued } = req.body;

    if (clientSubmissionId) {
      const duplicateSubmission = await Survey.findOne({ clientSubmissionId });
      if (duplicateSubmission) {
        return res.status(409).json({
          message: "This survey has already been submitted.",
        });
      }
    }

    if (!sessionId) {
      return res.status(400).json({
        message: "Survey session is missing. Please reload the survey.",
      });
    }

    let session = await SurveySession.findOne({ sessionId });

    if (!session && offlineQueued && sessionId.startsWith("offline-")) {
      const startedAt = new Date(Date.now() - SURVEY_DURATION_MS);
      session = await SurveySession.create({
        sessionId,
        userIP: req.ip,
        startedAt,
        expiresAt: new Date(submittedAt || Date.now()),
        submitted: false,
      });
    }

    if (!session) {
      return res.status(400).json({
        message: "Invalid survey session. Please start again.",
      });
    }
const existingSurvey = await Survey.findOne({
  sessionId,
});

if (existingSurvey) {
  return res.status(409).json({
    message: "You have already submitted this survey.",
  });
}
    if (session.submitted) {
      return res.status(409).json({
        message: "You have already submitted this survey.",
      });
    }

    const clientSubmittedAt = new Date(submittedAt || Date.now());
    if (clientSubmittedAt > session.expiresAt) {
      return res.status(400).json({
        message: "Survey time expired. Please start a new survey.",
      });
    }

    const survey = new Survey(req.body);
    await survey.save();

    session.submitted = true;
    session.submittedAt = new Date();
    await session.save();

    res.json({ message: "Survey Saved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Saving Survey" });
  }
});

app.get("/surveys", async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ syncedAt: -1 });
    res.json(surveys);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Fetching Surveys" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
