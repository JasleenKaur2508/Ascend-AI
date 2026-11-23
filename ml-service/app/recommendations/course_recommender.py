from typing import List, Dict

CURATED_COURSES = [
    # Python & Programming
    {
        "course_id": "py-01",
        "title": "CS50's Introduction to Programming with Python",
        "skill": "Python",
        "provider": "edX / Harvard University",
        "difficulty": "Beginner to Intermediate",
        "url": "https://cs50.harvard.edu/python/",
        "description": "Comprehensive introduction to programming using Python, data structures, testing, and software design."
    },
    {
        "course_id": "java-01",
        "title": "Java Programming and Software Engineering Fundamentals",
        "skill": "Java",
        "provider": "Coursera (Duke University)",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.coursera.org/specializations/java-programming",
        "description": "Core object-oriented programming concepts in Java, data structures, algorithms, and debugging methodologies."
    },
    {
        "course_id": "js-01",
        "title": "JavaScript Algorithms and Data Structures",
        "skill": "JavaScript",
        "provider": "freeCodeCamp",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/",
        "description": "Master modern ES6+ JavaScript, asynchronous programming, DOM manipulation, and algorithmic problem solving."
    },
    {
        "course_id": "ts-01",
        "title": "Learn TypeScript — Official Interactive Handbook",
        "skill": "TypeScript",
        "provider": "Microsoft / TypeScript Official",
        "difficulty": "Intermediate",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "description": "Master static type systems, interfaces, generics, union types, and enterprise TypeScript architecture."
    },
    # Web & Full Stack
    {
        "course_id": "react-01",
        "title": "Front End Development Libraries (React & State Architecture)",
        "skill": "React",
        "provider": "freeCodeCamp",
        "difficulty": "Intermediate",
        "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/",
        "description": "Build modern single-page web applications with React, components, hooks, and predictable state management."
    },
    {
        "course_id": "node-01",
        "title": "Developing Back-End Apps with Node.js and Express",
        "skill": "Node.js",
        "provider": "Coursera (IBM)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/developing-backend-apps-with-nodejs-and-express",
        "description": "Build scalable server-side applications, asynchronous event loops, and production Node.js services."
    },
    {
        "course_id": "express-01",
        "title": "Back End Development and APIs with Express.js",
        "skill": "Express",
        "provider": "freeCodeCamp",
        "difficulty": "Intermediate",
        "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
        "description": "Design middleware pipelines, routing controllers, authentication, and microservices using Express."
    },
    {
        "course_id": "rest-01",
        "title": "RESTful Microservices & API Design Guidelines",
        "skill": "REST API",
        "provider": "Coursera (Google Cloud)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/api-design-apigee-gcp",
        "description": "Architect clean REST APIs with OpenAPI specifications, pagination, rate limiting, and OAuth2/JWT security."
    },
    # Machine Learning & Data Science
    {
        "course_id": "ml-01",
        "title": "Machine Learning Specialization",
        "skill": "Machine Learning",
        "provider": "Coursera (DeepLearning.AI & Stanford)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/specializations/machine-learning-introduction",
        "description": "Foundational ML curriculum covering supervised learning, SVMs, logistic regression, and ensemble trees."
    },
    {
        "course_id": "dl-01",
        "title": "Deep Learning Specialization",
        "skill": "Deep Learning",
        "provider": "Coursera (DeepLearning.AI)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/specializations/deep-learning",
        "description": "Master neural networks, backpropagation, CNNs, sequence models, and optimization techniques."
    },
    {
        "course_id": "nlp-01",
        "title": "Natural Language Processing Specialization",
        "skill": "NLP",
        "provider": "Coursera (DeepLearning.AI)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/specializations/natural-language-processing",
        "description": "Learn vector space models, TF-IDF, word embeddings, sentiment classification, and sequence transformers."
    },
    {
        "course_id": "ds-01",
        "title": "Applied Data Science with Python Specialization",
        "skill": "Data Science",
        "provider": "Coursera (University of Michigan)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/specializations/data-science-python",
        "description": "Statistical modeling, exploratory data analysis, visualization, and applied text mining in Python."
    },
    {
        "course_id": "pandas-01",
        "title": "Data Manipulation and Analysis with Pandas",
        "skill": "Pandas",
        "provider": "Kaggle Learn",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.kaggle.com/learn/pandas",
        "description": "Hands-on data wrangling, indexing, aggregation, missing-value imputation, and DataFrame transformations."
    },
    {
        "course_id": "numpy-01",
        "title": "Scientific Computing & Vectorized Array Programming with NumPy",
        "skill": "NumPy",
        "provider": "NumPy Official Tutorials",
        "difficulty": "Intermediate",
        "url": "https://numpy.org/learn/",
        "description": "Master n-dimensional arrays, broadcasting, linear algebra operations, and high-performance numerical computing."
    },
    {
        "course_id": "sklearn-01",
        "title": "Machine Learning in Python with Scikit-Learn",
        "skill": "Scikit-learn",
        "provider": "Inria / Scikit-Learn Official MOOC",
        "difficulty": "Intermediate",
        "url": "https://inria.github.io/scikit-learn-mooc/",
        "description": "Build leak-free ML pipelines, cross-validation workflows, feature preprocessors, and tuned classifiers."
    },
    # Databases & SQL
    {
        "course_id": "sql-01",
        "title": "Databases and SQL for Data Science with Python",
        "skill": "SQL",
        "provider": "Coursera (IBM)",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.coursera.org/learn/sql-data-science",
        "description": "Comprehensive practical SQL querying, joins, indexing, aggregation, subqueries, and relational schema design."
    },
    {
        "course_id": "mongo-01",
        "title": "MongoDB Developer Pathway & Schema Design",
        "skill": "MongoDB",
        "provider": "MongoDB University",
        "difficulty": "Intermediate",
        "url": "https://learn.mongodb.com/",
        "description": "Master document data modeling, CRUD operations, aggregation pipelines, and compound indexing in MongoDB."
    },
    # Cloud & DevOps
    {
        "course_id": "docker-01",
        "title": "Docker & Containerization Essentials for Developers",
        "skill": "Docker",
        "provider": "Docker Official Curriculum",
        "difficulty": "Intermediate",
        "url": "https://www.docker.com/101-tutorial/",
        "description": "Containerize full-stack applications, author multi-stage Dockerfiles, and orchestrate services with Docker Compose."
    },
    {
        "course_id": "k8s-01",
        "title": "Introduction to Kubernetes (LFS158)",
        "skill": "Kubernetes",
        "provider": "The Linux Foundation / edX",
        "difficulty": "Intermediate",
        "url": "https://www.edx.org/learn/kubernetes/the-linux-foundation-introduction-to-kubernetes",
        "description": "Deploy, scale, and manage containerized microservices across production Kubernetes clusters."
    },
    {
        "course_id": "aws-01",
        "title": "AWS Cloud Technical Essentials",
        "skill": "AWS",
        "provider": "Coursera (AWS Training)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/aws-cloud-technical-essentials",
        "description": "Fundamental AWS architecture covering IAM, EC2, S3, RDS, Lambda, VPC networking, and cloud security."
    },
    {
        "course_id": "linux-01",
        "title": "Introduction to Linux (LFS101)",
        "skill": "Linux",
        "provider": "The Linux Foundation / edX",
        "difficulty": "Beginner to Intermediate",
        "url": "https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux",
        "description": "Master Linux system administration, file permissions, process management, networking, and shell environments."
    },
    {
        "course_id": "bash-01",
        "title": "Linux Commands and Shell Scripting with Bash",
        "skill": "Bash",
        "provider": "Coursera (IBM)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/hands-on-introduction-to-linux-commands-and-shell-scripting",
        "description": "Automate system tasks, write cron pipelines, parse logs, and build resilient Bash deployment scripts."
    },
    {
        "course_id": "git-01",
        "title": "Version Control with Git",
        "skill": "Git",
        "provider": "Coursera (Atlassian)",
        "difficulty": "Beginner",
        "url": "https://www.coursera.org/learn/version-control-with-git",
        "description": "Master branching strategies, rebasing, pull requests, merge conflict resolution, and collaborative Git workflows."
    },
    {
        "course_id": "cicd-01",
        "title": "Continuous Integration and Continuous Delivery (CI/CD)",
        "skill": "CI/CD",
        "provider": "Coursera (IBM)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/continuous-integration-and-continuous-delivery-ci-cd",
        "description": "Build automated test, build, security scan, and deployment pipelines using GitHub Actions and GitOps."
    },
    {
        "course_id": "jenkins-01",
        "title": "Jenkins Build & Pipeline Automation Engineer Path",
        "skill": "Jenkins",
        "provider": "Jenkins Official Tutorials",
        "difficulty": "Intermediate",
        "url": "https://www.jenkins.io/doc/tutorials/",
        "description": "Author declarative Jenkinsfiles, multi-branch CI pipelines, distributed build agents, and artifact publishing."
    },
    {
        "course_id": "terraform-01",
        "title": "Infrastructure as Code with HashiCorp Terraform",
        "skill": "Terraform",
        "provider": "HashiCorp Developer Tutorials",
        "difficulty": "Intermediate",
        "url": "https://developer.hashicorp.com/terraform/tutorials",
        "description": "Provision reproducible cloud infrastructure using declarative HCL modules, remote state, and plan workflows."
    },
    {
        "course_id": "micro-01",
        "title": "Application Development using Microservices and Serverless",
        "skill": "Microservices",
        "provider": "Coursera (IBM)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/learn/developing-applications-with-cloud-native-and-microservices",
        "description": "Design loosely coupled microservices, API gateways, service discovery, and event-driven communication."
    },
    # Core CS, Java Enterprise & Cloud Architecture
    {
        "course_id": "dsa-01",
        "title": "Data Structures and Performance",
        "skill": "Data Structures",
        "provider": "Coursera (UC San Diego)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/data-structures-optimizing-performance",
        "description": "Analyze trees, hash tables, graphs, heaps, and memory-efficient data representations."
    },
    {
        "course_id": "algo-01",
        "title": "Algorithms Specialization",
        "skill": "Algorithms",
        "provider": "Coursera (Stanford University)",
        "difficulty": "Intermediate to Advanced",
        "url": "https://www.coursera.org/specializations/algorithms",
        "description": "Master divide-and-conquer, graph search, shortest paths, greedy algorithms, and dynamic programming."
    },
    {
        "course_id": "sysdesign-01",
        "title": "Software Architecture & Distributed System Design",
        "skill": "System Design",
        "provider": "Coursera (University of Alberta)",
        "difficulty": "Advanced",
        "url": "https://www.coursera.org/learn/software-architecture",
        "description": "Design scalable distributed systems with load balancing, caching tiers, database sharding, and fault tolerance."
    },
    {
        "course_id": "spring-01",
        "title": "Building Cloud Services with the Java Spring Framework",
        "skill": "Spring Boot",
        "provider": "Coursera (Vanderbilt University)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/cloud-services-java-spring-framework",
        "description": "Develop production Java backend services with Spring Boot, dependency injection, Spring Security, and JPA."
    },
    {
        "course_id": "hibernate-01",
        "title": "Java Persistence with Hibernate and Spring Data JPA",
        "skill": "Hibernate",
        "provider": "Hibernate Official Documentation",
        "difficulty": "Intermediate",
        "url": "https://hibernate.org/orm/documentation/",
        "description": "Master object-relational mapping (ORM), entity lifecycles, transaction management, and query optimization."
    },
    {
        "course_id": "kafka-01",
        "title": "Apache Kafka 101 — Event Streaming Architecture",
        "skill": "Kafka",
        "provider": "Confluent Developer",
        "difficulty": "Intermediate",
        "url": "https://developer.confluent.io/courses/apache-kafka/events/",
        "description": "Build high-throughput distributed event streaming pipelines with Kafka topics, partitions, producers, and consumers."
    },
    {
        "course_id": "cloud-01",
        "title": "Cloud Computing Foundations & Architecture",
        "skill": "Cloud Computing",
        "provider": "Coursera (Duke University)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/cloud-computing-foundations-duke",
        "description": "Architect multi-region cloud workloads, virtualization, storage tiers, auto-scaling, and serverless compute."
    },
    {
        "course_id": "sec-01",
        "title": "Cybersecurity & Cloud Application Security",
        "skill": "Security",
        "provider": "Coursera (Google)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/professional-certificates/google-cybersecurity",
        "description": "Implement zero-trust IAM, OWASP Top 10 mitigations, encryption in transit/at rest, and vulnerability auditing."
    },
    {
        "course_id": "net-01",
        "title": "The Bits and Bytes of Computer Networking",
        "skill": "Networking",
        "provider": "Coursera (Google)",
        "difficulty": "Intermediate",
        "url": "https://www.coursera.org/learn/computer-networking",
        "description": "Master TCP/IP, DNS, HTTP/HTTPS, VPC subnetting, load balancers, firewalls, and cloud network routing."
    }
]


