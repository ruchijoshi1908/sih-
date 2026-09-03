import os
import json
import re
from typing import List, Dict, Any, Optional
import httpx

from backend.config import GEMINI_API_KEY, OPENAI_API_KEY, GROQ_API_KEY
from backend.services.skill_normalizer import (
    normalize_skill_name,
    extract_known_skills_from_text,
    get_skill_category
)

# Standard curricular recommendations blueprint for fallback & reference
SKILL_RECOMMENDATION_BLUEPRINTS = {
    "SQL": {
        "module": "Module 3B: Relational Databases & SQL for Data Analytics",
        "topics": "SELECT, WHERE, JOINs (INNER, LEFT, RIGHT), GROUP BY, Window Functions (ROW_NUMBER, RANK), Aggregations, CTEs, and Subqueries.",
        "practical_activity": "Hands-on Lab: Connect Python/Pandas to PostgreSQL database, execute complex multi-table analytical queries, and build financial metric aggregates.",
        "priority": "Critical"
    },
    "Generative AI": {
        "module": "Module 6: Applied Generative AI, LLMs & Prompt Engineering",
        "topics": "Foundation Models (OpenAI, Gemini), Prompt Engineering techniques, Retrieval-Augmented Generation (RAG) architecture, Vector Embeddings, and LangChain/LlamaIndex pipelines.",
        "practical_activity": "Term Project: Build an AI Document Q&A Assistant using LangChain, ChromaDB vector store, and a local/cloud LLM.",
        "priority": "High"
    },
    "Power BI": {
        "module": "Module 5B: Enterprise Business Intelligence & Dashboarding with Power BI",
        "topics": "Power Query ETL, Data Modeling, DAX (Data Analysis Expressions) formulas, interactive KPI visualizations, and publishing dashboard reports.",
        "practical_activity": "Case Study Lab: Create an Executive Sales Performance Dashboard with drill-down filters and automated data refresh.",
        "priority": "High"
    },
    "Docker": {
        "module": "Module 7: Containerization & Model Deployment with Docker",
        "topics": "Docker fundamentals, writing Dockerfiles, multi-stage builds, docker-compose, and deploying containerized REST APIs.",
        "practical_activity": "Lab Practical: Containerize a Python FastAPI machine learning microservice and test endpoint inference in Docker.",
        "priority": "Medium"
    },
    "React": {
        "module": "Module 2: Modern Frontend Architecture with React",
        "topics": "JSX, Component Lifecycle, Hooks (useState, useEffect, useContext, useMemo), State Management (Zustand/Redux), and Tailwind CSS styling.",
        "practical_activity": "Project: Develop an interactive Single Page Application with dynamic component state and REST API consumption.",
        "priority": "Critical"
    },
    "TypeScript": {
        "module": "Module 3: Strongly Typed Web Applications with TypeScript",
        "topics": "Static typing, Interfaces, Generics, Union types, Type narrowing, and configuring tsconfig in modern React/Node apps.",
        "practical_activity": "Lab: Refactor a vanilla JavaScript application into strict TypeScript with full interface safety.",
        "priority": "High"
    },
    "Next.js": {
        "module": "Module 4: Full Stack Server-Side Rendering with Next.js",
        "topics": "App Router, Server Components, API routes, Server Actions, Dynamic routing, and SSR/SSG rendering strategies.",
        "practical_activity": "Project: Build a production-grade full stack blog and e-commerce storefront with server-side rendering.",
        "priority": "High"
    },
    "Kubernetes": {
        "module": "Module 6: Container Orchestration with Kubernetes",
        "topics": "Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and Helm charts for cluster scaling.",
        "practical_activity": "Lab: Deploy a resilient multi-container application on a local Minikube / K3s cluster.",
        "priority": "High"
    },
    "Terraform": {
        "module": "Module 5: Infrastructure as Code (IaC) with Terraform",
        "topics": "HCL syntax, Terraform state management, Providers (AWS/Azure), Modules, and automated provisioning.",
        "practical_activity": "Lab: Write Terraform scripts to spin up VPCs, compute instances, and S3 buckets automatically.",
        "priority": "High"
    }
}

