import crypto from "node:crypto";
import express from "express";
console.log("=== THIS IS MY SERVER.JS ===");
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();
const SURVEY_DURATION_MS = 3 * 60 * 1000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage });
mongoose.connect(
  "mongodb://nitikaa2006_db_user:Nitika1812@ac-ckrpbho-shard-00-00.4240rjb.mongodb.net:27017,ac-ckrpbho-shard-00-01.4240rjb.mongodb.net:27017,ac-ckrpbho-shard-00-02.4240rjb.mongodb.net:27017/?ssl=true&replicaSet=atlas-cz8zuv-shard-0&authSource=admin&appName=AirportSurveyDB"
)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error(err));

const defaultAirports = [
  {
    name: "Safdarjung Airport",
    code: "VIDD",
    lat: 28.5845,
    lng: 77.2058,
    radiusMeters: 500,
  },
  {
    name: "Indira Gandhi International Airport",
    code: "VIDP",
    lat: 28.5562,
    lng: 77.1000,
    radiusMeters: 1500,
  },
  {
    name: "Chhatrapati Shivaji Maharaj International Airport",
    code: "VABB",
    lat: 19.0896,
    lng: 72.8656,
    radiusMeters: 1500,
  },
  {
    name: "Kempegowda International Airport",
    code: "VOBL",
    lat: 13.1986,
    lng: 77.7066,
    radiusMeters: 1500,
  },
  {
    name: "Chennai International Airport",
    code: "VOMM",
    lat: 12.9941,
    lng: 80.1709,
    radiusMeters: 1500,
  },
  {
    name: "Netaji Subhas Chandra Bose International Airport",
    code: "VECC",
    lat: 22.6547,
    lng: 88.4467,
    radiusMeters: 1500,
  },
  {
    name: "Rajiv Gandhi International Airport",
    code: "VOHS",
    lat: 17.2403,
    lng: 78.4294,
    radiusMeters: 1500,
  },
  {
    name: "Cochin International Airport",
    code: "VOCI",
    lat: 10.1520,
    lng: 76.4019,
    radiusMeters: 1500,
  },
  {
    name: "Sardar Vallabhbhai Patel International Airport",
    code: "VAAH",
    lat: 23.0772,
    lng: 72.6347,
    radiusMeters: 1500,
  },
  {
    name: "Pune International Airport",
    code: "VAPO",
    lat: 18.5821,
    lng: 73.9197,
    radiusMeters: 1500,
  },
  {
    name: "Test Airport",
    code: "TEST",
    lat: 28.6255,
    lng: 77.1100,
    radiusMeters: 500,
  },
];

const AirportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  radiusMeters: { type: Number, default: 500 },
  city: String,
  state: String,
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

const SurveySessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  deviceId: String,
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
  issueCategory: String,
photos: [String],
  submittedAt: String,
  syncedAt: { type: Date, default: Date.now },
});

const Airport = mongoose.model("Airport", AirportSchema);
const SurveySession = mongoose.model("SurveySession", SurveySessionSchema);
const Survey = mongoose.model("Survey", SurveySchema);
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
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
  console.log("AIRPORT ROUTE HIT");
  try {
    await seedAirports();
    const airports = await Airport.find({ status: "active" }).sort({ name: 1 });
    res.json(airports);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
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
  console.log("START SURVEY HIT");
  try {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + SURVEY_DURATION_MS);
    const sessionId = crypto.randomUUID();

   const deviceId = req.headers["x-device-id"] || req.ip;

await SurveySession.create({
  sessionId,
  deviceId,
  userIP: req.ip,
  startedAt,
  expiresAt,
  submitted: false,
});
    res.json({ sessionId, startedAt, expiresAt, durationSeconds: 180 });
 } catch (error) {
  console.error("START SURVEY ERROR:");
  console.error(error);

  res.status(500).json({
    message: error.message,
    stack: error.stack,
  });
}
});
app.post("/submitSurvey", upload.array("photos", 5), async (req, res) => {
  try {
    console.log("BODY:", req.body);
console.log("FILES:", req.files);
console.log("CONTENT TYPE:", req.headers["content-type"]);
    const {
  sessionId,
  clientSubmissionId,
  submittedAt,
  offlineQueued,
} = req.body;

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
  const startedAt = new Date();

  session = await SurveySession.create({
    sessionId,
    deviceId: req.ip,
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
/*
const duplicateDevice = await SurveySession.findOne({
  deviceId: session.deviceId,
  submitted: true,
});

if (
  duplicateDevice &&
  duplicateDevice.sessionId !== sessionId
) {
  return res.status(409).json({
    message: "You have already participated."
  });
}
*/

    
    
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
const serverTime =
  new Date();

if (
  serverTime >
  session.expiresAt
)
{
  return res.status(400).json({
    message:
      "Survey time expired. Please start a new survey.",
  });
} 
console.log("FILES:", req.files);
console.log("PHOTOS TO SAVE:", req.files?.map(file => `/uploads/${file.filename}`));
   const survey = new Survey({
  airportName: req.body.airportName,
  airportCode: req.body.airportCode,
  tripReason: req.body.tripReason,
  travelClass: req.body.travelClass,
  returnTrips: req.body.returnTrips,
  comments: req.body.comments,
  issueCategory: req.body.issueCategory,
  sessionId: req.body.sessionId,
  clientSubmissionId: req.body.clientSubmissionId,
  offlineQueued: false,
  submittedAt: req.body.submittedAt,
  ratings: JSON.parse(req.body.ratings),
  photos: req.files
  ? req.files.map((file) => `/uploads/${file.filename}`)
  : [],
});

await survey.save();
const savedSurvey = await Survey.findById(survey._id);
console.log("SAVED:", savedSurvey);
console.log(survey);

    session.submitted = true;
    session.submittedAt = new Date();
    await session.save();

    res.json({ message: "Survey Saved Successfully" });
 } catch (error) {
  console.error(error);
  res.status(500).json({
    message: error.message,
    stack: error.stack,
  });
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
