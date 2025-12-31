import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Lock,
  FileCheck,
  Shield,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  Award,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Institution Issues Credential",
      description:
        "Universities and accredited institutions issue academic credentials by cryptographically signing them and anchoring them to the blockchain. Each credential is uniquely tied to the recipient's decentralized identifier (DID).",
      icon: Building2,
      features: ["Cryptographic signatures", "Blockchain anchoring", "Tamper-proof records"],
    },
    {
      number: "02",
      title: "Credential is Secured",
      description:
        "Once issued, the credential is immutably stored with a cryptographic proof that can never be altered or forged. The blockchain provides a permanent, decentralized audit trail.",
      icon: Lock,
      features: ["Immutable storage", "Cryptographic proofs", "Decentralized audit trail"],
    },
    {
      number: "03",
      title: "Student Owns Forever",
      description:
        "Students receive their credentials in a digital wallet they fully control. They own their academic identity forever - no institution can revoke access to the credential itself, only mark it as revoked.",
      icon: GraduationCap,
      features: ["Full ownership", "Selective disclosure", "Privacy controls"],
    },
    {
      number: "04",
      title: "Instant Verification",
      description:
        "Employers and other verifiers can instantly verify any credential without contacting the issuing institution. Verification happens in seconds through cryptographic checks.",
      icon: FileCheck,
      features: ["Zero intermediaries", "Instant results", "API integration"],
    },
  ];

  const benefits = [
    {
      title: "Fraud Prevention",
      description: "Eliminate credential fraud with cryptographic verification",
      icon: Shield,
    },
    {
      title: "Instant Verification",
      description: "Verify credentials in seconds, not days or weeks",
      icon: Zap,
    },
    {
      title: "Global Recognition",
      description: "Credentials recognized across borders and institutions",
      icon: Globe,
    },
    {
      title: "Lifetime Ownership",
      description: "Students own their credentials forever, not the institution",
      icon: Award,
    },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-border py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              How OpenCred Works
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              OpenCred uses blockchain technology and decentralized identity standards to create 
              a new paradigm for academic credentials - one where trust is built into the technology 
              itself, not dependent on intermediaries.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid items-center gap-12 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <span className="text-6xl font-bold text-muted/30">{step.number}</span>
                  <h2 className="mt-4 text-3xl font-bold text-foreground">{step.title}</h2>
                  <p className="mt-4 text-lg text-muted-foreground">{step.description}</p>
                  <ul className="mt-6 space-y-3">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`flex justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-primary/10 lg:h-64 lg:w-64">
                    <step.icon className="h-24 w-24 text-primary lg:h-32 lg:w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-card py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-foreground">Why It Matters</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            OpenCred transforms how we think about academic credentials
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-border bg-background p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                  <benefit.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Ready to Get Started?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the future of academic credentials today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/connect-wallet">
                <Button variant="hero" size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="hero-outline" size="lg">
                  Read Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
