import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/aai-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Overview from "./admin/Overview";
import Responses from "./admin/Responses";
import Ratings from "./admin/Ratings";
import Reports from "./admin/Reports";

import "../App.css";

const defaultAirportNames = [
  "Test Airport",
  "Safdarjung Airport",
  "Indira Gandhi International Airport",
  "Chhatrapati Shivaji Maharaj International Airport",
  "Kempegowda International Airport",
  "Chennai International Airport",
  "Netaji Subhas Chandra Bose International Airport",
  "Rajiv Gandhi International Airport",
  "Cochin International Airport",
  "Sardar Vallabhbhai Patel International Airport",
  "Pune International Airport",
];

const questionLabels = [
  { key: "q1", label: "Parking" },
  { key: "q2", label: "Check-In" },
  { key: "q3", label: "Washrooms" },
  { key: "q4", label: "Security" },
  { key: "q5", label: "Food & Retail" },
  { key: "q6", label: "Boarding Gate" },
  { key: "q7", label: "Overall Experience" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "responses", label: "Responses" },
  { id: "ratings", label: "Question Ratings" },
  { id: "reports", label: "Reports" },
];

function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [airportOptions, setAirportOptions] = useState(defaultAirportNames);
  const [selectedAirport, setSelectedAirport] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddAirport, setShowAddAirport] = useState(false);
  const [newAirport, setNewAirport] = useState({
    name: "",
    code: "",
    city: "",
    state: "",
  });
  const [dashboardMessage, setDashboardMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/surveys")
      .then((res) => res.json())
      .then((data) => setSurveys(data))
      .catch((err) => console.log(err));

    fetch("http://localhost:5000/airports")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAirportOptions((currentOptions) => [
            ...new Set([
              ...currentOptions,
              ...data.map((airport) => airport.name).filter(Boolean),
            ]),
          ]);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredSurveys = useMemo(() => {
    if (selectedAirport === "All") return surveys;

    return surveys.filter((survey) => survey.airportName === selectedAirport);
  }, [selectedAirport, surveys]);

  const airports = useMemo(() => {
    return [
      ...new Set([
        ...defaultAirportNames,
        ...airportOptions,
        ...surveys.map((survey) => survey.airportName).filter(Boolean),
      ]),
    ].sort();
  }, [airportOptions, surveys]);

  const dashboardData = useMemo(() => {
    const airportCount = new Set(filteredSurveys.map((s) => s.airportCode)).size;
    const todayResponses = filteredSurveys.filter((s) => {
      return (
        new Date(s.submittedAt).toDateString() === new Date().toDateString()
      );
    }).length;

    const allRatings = filteredSurveys.flatMap((survey) => {
      if (!survey.ratings) return [];

      return questionLabels.map((question) => survey.ratings[question.key] || 0);
    });

    const validRatings = allRatings.filter((rating) => rating > 0);
    const averageRating =
      validRatings.length > 0
        ? (
            validRatings.reduce((sum, rating) => sum + rating, 0) /
            validRatings.length
          ).toFixed(1)
        : 0;

    const satisfactionScore = ((averageRating / 5) * 100).toFixed(0);

    const airportRatings = {};
    filteredSurveys.forEach((survey) => {
      if (!survey.ratings) return;

      const total = questionLabels.reduce(
        (sum, question) => sum + (survey.ratings[question.key] || 0),
        0
      );
      const avg = total / questionLabels.length;

      if (!airportRatings[survey.airportName]) {
        airportRatings[survey.airportName] = [];
      }

      airportRatings[survey.airportName].push(avg);
    });

    let topAirport = "N/A";
    let topRating = 0;

    Object.keys(airportRatings).forEach((airport) => {
      const ratings = airportRatings[airport];
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      if (avg > topRating) {
        topRating = avg;
        topAirport = airport;
      }
    });

    const airportCounts = {};
    filteredSurveys.forEach((survey) => {
      airportCounts[survey.airportCode] =
        (airportCounts[survey.airportCode] || 0) + 1;
    });

    const dateCounts = {};
    filteredSurveys.forEach((survey) => {
      const date = new Date(survey.submittedAt).toLocaleDateString();
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const questionAverages = questionLabels.map((question) => {
      const ratings = filteredSurveys
        .map((survey) => survey.ratings?.[question.key] || 0)
        .filter((rating) => rating > 0);

      const average =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      return {
        ...question,
        average: Number(average.toFixed(1)),
        responses: ratings.length,
      };
    });

    return {
      stats: {
        totalResponses: filteredSurveys.length,
        airportCount,
        todayResponses,
        satisfactionScore,
        averageRating,
        topAirport,
        topRating,
      },
      airportCounts,
      dateCounts,
      questionAverages,
    };
  }, [filteredSurveys]);

  const exportRows = filteredSurveys.map((survey) => ({
    Airport: survey.airportName,
    Code: survey.airportCode,
    Trip: survey.tripReason,
    Class: survey.travelClass,
    "Return Trips": survey.returnTrips,
    Parking: survey.ratings?.q1 || "",
    "Check-In": survey.ratings?.q2 || "",
    Washrooms: survey.ratings?.q3 || "",
    Security: survey.ratings?.q4 || "",
    "Food & Retail": survey.ratings?.q5 || "",
    "Boarding Gate": survey.ratings?.q6 || "",
    "Overall Experience": survey.ratings?.q7 || "",
    Comments: survey.comments?.trim() ? survey.comments : "No Comments",
    "Submitted At": survey.submittedAt
      ? new Date(survey.submittedAt).toLocaleString()
      : "",
  }));

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");
    XLSX.writeFile(workbook, "AirportSurveyReport.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("Airport Customer Satisfaction Survey Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 22);

    const rows = filteredSurveys.map((survey) => [
      survey.airportCode,
      survey.tripReason,
      survey.travelClass,
      survey.ratings?.q1 || "",
      survey.ratings?.q2 || "",
      survey.ratings?.q3 || "",
      survey.ratings?.q4 || "",
      survey.ratings?.q5 || "",
      survey.ratings?.q6 || "",
      survey.ratings?.q7 || "",
      survey.comments?.trim() ? survey.comments : "No Comments",
    ]);

    autoTable(doc, {
      head: [
        [
          "Airport",
          "Trip",
          "Class",
          "Parking",
          "Check-In",
          "Washrooms",
          "Security",
          "Food & Retail",
          "Boarding Gate",
          "Overall Experience",
          "Comments",
        ],
      ],
      body: rows,
      startY: 30,
    });

    doc.save("AirportSurveyReport.pdf");
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  const handleAirportFilterChange = (value) => {
    if (value === "__add_airport__") {
      setShowAddAirport(true);
      setSelectedAirport("All");
      return;
    }

    setSelectedAirport(value);
  };

  const handleAddAirport = async (event) => {
    event.preventDefault();

    if (!newAirport.name || !newAirport.code) {
      setDashboardMessage("Airport name and code are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/airports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAirport,
          code: newAirport.code.toUpperCase(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setAirportOptions((currentOptions) => [
        ...new Set([...currentOptions, data.airport.name]),
      ]);
      setSelectedAirport(data.airport.name);
      setNewAirport({ name: "", code: "", city: "", state: "" });
      setShowAddAirport(false);
      setDashboardMessage("Airport added to dashboard list.");
    } catch (error) {
      setDashboardMessage(error.message || "Unable to add airport.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src={logo} alt="AAI Logo" className="dashboard-logo" />

        <div className="dashboard-title">
          <h1>Airport Authority of India</h1>
          <p>Airport Customer Satisfaction Analytics Dashboard</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-live-strip" aria-hidden="true">
        <div className="ticker-track">
          <span>Passenger experience insights</span>
          <span>Airport service quality pulse</span>
          <span>Smart satisfaction monitoring</span>
          <span>Better journeys through feedback</span>
          <span>Passenger experience insights</span>
          <span>Airport service quality pulse</span>
          <span>Smart satisfaction monitoring</span>
          <span>Better journeys through feedback</span>
        </div>
      </div>

      <div className="dashboard-tabs" role="tablist" aria-label="Dashboard tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-filter">
        <label htmlFor="airport-filter">Select Airport</label>

        <select
          id="airport-filter"
          value={selectedAirport}
          onChange={(e) => handleAirportFilterChange(e.target.value)}
        >
          <option value="All">All Airports</option>

          {airports.map((airport) => (
            <option key={airport} value={airport}>
              {airport}
            </option>
          ))}
          <option value="__add_airport__">+ Add New Airport</option>
        </select>
      </div>

      {dashboardMessage && <div className="sync-message">{dashboardMessage}</div>}

      {showAddAirport && (
        <form className="add-airport-panel" onSubmit={handleAddAirport}>
          <h3>Add Airport to Dashboard</h3>
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
          <p className="mapping-note">
            Admin can add airport metadata here. Passenger-side location mapping
            is captured automatically from the survey device GPS.
          </p>
          <button type="submit" className="submit-btn">
            Save Airport
          </button>
        </form>
      )}

      {activeTab === "overview" && <Overview data={dashboardData} />}

      {activeTab === "responses" && <Responses surveys={filteredSurveys} />}

      {activeTab === "ratings" && (
        <Ratings questionAverages={dashboardData.questionAverages} />
      )}

      {activeTab === "reports" && (
        <Reports
          filteredSurveys={filteredSurveys}
          selectedAirport={selectedAirport}
          onExportExcel={exportToExcel}
          onExportPDF={exportToPDF}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
