import csv
import os
import re
from typing import List, Dict

# Priority categories and canonical display names for technical & domain skills
SKILL_CATEGORY_MAP = {
    # Programming Languages
    "python": ("Python", "Programming Languages"),
    "java": ("Java", "Programming Languages"),
    "javascript": ("JavaScript", "Programming Languages"),
    "typescript": ("TypeScript", "Programming Languages"),
    "c++": ("C++", "Programming Languages"),
    "cpp": ("C++", "Programming Languages"),
    "c#": ("C#", "Programming Languages"),
    "csharp": ("C#", "Programming Languages"),
    "ruby": ("Ruby", "Programming Languages"),
    "php": ("PHP", "Programming Languages"),
    "go": ("Go", "Programming Languages"),
    "golang": ("Go", "Programming Languages"),
    "rust": ("Rust", "Programming Languages"),
    "kotlin": ("Kotlin", "Programming Languages"),
    "swift": ("Swift", "Programming Languages"),
    "dart": ("Dart", "Programming Languages"),
    "r": ("R", "Programming Languages"),
    "scala": ("Scala", "Programming Languages"),
    "sql": ("SQL", "Programming Languages"),
    "bash": ("Bash", "Programming Languages"),
    "shell": ("Shell", "Programming Languages"),
    "perl": ("Perl", "Programming Languages"),
    "groovy": ("Groovy", "Programming Languages"),
    "matlab": ("MATLAB", "Programming Languages"),
    "solidity": ("Solidity", "Programming Languages"),
    "abap": ("ABAP", "Programming Languages"),
    "vbscript": ("VBScript", "Programming Languages"),

    # Web & Frameworks
    "react": ("React", "Web & Frameworks"),
    "reactjs": ("React", "Web & Frameworks"),
    "react.js": ("React", "Web & Frameworks"),
    "node.js": ("Node.js", "Web & Frameworks"),
    "nodejs": ("Node.js", "Web & Frameworks"),
    "node js": ("Node.js", "Web & Frameworks"),
    "express": ("Express", "Web & Frameworks"),
    "expressjs": ("Express", "Web & Frameworks"),
    "express.js": ("Express", "Web & Frameworks"),
    "angular": ("Angular", "Web & Frameworks"),
    "angularjs": ("Angular", "Web & Frameworks"),
    "vue": ("Vue.js", "Web & Frameworks"),
    "vuejs": ("Vue.js", "Web & Frameworks"),
    "vue.js": ("Vue.js", "Web & Frameworks"),
    "next.js": ("Next.js", "Web & Frameworks"),
    "nextjs": ("Next.js", "Web & Frameworks"),
    "django": ("Django", "Web & Frameworks"),
    "flask": ("Flask", "Web & Frameworks"),
    "fastapi": ("FastAPI", "Web & Frameworks"),
    "spring": ("Spring", "Web & Frameworks"),
    "spring boot": ("Spring Boot", "Web & Frameworks"),
    "hibernate": ("Hibernate", "Web & Frameworks"),
    ".net": (".NET", "Web & Frameworks"),
    "dotnet": (".NET", "Web & Frameworks"),
    "asp.net": ("ASP.NET", "Web & Frameworks"),
    "laravel": ("Laravel", "Web & Frameworks"),
    "html": ("HTML", "Web & Frameworks"),
    "html5": ("HTML5", "Web & Frameworks"),
    "css": ("CSS", "Web & Frameworks"),
    "css3": ("CSS3", "Web & Frameworks"),
    "sass": ("Sass", "Web & Frameworks"),
    "tailwind": ("Tailwind CSS", "Web & Frameworks"),
    "tailwind css": ("Tailwind CSS", "Web & Frameworks"),
    "bootstrap": ("Bootstrap", "Web & Frameworks"),
    "flutter": ("Flutter", "Web & Frameworks"),
    "jquery": ("jQuery", "Web & Frameworks"),
    "ajax": ("AJAX", "Web & Frameworks"),
    "wordpress": ("WordPress", "Web & Frameworks"),
    "drupal": ("Drupal", "Web & Frameworks"),
    "redux": ("Redux", "Web & Frameworks"),
    "webpack": ("Webpack", "Web & Frameworks"),
    "rest api": ("REST API", "Web & Frameworks"),
    "restful api": ("REST API", "Web & Frameworks"),
    "graphql": ("GraphQL", "Web & Frameworks"),

    # AI & Data Science
    "machine learning": ("Machine Learning", "AI & Data Science"),
    "ml": ("Machine Learning", "AI & Data Science"),
    "deep learning": ("Deep Learning", "AI & Data Science"),
    "natural language processing": ("Natural Language Processing", "AI & Data Science"),
    "nlp": ("NLP", "AI & Data Science"),
    "computer vision": ("Computer Vision", "AI & Data Science"),
    "tensorflow": ("TensorFlow", "AI & Data Science"),
    "pytorch": ("PyTorch", "AI & Data Science"),
    "keras": ("Keras", "AI & Data Science"),
    "scikit-learn": ("Scikit-learn", "AI & Data Science"),
    "scikit learn": ("Scikit-learn", "AI & Data Science"),
    "sklearn": ("Scikit-learn", "AI & Data Science"),
    "pandas": ("Pandas", "AI & Data Science"),
    "numpy": ("NumPy", "AI & Data Science"),
    "scipy": ("SciPy", "AI & Data Science"),
    "matplotlib": ("Matplotlib", "AI & Data Science"),
    "seaborn": ("Seaborn", "AI & Data Science"),
    "data science": ("Data Science", "AI & Data Science"),
    "data analysis": ("Data Analysis", "AI & Data Science"),
    "data analytics": ("Data Analytics", "AI & Data Science"),
    "data mining": ("Data Mining", "AI & Data Science"),
    "data warehouse": ("Data Warehouse", "AI & Data Science"),
    "data models": ("Data Modeling", "AI & Data Science"),
    "business intelligence": ("Business Intelligence", "AI & Data Science"),
    "statistics": ("Statistics", "AI & Data Science"),
    "big data": ("Big Data", "AI & Data Science"),
    "hadoop": ("Hadoop", "AI & Data Science"),
    "spark": ("Apache Spark", "AI & Data Science"),
    "pyspark": ("PySpark", "AI & Data Science"),
    "power bi": ("Power BI", "AI & Data Science"),
    "tableau": ("Tableau", "AI & Data Science"),

    # Cloud & DevOps
    "docker": ("Docker", "Cloud & DevOps"),
    "kubernetes": ("Kubernetes", "Cloud & DevOps"),
    "aws": ("AWS", "Cloud & DevOps"),
    "amazon web services": ("AWS", "Cloud & DevOps"),
    "azure": ("Azure", "Cloud & DevOps"),
    "gcp": ("Google Cloud", "Cloud & DevOps"),
    "google cloud": ("Google Cloud", "Cloud & DevOps"),
    "cloud computing": ("Cloud Computing", "Cloud & DevOps"),
    "cloud technologies": ("Cloud Computing", "Cloud & DevOps"),
    "ci/cd": ("CI/CD", "Cloud & DevOps"),
    "jenkins": ("Jenkins", "Cloud & DevOps"),
    "git": ("Git", "Cloud & DevOps"),
    "github": ("GitHub", "Cloud & DevOps"),
    "gitlab": ("GitLab", "Cloud & DevOps"),
    "terraform": ("Terraform", "Cloud & DevOps"),
    "ansible": ("Ansible", "Cloud & DevOps"),
    "puppet": ("Puppet", "Cloud & DevOps"),
    "linux": ("Linux", "Cloud & DevOps"),
    "kali linux": ("Kali Linux", "Cloud & DevOps"),
    "devops": ("DevOps", "Cloud & DevOps"),
    "microservices": ("Microservices", "Cloud & DevOps"),
    "kafka": ("Kafka", "Cloud & DevOps"),
    "apache tomcat": ("Apache Tomcat", "Cloud & DevOps"),
    "nginx": ("Nginx", "Cloud & DevOps"),

    # Databases
    "mongodb": ("MongoDB", "Databases"),
    "mysql": ("MySQL", "Databases"),
    "postgresql": ("PostgreSQL", "Databases"),
    "postgres": ("PostgreSQL", "Databases"),
    "oracle": ("Oracle", "Databases"),
    "redis": ("Redis", "Databases"),
    "sqlite": ("SQLite", "Databases"),
    "cassandra": ("Cassandra", "Databases"),
    "elasticsearch": ("Elasticsearch", "Databases"),
    "neo4j": ("Neo4j", "Databases"),
    "sql server": ("SQL Server", "Databases"),
    "db2": ("IBM DB2", "Databases"),
    "nosql": ("NoSQL", "Databases"),
    "database": ("Database Systems", "Databases"),

    # Core Software Engineering & Domain
    "data structures": ("Data Structures", "Software Engineering"),
    "algorithms": ("Algorithms", "Software Engineering"),
    "system design": ("System Design", "Software Engineering"),
    "operating systems": ("Operating Systems", "Software Engineering"),
    "computer science": ("Computer Science", "Software Engineering"),
    "computer engineering": ("Computer Engineering", "Software Engineering"),
    "agile development": ("Agile Development", "Software Engineering"),
    "project management": ("Project Management", "Software Engineering"),
    "business analysis": ("Business Analysis", "Software Engineering"),
    "android": ("Android", "Software Engineering"),
    "ios": ("iOS", "Software Engineering"),
    "xcode": ("Xcode", "Software Engineering"),
    "eclipse": ("Eclipse", "Software Engineering"),
    "unity": ("Unity", "Software Engineering"),
    "embedded systems": ("Embedded Systems", "Software Engineering"),
    "networking": ("Networking", "Software Engineering"),
    "security": ("Security", "Software Engineering"),
    "cisco": ("Cisco Networking", "Software Engineering"),
    "smart contract": ("Smart Contracts", "Software Engineering"),
    "blockchain": ("Blockchain", "Software Engineering"),
    "etl": ("ETL", "AI & Data Science"),
    "selenium": ("Selenium", "Software Engineering"),
    "junit": ("JUnit", "Software Engineering"),
    "pytest": ("Pytest", "Software Engineering"),
}

