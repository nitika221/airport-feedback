import { useState, useEffect } from "react";
import "../App.css";
import logo from "../assets/aai-logo.png";

function SurveyPage() {
    const airports = [
  {
    name: "Safdarjung Airport",
    code: "VIDD",
    lat: 28.5845,
    lng: 77.2058,
  },
  {
    name: "Indira Gandhi International Airport",
    code: "VIDP",
    lat: 28.5562,
    lng: 77.1000,
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
  {
    name: "Chennai International Airport",
    code: "VOMM",
    lat: 12.9941,
    lng: 80.1709,
  },
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
  {
    name: "Cochin International Airport",
    code: "VOCI",
    lat: 10.1520,
    lng: 76.4019,
  },
  {
    name: "Sardar Vallabhbhai Patel International Airport",
    code: "VAAH",
    lat: 23.0772,
    lng: 72.6347,
  },
  {
    name: "Pune International Airport",
    code: "VAPO",
    lat: 18.5821,
    lng: 73.9197,
  },
];
   const [airportName, setAirportName] = useState("");
   const [airportCode, setAirportCode] = useState("");
   const [comments, setComments] = useState("");
   const [tripReason, setTripReason] = useState("");
   const [travelClass, setTravelClass] = useState("");
   const [returnTrips, setReturnTrips] = useState("");
   const [userLocation, setUserLocation] = useState(null);
   //const AIRPORT_LAT = 28.6296;
   //const AIRPORT_LNG = 77.1033;
   const [distance, setDistance] = useState(null);
   const isInsideAirport = distance !== null && distance < 0.05;
   const [timeLeft, setTimeLeft] = useState(180);
   const [isExpired, setIsExpired] = useState(false);
   useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setIsExpired(true);
        alert("Time is up!");
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);
useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
    let nearestAirport = airports[0];
let minDistance = Infinity;

airports.forEach((airport) => {
  const distance = Math.sqrt(
    Math.pow(lat - airport.lat, 2) +
    Math.pow(lng - airport.lng, 2)
  );

  if (distance < minDistance) {
    minDistance = distance;
    nearestAirport = airport;
  }
});

     setAirportName(nearestAirport.name);
     setAirportCode(nearestAirport.code);
     console.log("Nearest Airport:", nearestAirport.name);
     setUserLocation({ lat, lng });

     const distanceValue = Math.sqrt(
  Math.pow(lat - nearestAirport.lat, 2) +
  Math.pow(lng - nearestAirport.lng, 2)
);

setDistance(minDistance);
    },
    (error) => {
      alert("Please allow location access");
      console.log(error);
    }
  );
}, []);
   const today = new Date().toISOString().split("T")[0];
   const currentTime = new Date().toLocaleTimeString("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

    const handleSubmit = async () => {
  console.log("Airport:", airportName);
  console.log("Code:", airportCode);
  console.log("Trip Reason:", tripReason);
  console.log("Travel Class:", travelClass);
  console.log("Return Trips:", returnTrips);
  console.log("Comments:", comments);
const surveyData = {
  airportName,
  airportCode,
  tripReason,
  travelClass,
  returnTrips,
  comments,
  submittedAt: new Date().toISOString(),
};

localStorage.setItem(
  "surveyData",
  JSON.stringify(surveyData)
);
await fetch("http://localhost:5000/submitSurvey", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(surveyData),
});
  alert("Survey Submitted Successfully!");
};
  return (
    <div className="container">

      <div className="header">
        <img src={logo} alt="AAI Logo" className="logo" />

        <div>
          <h1>AAI - Customer Satisfaction Survey</h1>
          <p>Help us improve your airport experience ✈️</p>
        </div>

        <div className="timer">
         ⏱ {Math.floor(timeLeft / 60)}:
         {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
      </div>

      <div className="welcome-box">
        ✈️ Welcome Passenger! Please complete the survey within 3 minutes.
      </div>
      {distance && (
      <h3>
      Distance: {distance}
     </h3>
)}
    {distance !== null && (
  <h3 style={{ color: isInsideAirport ? "green" : "red" }}>
    {isInsideAirport
      ? "✅ Inside Airport"
      : "❌ Outside Airport"}
  </h3>
)}
      <div className="form-grid">
  <input
  value={airportName}
  readOnly
/>
  <input
  value={airportCode}
  readOnly
/>

  <input placeholder="Flight Number" />
  <input
  type="date"
  value={today}
  readOnly
/>

  <input
  type="time"
  value={currentTime}
  readOnly
/>
  <input placeholder="Destination" />
</div>

      <h3>Main Reason For Trip</h3>

      <button
     onClick={() => setTripReason("Business")}
     style={{
    background:
      tripReason === "Business" ? "#2563eb" : "white",
    color:
      tripReason === "Business" ? "white" : "#1e3a8a",
  }}
>
  Business
</button>
      <button
  onClick={() => setTripReason("Leisure")}
  style={{
    background:
      tripReason === "Leisure" ? "#2563eb" : "white",
    color:
      tripReason === "Leisure" ? "white" : "#1e3a8a",
  }}
>
  Leisure
</button>
      <button
  onClick={() => setTripReason("Other")}
  style={{
    background:
      tripReason === "Other" ? "#2563eb" : "white",
    color:
      tripReason === "Other" ? "white" : "#1e3a8a",
  }}
>
  Other
</button>

      <h3>Which section of the aircraft are you travelling in?</h3>

      <button
  onClick={() => setTravelClass("First Class")}
  style={{
    background:
      travelClass === "First Class" ? "#2563eb" : "white",
    color:
      travelClass === "First Class" ? "white" : "#1e3a8a",
  }}
>
  First Class
</button>
      <button
  onClick={() => setTravelClass("Business/Upper Class")}
  style={{
    background:
      travelClass === "Business/Upper Class" ? "#2563eb" : "white",
    color:
      travelClass === "Business/Upper Class" ? "white" : "#1e3a8a",
  }}
>
  Business/Upper Class
</button>
      <button
  onClick={() => setTravelClass("Economy")}
  style={{
    background:
      travelClass === "Economy" ? "#2563eb" : "white",
    color:
      travelClass === "Economy" ? "white" : "#1e3a8a",
  }}
>
  Economy
</button>
      <button
  onClick={() => setTravelClass("Tourist")}
  style={{
    background:
      travelClass === "Tourist" ? "#2563eb" : "white",
    color:
      travelClass === "Tourist" ? "white" : "#1e3a8a",
  }}
>
  Tourist
</button>

      <h3>Number of return trips made in last 12 months</h3>

      <button
  onClick={() => setReturnTrips("1-2")}
  style={{
    background:
      returnTrips === "1-2" ? "#2563eb" : "white",
    color:
      returnTrips === "1-2" ? "white" : "#1e3a8a",
  }}
>
  1-2
</button>
      <button
  onClick={() => setReturnTrips("3-5")}
  style={{
    background:
      returnTrips === "3-5" ? "#2563eb" : "white",
    color:
      returnTrips === "3-5" ? "white" : "#1e3a8a",
  }}
>
  3-5
</button>
      <button
  onClick={() => setReturnTrips("6-10")}
  style={{
    background:
      returnTrips === "6-10" ? "#2563eb" : "white",
    color:
      returnTrips === "6-10" ? "white" : "#1e3a8a",
  }}
>
  6-10
</button>
      <button
  onClick={() => setReturnTrips("11-20")}
  style={{
    background:
      returnTrips === "11-20" ? "#2563eb" : "white",
    color:
      returnTrips === "11-20" ? "white" : "#1e3a8a",
  }}
>
  11-20
</button>
      <button
  onClick={() => setReturnTrips("21+")}
  style={{
    background:
      returnTrips === "21+" ? "#2563eb" : "white",
    color:
      returnTrips === "21+" ? "white" : "#1e3a8a",
  }}
>
  21+
</button>

      <h2>Airport Departure Customer Satisfaction Questionnaire</h2>

      <table>
        <thead>
          <tr>
            <th>Sl No</th>
            <th>Questions</th>
            <th>Did Not Use</th>
            <th>Excellent</th>
            <th>Very Good</th>
            <th>Good</th>
            <th>Fair</th>
            <th>Poor</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>1</td>
            <td>Experience at parking facility?</td>
            <td><input type="radio" name="q1" /></td>
            <td><input type="radio" name="q1" /></td>
            <td><input type="radio" name="q1" /></td>
            <td><input type="radio" name="q1" /></td>
            <td><input type="radio" name="q1" /></td>
            <td><input type="radio" name="q1" /></td>
          </tr>

          <tr>
            <td>2</td>
            <td>Experience at Check-in?</td>
            <td><input type="radio" name="q2" /></td>
            <td><input type="radio" name="q2" /></td>
            <td><input type="radio" name="q2" /></td>
            <td><input type="radio" name="q2" /></td>
            <td><input type="radio" name="q2" /></td>
            <td><input type="radio" name="q2" /></td>
          </tr>

          <tr>
            <td>3</td>
            <td>Cleanliness of washrooms?</td>
            <td><input type="radio" name="q3" /></td>
            <td><input type="radio" name="q3" /></td>
            <td><input type="radio" name="q3" /></td>
            <td><input type="radio" name="q3" /></td>
            <td><input type="radio" name="q3" /></td>
            <td><input type="radio" name="q3" /></td>
          </tr>
          <tr>
     <td>4</td>
     <td>Experience at Security Check?</td>
     <td><input type="radio" name="q4" /></td>
     <td><input type="radio" name="q4" /></td>
     <td><input type="radio" name="q4" /></td>
     <td><input type="radio" name="q4" /></td>
     <td><input type="radio" name="q4" /></td>
     <td><input type="radio" name="q4" /></td>
    </tr>
    <tr>
    <td>5</td>
    <td>Were F&B and retail facilities as per expectation?</td>
    <td><input type="radio" name="q5" /></td>
    <td><input type="radio" name="q5" /></td>
    <td><input type="radio" name="q5" /></td>
    <td><input type="radio" name="q5" /></td>
    <td><input type="radio" name="q5" /></td>
    <td><input type="radio" name="q5" /></td>
    </tr>
    <tr>
  <td>6</td>
     <td>Experience at Boarding Gate?</td>
     <td><input type="radio" name="q6" /></td>
     <td><input type="radio" name="q6" /></td>
     <td><input type="radio" name="q6" /></td>
     <td><input type="radio" name="q6" /></td>
     <td><input type="radio" name="q6" /></td>
     <td><input type="radio" name="q6" /></td>
    </tr>
    <tr>
  <td>7</td>
  <td>Any Other Comments?</td>
  <td colSpan="6">
    <textarea
  placeholder="Enter your comments here..."
  rows="3"
  value={comments}
  onChange={(e) => setComments(e.target.value)}
/>
    
  </td>
</tr>
        </tbody>
      </table>
    {isExpired && (
  <h3 style={{ color: "red" }}>
    ⛔ Survey Time Expired
  </h3>
)}
   <button
  className="submit-btn"
  onClick={handleSubmit}
  disabled={isExpired || !isInsideAirport}
>
  SUBMIT
</button>
 
    </div>
  );
}

export default SurveyPage;