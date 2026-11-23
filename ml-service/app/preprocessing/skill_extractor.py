import csv
import os
import re
from typing import List, Dict, Set, Tuple

# Priority categories for high-frequency technical skills
SKILL_CATEGORY_MAP = {
    # Programming Languages
    "python": "Programming Languages",
    "java": "Programming Languages",
    "javascript": "Programming Languages",
    "typescript": "Programming Languages",
    "cpp": "Programming Languages",
    "csharp": "Programming Languages",
    "ruby": "Programming Languages",
    "php": "Programming Languages",
    "go": "Programming Languages",
    "golang": "Programming Languages",
    "rust": "Programming Languages",
    "kotlin": "Programming Languages",
    "swift": "Programming Languages",
    "dart": "Programming Languages",
    "r": "Programming Languages",
    "scala": "Programming Languages",
    "sql": "Programming Languages",
    "bash": "Programming Languages",
    "shell": "Programming Languages",
    
    # Web & Frameworks
    "react": "Web & Frameworks",
    "reactjs": "Web & Frameworks",
    "nodejs": "Web & Frameworks",
    "express": "Web & Frameworks",
    "expressjs": "Web & Frameworks",
    "angular": "Web & Frameworks",
    "vue": "Web & Frameworks",
    "vuejs": "Web & Frameworks",
    "next.js": "Web & Frameworks",
    "django": "Web & Frameworks",
    "flask": "Web & Frameworks",
    "fastapi": "Web & Frameworks",
    "spring": "Web & Frameworks",
    "spring boot": "Web & Frameworks",
    "dotnet": "Web & Frameworks",
    "asp.net": "Web & Frameworks",
    "laravel": "Web & Frameworks",
    "html": "Web & Frameworks",
    "html5": "Web & Frameworks",
    "css": "Web & Frameworks",
    "css3": "Web & Frameworks",
    "tailwind": "Web & Frameworks",
    "tailwind css": "Web & Frameworks",
    "bootstrap": "Web & Frameworks",
    "flutter": "Web & Frameworks",
    
    # AI & Data Science
    "machine learning": "AI & Data Science",
    "deep learning": "AI & Data Science",
    "natural language processing": "AI & Data Science",
    "nlp": "AI & Data Science",
    "computer vision": "AI & Data Science",
    "tensorflow": "AI & Data Science",
    "pytorch": "AI & Data Science",
    "keras": "AI & Data Science",
    "scikit-learn": "AI & Data Science",
    "sklearn": "AI & Data Science",
    "pandas": "AI & Data Science",
    "numpy": "AI & Data Science",
    "scipy": "AI & Data Science",
    "matplotlib": "AI & Data Science",
    "seaborn": "AI & Data Science",
    "data science": "AI & Data Science",
    "data analysis": "AI & Data Science",
    "big data": "AI & Data Science",
    "hadoop": "AI & Data Science",
    "spark": "AI & Data Science",
    "pyspark": "AI & Data Science",
    "power bi": "AI & Data Science",
    "tableau": "AI & Data Science",
    
    # Cloud & DevOps
    "docker": "Cloud & DevOps",
    "kubernetes": "Cloud & DevOps",
    "aws": "Cloud & DevOps",
    "amazon web services": "Cloud & DevOps",
    "azure": "Cloud & DevOps",
    "gcp": "Cloud & DevOps",
    "google cloud": "Cloud & DevOps",
    "ci/cd": "Cloud & DevOps",
    "jenkins": "Cloud & DevOps",
    "git": "Cloud & DevOps",
    "github": "Cloud & DevOps",
    "gitlab": "Cloud & DevOps",
    "terraform": "Cloud & DevOps",
    "ansible": "Cloud & DevOps",
    "linux": "Cloud & DevOps",
    "devops": "Cloud & DevOps",
    "microservices": "Cloud & DevOps",
    "rest api": "Cloud & DevOps",
    "graphql": "Cloud & DevOps",
    "open source": "Software Engineering",
    
    # Databases
    "mongodb": "Databases",
    "mysql": "Databases",
    "postgresql": "Databases",
    "oracle": "Databases",
    "redis": "Databases",
    "sqlite": "Databases",
    "cassandra": "Databases",
    "elasticsearch": "Databases",
    "neo4j": "Databases",
    "database": "Databases",
    "nosql": "Databases"
}

