from typing import List, Dict

class CareerRoadmapGenerator:
    def generate_roadmap(
        self,
        candidate_skills: List[str] = None,
        missing_skills: List[str] = None,
        target_role: str = "Software Engineer",
        predicted_category: str = ""
    ) -> List[Dict]:
        """
        Builds a customized 6-stage career roadmap based on candidate's real skill profile.
        """
        candidate_skills = candidate_skills or []
        missing_skills = missing_skills or []
        
        primary_gap = missing_skills[0] if missing_skills else "Cloud Architecture"
        secondary_gap = missing_skills[1] if len(missing_skills) > 1 else "Testing & CI/CD"
        top_skill = candidate_skills[0] if candidate_skills else "Core Programming"
        
        stages = [
            {
                "stage": 1,
                "title": "Stage 1: Resume & ATS Optimization",
                "duration": "1 - 2 Weeks",
                "priority": "High",
                "objective": "Align resume structure with automated ATS standards and highlight quantifiable achievements.",
                "tasks": [
                    {
                        "task_id": "s1-t1",
                        "name": "Quantify bullet points with impact metrics",
                        "description": "Convert descriptive tasks into quantifiable achievements (e.g. 'Improved query latency by 35%').",
                        "completed": False
                    },
                    {
                        "task_id": "s1-t2",
                        "name": f"Incorporate target role keywords ({target_role})",
                        "description": "Ensure high-frequency industry terms from job descriptions are present in your skills and summary.",
                        "completed": False
                    },
                    {
                        "task_id": "s1-t3",
                        "name": "Standardize formatting for ATS parsers",
                        "description": "Use clean single-column layout, standard headers (Experience, Skills, Education), and bulleted lists.",
                        "completed": False
                    }
                ],
                "recommended_resource": "ASCEND AI ATS Optimization Engine & Resume Enhancer"
            },
            {
                "stage": 2,
                "title": f"Stage 2: Core Competency Deepening ({top_skill})",
                "duration": "2 - 3 Weeks",
                "priority": "Medium",
                "objective": f"Solidify advanced mastery and architectural best practices in {top_skill}.",
                "tasks": [
                    {
                        "task_id": "s2-t1",
                        "name": f"Master advanced patterns in {top_skill}",
                        "description": "Study design patterns, concurrency models, and memory profiling.",
                        "completed": False
                    },
                    {
                        "task_id": "s2-t2",
                        "name": "Conduct code refactoring & benchmark tests",
                        "description": "Profile existing codebase performance and write clean, modular, tested abstractions.",
                        "completed": False
                    }
                ],
                "recommended_resource": f"Official documentation and advanced production patterns for {top_skill}"
            },
            {
                "stage": 3,
                "title": f"Stage 3: Targeted Skill-Gap Acquisition ({primary_gap} & {secondary_gap})",
                "duration": "3 - 4 Weeks",
                "priority": "High",
                "objective": f"Close high-priority missing requirements ({primary_gap}) identified by job matching.",
                "tasks": [
                    {
                        "task_id": "s3-t1",
                        "name": f"Complete foundational coursework in {primary_gap}",
                        "description": f"Work through interactive labs and documentation covering {primary_gap}.",
                        "completed": False
                    },
                    {
                        "task_id": "s3-t2",
                        "name": f"Build proof-of-concept integrating {primary_gap}",
                        "description": f"Create an independent microservice demonstrating practical usage of {primary_gap}.",
                        "completed": False
                    },
                    {
                        "task_id": "s3-t3",
                        "name": f"Integrate {secondary_gap} into project workflow",
                        "description": f"Implement automated testing and validation using {secondary_gap}.",
                        "completed": False
                    }
                ],
                "recommended_resource": f"ASCEND AI Recommended Courses: {primary_gap}"
            },
            {
                "stage": 4,
                "title": "Stage 4: Portfolio & Production Projects",
                "duration": "3 - 5 Weeks",
                "priority": "High",
                "objective": "Build and deploy an end-to-end full-stack or ML project that showcases your stack.",
                "tasks": [
                    {
                        "task_id": "s4-t1",
                        "name": "Develop production-ready capstone project",
                        "description": f"Combine {top_skill} and newly acquired {primary_gap} into a deployed system with CI/CD.",
                        "completed": False
                    },
                    {
                        "task_id": "s4-t2",
                        "name": "Write comprehensive documentation & README",
                        "description": "Include architecture diagrams, live demo links, API contracts, and benchmark results.",
                        "completed": False
                    }
                ],
                "recommended_resource": "GitHub public repository & containerized deployment (e.g. Render / AWS / Docker)"
            },
            {
                "stage": 5,
                "title": "Stage 5: Technical & Behavioral Interview Drills",
                "duration": "2 - 3 Weeks",
                "priority": "High",
                "objective": f"Prepare for technical whiteboard, system design, and behavioral questions for {target_role}.",
                "tasks": [
                    {
                        "task_id": "s5-t1",
                        "name": "Practice role-specific mock interview questions",
                        "description": "Complete question sets generated by the ASCEND AI Interview Preparation engine.",
                        "completed": False
                    },
                    {
                        "task_id": "s5-t2",
                        "name": "Master system design fundamentals",
                        "description": "Study caching (Redis), database indexing, message queues, and horizontal scaling.",
                        "completed": False
                    },
                    {
                        "task_id": "s5-t3",
                        "name": "Draft STAR method responses for behavioral stories",
                        "description": "Prepare 4-5 core stories covering leadership, conflict resolution, and technical setbacks.",
                        "completed": False
                    }
                ],
                "recommended_resource": "ASCEND AI Interview Preparation Module"
            },
            {
                "stage": 6,
                "title": "Stage 6: Strategic Job Applications & Networking",
                "duration": "Ongoing",
                "priority": "Medium",
                "objective": "Target tailored applications to roles where your compatibility score exceeds 75%.",
                "tasks": [
                    {
                        "task_id": "s6-t1",
                        "name": "Run batch candidate screening against top 10 positions",
                        "description": "Analyze match percentages and prioritize roles with high skill coverage.",
                        "completed": False
                    },
                    {
                        "task_id": "s6-t2",
                        "name": "Connect with engineering hiring managers and recruiters",
                        "description": "Share customized resume summaries tailored specifically to open job requisitions.",
                        "completed": False
                    }
                ],
                "recommended_resource": "ASCEND AI Job Matching & ATS Analytics"
            }
        ]
        return stages

_roadmap_generator = None

def get_career_roadmap_generator() -> CareerRoadmapGenerator:
    global _roadmap_generator
    if _roadmap_generator is None:
        _roadmap_generator = CareerRoadmapGenerator()
    return _roadmap_generator
