"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentClass: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      if (!db) {
        throw new Error("Firebase is not initialized. Please check your environment variables.");
      }

      // Add document to Firestore
      await addDoc(collection(db, "contacts"), {
        ...formData,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
      });

      setSubmitStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        studentClass: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message: error instanceof Error && error.message.includes("Firebase")
          ? "Firebase is not configured. Please contact us directly via phone or email."
          : "Sorry, there was an error sending your message. Please try again later or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg sm:text-xl">
                A²
              </div>
              <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground">A² Institution for Academics Excellence</span>
            </Link>
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground px-2">
                Get in Touch
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 mb-3 sm:mb-4">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Address</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      F-1, Sai Mansion Apartments,<br />
                      Road No-3, Mallikarjuna Colony,<br />
                      Old Bowenpally, Secunderabad,<br />
                      Hyderabad - 500011
                    </p>
                  </div>

                  <div>
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 mb-3 sm:mb-4">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Phone</h3>
                    <p className="text-sm sm:text-base text-muted-foreground space-y-1">
                      <a href="tel:+916303197020" className="block hover:text-primary transition-colors">
                        +91 6303197020
                      </a>
                      <a href="tel:+919291279212" className="block hover:text-primary transition-colors">
                        +91 9291279212
                      </a>
                    </p>
                  </div>

                  <div>
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 mb-3 sm:mb-4">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Email</h3>
                    <p className="text-sm sm:text-base text-muted-foreground space-y-1">
                      <a href="mailto:info@asquareinstitutions.com" className="block break-all hover:text-primary transition-colors">
                        info@asquareinstitutions.com
                      </a>
                      <a href="mailto:admissions@asquareinstitutions.com" className="block break-all hover:text-primary transition-colors">
                        admissions@asquareinstitutions.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 mb-3 sm:mb-4">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Office Hours</h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      Monday - Saturday: 5:00 PM - 9:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: 10:00 AM  - 1:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Send us a Message</h2>

                  {submitStatus.type && (
                    <div
                      className={`mb-4 sm:mb-6 rounded-lg p-3 sm:p-4 ${
                        submitStatus.type === "success"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-medium">{submitStatus.message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label htmlFor="studentClass" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                          Student Class
                        </label>
                        <select
                          id="studentClass"
                          name="studentClass"
                          value={formData.studentClass}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                        >
                          <option value="">Select Class</option>
                          <option value="Class 1-5">Class 1-5</option>
                          <option value="Class 6-9">Class 6-9</option>
                          <option value="Class 10">Class 10</option>
                          <option value="Class 11-12 MPC Engineering">Class 11-12 MPC Engineering</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

