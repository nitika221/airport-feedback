import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../assets/aai-logo.png";

const API_URL = "http://localhost:5000";
const PENDING_SURVEYS_KEY = "pendingSurveys";

const fallbackAirports = [
  {
    name: "Safdarjung Airport",
    code: "VIDD",
    lat: 28.5845,
    lng: 77.2058,
    radius: 5,
  },
  {
    name: "Indira Gandhi International Airport",
    code: "VIDP",
    lat: 28.5562,
    lng: 77.1,
    radius: 10,
  },
  {
    name: "Chhatrapati Shivaji Maharaj International Airport",
    code: "VABB",
    lat: 19.0896,
    lng: 72.8656,
    radius: 10,
  },
  {
    name: "Kempegowda International Airport",
    code: "VOBL",
    lat: 13.1986,
    lng: 77.7066,
    radius: 10,
  },
  {
    name: "Chennai International Airport",
    code: "VOMM",
    lat: 12.9941,
    lng: 80.1709,
    radius: 10,
  },
  {
    name: "Netaji Subhas Chandra Bose International Airport",
    code: "VECC",
    lat: 22.6547,
    lng: 88.4467,
    radius: 10,
  },
  {
    name: "Rajiv Gandhi International Airport",
    code: "VOHS",
    lat: 17.2403,
    lng: 78.4294,
    radius: 10,
  },
  {
    name: "Cochin International Airport",
    code: "VOCI",
    lat: 10.152,
    lng: 76.4019,
    radius: 10,
  },
  {
    name: "Sardar Vallabhbhai Patel International Airport",
    code: "VAAH",
    lat: 23.0772,
    lng: 72.6347,
    radius: 10,
  },
  {
    name: "Pune International Airport",
    code: "VAPO",
    lat: 18.5821,
    lng: 73.9197,
    radius: 10,
  },
  {
    name: "Test Airport",
    code: "TEST",
    lat: 28.6255,
    lng: 77.11,
    radius: 5,
  },
];

const questions = [
  { key: "q1", text: "Experience at parking facility?" },
  { key: "q2", text: "Experience at Check-in?" },
  { key: "q3", text: "Cleanliness of washrooms?" },
  { key: "q4", text: "Experience at Security Check?" },
  { key: "q5", text: "Were F&B and retail facilities as per expectation?" },
  { key: "q6", text: "Experience at Boarding Gate?" },
  { key: "q7", text: "Overall Airport Experience?" },
];

const ratingOptions = [
  { label: "Did Not Use", value: 0 },
  { label: "Excellent", value: 5 },
  { label: "Very Good", value: 4 },
  { label: "Good", value: 3 },
  { label: "Fair", value: 2 },
  { label: "Poor", value: 1 },
];

const readPendingSurveys = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SURVEYS_KEY)) || [];
  } catch {
    return [];
  }
};

const savePendingSurveys = (surveys) => {
  localStorage.setItem(PENDING_SURVEYS_KEY, JSON.stringify(surveys));
};

const mergeAirports = (baseAirports, addedAirports) => {
  const airportMap = new Map();

  [...baseAirports, ...addedAirports].forEach((airport) => {
    airportMap.set(airport.code, airport);
  });

  return Array.from(airportMap.values());
};
function distanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
function SurveyPage() {
  const navigate = useNavigate();
  const [airports, setAirports] = useState(fallbackAirports);
  const [airportName, setAirportName] = useState("");
  const [airportCode, setAirportCode] = useState("");
  const [comments, setComments] = useState("");
  const [ratings, setRatings] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
    q7: "",
  });
  const [tripReason, setTripReason] = useState("");
  const [travelClass, setTravelClass] = useState("");
  const [returnTrips, setReturnTrips] = useState("");
  const [distance, setDistance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isExpired, setIsExpired] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [session, setSession] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [showAddAirport, setShowAddAirport] = useState(false);
  const [newAirport, setNewAirport] = useState({
    name: "",
    code: "",
    city: "",
    state: "",
  });
const selectedAirport = airports.find(
  (airport) => airport.code === airportCode
);

