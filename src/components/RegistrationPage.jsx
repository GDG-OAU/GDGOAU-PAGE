import { useMemo, useState } from "react";
import Header from "./Header";
import { communities } from "../data/communities";
import {
  WHATSAPP_CHANNEL_URL,
  GOOGLE_SCRIPT_URL,
  REGISTRATION_API_SECRET,
} from "../constants/site";
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  CheckmarkCircle02Icon,
} from "hugeicons-react";

export default function RegistrationPage() {
  const initialCommunity =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("community") : "web-development";

  const defaultCommunity = useMemo(
    () => communities.find((community) => community.id === initialCommunity) || communities[0],
    [initialCommunity]
  );

  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    email: "",
    phone: "",
    pictureLink: "",
    birthdayPhotoConsent: false,
    birthday: "",
    interest: defaultCommunity.id,
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (
      !formData.fullName ||
      !formData.department ||
      !formData.email ||
      !formData.phone ||
      !formData.pictureLink ||
      !formData.birthday ||
      !formData.interest
    ) {
      setMessage("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      photoUrl: formData.pictureLink,
      interest: formData.interest,
      token: REGISTRATION_API_SECRET,
    };

    let isSuccess = false;
    let errorMessage = "";

    try {
      // 1. First attempt via /api/register (Cloudflare Worker proxy)
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const result = await response.json();
          if (result.success) {
            isSuccess = true;
          } else if (result.message) {
            errorMessage = result.message;
          }
        }
      } catch (err) {
        // Network or local endpoint unavailable, will try direct Google script fallback
      }

      // 2. Fallback directly to Google Apps Script endpoint if needed
      if (!isSuccess && !errorMessage) {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const result = await response.json();
          if (result.success) {
            isSuccess = true;
          } else {
            errorMessage = result.message || "Registration could not be completed.";
          }
        } else {
          const text = await response.text();
          try {
            const parsed = JSON.parse(text);
            if (parsed.success) isSuccess = true;
            else errorMessage = parsed.message || "Registration failed.";
          } catch {
            errorMessage = "Server returned an invalid response. Please try again.";
          }
        }
      }

      if (!isSuccess) {
        throw new Error(errorMessage || "Registration could not be completed. Please try again.");
      }

      setSubmitted(true);
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCommunity = communities.find((community) => community.id === formData.interest) || defaultCommunity;

  return (
    <>
      <Header />
      <main className="registration-container">
        <a href="/communities" className="back-link">
          <ArrowLeft02Icon size={16} strokeWidth={2} aria-hidden="true" />
          <span>Back to communities</span>
        </a>

        {!submitted ? (
          <section>
            <div className="form-heading">
              <span className="eyebrow">BECOME PART OF GDG OAU</span>
              <h1>Let&apos;s get to know you.</h1>
              <p>Tell us a little about yourself and the community you would love to be part of.</p>
            </div>

            <div className="selected-community">
              <div className="selected-icon">
                <selectedCommunity.icon size={28} strokeWidth={1.8} color="currentColor" />
              </div>
              <div>
                <span className="selected-label">YOUR SELECTED COMMUNITY</span>
                <div className="selected-name">{selectedCommunity.name}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Biochemistry" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 801 234 5678" required />
              </div>

              <div className="form-group">
                <label htmlFor="pictureLink">Google Drive Picture Link</label>
                <input id="pictureLink" name="pictureLink" value={formData.pictureLink} onChange={handleChange} placeholder="https://drive.google.com/file/d/..." required />
              </div>

              <div className="form-group">
                <label className="consent-label">
                  <input type="checkbox" name="birthdayPhotoConsent" checked={formData.birthdayPhotoConsent} onChange={handleChange} />
                  I agree that GDG OAU may use my picture in community birthday greetings.
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="birthday">Birthday</label>
                <input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleChange} max={new Date().toISOString().slice(0, 10)} required />
              </div>

              <div className="form-group">
                <label htmlFor="interest">Field of Interest</label>
                <select id="interest" name="interest" value={formData.interest} onChange={handleChange} required>
                  <option value="">Select a community</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>{community.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                <span>{isSubmitting ? "Submitting..." : "Submit registration"}</span>
                {!isSubmitting && <ArrowRight02Icon size={18} strokeWidth={2} aria-hidden="true" />}
              </button>

              {message && <div className="form-message error" role="alert">{message}</div>}
            </form>
          </section>
        ) : (
          <section className="success-screen" aria-live="polite">
            <div className="success-icon">
              <CheckmarkCircle02Icon size={44} strokeWidth={2} />
            </div>
            <h1>Congratulations!</h1>
            <p>
              Your registration was successful. Welcome to the <span className="success-community">{selectedCommunity.name}</span> community!
            </p>

            {selectedCommunity.groupLink ? (
              <a className="whatsapp-button" href={selectedCommunity.groupLink} target="_blank" rel="noopener noreferrer">
                <span>Join {selectedCommunity.name} on WhatsApp</span>
                <ArrowRight02Icon size={18} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <div className="no-group-message">Thank you for registering! The WhatsApp group for this community is not available yet.</div>
            )}

            <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="channel-secondary-button">
              <span>Follow GDG OAU WhatsApp Channel</span>
              <ArrowRight02Icon size={18} strokeWidth={2} aria-hidden="true" />
            </a>
            <a href="/" className="success-home">Back to GDG OAU homepage</a>
          </section>
        )}
      </main>
    </>
  );
}
