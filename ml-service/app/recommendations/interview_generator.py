from typing import List, Dict

ROLE_QUESTION_BANK = {
    "JavaScript Developer": [
        {
            "category": "Technical",
            "topic": "Event Loop & Asynchronous JS",
            "difficulty": "Intermediate",
            "question": "Can you explain how the JavaScript Event Loop coordinates the Call Stack, Macro-task Queue, and Micro-task Queue?",
            "answer_structure": "1. Define single-threaded non-blocking runtime. 2. Explain synchronous execution on call stack. 3. Detail promise resolution in microtask queue vs setTimeout in macrotask queue. 4. Give a concrete example.",
            "prep_tips": "Trace console.log order of a script mixing Promise.then and setTimeout."
        },
        {
            "category": "Conceptual",
            "topic": "Closures & Memory Management",
            "difficulty": "Intermediate",
            "question": "What is a closure in JavaScript, and what are its practical use cases and memory leak risks?",
            "answer_structure": "1. Explain lexical scoping. 2. Give use case like data privacy or memoization. 3. Mention dangling references retaining memory in heap.",
            "prep_tips": "Write a clean function factory to illustrate encapsulation."
        }
    ],
    "Node js developer": [
        {
            "category": "Technical",
            "topic": "Stream Processing & Backpressure",
            "difficulty": "Advanced",
            "question": "How do streams work in Node.js, and how do you handle backpressure when reading from a fast source and writing to a slow destination?",
            "answer_structure": "1. Explain Readable, Writable, Duplex, Transform streams. 2. Define backpressure when buffer highWaterMark is exceeded. 3. Explain how pipe() handles drain events automatically.",
            "prep_tips": "Demonstrate understanding of memory efficiency over loading whole files into RAM with fs.readFile."
        },
        {
            "category": "Scenario-based",
            "topic": "Production Error Handling & Clustering",
            "difficulty": "Intermediate",
            "question": "Suppose your Node.js microservice crashes intermittently under high concurrency with an unhandled rejection. How would you diagnose and prevent downtime?",
            "answer_structure": "1. Mention process event listeners (unhandledRejection, uncaughtException). 2. Logging and tracing with APM. 3. Process management with PM2 / Docker health checks. 4. Graceful shutdown.",
            "prep_tips": "Emphasize graceful shutdown and proper container health-check endpoints."
        }
    ],
    "Machine Learning": [
        {
            "category": "Technical",
            "topic": "Bias-Variance Tradeoff & Regularization",
            "difficulty": "Intermediate",
            "question": "How do you diagnose high bias versus high variance in an ML model, and what techniques would you apply to address each?",
            "answer_structure": "1. Compare training loss vs validation loss curves. 2. Address underfitting (high bias): add features, decrease regularization, increase model complexity. 3. Address overfitting (high variance): L1/L2 regularization, dropout, cross-validation, more data.",
            "prep_tips": "Be ready to write mathematical loss penalty terms for Ridge (L2) and Lasso (L1)."
        },
        {
            "category": "Conceptual",
            "topic": "Evaluation Metrics for Imbalanced Datasets",
            "difficulty": "Intermediate",
            "question": "Why is accuracy a misleading metric for imbalanced classification, and what alternative metrics should be used?",
            "answer_structure": "1. Explain the majority class paradox (e.g. 99% accuracy on 1% positive case). 2. Detail Precision, Recall, Macro F1, and PR-AUC. 3. Explain threshold tuning.",
            "prep_tips": "Connect this directly to your resume classification project where macro F1 is essential."
        }
    ],
    "DevOps Engineer": [
        {
            "category": "Technical",
            "topic": "Containerization & Multi-stage Builds",
            "difficulty": "Intermediate",
            "question": "How do multi-stage Docker builds optimize image size and security in a continuous delivery pipeline?",
            "answer_structure": "1. Separate build dependencies (compilers, devDependencies) from runtime artifacts. 2. Produce minimal distroless or alpine base image. 3. Reduce attack surface and deployment transfer time.",
            "prep_tips": "Highlight how running containers as non-root users improves container security."
        },
        {
            "category": "Scenario-based",
            "topic": "Zero-Downtime Deployments",
            "difficulty": "Advanced",
            "question": "Compare Blue-Green deployment with Canary releases in Kubernetes. When would you choose one over the other?",
            "answer_structure": "1. Define Blue-Green (instant traffic switch between identical environments). 2. Define Canary (incremental traffic routing). 3. Contrast rollback complexity and database schema migration compatibility.",
            "prep_tips": "Mention ingress controllers or service meshes like Istio for weighted traffic splitting."
        }
    ]
}