class CourseRecommender:
    def __init__(self):
        self.catalog = CURATED_COURSES

    def recommend_for_skills(
        self,
        missing_skills: List[str],
        target_role: str = "",
        limit: int = 8
    ) -> List[Dict]:
        """
        Recommends unique, verified courses matching the candidate's missing skills.
        Guarantees zero duplicate courses, zero duplicate titles/URLs, and 1 course per skill.
        """
        recommended = []
        seen_course_ids = set()
        seen_urls = set()
        seen_titles = set()
        seen_skills = set()

        def add_course(course: Dict, reason: str) -> bool:
            cid = course["course_id"].strip().lower()
            curl = course["url"].strip().lower()
            ctitle = course["title"].strip().lower()
            cskill = course["skill"].strip().lower()

            if cid in seen_course_ids or curl in seen_urls or ctitle in seen_titles or cskill in seen_skills:
                return False

            seen_course_ids.add(cid)
            seen_urls.add(curl)
            seen_titles.add(ctitle)
            seen_skills.add(cskill)
            recommended.append({
                **course,
                "reason": reason
            })
            return True

        missing_clean = [s.strip() for s in (missing_skills or []) if s and s.strip()]

        # 1. Exact skill match pass (preserves missing_skills priority order)
        for m_skill in missing_clean:
            m_lower = m_skill.lower()
            for course in self.catalog:
                if course["skill"].lower() == m_lower:
                    add_course(
                        course,
                        f"Directly addresses your identified skill gap in '{course['skill']}' required for {target_role or 'your target role'}."
                    )
                    break
            if len(recommended) >= limit:
                return recommended[:limit]

        # 2. Substring/related skill match pass for any remaining missing skills
        for m_skill in missing_clean:
            m_lower = m_skill.lower()
            for course in self.catalog:
                c_lower = course["skill"].lower()
                if m_lower in c_lower or c_lower in m_lower:
                    add_course(
                        course,
                        f"Directly addresses your identified skill gap in '{course['skill']}' required for {target_role or 'your target role'}."
                    )
                    break
            if len(recommended) >= limit:
                return recommended[:limit]

        # 3. Only if zero missing skills matched, provide distinct foundational courses
        if len(recommended) == 0:
            for course in self.catalog:
                add_course(
                    course,
                    f"Recommended to reinforce core competencies for {target_role or 'software engineering roles'}."
                )
                if len(recommended) >= min(limit, 6):
                    break

        return recommended[:limit]


_recommender = None


def get_course_recommender() -> CourseRecommender:
    global _recommender
    if _recommender is None:
        _recommender = CourseRecommender()
    return _recommender
