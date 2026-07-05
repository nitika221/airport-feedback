import { Link } from "react-router-dom";
import logo from "../assets/aai-logo.png";
import "../App.css";

function ThankYou() {
  return (
    <main className="thank-you-page">
      <section className="thank-you-card">
        <img src={logo} alt="AAI Logo" className="thank-you-logo" />

        <h1>Thank You for Your Feedback</h1>
        <p>
          Your response has been captured. If you were offline, it has been
          saved safely and will sync automatically when the internet returns.
        </p>

        <Link to="/" className="thank-you-link">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default ThankYou;