class InterviewQuestionGenerator:
    def __init__(self):
        self.role_bank = ROLE_QUESTION_BANK

    def generate_questions(
        self,
        job_title: str,
        job_description: str = "",
        candidate_skills: List[str] = None,
        missing_skills: List[str] = None,
        predicted_category: str = ""
    ) -> List[Dict]:
        """
        Dynamically synthesizes role, skill-gap, and behavioral interview questions.
        """
        candidate_skills = candidate_skills or []
        missing_skills = missing_skills or []
        questions = []
        
        # 1. Fetch matching or closest role questions
        matched_role = None
        for role_key in self.role_bank:
            if role_key.lower() in job_title.lower() or job_title.lower() in role_key.lower():
                matched_role = role_key
                break
        
        if matched_role:
            questions.extend(self.role_bank[matched_role])
        else:
            # Fallback to software engineering questions
            questions.append({
                "category": "Technical",
                "topic": f"System Architecture & {job_title}",
                "difficulty": "Intermediate",
                "question": f"In your experience targeting a {job_title} role, how do you design decoupled, scalable architectures that satisfy both throughput and latency requirements?",
                "answer_structure": "1. Requirements gathering (functional vs non-functional). 2. High-level architecture components. 3. Data flow and bottleneck mitigation. 4. Observability and monitoring.",
                "prep_tips": "Use the STAR method (Situation, Task, Action, Result) when discussing your past engineering implementations."
            })
            questions.append({
                "category": "Conceptual",
                "topic": "Code Quality & Testing",
                "difficulty": "Intermediate",
                "question": "What is your testing strategy when shipping mission-critical services? How do you balance unit, integration, and end-to-end tests?",
                "answer_structure": "1. Testing pyramid philosophy. 2. Fast feedback from isolated unit tests. 3. Integration tests for database and API contracts. 4. CI automated gatekeeping.",
                "prep_tips": "Mention code coverage metrics and mock isolation."
            })
            
        # 2. Add Skill-Gap Targeted Questions
        if missing_skills:
            gap_skill = missing_skills[0]
            questions.append({
                "category": "Skill-gap-focused",
                "topic": f"Core Competency in {gap_skill}",
                "difficulty": "Intermediate",
                "question": f"This position explicitly requires proficiency with {gap_skill}. How would you rapidly ramp up, apply, and demonstrate production reliability with {gap_skill}?",
                "answer_structure": f"1. Acknowledge existing analogous knowledge (how your existing skills bridge to {gap_skill}). 2. Rapid prototyping and sandbox experiments. 3. Implementing verified best practices and automated tests.",
                "prep_tips": f"Review official documentation and core architecture diagrams for {gap_skill} prior to the interview."
            })
            
        # 3. Add Candidate Skill Strength Question
        if candidate_skills:
            strong_skill = candidate_skills[0]
            questions.append({
                "category": "Technical",
                "topic": f"Deep Dive: {strong_skill}",
                "difficulty": "Advanced",
                "question": f"Your resume highlights strong hands-on experience in {strong_skill}. What was the most technically challenging problem you solved using {strong_skill}, and how did you resolve it?",
                "answer_structure": "1. Clear problem statement and technical constraints. 2. Evaluated alternatives. 3. Specific implementation details. 4. Measurable outcome (performance gain, latency drop, bug reduction).",
                "prep_tips": "Quantify outcomes with concrete numbers (e.g., 'reduced API response time by 40%')."
            })
            
        # 4. Add Behavioral / HR Question
        questions.append({
            "category": "HR & Behavioral",
            "topic": "Collaboration & Conflict Resolution",
            "difficulty": "Beginner",
            "question": "Describe a scenario where you had a technical disagreement with a teammate or stakeholder regarding an architectural decision. How did you resolve it?",
            "answer_structure": "1. Describe the disagreement neutrally without blaming. 2. Focus on objective criteria (benchmarks, trade-offs, maintainability). 3. Document the consensus reached and long-term project outcome.",
            "prep_tips": "Emphasize emotional intelligence, active listening, and putting user/system health first."
        })
        
        return questions

_interview_generator = None

def get_interview_generator() -> InterviewQuestionGenerator:
    global _interview_generator
    if _interview_generator is None:
        _interview_generator = InterviewQuestionGenerator()
    return _interview_generator
