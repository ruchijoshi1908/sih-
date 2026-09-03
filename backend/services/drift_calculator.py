from typing import Dict, List, Any

def calculate_curriculum_drift(
    industry_skills_demand: Dict[str, float], # skill_name -> demand_percentage (0 to 100)
    curriculum_skills: List[str]              # list of canonical skill names in course
) -> Dict[str, Any]:
    """
    Calculate the deterministic Curriculum Drift Score (0 - 100).
    
    Formula:
    Drift Score = (Sum of Demand Weights of Missing Skills / Total Industry Demand Weight) * 100
    
    Categorization:
    - 0 to 30: 🟢 Healthy (Curriculum closely aligns with market demand)
    - 31 to 60: 🟡 Needs Update (Curriculum missing moderate industry requirements)
    - 61 to 100: 🔴 Outdated (Curriculum has severe gaps in high-demand industry skills)
    """
    if not industry_skills_demand:
        return {
            "score": 0.0,
            "status": "Healthy",
            "status_color": "green",
            "total_skills_count": 0,
            "matched_skills_count": 0,
            "missing_skills_count": 0,
            "formula_breakdown": "No industry skills data available for this target role.",
            "metrics": {
                "total_demand_weight": 0.0,
                "missing_demand_weight": 0.0,
                "matched_demand_weight": 0.0,
                "matched_skills": [],
                "missing_skills": []
            }
        }
    
    curriculum_set = set(s.strip() for s in curriculum_skills)
    
    total_demand_weight = 0.0
    missing_demand_weight = 0.0
    matched_demand_weight = 0.0
    
    matched_skills = []
    missing_skills = []
    
    for skill_name, demand_pct in industry_skills_demand.items():
        total_demand_weight += demand_pct
        if skill_name in curriculum_set:
            matched_demand_weight += demand_pct
            matched_skills.append({
                "skill": skill_name,
                "demand_pct": round(demand_pct, 1),
                "status": "MATCHED",
                "in_curriculum": True
            })
        else:
            missing_demand_weight += demand_pct
            # Categorize missing into HIGH DEMAND or EMERGING
            status_tag = "MISSING" if demand_pct >= 40 else "EMERGING"
            missing_skills.append({
                "skill": skill_name,
                "demand_pct": round(demand_pct, 1),
                "status": status_tag,
                "in_curriculum": False
            })
            
    # Calculate score
    if total_demand_weight > 0:
        raw_score = (missing_demand_weight / total_demand_weight) * 100.0
        score = round(raw_score, 1)
    else:
        score = 0.0

    # Classify status
    if score <= 30.0:
        status = "Healthy"
        status_color = "green"
    elif score <= 60.0:
        status = "Needs Update"
        status_color = "yellow"
    else:
        status = "Outdated"
        status_color = "red"

    # Human-readable formula breakdown for hackathon judges
    formula_breakdown = (
        f"Drift Score = (Missing Skills Demand Weight / Total Industry Demand Weight) × 100\n"
        f"= ({missing_demand_weight:.1f} / {total_demand_weight:.1f}) × 100 = {score}% [{status}]"
    )

    return {
        "score": score,
        "status": status,
        "status_color": status_color,
        "total_skills_count": len(industry_skills_demand),
        "matched_skills_count": len(matched_skills),
        "missing_skills_count": len(missing_skills),
        "formula_breakdown": formula_breakdown,
        "metrics": {
            "total_demand_weight": round(total_demand_weight, 1),
            "missing_demand_weight": round(missing_demand_weight, 1),
            "matched_demand_weight": round(matched_demand_weight, 1),
            "matched_skills": sorted(matched_skills, key=lambda x: x["demand_pct"], reverse=True),
            "missing_skills": sorted(missing_skills, key=lambda x: x["demand_pct"], reverse=True)
        }
    }
