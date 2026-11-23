from typing import List, Dict

CURATED_COURSES = [
    # Python & Programming
    {
        "course_id": "py-01",
        "title": "Programming for Everybody (Getting Started with Python)",
        "skill": "Python",
        "provider": "Coursera (University of Michigan)",
        "difficulty": "Beginner",
        "url": "https://www.coursera.org/learn/python",
        "description": "Learn the basics of programming computers using Python, data structures, and variables."
    },
    {
        "course_id": "py-02",
        "title": "CS50's Introduction to Programming with Python",
        "skill": "Python",
        "provider": "edX / Harvard University",
        "difficulty": "Intermediate",
        "url": "https://cs50.harvard.edu/python/",
        "description": "An introduction to programming using Python, emphasizing problem-solving and software design."
    },
    # Web & Full Stack
    {
        "course_id": "react-01",
        "title": "Legacy Front End Development Libraries (React & Redux)",
        "skill": "React",
        "provider": "freeCodeCamp",
        "difficulty": "Intermediate",
        "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/",
        "description": "Learn how to build single-page web applications with React, components, hooks, and state management."
    },
    {
        "course_id": "node-01",
        "title": "Server-side Development with NodeJS, Express and MongoDB",
        "skill": "Node.js",
        "provider": "Coursera (HKUST)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/server-side-nodejs",
        "description": "Build scalable RESTful APIs, manage databases with Mongoose, and implement JWT authentication."
    },
    {
        "course_id": "js-01",
        "title": "JavaScript Algorithms and Data Structures",
        "skill": "JavaScript",
        "provider": "freeCodeCamp",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
        "description": "Master fundamental ES6+ concepts, functional programming, and object-oriented patterns."
    },
    # Machine Learning & AI
    {
        "course_id": "ml-01",
        "title": "Machine Learning Specialization",
        "skill": "Machine Learning",
        "provider": "Coursera (DeepLearning.AI & Stanford)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "description": "Foundational ML course covering supervised learning, neural networks, and decision trees taught by Andrew Ng."
    },
    {
        "course_id": "dl-01",
        "title": "Deep Learning Specialization",
        "skill": "Deep Learning",
        "provider": "Coursera (DeepLearning.AI)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "description": "Master neural networks, backpropagation, CNNs, transformers, and sequence models using TensorFlow."
    },
    {
        "course_id": "nlp-01",
        "title": "Natural Language Processing Specialization",
        "skill": "NLP",
        "provider": "Coursera (DeepLearning.AI)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/specializations/natural-language-processing",
        "description": "Learn sentiment analysis, word embeddings, sequence-to-sequence models, and transformer architectures."
    },
    # Databases & SQL
    {
        "course_id": "sql-01",
        "title": "Databases and SQL for Data Science with Python",
        "skill": "SQL",
        "provider": "Coursera (IBM)",
        "difficulty": "Beginner",
        "url": "https://www.coursera.org/learn/sql-data-science",
        "description": "Comprehensive practical SQL querying, joins, aggregation, subqueries, and database schema creation."
    },
    {
        "course_id": "mongo-01",
        "title": "MongoDB Basics and Schema Design",
        "skill": "MongoDB",
        "provider": "MongoDB University",
        "difficulty": "Intermediate",
        "url": "https://learn.mongodb.com/",
        "description": "Master document modeling, CRUD operations, aggregation pipelines, and indexing strategies in MongoDB."
    },
    # Cloud & DevOps
    {
        "course_id": "docker-01",
        "title": "Docker for Developers",
        "skill": "Docker",
        "provider": "Coursera / edX",
        "difficulty": "Intermediate",
        "url": "https://www.docker.com/101-tutorial/",
        "description": "Containerize full-stack applications, write multi-stage Dockerfiles, and orchestrate with Docker Compose."
    },
    {
        "course_id": "k8s-01",
        "title": "Introduction to Kubernetes",
        "skill": "Kubernetes",
        "provider": "The Linux Foundation / edX",
        "difficulty": "Intermediate",
        "url": "https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes",
        "description": "Deploy, scale, and manage containerized microservices across cloud clusters."
    },
    {
        "course_id": "aws-01",
        "title": "AWS Cloud Technical Essentials",
        "skill": "AWS",
        "provider": "Coursera (AWS Training)",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.coursera.org/learn/aws-cloud-technical-essentials",
        "description": "Fundamental AWS security, IAM, EC2, S3, RDS, Lambda, and cloud architecture design."
    },
    # Mobile
    {
        "course_id": "flutter-01",
        "title": "Flutter & Dart - The Complete Guide",
        "skill": "Flutter",
        "provider": "Flutter Official Documentation",
        "difficulty": "Intermediate",
        "url": "https://docs.flutter.dev/get-started/codelab",
        "description": "Build high-performance cross-platform Android and iOS applications with Dart and Flutter widgets."
    },
    # Java
    {
        "course_id": "java-01",
        "title": "Java Programming: Solving Problems with Software",
        "skill": "Java",
        "provider": "Coursera (Duke University)",
        "difficulty": "Beginner",
        "url": "https://www.coursera.org/learn/java-programming",
        "description": "Core object-oriented programming concepts in Java, algorithms, and debugging methodologies."
    }
]

class CourseRecommender:
    def __init__(self):
        self.catalog = CURATED_COURSES

    def recommend_for_skills(
        self,
        missing_skills: List[str],
        target_role: str = "",
        limit: int = 6
    ) -> List[Dict]:
        """
        Recommends verified courses matching the candidate's missing skills.
        """
        if not missing_skills:
            # Fallback to general career advancement courses
            return [
                {**course, "reason": f"Recommended to reinforce core competencies for {target_role or 'software roles'}."}
                for course in self.catalog[:limit]
            ]

        missing_lower = [s.lower() for s in missing_skills]
        recommended = []
        seen_course_ids = set()
        seen_urls = set()

        for course in self.catalog:
            course_skill = course["skill"].lower()
            cid = course["course_id"]
            curl = course["url"].strip().lower()
            # Match directly or by substring
            if any(m in course_skill or course_skill in m for m in missing_lower):
                if cid not in seen_course_ids and curl not in seen_urls:
                    seen_course_ids.add(cid)
                    seen_urls.add(curl)
                    recommended.append({
                        **course,
                        "reason": f"Directly addresses your identified skill gap in '{course['skill']}' required for {target_role or 'this role'}."
                    })
                    if len(recommended) >= limit:
                        break

        # If we need more recommendations, supplement from relevant courses without duplication
        if len(recommended) < limit:
            for course in self.catalog:
                cid = course["course_id"]
                curl = course["url"].strip().lower()
                if cid not in seen_course_ids and curl not in seen_urls:
                    seen_course_ids.add(cid)
                    seen_urls.add(curl)
                    recommended.append({
                        **course,
                        "reason": f"Foundational industry qualification beneficial for advancement in {target_role or 'tech careers'}."
                    })
                    if len(recommended) >= limit:
                        break

        return recommended[:limit]

_recommender = None

def get_course_recommender() -> CourseRecommender:
    global _recommender
    if _recommender is None:
        _recommender = CourseRecommender()
    return _recommender
