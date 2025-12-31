import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Lock, 
  FileCheck, 
  Zap, 
  ArrowRight, 
  Building2, 
  GraduationCap, 
  Briefcase,
  CheckCircle,
  Globe,
  Users,
  Award
} from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="max-w-xl animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <span className="text-muted-foreground">Blockchain-Powered Credentials</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Academic Credentials,{" "}
              <span className="text-accent">Rebuilt for Trust.</span>
            </h1>
            
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
              OpenCred is a decentralized platform for issuing, owning, and verifying 
              academic credentials securely and instantly. No intermediaries required.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/connect-wallet">
                <Button variant="hero" size="lg">
                  <GraduationCap className="h-5 w-5" />
                  Get Started as Student
                </Button>
              </Link>
              <Link to="/connect-wallet">
                <Button variant="hero-outline" size="lg">
                  <Building2 className="h-5 w-5" />
                  Issue Credentials
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Shield, label: "Blockchain-Backed" },
                { icon: FileCheck, label: "W3C Compliant" },
                { icon: Lock, label: "Privacy-First" },
                { icon: Zap, label: "Instant Verify" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-accent" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in lg:animate-float">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <img
                src={heroImage}
                alt="OpenCred - Decentralized Academic Credentials"
                className="w-full rounded-2xl"
              />
              {/* Floating card overlay */}
              <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Credential Verified</p>
                    <p className="text-xs text-muted-foreground">Just now • MIT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Building2,
      title: "Institution Issues",
      description: "Universities cryptographically sign and issue credentials to the blockchain.",
    },
    {
      number: "02",
      icon: Lock,
      title: "Credential Secured",
      description: "Credentials are immutably stored with tamper-proof cryptographic proofs.",
    },
    {
      number: "03",
      icon: GraduationCap,
      title: "Student Owns",
      description: "Students have full ownership and control over their academic identity.",
    },
    {
      number: "04",
      icon: Briefcase,
      title: "Employer Verifies",
      description: "Instant verification without contacting the issuing institution.",
    },
  ];

  return (
    <section className="border-t border-border bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How OpenCred Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A seamless flow from issuance to verification, powered by decentralized technology.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-border lg:block" />
              )}
              
              <div className="mb-4 flex items-center justify-between">
                <span className="text-4xl font-bold text-muted/50">{step.number}</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <step.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ForWhomSection() {
  const personas = [
    {
      icon: GraduationCap,
      title: "For Students",
      description: "Own your academic identity forever. Store, manage, and selectively share your credentials with full control over privacy and access.",
      features: ["Permanent credential ownership", "Selective disclosure", "Privacy controls"],
      href: "/connect-wallet",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Building2,
      title: "For Institutions",
      description: "Issue tamper-proof credentials with cryptographic signatures. Maintain immutable records and participate in decentralized governance.",
      features: ["Cryptographic issuance", "Revocation management", "Audit trails"],
      href: "/connect-wallet",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Briefcase,
      title: "For Employers",
      description: "Instantly verify credentials without intermediaries. Access verification via intuitive UI or integrate with our powerful API.",
      features: ["Instant verification", "QR code scanning", "API integration"],
      href: "/verify",
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Everyone in Education
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            OpenCred serves the entire academic ecosystem with tailored solutions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-card-hover"
            >
              <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${persona.bgColor}`}>
                <persona.icon className={`h-7 w-7 ${persona.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground">{persona.title}</h3>
              <p className="mt-3 text-muted-foreground">{persona.description}</p>
              
              <ul className="mt-6 space-y-3">
                {persona.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                to={persona.href}
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  const stats = [
    { value: "10M+", label: "Credentials Issued", icon: Award },
    { value: "500+", label: "Partner Institutions", icon: Building2 },
    { value: "50K+", label: "Daily Verifications", icon: FileCheck },
    { value: "180+", label: "Countries Reached", icon: Globe },
  ];

  return (
    <section className="border-y border-border bg-primary py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10">
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-4xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="mt-2 text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "Credentials are anchored to the blockchain, ensuring immutability and preventing fraud.",
    },
    {
      icon: Lock,
      title: "Privacy by Design",
      description: "Zero-knowledge proofs enable selective disclosure without revealing unnecessary data.",
    },
    {
      icon: FileCheck,
      title: "W3C Standards",
      description: "Built on W3C Verifiable Credentials and Decentralized Identifiers (DIDs) specifications.",
    },
    {
      icon: Users,
      title: "DAO Governance",
      description: "Decentralized governance ensures transparent and fair protocol evolution.",
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Enterprise-Grade Security, Open-Source Trust
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              OpenCred combines the best of decentralized technology with institutional-grade 
              security to create a credential platform you can trust.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <feature.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <span className="text-sm font-medium text-foreground">Credential Integrity</span>
                  <span className="text-sm text-accent">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <span className="text-sm font-medium text-foreground">Issuer Signature</span>
                  <span className="text-sm text-accent">✓ Valid</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <span className="text-sm font-medium text-foreground">Revocation Status</span>
                  <span className="text-sm text-accent">✓ Active</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                  <span className="text-sm font-medium text-foreground">Blockchain Anchor</span>
                  <span className="text-sm text-accent">✓ Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="border-t border-border bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to Transform Academic Credentials?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join the growing network of institutions, students, and employers building 
            the future of trusted academic verification.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/connect-wallet">
              <Button variant="hero" size="lg">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="hero-outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