# Blacklist of generic single words in ESCO that cause false positives when matched standalone
GENERIC_SINGLE_WORD_STOPWORDS = {
    "source", "open", "free", "lead", "plan", "part", "level", "act", "key", "run", 
    "set", "use", "make", "work", "job", "good", "team", "year", "call", "hand", 
    "high", "room", "book", "date", "area", "case", "cost", "view", "rate", "site", 
    "side", "type", "form", "item", "user", "post", "step", "role", "need", "hold", 
    "read", "show", "play", "move", "live", "mean", "name", "mind", "life", "line", 
    "look", "meet", "note", "next", "pass", "pick", "port", "pull", "push", "real", 
    "ring", "risk", "rule", "safe", "sale", "same", "save", "scan", "seat", "seed", 
    "send", "ship", "shop", "shot", "sign", "size", "sort", "stay", "stop", "suit", 
    "task", "tell", "term", "till", "tone", "tour", "town", "tree", "trip", 
    "true", "turn", "unit", "wait", "walk", "wall", "warm", "wash", "wave", "wear", 
    "week", "west", "wide", "wild", "wind", "wire", "wish", "wood", "word", "yard",
    "able", "also", "back", "base", "best", "both", "busy", "care", "city", "come",
    "cool", "copy", "dark", "deal", "door", "draw", "drop", "duty", "each", "earn",
    "easy", "edge", "else", "even", "ever", "face", "fact", "fair", "fall", "fast",
    "feel", "fill", "find", "fine", "fire", "firm", "fish", "flat", "flow", "food",
    "foot", "full", "fund", "gain", "game", "give", "glad", "goal", "gold", "gone",
    "grow", "half", "hard", "head", "hear", "heat", "help", "here", "hide", "hill",
    "hire", "home", "hope", "host", "hour", "huge", "hurt", "idea", "iron", "join",
    "jump", "just", "keep", "kill", "kind", "king", "know", "lack", "lady", "land",
    "last", "late", "left", "less", "list", "load", "loan", "lock", "long", "lose",
    "loss", "lost", "love", "luck", "mail", "main", "many", "mark", "mass", "math",
    "mile", "milk", "mine", "miss", "mode", "moon", "more", "most", "much", "must",
    "near", "neck", "news", "nice", "nine", "none", "noon", "nose", "once", "ones",
    "only", "onto", "pack", "page", "pain", "pair", "park", "past", "path", "peer",
    "pile", "pipe", "plus", "pool", "poor", "pray", "pure", "race", "rain", "rank",
    "rare", "rest", "rich", "ride", "rise", "road", "rock", "roof", "root", "rope",
    "rose", "safe", "sail", "salt", "save", "says", "seat", "seek", "seem", "seen",
    "self", "sell", "shut", "sick", "skin", "slow", "snow", "soft", "soil", "some",
    "song", "soon", "sort", "soul", "soup", "spot", "star", "step", "such", "sure",
    "take", "talk", "tall", "team", "tell", "tend", "test", "than", "that", "them",
    "then", "they", "thin", "this", "thus", "time", "tiny", "tips", "tire", "told",
    "took", "tool", "tour", "town", "tree", "trip", "true", "tube", "turn", "twin",
    "type", "unit", "upon", "used", "user", "uses", "vain", "vary", "vast", "very",
    "view", "vote", "wage", "wait", "wake", "walk", "wall", "want", "ward", "warm",
    "warn", "wash", "wave", "ways", "weak", "wear", "week", "well", "went", "were",
    "west", "what", "when", "whom", "wide", "wild", "will", "wind", "wine", "wing",
    "wire", "wise", "wish", "with", "wood", "word", "wore", "work", "worm", "worn",
    "wrap", "yard", "yeah", "year", "zero", "zone"
}