const isInsideAirport =
  selectedAirport &&
  userLocation
    ? distanceInMeters(
        userLocation.lat,
        userLocation.lng,
        selectedAirport.lat,
        selectedAirport.lng
      ) <= (selectedAirport.radiusMeters || 1000)
    : false;

  const sortedAirports = useMemo(() => {
    return [...airports].sort((a, b) => a.name.localeCompare(b.name));
  }, [airports]);

  const syncPendingSurveys = async () => {
    const pendingSurveys = readPendingSurveys();
    if (pendingSurveys.length === 0) return;

    const unsynced = [];

    for (const survey of pendingSurveys) {
      try {
        const response = await fetch(`${API_URL}/submitSurvey`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...survey, offlineQueued: true }),
        });

        if (!response.ok && response.status !== 409) {
          unsynced.push(survey);
        }
      } catch {
        unsynced.push(survey);
      }
    }

    savePendingSurveys(unsynced);

    if (pendingSurveys.length !== unsynced.length) {
      setSyncMessage("Offline surveys synced successfully.");
    }
  };

  const loadAirports = async () => {
    try {
      const response = await fetch(`${API_URL}/airports`);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setAirports(mergeAirports(fallbackAirports, data));
      }
    } catch {
      setSyncMessage("Offline mode: using saved airport list.");
    }
  };

  const startSurveySession = async () => {
    try {
      const response = await fetch(`${API_URL}/startSurvey`, { method: "POST" });
      const data = await response.json();
      setSession(data);
      setTimeLeft(
        Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 1000))
      );
    } catch {
      const offlineSession = {
        sessionId: `offline-${crypto.randomUUID()}`,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 180000).toISOString(),
      };

      setSession(offlineSession);
      setTimeLeft(180);
      setSyncMessage("Offline mode: survey will sync when internet returns.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAirports();
    startSurveySession();
    syncPendingSurveys();

    window.addEventListener("online", syncPendingSurveys);
    return () => window.removeEventListener("online", syncPendingSurveys);
  }, []);

  useEffect(() => {
    if (!session?.expiresAt) return;

    const timer = setInterval(() => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
      );

      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (sortedAirports.length === 0) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        let nearestAirport = null;
let minDistance = Infinity;

sortedAirports.forEach((airport) => {
  const distanceKm =
    Math.sqrt(
      Math.pow(lat - airport.lat, 2) +
      Math.pow(lng - airport.lng, 2)
    ) * 111;

  if (distanceKm < minDistance) {
    minDistance = distanceKm;
    nearestAirport = airport;
  }
});
console.log("Nearest Airport:", nearestAirport);
console.log("Distance (km):", minDistance);
setDistance(minDistance);

if (
  nearestAirport &&
  minDistance <=
    ((nearestAirport.radiusMeters || 1000) / 1000)
) {
  setAirportName(nearestAirport.name);
  setAirportCode(nearestAirport.code);
} else {
  setAirportName("");
  setAirportCode("");
}
      },
      (error) => {
        console.log(error);
        const firstAirport = sortedAirports[0];
        setAirportName(firstAirport.name);
        setAirportCode(firstAirport.code);
      }
    );
  }, [sortedAirports]);

  const today = new Date().toISOString().split("T")[0];
  const currentTime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const selectAirport = (airportValue) => {
    if (airportValue === "__other_airport__") {
      setShowAddAirport(true);
      setAirportName("");
      setAirportCode("");
      return;
    }

    setShowAddAirport(false);
    const selectedAirport = airports.find((airport) => airport.name === airportValue);
    
    if (!selectedAirport) return;
    setAirportName(selectedAirport.name);
    setAirportCode(selectedAirport.code);
  };

  const updateRating = (questionKey, value) => {
    setRatings({ ...ratings, [questionKey]: Number(value) });
  };

  const handleAddAirport = async (event) => {
    event.preventDefault();

    if (!newAirport.name || !newAirport.code) {
      setValidationError("Please enter airport name and airport code.");
      return;
    }

    if (!userLocation) {
      setValidationError(
        "Please allow location access first. The airport location will be mapped automatically."
      );
      return;
    }

    const airportPayload = {
      ...newAirport,
      code: newAirport.code.toUpperCase(),
      lat: userLocation.lat,
      lng: userLocation.lng,
    };

    try {
      const response = await fetch(`${API_URL}/airports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(airportPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setAirports((currentAirports) => {
        const withoutSameCode = currentAirports.filter(
          (airport) => airport.code !== data.airport.code
        );
        return [...withoutSameCode, data.airport];
      });
      setAirportName(data.airport.name);
      setAirportCode(data.airport.code);
      setNewAirport({ name: "", code: "", city: "", state: "" });
      setShowAddAirport(false);
      setValidationError("");
      setSyncMessage("Airport added successfully.");
    } catch (error) {
      setValidationError(error.message || "Unable to add airport right now.");
    }
  };

  const queueOfflineSurvey = (surveyData) => {
    const pendingSurveys = readPendingSurveys();
    savePendingSurveys([...pendingSurveys, { ...surveyData, offlineQueued: true }]);
  };

  const handleSubmit = async () => {
    const hasAllRatings = questions.every((question) => ratings[question.key] !== "");

    if (!tripReason || !travelClass || !returnTrips || !hasAllRatings) {
      setValidationError(
        "Please complete trip reason, travel class, return trips and all ratings before submitting."
      );
      return;
    }

    if (isExpired) {
      setValidationError("Survey time expired. Please refresh and start again.");
      return;
    }

    setValidationError("");

    const surveyData = {
      airportName,
      airportCode,
      tripReason,
      travelClass,
      returnTrips,
      ratings,
      comments,
      sessionId: session?.sessionId,
      clientSubmissionId: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("surveyData", JSON.stringify(surveyData));

    try {
      const response = await fetch(`${API_URL}/submitSurvey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      navigate("/thank-you");
    } catch (error) {
      queueOfflineSurvey(surveyData);
      setSyncMessage(
        error.message?.includes("expired") || error.message?.includes("already")
          ? error.message
          : "No internet detected. Survey saved offline and will sync automatically."
      );
      navigate("/thank-you");
    }
  };

  return (
    <div className="container survey-shell">
      <div className="header survey-header">
        <img src={logo} alt="AAI Logo" className="logo" />

        <div>
          <h1>AAI - Customer Satisfaction Survey</h1>
          <p>Help us improve your airport experience</p>
        </div>

        <div className={timeLeft <= 30 ? "timer timer-danger" : "timer"}>
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      <div className="welcome-box">
        Welcome Passenger! Complete the survey within 3 minutes. 
      </div>

      

      {syncMessage && <div className="sync-message">{syncMessage}</div>}

      {distance !== null && (
        <div className="location-status">
          <strong>Nearest airport distance:</strong> {distance.toFixed(4)}
          <span className={isInsideAirport ? "inside-status" : "outside-status"}>
            {isInsideAirport ? "Inside Airport" : "Outside Airport"}
          </span>
        </div>
      )}

      <div className="form-grid">
        <select
          value={showAddAirport ? "__other_airport__" : airportName}
          onChange={(e) => selectAirport(e.target.value)}
        >
          {sortedAirports.map((airport) => (
            <option key={airport.code} value={airport.name}>
              {airport.name}
            </option>
          ))}
          <option value="__other_airport__">Other / Airport not listed</option>
        </select>

        <input value={airportCode} readOnly />
        <input placeholder="Flight Number" />
        <input type="date" value={today} readOnly />
        <input type="time" value={currentTime} readOnly />
        <input placeholder="Destination" />
      </div>

      {showAddAirport && (
        <form className="add-airport-panel" onSubmit={handleAddAirport}>
          <h3>Airport not listed?</h3>
          <p className="mapping-note">
            Enter the airport details you know. Location mapping will use your
            current GPS automatically.
          </p>
          <div className="form-grid">
            <input
              placeholder="Airport Name"
              value={newAirport.name}
              onChange={(e) => setNewAirport({ ...newAirport, name: e.target.value })}
            />
            <input
              placeholder="Airport Code"
              value={newAirport.code}
              onChange={(e) => setNewAirport({ ...newAirport, code: e.target.value })}
            />
            <input
              placeholder="City"
              value={newAirport.city}
              onChange={(e) => setNewAirport({ ...newAirport, city: e.target.value })}
            />
            <input
              placeholder="State"
              value={newAirport.state}
              onChange={(e) => setNewAirport({ ...newAirport, state: e.target.value })}
            />
          </div>
          <button type="submit" className="submit-btn">
            Continue with this airport
          </button>
        </form>
      )}

      <h3>Main Reason For Trip</h3>
      {["Business", "Leisure", "Other"].map((reason) => (
        <button
          key={reason}
          onClick={() => setTripReason(reason)}
          style={{
            background: tripReason === reason ? "#2563eb" : "white",
            color: tripReason === reason ? "white" : "#1e3a8a",
          }}
        >
          {reason}
        </button>
      ))}

      <h3>Which section of the aircraft are you travelling in?</h3>
      {["First Class", "Business/Upper Class", "Economy", "Tourist"].map(
        (className) => (
          <button
            key={className}
            onClick={() => setTravelClass(className)}
            style={{
              background: travelClass === className ? "#2563eb" : "white",
              color: travelClass === className ? "white" : "#1e3a8a",
            }}
          >
            {className}
          </button>
        )
      )}

      <h3>Number of return trips made in last 12 months</h3>
      {["1-2", "3-5", "6-10", "11-20", "21+"].map((tripCount) => (
        <button
          key={tripCount}
          onClick={() => setReturnTrips(tripCount)}
          style={{
            background: returnTrips === tripCount ? "#2563eb" : "white",
            color: returnTrips === tripCount ? "white" : "#1e3a8a",
          }}
        >
          {tripCount}
        </button>
      ))}

      <h2>Airport Departure Customer Satisfaction Questionnaire</h2>
      <div className="survey-table-container">
        <table>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Questions</th>
              {ratingOptions.map((option) => (
                <th key={option.label}>{option.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {questions.map((question, index) => (
              <tr key={question.key}>
                <td>{index + 1}</td>
                <td className="question-cell">{question.text}</td>

                {ratingOptions.map((option) => (
                  <td key={`${question.key}-${option.value}`}>
                    <input
                      type="radio"
                      name={question.key}
                      value={option.value}
                      checked={ratings[question.key] === option.value}
                      onChange={(e) => updateRating(question.key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Additional Comments</h3>
      <textarea
        placeholder="Enter your comments here..."
        rows="4"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      {isExpired && <h3 style={{ color: "red" }}>Survey Time Expired</h3>}
      {validationError && <div className="validation-error">{validationError}</div>}

      <button className="submit-btn" onClick={handleSubmit} disabled={isExpired}>
        SUBMIT
      </button>
    </div>
  );
}

export default SurveyPage;
