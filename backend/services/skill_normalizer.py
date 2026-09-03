import re
from typing import Dict, List, Optional

# Canonical skills registry
CANONICAL_SKILLS: Dict[str, str] = {
    # Programming & Languages
    "python": "Python",
    "python3": "Python",
    "python 3": "Python",
    "python 3.x": "Python",
    "py": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "c": "C",
    "c programming": "C",
    "c++": "C++",
    "cpp": "C++",
    "java": "Java",
    "golang": "Go",
    "go": "Go",
    "rust": "Rust",
    "php": "PHP",
    "r": "R",
    "r programming": "R",
    "sql": "SQL",
    "structured query language": "SQL",
    "html": "HTML5",
    "html5": "HTML5",
    "css": "CSS3",
    "css3": "CSS3",

    # AI, Data Science & Machine Learning
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "generative ai": "Generative AI",
    "genai": "Generative AI",
    "gen ai": "Generative AI",
    "llm": "Generative AI",
    "llms": "Generative AI",
    "large language models": "Generative AI",
    "prompt engineering": "Prompt Engineering",
    "rag": "RAG",
    "retrieval augmented generation": "RAG",
    "langchain": "LangChain",
    "natural language processing": "NLP",
    "nlp": "NLP",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "statistics": "Statistics",
    "applied statistics": "Statistics",
    "computational statistics": "Statistics",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "data cleaning": "Data Cleaning",
    "data visualization": "Data Visualization",
    "data modeling": "Data Modeling",
    "etl": "ETL",
    "mlops": "MLOps",

    # BI & Analytics Tools
    "power bi": "Power BI",
    "powerbi": "Power BI",
    "tableau": "Tableau",
    "excel": "Excel",
    "advanced excel": "Excel",

    # Web & Frameworks
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "node": "Node.js",
    "express": "Express",
    "express.js": "Express",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "redux": "Redux",
    "redux toolkit": "Redux",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful apis": "REST APIs",
    "graphql": "GraphQL",
    "jquery": "jQuery",

    # Databases & Cloud
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "vector databases": "Vector Databases",
    "pinecone": "Vector Databases",
    "chromadb": "Vector Databases",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "terraform": "Terraform",
    "ci/cd": "CI/CD",
    "github actions": "CI/CD",
    "git": "Git",
    "linux": "Linux"
}

# Skill category mappings
SKILL_CATEGORIES: Dict[str, str] = {
    "Python": "Programming",
    "JavaScript": "Programming",
    "TypeScript": "Programming",
    "C": "Programming",
    "C++": "Programming",
    "Java": "Programming",
    "SQL": "Database & Analytics",
    "HTML5": "Frontend",
    "CSS3": "Frontend",
    "Tailwind CSS": "Frontend",
    "React": "Frontend Framework",
    "Next.js": "Full Stack Framework",
    "Node.js": "Backend Runtime",
    "Express": "Backend Framework",
    "FastAPI": "Backend Framework",
    "Machine Learning": "Data Science & AI",
    "Deep Learning": "Data Science & AI",
    "Generative AI": "Emerging AI",
    "Prompt Engineering": "Emerging AI",
    "RAG": "Emerging AI",
    "NLP": "Data Science & AI",
    "Statistics": "Mathematics & Core",
    "Pandas": "Data Analysis",
    "NumPy": "Data Analysis",
    "Scikit-Learn": "Data Science & AI",
    "PyTorch": "Data Science & AI",
    "TensorFlow": "Data Science & AI",
    "Power BI": "Business Intelligence",
    "Tableau": "Business Intelligence",
    "Excel": "Business Intelligence",
    "PostgreSQL": "Database",
    "MongoDB": "Database",
    "Redis": "Database",
    "Docker": "DevOps & Cloud",
    "Kubernetes": "DevOps & Cloud",
    "AWS": "DevOps & Cloud",
    "Terraform": "DevOps & Cloud",
    "CI/CD": "DevOps & Cloud",
    "Git": "Tools & Version Control",
    "Linux": "Systems & OS"
}

def normalize_skill_name(raw_name: str) -> str:
    """Normalize a raw skill string to its canonical industry name."""
    cleaned = raw_name.strip()
    key = cleaned.lower()
    
    # Direct match
    if key in CANONICAL_SKILLS:
        return CANONICAL_SKILLS[key]
    
    # Strip common punctuation/noise
    cleaned_key = re.sub(r"[^a-zA-Z0-9\s\+\#\.]", "", key).strip()
    if cleaned_key in CANONICAL_SKILLS:
        return CANONICAL_SKILLS[cleaned_key]
    
    # Return Title Cased string if not found
    return cleaned.title()

def get_skill_category(skill_name: str) -> str:
    """Get category for skill."""
    return SKILL_CATEGORIES.get(skill_name, "Technical")

def extract_known_skills_from_text(text: str) -> List[str]:
    """Scan arbitrary text and find all matched canonical skills."""
    text_lower = text.lower()
    found_skills = set()
    
    for raw_term, canonical in CANONICAL_SKILLS.items():
        # Match as whole word / token
        pattern = r"(?:\b|_)" + re.escape(raw_term) + r"(?:\b|_)"
        if re.search(pattern, text_lower):
            found_skills.add(canonical)
            
    return sorted(list(found_skills))