class SkillExtractor:
    def __init__(self, skills_csv_path: str = None):
        if skills_csv_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            skills_csv_path = os.path.join(base_dir, "data", "raw", "skills.csv")
        
        self.skills_csv_path = skills_csv_path
        self.single_word_skills: Dict[str, str] = {}
        self.multi_word_skills: Dict[str, str] = {}
        self.priority_skills: Dict[str, str] = SKILL_CATEGORY_MAP
        self._load_skills()
    
    def _load_skills(self):
        """Loads canonical skills and alternative labels from skills.csv into fast lookup tables."""
        # 1. Initialize with priority technical skills
        for skill in self.priority_skills:
            norm = skill.lower()
            if ' ' in norm:
                self.multi_word_skills[norm] = norm.title()
            else:
                self.single_word_skills[norm] = norm.title()
                
        # Special tech representations
        self.single_word_skills["cpp"] = "C++"
        self.single_word_skills["csharp"] = "C#"
        self.single_word_skills["dotnet"] = ".NET"
        self.single_word_skills["nodejs"] = "Node.js"
        self.single_word_skills["reactjs"] = "React"
        self.single_word_skills["vuejs"] = "Vue.js"

        if not os.path.exists(self.skills_csv_path):
            print(f"Warning: skills file not found at {self.skills_csv_path}")
            return
        
        with open(self.skills_csv_path, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if not row or not row[0].strip():
                    continue
                canonical = row[0].strip()
                canonical_lower = canonical.lower()
                
                # Register canonical
                if ' ' in canonical_lower:
                    if canonical_lower not in self.multi_word_skills:
                        self.multi_word_skills[canonical_lower] = canonical
                else:
                    if (
                        len(canonical_lower) >= 3
                        and canonical_lower not in self.single_word_skills
                        and (canonical_lower not in GENERIC_SINGLE_WORD_STOPWORDS or canonical_lower in self.priority_skills)
                    ):
                        self.single_word_skills[canonical_lower] = canonical
                
                # Register alternative labels
                if len(row) > 1 and row[1].strip():
                    alt_labels = row[1].strip()
                    for alt in re.split(r'[,;|\n]', alt_labels):
                        alt_clean = alt.strip().lower()
                        if len(alt_clean) >= 3:
                            if ' ' in alt_clean:
                                if alt_clean not in self.multi_word_skills:
                                    self.multi_word_skills[alt_clean] = canonical
                            else:
                                if (
                                    alt_clean not in self.single_word_skills
                                    and (alt_clean not in GENERIC_SINGLE_WORD_STOPWORDS or alt_clean in self.priority_skills)
                                ):
                                    self.single_word_skills[alt_clean] = canonical

    def extract_skills(self, text: str) -> List[Dict]:
        """
        Extracts skills using O(N) n-gram tokenization and hash lookup.
        Prevents false-positives and achieves near-instant extraction.
        """
        if not text:
            return []
        
        text_lower = text.lower()
        # Tokenize words, preserving dots and hashes for tech
        tokens = re.findall(r'\b[a-z0-9_\+#\.]+\b', text_lower)
        num_tokens = len(tokens)
        
        found_skills: Dict[str, Dict] = {}

        def record_skill(match_key: str, canonical: str):
            clean_canonical = canonical.strip()
            # Normalize casing
            norm_key = clean_canonical.lower()
            
            # Filter any accidental generic stopwords
            if norm_key in GENERIC_SINGLE_WORD_STOPWORDS and norm_key not in self.priority_skills:
                return

            cat = self.priority_skills.get(norm_key, self.priority_skills.get(match_key, "Technical & Domain Skills"))
            if norm_key not in found_skills:
                found_skills[norm_key] = {
                    "skill": clean_canonical,
                    "canonical": clean_canonical,
                    "category": cat,
                    "frequency": 1
                }
            else:
                found_skills[norm_key]["frequency"] += 1

        # 1. Trigrams lookups (longest phrase priority)
        for i in range(num_tokens - 2):
            tri = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
            if tri in self.multi_word_skills:
                record_skill(tri, self.multi_word_skills[tri])

        # 2. Bigrams lookups
        for i in range(num_tokens - 1):
            bi = f"{tokens[i]} {tokens[i+1]}"
            if bi in self.multi_word_skills:
                record_skill(bi, self.multi_word_skills[bi])

        # 3. Single word lookups
        for t in tokens:
            if t in self.single_word_skills:
                record_skill(t, self.single_word_skills[t])

        results = sorted(list(found_skills.values()), key=lambda x: (x["category"] != "Technical & Domain Skills", x["frequency"]), reverse=True)
        return results

_extractor = None

def get_skill_extractor(skills_path: str = None) -> SkillExtractor:
    global _extractor
    if _extractor is None:
        _extractor = SkillExtractor(skills_path)
    return _extractor
