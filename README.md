# Labour Market Intelligence & Curriculum Alignment Platform (SIH PS 134)

> **AI-Powered Real-Time Labour Market Intelligence, Dynamic Curriculum Alignment & Placement Feedback Loop**

An end-to-end platform engineered for the **Smart India Hackathon (SIH PS 134)** to solve the disconnect between rapidly evolving industry skill demands and higher education / vocational training curricula.

---

## 🎯 The Core Problem & Solution

* **Problem**: Industry skill requirements change in months (e.g. GenAI, modern data stacks, cloud orchestration), but college curricula remain static for years, leading to low graduate employability.
* **Solution**: An AI-powered closed-loop platform that monitors real-time industry job postings, audits syllabus documents, calculates an **explainable Curriculum Drift Score (0–100)**, presents real market citations as evidence, recommends modular syllabus updates, facilitates employer validation, creates Version 2.0 curricula, and tracks placement outcome gains (e.g., $58\% \rightarrow 72\%$).

---

## 🚀 Key Features

1. **Job Market Intelligence**: Real-time aggregation of industry job descriptions with automatic skill extraction & canonical normalization.
2. **Curriculum Audit Engine**: Drag-and-drop syllabus PDF/TXT parsing to detect taught skills.
3. **Explainable Drift Score (0–100)**: Transparent, deterministic mathematical formula with zero AI hallucinations:
   $$\text{Drift Score} = \left( \frac{\sum_{\text{missing}} \text{Demand Weight}}{\sum_{\text{total}} \text{Demand Weight}} \right) \times 100$$
   * `0 – 30`: 🟢 **Healthy**
   * `31 – 60`: 🟡 **Needs Update**
   * `61 – 100`: 🔴 **Outdated**
4. **Evidence Engine**: Links each detected gap to real company job postings and statistical demand proof.
5. **AI Recommendation Agent**: Generates actionable syllabus modules, lab practicals, and evidence-backed rationale.
6. **Employer Validation Portal**: Dedicated workspace for industry hiring managers to Approve, Reject, or Partial validate changes with feedback.
7. **Curriculum Versioning**: Instant migration from Version 1.0 $\rightarrow$ Version 2.0 with drift reduction metrics.
8. **Placement Feedback Loop**: Compares before vs after placement rates ($58\% \rightarrow 72\%$, $+14\%$ gain) and average package growth.
9. **Student Skill Audit**: Student resume PDF upload, target role benchmarking, and customized 4-week fast-track roadmap.
10. **n8n Automation**: Scheduled daily scraper and event-driven employer alert dispatch workflows.

---

## 🏗️ Architecture & Tech Stack

```text
SIH/
├── backend/                  # FastAPI + SQLAlchemy ORM (SQLite / PostgreSQL)
│   ├── main.py               # Entry point & API routers
│   ├── config.py             # Environment configuration
│   ├── database/             # Database session & auto-seeder
│   ├── models/               # SQLAlchemy models (Courses, Jobs, Skills, Placements, etc.)
│   ├── schemas/              # Pydantic validation schemas
│   ├── routes/               # Clean REST API endpoints
│   └── services/             # Drift calculator, PDF parser, AI Agent, Evidence engine
├── frontend/                 # React 18 + Vite + Tailwind CSS + Lucide Icons + Recharts
│   ├── src/pages/            # Dashboard, CourseAudit, Recommendations, Employer, Placements, etc.
│   └── src/components/       # DriftGauge, SkillGapTable, EvidenceModal, PlacementChart, etc.
├── data/
│   ├── sample_jobs/          # 50+ real-world industry job postings
│   └── sample_syllabi/       # Legacy & modern syllabus blueprints
└── n8n/
    └── workflows/            # Exportable n8n workflow JSON definitions
```

---

## ⚡ Quick Start Guide

### 1. Start Backend (FastAPI)
```bash
cd backend
py -m pip install -r requirements.txt
py main.py
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🎬 3-Minute Hackathon Demo Script (For Judges)

1. **Executive Dashboard**:
   * Open `http://localhost:5173`. Show the 3-role switcher in the top bar (`Admin`, `Employer`, `Student`).
   * Point out the course catalog with status badges (e.g. *Data Science* is **🔴 Outdated (72%)**).
2. **Run Curriculum Audit**:
   * Navigate to **Curriculum Audit**. Click **"Run AI Curriculum Audit"**.
   * Show the animated **Drift Score Dial (72%)** and click the **Formula** button to show judges the exact mathematical derivation.
   * View the **Industry Skill Gap Matrix** showing missing high-demand skills (*SQL, Generative AI, Power BI*).
3. **Inspect Real Evidence**:
   * Click **"Evidence"** next to *SQL*. Show real job postings from companies citing why SQL is required for 71% of jobs.
4. **Employer Validation**:
   * Switch role to **Employer** or open **Employer Validation**. Click **Approve** on *SQL* and *Generative AI*.
5. **Publish Curriculum Version 2.0**:
   * Switch back to **Admin**, open **Recommendations**, and click **"Publish Version 2.0"**.
   * Notice that the Drift Score immediately drops from **72% (Outdated) 🔴** to **Healthy 🟢**.
6. **Show Placement Feedback Loop**:
   * Open **Placement Loop**. See the Before vs After comparison banner showing placement rate jumping from **58% to 72% (+14 percentage points)**.
7. **Student Resume Diagnostic**:
   * Open **Student Resume Audit**. Upload/paste student resume, select **Data Science**, and show the readiness score and 4-week actionable learning roadmap!

---

## 👥 6-Developer Team Work Breakdown (Pair Programming)

* **Pair 1 (AI & Data)**: Job market dataset, PDF syllabus extractor, Skill normalizer, AI extraction agents.
* **Pair 2 (Analytics & Logic)**: Deterministic Drift Score Engine, Gap detection matrix, Evidence citations, Placement ROI metrics.
* **Pair 3 (Platform & UI)**: FastAPI REST endpoints, React + Tailwind interface, n8n webhook pipelines, database persistence.