# Comprehensive blacklist of generic single words and irrelevant ESCO occupational/non-skill labels
IRRELEVANT_SKILL_TERMS = {
    # Generic English words that appear in ESCO
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
    "rose", "sail", "salt", "says", "seek", "seem", "seen", "self", "sell", "shut",
    "sick", "skin", "slow", "snow", "soft", "soil", "some", "song", "soon", "soul",
    "soup", "spot", "star", "such", "sure", "take", "talk", "tall", "tend", "test",
    "than", "that", "them", "then", "they", "thin", "this", "thus", "time", "tiny",
    "tips", "tire", "told", "took", "tool", "tube", "twin", "upon", "used", "uses",
    "vain", "vary", "vast", "very", "vote", "wage", "wake", "want", "ward", "warn",
    "ways", "weak", "well", "went", "were", "what", "when", "whom", "will", "wine",
    "wing", "wise", "with", "wore", "worm", "worn", "wrap", "yeah", "zero", "zone",
    "service", "create", "check", "health", "equipment", "operation", "maintenance",
    "energy", "history", "logic", "migration", "scratch", "assembly", "logging",
    "ecosystems", "decommissioning", "improvise", "crafting", "troubleshoot",
    "consultation", "ethics", "aesthetics", "chef", "us", "set-up", "governance",
    "guidance", "mining", "programming",

    # Irrelevant non-technical/non-career ESCO entries
    "prayer", "pregnancy", "childbirth", "hair", "obesity", "imitation jewellery",
    "reflexology", "medicines", "natural gas", "petroleum", "politics", "philosophy",
    "literature", "sociology", "criminology", "genetics", "nutrition", "dietetics",
    "exercise physiology", "food science", "fine arts", "pneumatics", "crimping",
    "sensors", "photography", "solar energy", "construction industry",
    "maintenance of footwear manufacturing machines",
    "mining, construction and civil engineering machinery products",
    "staple spinning machine technology",
    "collect tourist information",
    "guidance, navigation and control",
    "information governance compliance",

    # Spoken languages
    "english", "hindi", "marathi", "tamil", "punjabi", "german", "french",
    "swedish", "latin", "castilian spanish",

    # Vague conversational verb phrases in ESCO
    "gather data", "unstructured data", "work independently", "work efficiently",
    "solve problems", "solve technical problems", "make decisions", "meet deadlines",
    "lead a team", "manage resources", "cope with stress", "personal development",
    "company policies", "promote company", "represent the company", "resolve conflicts",
    "working condition", "quality standards", "business model", "business processes",
    "sales activities", "manage inventory", "Identify available services",
    "show initiative", "team building", "customer service", "communication"
}


