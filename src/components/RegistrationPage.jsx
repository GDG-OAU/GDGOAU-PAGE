import { useMemo, useState } from "react";
import "../pages.css";
import Header from "./Header";
import Dropdown from "./Dropdown";
import DatePicker from "./DatePicker";
import star from "../assets/figma/star.svg";
import slashes from "../assets/figma/slashes-outline.svg";
import globe from "../assets/figma/globe.svg";
import { communities } from "../data/communities";
import { WHATSAPP_CHANNEL_URL } from "../constants/site";
import { ArrowLeft02Icon, ArrowRight02Icon, CheckmarkCircle02Icon } from "hugeicons-react";

function Field({ id, label, children }) {
  return (
    <div className="rg-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

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

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Registration could not be completed. Please try again.");
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
      <main className="pg rg">
        <div className="rg-inner">
          <a href="/communities" className="rg-back">
            <ArrowLeft02Icon size={18} strokeWidth={2} aria-hidden="true" />
            <span>Back to communities</span>
          </a>

          {!submitted ? (
            <div className="rg-layout">
              <aside className="rg-side">
                <p className="pg-eyebrow">Become part of GDG OAU</p>
                <h1 className="rg-title">Let&apos;s get to know you.</h1>
                <p className="pg-lead">Tell us a little about yourself and the community you would love to be part of.</p>

                <div className="rg-selected" style={{ "--tint": "#c3ecf6" }}>
                  <span className="rg-selected-icon"><selectedCommunity.icon size={34} strokeWidth={1.7} aria-hidden="true" /></span>
                  <div>
                    <span className="rg-selected-label">Your selected community</span>
                    <strong>{selectedCommunity.name}</strong>
                  </div>
                </div>

                <img className="rg-deco rg-deco-star" src={star} alt="" />
                <img className="rg-deco rg-deco-slashes" src={slashes} alt="" />
              </aside>

              <form className="rg-form" onSubmit={handleSubmit} noValidate={false}>
                <div className="rg-row">
                  <Field id="fullName" label="Full name">
                    <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required />
                  </Field>
                  <Field id="department" label="Department">
                    <input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Biochemistry" required />
                  </Field>
                </div>

                <div className="rg-row">
                  <Field id="email" label="Email address">
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                  </Field>
                  <Field id="phone" label="Phone number">
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 801 234 5678" required />
                  </Field>
                </div>

                <Field id="pictureLink" label="Google Drive picture link">
                  <input id="pictureLink" name="pictureLink" value={formData.pictureLink} onChange={handleChange} placeholder="https://drive.google.com/file/d/..." required />
                </Field>

                <label className="rg-consent">
                  <input type="checkbox" name="birthdayPhotoConsent" checked={formData.birthdayPhotoConsent} onChange={handleChange} />
                  <span>I agree that GDG OAU may use my picture in community birthday greetings.</span>
                </label>

                <div className="rg-row">
                  <DatePicker
                    id="birthday"
                    label="Birthday"
                    placeholder="Pick your birthday"
                    value={formData.birthday}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(birthday) => setFormData((current) => ({ ...current, birthday }))}
                  />
                  <Dropdown
                    id="interest"
                    label="Field of interest"
                    placeholder="Select a community"
                    value={formData.interest}
                    onChange={(interest) => setFormData((current) => ({ ...current, interest }))}
                    options={communities.map((c) => ({ value: c.id, label: c.name, icon: c.icon }))}
                  />
                </div>

                <button type="submit" className="rg-submit" disabled={isSubmitting}>
                  <span>{isSubmitting ? "Submitting..." : "Submit registration"}</span>
                  {!isSubmitting && <ArrowRight02Icon size={20} strokeWidth={2} aria-hidden="true" />}
                </button>

                {message && <div className="rg-error" role="alert">{message}</div>}
              </form>
            </div>
          ) : (
            <section className="rg-success" aria-live="polite">
              <img className="rg-success-globe" src={globe} alt="" />
              <span className="rg-success-check"><CheckmarkCircle02Icon size={44} strokeWidth={2} aria-hidden="true" /></span>
              <h1 className="rg-title">Congratulations!</h1>
              <p className="pg-lead">
                Your registration was successful. Welcome to the <strong>{selectedCommunity.name}</strong> community!
              </p>

              <div className="rg-success-actions">
                {selectedCommunity.groupLink ? (
                  <a className="rg-submit" href={selectedCommunity.groupLink} target="_blank" rel="noopener noreferrer">
                    <span>Join {selectedCommunity.name} on WhatsApp</span>
                    <ArrowRight02Icon size={20} strokeWidth={2} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="rg-note">Thank you for registering! The WhatsApp group for this community is not available yet.</p>
                )}
                <a className="rg-secondary" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  Follow the GDG OAU WhatsApp channel
                </a>
                <a className="rg-link" href="/">Back to the GDG OAU homepage</a>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