class AIServiceAgent:
    """
    Unified AI Agent orchestrating Skill Extraction, Gap Analysis, 
    Curriculum Recommendations, and Student Career Roadmaps.
    Features robust LLM integration with automatic zero-failure fallback.
    """

    @staticmethod
    def extract_skills_from_text(text: str, context_type: str = "syllabus") -> List[str]:
        """
        Agent 1: Extract normalized skills from arbitrary text (Syllabus or Job Description).
        """
        if not text or len(text.strip()) == 0:
            return []

        # 1. Fast Pattern / NLP Extraction
        detected = extract_known_skills_from_text(text)
        
        # 2. If Gemini or OpenAI API key is available, enhance with LLM extraction
        if GEMINI_API_KEY:
            try:
                llm_skills = AIServiceAgent._call_gemini_skill_extractor(text)
                if llm_skills:
                    normalized_llm = [normalize_skill_name(s) for s in llm_skills]
                    combined = set(detected) | set(normalized_llm)
                    return sorted(list(combined))
            except Exception as e:
                print(f"[AI Agent] Gemini call failed, using heuristic extraction: {e}")

        # Fallback heuristic returns detected skills
        return detected

    @staticmethod
    def generate_curriculum_recommendations(
        course_name: str,
        missing_skills_with_evidence: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Agent 3: Generate detailed curriculum recommendations for detected missing skills.
        """
        recommendations = []
        
        for item in missing_skills_with_evidence:
            skill = item["skill"]
            demand_pct = item.get("demand_percentage", 0.0)
            evidence_summary = item.get("evidence_summary", f"{demand_pct}% of analyzed job postings require {skill}.")
            
            # Check blueprint registry
            blueprint = SKILL_RECOMMENDATION_BLUEPRINTS.get(skill)
            
            if blueprint:
                rec = {
                    "skill_name": skill,
                    "market_demand_percentage": demand_pct,
                    "proposed_module": blueprint["module"],
                    "recommendation_text": f"Incorporate modern industry-standard {skill} into the {course_name} curriculum. {blueprint['topics']}",
                    "suggested_practical_activity": blueprint["practical_activity"],
                    "rationale_evidence": f"{evidence_summary} Adding this module directly bridges the gap identified in current industry hiring requirements.",
                    "priority": blueprint["priority"],
                    "status": "pending"
                }
            else:
                category = get_skill_category(skill)
                rec = {
                    "skill_name": skill,
                    "market_demand_percentage": demand_pct,
                    "proposed_module": f"Specialized Unit: {skill} in {course_name}",
                    "recommendation_text": f"Introduce core principles and industry applications of {skill} ({category}).",
                    "suggested_practical_activity": f"Practical Exercise: Design and implement a lab assignment utilizing {skill} for realistic industry scenarios.",
                    "rationale_evidence": f"{evidence_summary} Course currently lacks direct instruction in {skill}.",
                    "priority": "High" if demand_pct >= 50 else "Medium",
                    "status": "pending"
                }
            recommendations.append(rec)
            
        return recommendations

    @staticmethod
    def analyze_student_resume(
        resume_text: str,
        target_role: str,
        target_role_required_skills: List[str]
    ) -> Dict[str, Any]:
        """
        Analyze a student's resume against target role skills and generate gap & roadmap.
        """
        student_skills = AIServiceAgent.extract_skills_from_text(resume_text, context_type="resume")
        student_skill_set = set(student_skills)
        
        target_set = set(target_role_required_skills)
        matched = [s for s in target_role_required_skills if s in student_skill_set]
        missing = [s for s in target_role_required_skills if s not in student_skill_set]
        
        readiness_score = round((len(matched) / max(len(target_role_required_skills), 1)) * 100)
        
        # Build 4-week learning roadmap for missing skills
        roadmap = []
        for i, skill in enumerate(missing[:4], start=1):
            bp = SKILL_RECOMMENDATION_BLUEPRINTS.get(skill, {
                "topics": f"Fundamentals and best practices of {skill}",
                "practical_activity": f"Build a mini project demonstrating {skill}"
            })
            roadmap.append({
                "week": f"Week {i}",
                "focus_skill": skill,
                "goal": f"Master core competencies in {skill}",
                "topics": bp.get("topics", f"Core syntax, tools, and workflows for {skill}"),
                "actionable_project": bp.get("practical_activity", f"Build a portfolio project using {skill}")
            })
            
        return {
            "extracted_skills": student_skills,
            "matched_skills": matched,
            "missing_skills": missing,
            "readiness_score": readiness_score,
            "roadmap": roadmap
        }

    @staticmethod
    def _call_gemini_skill_extractor(text: str) -> List[str]:
        """Direct Gemini API call if GEMINI_API_KEY is configured."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        prompt = (
            "You are an expert curriculum and talent analytics AI. "
            "Extract all technical skills, tools, programming languages, and frameworks mentioned in the following text. "
            "Return ONLY a valid JSON array of strings, e.g. [\"Python\", \"SQL\", \"Docker\"]. Do not include markdown formatting.\n\n"
            f"TEXT:\n{text[:4000]}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 500}
        }
        resp = httpx.post(url, json=payload, timeout=10.0)
        if resp.status_code == 200:
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean JSON
            clean_text = re.sub(r"^```(json)?|```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
            return json.loads(clean_text)
        return []
