"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                A²
              </div>
              <span className="font-serif text-xl font-bold text-foreground">A² Institution for Academics Excellence</span>
            </div>
            <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
              <Link href="#courses" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Courses
              </Link>
              <Link href="#results" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Results
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Testimonials
              </Link>
            </div>
            <div className="hidden md:flex items-center">
              <Link 
                href="/contact" 
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Contact Us
              </Link>
            </div>
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col gap-4">
                <Link 
                  href="#courses" 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link 
                  href="#results" 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Results
                </Link>
                <Link 
                  href="#testimonials" 
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link 
                  href="/contact" 
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Excellence in Education
              <span className="block text-primary">Excellence in Results</span>
          </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Empowering school students with quality coaching, expert faculty, and proven methodologies to achieve academic excellence and secure their future.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
              >
                Enroll Now
              </Link>
              <Link
                href="#courses"
                className="rounded-lg border-2 border-primary px-8 py-3 text-base font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 sm:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive coaching programs designed for academic excellence
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-7xl lg:grid-cols-3">
            {[
              {
                title: "Class 1-5 Foundation",
                description: "Strong foundation in Mathematics, Science, and English for CBSE and State boards.",
                features: ["Classroom Sessions", "Regular Tests", "Doubt Sessions"],
                icon: "book",
              },
              {
                title: "Class 6-9",
                description: "Comprehensive coaching for Physics, Chemistry, Mathematics, and Biology.",
                features: [ "Classroom Sessions", "Regular Tests", "Doubt Sessions", "IIT/NEET Foundation", "Competitive Exams"],
                icon: "science",
              },
              {
                title: "Class 10-12",
                description: "Expert guidance for SSC,CBSE and ICSE Board Exams",
                features: ["Competitve Exams Preparations", "Board Exams Preparations", "Career Guidance"],
                icon: "briefcase",
              },
              {
                title: "Comprehensive JEE/NEET Foundation for class 6-10",
                description: "Early preparation for engineering and medical entrance examinations.",
                features: ["Concept Building", "Problem Solving", "Mock Tests"],
                icon: "target",
              },
              {
                title: "Olympiad Preparation for class 6-10",
                description: "Specialized training for National and International Olympiads.",
                features: ["Advanced Concepts", "Problem Solving", "Mock Olympiads"],
                icon: "trophy",
              },
              {
                title: "Doubt Clearing Sessions",
                description: "Personalized one-on-one sessions for individual attention and clarity.",
                features: ["Flexible Timing", "Expert Faculty", "Customized Approach"],
                icon: "lightbulb",
              },
            ].map((course, index) => (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {course.icon === "book" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                  {course.icon === "science" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  )}
                  {course.icon === "briefcase" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {course.icon === "target" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {course.icon === "trophy" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                  {course.icon === "lightbulb" && (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{course.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {course.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <svg className="mr-2 h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 sm:py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Results Speak
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Consistent excellence year after year for 10+ years
            </p>
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-6 items-center justify-center p-8 rounded-xl bg-card border border-border shadow-sm">
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground mt-1">Students Trained</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-border"></div>
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Success Rate In Board Exams</div>
              </div>
              <div className="hidden sm:block h-12 w-px bg-border"></div>
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground mt-1">Merit Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Parents & Students Say
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Real experiences from our community
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-7xl lg:grid-cols-3">
            {[
              {
                name: "Rahul Mehta",
                role: "Student, Class 12",
                content: "The faculty at A² Institution for Academics Excellence helped me score 95% in my board exams. Their teaching methodology and regular tests were instrumental in my success.",
                rating: 5,
              },
              {
                name: "Mrs. Sunita Verma",
                role: "Parent",
                content: "My daughter's confidence has grown tremendously since joining. The personalized attention and doubt-clearing sessions make all the difference.",
                rating: 5,
              },
              {
                name: "Dr. Kavita Nair",
                role: "Parent",
                content: "The institute maintains excellent discipline and academic standards. My son's performance improved significantly in just one year.",
                rating: 5,
              },
              {
                name: "Sneha Patel",
                role: "MPC Student",
                content: "The Maths faculty is exceptional. With their guidance, I secured admission in a top medical college. Thank you A² Institution for Academics Excellence!",
                rating: 5,
              },
              {
                name: "Mr. Vikram Desai",
                role: "Parent",
                content: "Best coaching institute in the area. The teachers are excellent, special thanks to Praveen Sir",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 flex-1">"{testimonial.content}"</p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-12 sm:py-20 md:py-32 bg-background overflow-hidden">
        {/* Background gradient shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-20 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 md:p-12 shadow-lg">
              {/* Tagline with icon */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 md:mb-8">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="16" cy="8" r="1" fill="currentColor" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-primary">Excellence in Education</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground text-center mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
                Want to know more about{" "}
                <span className="text-primary block sm:inline">A² Institution for Academics Excellence</span>?
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-8 px-2">
                Book a free consultation and learn more about A² Institution for Academics Excellence, our courses, and success stories. We would love to help you with all your queries and guide you on your academic journey.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto rounded-full bg-primary px-6 py-2.5 sm:px-8 sm:py-3.5 text-sm sm:text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity text-center"
                >
                  Contact Us
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto rounded-full border-2 border-primary bg-background px-6 py-2.5 sm:px-8 sm:py-3.5 text-sm sm:text-base font-semibold text-primary hover:bg-primary/5 transition-colors text-center"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
