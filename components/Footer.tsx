import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                A²
              </div>
              <span className="font-serif text-xl font-bold text-foreground">A² Institution for Academics Excellence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering students with quality education and excellence in results.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#courses" className="text-muted-foreground hover:text-foreground transition-colors">Courses</Link></li>
              <li><Link href="#results" className="text-muted-foreground hover:text-foreground transition-colors">Results</Link></li>
              <li><Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="tel:+916303197020" className="hover:text-foreground transition-colors">
                  +91 6303197020
                </a>
              </li>
              <li>info@asquareinstitutions.com</li>
              <li className="leading-relaxed">
                F-1, Sai Mansion Apartments,<br />
                Road No-3, Mallikarjuna Colony,<br />
                Old Bowenpally, Secunderabad,<br />
                Hyderabad - 500011
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} A² Institution for Academics Excellence. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

