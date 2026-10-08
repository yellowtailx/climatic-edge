# CI/CD Report — My Favorite GitHub Actions Repository

**Submitted for:** Module 4 — DevOps and CI/CD Fundamentals  
**Author:** Sudhan  
**Date:** October 2026

---

## Repository

**Name:** End-to-End CI/CD Pipeline Using GitHub Actions  
**URL:** https://github.com/ChaitanyaDaterao/End-to-End-CI-CD-Pipeline-Using-GitAction  
**Project:** Murum BMS — a full-stack Business Management System  
**Stack:** React (frontend), Node.js/Express (backend), MongoDB (database), Docker + Kubernetes (deployment)

---

## Why This Repository

This is my favorite CI/CD repository because it demonstrates a complete, production-grade
**DevSecOps** pipeline built entirely on GitHub Actions. Instead of a single trivial "hello
world" workflow, it shows every stage a real application goes through — from linting and
testing to containerised deployment with security gates along the way.

---

## Pipeline Stages

| Stage | What it does |
|-------|--------------|
| **1. Git setup** | Monorepo with `.env.example` and branch strategy (PRs merge to `main`) |
| **2. Security gates** | Gitleaks secret scanning, CodeQL static analysis, Dependabot vulnerability alerts |
| **3. CI build & scan** | Jest + Supertest unit tests, Docker multi-stage builds, Trivy security scans (SARIF), push to GHCR, SBOM generation |
| **4. Deploy** | Helm chart rollout to Kubernetes (Minikube), rollout verification via `kubectl rollout status` |
| **5. Notifications** | Slack webhook integration on pipeline results |

---

## GitHub Actions Concepts Demonstrated

1. **Workflows (`on:`)** — triggers on push, pull requests, tags, or schedules.
2. **Jobs & steps** — each job runs on a runner (`ubuntu-latest`) with ordered steps.
3. **Secrets** — `GITHUB_TOKEN` (auto-provided) and `SLACK_WEBHOOK_URL` stored in repo
   secrets, never hard-coded.
4. **Actions** — reusable units like `actions/checkout@v4`, `docker/build-push-action`,
   and community actions for Trivy, CodeQL, and Gitleaks.
5. **Artifacts** — SBOM and test reports uploaded from CI jobs.
6. **Environments** — a `production` environment with required reviewer approval gates.
7. **Continuous Deployment** — the pipeline doesn't stop at tests; it builds images,
   pushes them to a registry, and rolls them out to Kubernetes automatically.

---

## Comparison With My Own Repository (ClimaticEdge)

My ClimaticEdge repository includes a CI workflow of its own
(`.github/workflows/ci.yml`) that:

- Runs on push and pull requests to `main`
- Type-checks with `tsc --noEmit`
- Builds the production bundle with webpack
- Caches npm dependencies for faster runs
- Uploads the build as a downloadable artifact

It is smaller than the Murum BMS pipeline because ClimaticEdge is a client-side SPA,
whereas Murum BMS ships containers to Kubernetes — but the same GitHub Actions
fundamentals (workflows, jobs, steps, secrets, artifacts) apply to both.

---

## What I Learned

- How GitHub Actions YAML triggers and matrix builds work.
- How to keep secrets out of source code using repository secrets.
- That a mature CI/CD pipeline is a series of **quality gates**, each catching a
  different class of bug (lint → test → security → deploy).
- How Continuous Deployment shortens the time from commit to production.

---

## References

- GitHub Actions Docs: https://docs.github.com/en/actions
- Repository: https://github.com/ChaitanyaDaterao/End-to-End-CI-CD-Pipeline-Using-GitAction