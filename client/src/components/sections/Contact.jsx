import { useState } from "react";
import emailjs from "emailjs-com";

function Contact() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        setShowForm(false);
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to send message.");
      });
  };

  return (
    <section id="contact" className="contact-section">
      <h2 className="section-title">Let’s Chat</h2>

      <p className="contact-text">
        Want to collaborate, book a photography session,
        or just appreciate the stories behind the frames?
        Let’s connect.
      </p>

      {!showForm ? (
        <button
          className="hero-button"
          onClick={() => setShowForm(true)}
        >
          Contact Me
        </button>
      ) : (
        <form onSubmit={sendEmail} className="contact-form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit" className="hero-button">
            Send Message
          </button>
        </form>
      )}
    </section>
  );
}

export default Contact;