class SkillExtractor:
    def __init__(self, skills_csv_path: str = None):
        if skills_csv_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            skills_csv_path = os.path.join(base_dir, "data", "raw", "skills.csv")

        self.skills_csv_path = skills_csv_path
        self.single_word_skills: Dict[str, str] = {}
        self.multi_word_skills: Dict[str, str] = {}
        self.skill_categories: Dict[str, str] = {}
        self._load_skills()

    def _register(self, phrase_lower: str, display_name: str, category: str):
        if not phrase_lower or phrase_lower in IRRELEVANT_SKILL_TERMS:
            return
        if display_name.lower() in IRRELEVANT_SKILL_TERMS:
            return
        self.skill_categories[display_name.lower()] = category
        if " " in phrase_lower:
            self.multi_word_skills[phrase_lower] = display_name
        else:
            if len(phrase_lower) >= 2 or phrase_lower in ("r", "c"):
                self.single_word_skills[phrase_lower] = display_name

    def _load_skills(self):
        """Loads priority technical skills and clean canonical labels from skills.csv."""
        # 1. Register curated priority technical & domain skills
        for raw_key, (display_name, category) in SKILL_CATEGORY_MAP.items():
            self._register(raw_key.lower(), display_name, category)

        if not os.path.exists(self.skills_csv_path):
            return

        #Prefixes of occupational verb phrases in ESCO that are not concrete resume skills
        verb_prefixes = (
            "manage ", "supervise ", "apply ", "control ", "identify ", "perform ",
            "ensure ", "show ", "train ", "lead ", "handle ", "develop ", "maintain ",
            "operate ", "conduct ", "assist ", "advise ", "prepare ", "coordinate ",
            "monitor ", "check ", "provide ", "use ", "create ", "carry out ",
            "organize ", "organise ", "inspect ", "install ", "repair ", "clean ",
            "assemble ", "collect ", "compile ", "promote ", "represent ", "resolve ",
            "solve ", "make ", "meet ", "work ", "cope ", "gather "
        )

        with open(self.skills_csv_path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            next(reader, None)
            for row in reader:
                if not row or not row[0].strip():
                    continue
                canonical = row[0].strip()
                canonical_lower = canonical.lower()

                if canonical_lower in IRRELEVANT_SKILL_TERMS:
                    continue
                if any(canonical_lower.startswith(vp) for vp in verb_prefixes):
                    continue
                if "," in canonical_lower or len(canonical_lower.split()) > 3:
                    continue

                # If already registered in priority map, keep priority display name & category
                if canonical_lower in SKILL_CATEGORY_MAP:
                    continue

                display_name = canonical.title() if canonical.islower() else canonical
                if " " in canonical_lower:
                    self._register(canonical_lower, display_name, "Technical & Domain Skills")
                else:
                    if len(canonical_lower) >= 3:
                        self._register(canonical_lower, display_name, "Technical & Domain Skills")

    def extract_skills(self, text: str) -> List[Dict]:
        """
        Extracts relevant technical and professional skills using O(N) n-gram tokenization.
        """
        if not text:
            return []

        text_lower = text.lower()
        tokens = re.findall(r"\b[a-z0-9_\+#\.\/]+\b", text_lower)
        # Strip trailing periods from normal words while keeping .net, node.js, etc.
        cleaned_tokens = []
        for t in tokens:
            t_stripped = t.rstrip(".")
            if t_stripped:
                cleaned_tokens.append(t_stripped)
        tokens = cleaned_tokens
        num_tokens = len(tokens)

        found_skills: Dict[str, Dict] = {}

        def record_skill(match_key: str, canonical: str):
            clean_canonical = canonical.strip()
            norm_key = clean_canonical.lower()
            if norm_key in IRRELEVANT_SKILL_TERMS or match_key in IRRELEVANT_SKILL_TERMS:
                return

            cat = self.skill_categories.get(norm_key, "Technical & Domain Skills")
            if norm_key not in found_skills:
                found_skills[norm_key] = {
                    "skill": clean_canonical,
                    "canonical": clean_canonical,
                    "category": cat,
                    "frequency": 1
                }
            else:
                found_skills[norm_key]["frequency"] += 1

        # 1. Trigrams
        for i in range(num_tokens - 2):
            tri = f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}"
            if tri in self.multi_word_skills:
                record_skill(tri, self.multi_word_skills[tri])

        # 2. Bigrams
        for i in range(num_tokens - 1):
            bi = f"{tokens[i]} {tokens[i+1]}"
            if bi in self.multi_word_skills:
                record_skill(bi, self.multi_word_skills[bi])

        # 3. Unigrams
        for t in tokens:
            if t in self.single_word_skills:
                record_skill(t, self.single_word_skills[t])

        results = sorted(
            list(found_skills.values()),
            key=lambda x: (x["category"] != "Technical & Domain Skills", x["frequency"]),
            reverse=True
        )
        return results


_extractor = None


def get_skill_extractor(skills_path: str = None) -> SkillExtractor:
    global _extractor
    if _extractor is None:
        _extractor = SkillExtractor(skills_path)
    return _extractor
