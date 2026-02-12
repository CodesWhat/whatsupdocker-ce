import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Github,
  ExternalLink,
  Container,
  Radio,
  Bell,
  Eye,
  Network,
  BarChart3,
  BookOpen,
  Terminal,
} from "lucide-react";

const features = [
  {
    icon: Container,
    title: "Auto-Discovery",
    description: "Automatically discovers running containers and tracks their image versions without manual configuration.",
  },
  {
    icon: Radio,
    title: "10+ Registries",
    description: "Query Docker Hub, GHCR, ECR, GCR, GitLab, Quay, LSCR, ACR, and custom v2 registries.",
  },
  {
    icon: Bell,
    title: "16 Triggers",
    description: "Notify via Slack, Discord, Telegram, SMTP, MQTT, webhooks, Gotify, NTFY, Kafka, and more.",
  },
  {
    icon: Eye,
    title: "Dry-Run Preview",
    description: "Preview updates before applying them. Pre-update image backup with one-click rollback.",
  },
  {
    icon: Network,
    title: "Distributed Agents",
    description: "Monitor remote Docker hosts via SSE-based agents. Centralized dashboard for all environments.",
  },
  {
    icon: BarChart3,
    title: "Prometheus Metrics",
    description: "Built-in /metrics endpoint with Grafana dashboard template. Full observability out of the box.",
  },
];

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drydock.codeswhat.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Drydock",
    url: baseUrl,
    description:
      "Open source container update monitoring built in TypeScript with modern tooling.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Docker",
    license: "https://opensource.org/licenses/MIT",
    author: {
      "@type": "Organization",
      name: "CodesWhat",
      url: "https://codeswhat.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        {/* Background Pattern */}
        <div className="bg-grid-neutral-200/50 dark:bg-grid-neutral-800/50 fixed inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
            {/* Bouncing Whale Logo */}
            <div className="animate-bounce-slow mb-8">
              <Image
                src="/whale-logo.png"
                alt="Drydock Logo"
                width={180}
                height={180}
                className="drop-shadow-2xl dark:invert"
                priority
              />
            </div>

            {/* Version Badge */}
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
              v1.2.0 &middot; Open Source
            </Badge>

            {/* Heading */}
            <div className="max-w-4xl text-center">
              <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent dark:from-neutral-100 dark:to-neutral-400">
                  Container Update
                </span>
                <br />
                <span className="bg-gradient-to-r from-neutral-700 to-neutral-500 bg-clip-text text-transparent dark:from-neutral-300 dark:to-neutral-500">
                  Monitoring
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400">
                Keep your containers up-to-date. Auto-discover running containers, detect image
                updates across 10+ registries, and trigger notifications via 16+ services.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <a
                    href="https://github.com/CodesWhat/drydock"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href="https://github.com/CodesWhat/drydock#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="h-4 w-4" />
                    Documentation
                  </a>
                </Button>
              </div>

              {/* Badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <a href="https://github.com/CodesWhat/drydock/stargazers" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/github/stars/CodesWhat/drydock?style=flat" alt="Stars" />
                </a>
                <a href="https://github.com/CodesWhat/drydock/forks" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/github/forks/CodesWhat/drydock?style=flat" alt="Forks" />
                </a>
                <a href="https://github.com/CodesWhat/drydock/issues" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/github/issues/CodesWhat/drydock?style=flat" alt="Issues" />
                </a>
                <a href="LICENSE" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/badge/license-MIT-C9A227" alt="License MIT" />
                </a>
                <a href="https://github.com/CodesWhat/drydock/commits/main" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/github/last-commit/CodesWhat/drydock?style=flat" alt="Last commit" />
                </a>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <a href="https://www.bestpractices.dev/projects/11915" target="_blank" rel="noopener noreferrer">
                  <img src="https://www.bestpractices.dev/projects/11915/badge" alt="OpenSSF Best Practices" />
                </a>
                <a href="https://securityscorecards.dev/viewer/?uri=github.com/CodesWhat/drydock" target="_blank" rel="noopener noreferrer">
                  <img src="https://img.shields.io/ossf-scorecard/github.com/CodesWhat/drydock?label=openssf+scorecard&style=flat" alt="OpenSSF Scorecard" />
                </a>
                <a href="https://app.codecov.io/gh/CodesWhat/drydock" target="_blank" rel="noopener noreferrer">
                  <img src="https://codecov.io/gh/CodesWhat/drydock/graph/badge.svg?token=b90d4863-46c5-40d2-bf00-f6e4a79c8656" alt="Codecov" />
                </a>
                <a href="https://sonarcloud.io/summary/overall?id=CodesWhat_drydock" target="_blank" rel="noopener noreferrer">
                  <img src="https://sonarcloud.io/api/project_badges/measure?project=CodesWhat_drydock&metric=alert_status" alt="SonarCloud" />
                </a>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="px-4 pb-24">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                  Everything you need
                </h2>
                <p className="mx-auto max-w-2xl text-neutral-600 dark:text-neutral-400">
                  A complete solution for monitoring and managing container updates across your
                  infrastructure.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <Card
                    key={feature.title}
                    className="border-neutral-200 bg-white/50 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50"
                  >
                    <CardContent className="pt-6">
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <feature.icon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                      </div>
                      <h3 className="mb-2 font-semibold text-neutral-900 dark:text-neutral-100">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Start Section */}
          <section className="border-t border-neutral-200 px-4 py-24 dark:border-neutral-800">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
                Get started in seconds
              </h2>
              <p className="mb-8 text-neutral-600 dark:text-neutral-400">
                One command to start monitoring all your containers.
              </p>

              {/* Code Block */}
              <Card className="mx-auto max-w-2xl border-neutral-200 bg-neutral-950 text-left dark:border-neutral-800">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-center gap-2 text-neutral-500">
                    <Terminal className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Terminal</span>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code className="text-neutral-300">
                      <span className="text-neutral-500">$</span>{" "}
                      <span className="text-[#C4FF00]">docker run</span> -d \{"\n"}
                      {"  "}--name drydock \{"\n"}
                      {"  "}-v /var/run/docker.sock:/var/run/docker.sock \{"\n"}
                      {"  "}-p 3000:3000 \{"\n"}
                      {"  "}ghcr.io/codeswhat/drydock
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-neutral-200 px-4 py-8 dark:border-neutral-800">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Image src="/codeswhat-logo.png" alt="CodesWhat" width={20} height={20} className="dark:invert" />
                <span>&copy; {new Date().getFullYear()} CodesWhat. MIT License.</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/CodesWhat/drydock"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/CodesWhat/drydock#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  aria-label="Documentation"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
