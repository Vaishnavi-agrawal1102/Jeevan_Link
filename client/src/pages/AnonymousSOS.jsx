
import { useState } from "react";
import { createAnonymousSOS } from "../services/requestAPI.js";

const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const initialForm = {
  reporterName: "",
  reporterPhone: "",
  type: "rescue",
  urgency: "critical",
  description: "",
  numberOfPeople: 1,
  state: "",
  district: "",
  address: "",
};

export default function AnonymousSOS() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (form.description.trim().length < 5) {
      setError("Please describe your emergency in at least 5 characters.");
      return;
    }

    if (!form.state) {
      setError("Please select your state.");
      return;
    }

    if (!form.district.trim() && !form.address.trim()) {
      setError("Please enter your district or your location/address.");
      return;
    }

    const people = Number(form.numberOfPeople);

    if (!Number.isSafeInteger(people) || people < 1) {
      setError("Please enter a valid positive whole number of people.");
      return;
    }

    if (!/^[0-9+\-\s()]{7,20}$/.test(form.reporterPhone.trim())) {
      setError("Please enter a valid contact number.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        reporterName: form.reporterName.trim(),
        reporterPhone: form.reporterPhone.trim(),
        description: form.description.trim(),
        numberOfPeople: people,
        state: form.state,
        district: form.district.trim(),
        address: form.address.trim(),
      };

      const response = await createAnonymousSOS(payload);

      setMessage(
        response.message ||
          "Your SOS request was submitted. Please keep your phone available."
      );

      setForm(initialForm);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not submit your SOS. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="anonymous-sos-page">
      <section className="anonymous-sos-card">
        <h1>Emergency SOS</h1>
        <p>
          Submit an emergency request without creating an account. Enter your
          location as accurately as possible.
        </p>

        <div className="anonymous-sos-notice">
          This form does not automatically contact emergency services. If you
          are in immediate danger, contact your local emergency service too.
        </div>

        {message && (
          <p className="anonymous-sos-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="anonymous-sos-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>
            Your name (optional)
            <input
              name="reporterName"
              value={form.reporterName}
              onChange={handleChange}
              maxLength={100}
              placeholder="Enter your name"
            />
          </label>

          <label>
            Contact number *
            <input
              type="tel"
              name="reporterPhone"
              value={form.reporterPhone}
              onChange={handleChange}
              required
              maxLength={20}
              autoComplete="tel"
              placeholder="Enter your phone number"
            />
          </label>

          <label>
            Emergency type *
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="rescue">Rescue</option>
              <option value="medical">Medical help</option>
              <option value="food">Food</option>
              <option value="shelter">Shelter</option>
              <option value="water">Water</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Urgency *
            <select
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>

          <label>
            Number of people affected *
            <input
              type="number"
              name="numberOfPeople"
              value={form.numberOfPeople}
              onChange={handleChange}
              min="1"
              step="1"
              required
            />
          </label>

          <label>
            State *
            <select
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            >
              <option value="">Select your state or UT</option>
              {INDIA_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label>
            District
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              maxLength={100}
              placeholder="Enter your district"
            />
          </label>

          <label>
            Exact location or address *
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              maxLength={300}
              placeholder="Village, road, landmark, or nearby location"
              rows={3}
            />
          </label>

          <label>
            Describe the emergency *
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={1000}
              placeholder="What happened, and what help is needed?"
              rows={4}
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting SOS..." : "Submit Emergency SOS"}
          </button>
        </form>
      </section>

      <style>{`
        .anonymous-sos-page {
          min-height: 100vh;
          padding: 32px 16px;
          background: #f1f5f9;
          color: #0f172a;
        }
        .anonymous-sos-card {
          max-width: 640px;
          margin: 0 auto;
          padding: 28px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
        }
        .anonymous-sos-card h1 {
          margin-top: 0;
          color: #0f766e;
        }
        .anonymous-sos-card form {
          display: grid;
          gap: 16px;
        }
        .anonymous-sos-card label {
          display: grid;
          gap: 7px;
          font-weight: 600;
        }
        .anonymous-sos-card input,
        .anonymous-sos-card select,
        .anonymous-sos-card textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font: inherit;
        }
        .anonymous-sos-card button {
          padding: 14px;
          border: 0;
          border-radius: 8px;
          background: #b91c1c;
          color: white;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .anonymous-sos-card button:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .anonymous-sos-notice {
          margin: 18px 0;
          padding: 12px;
          border-radius: 8px;
          background: #fff7ed;
          color: #9a3412;
        }
        .anonymous-sos-success { color: #047857; }
        .anonymous-sos-error { color: #b91c1c; }
        @media (max-width: 480px) {
          .anonymous-sos-card { padding: 18px; }
        }
      `}</style>
    </main>
  );
}
