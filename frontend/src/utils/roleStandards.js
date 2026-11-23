export const ROLE_STANDARDS = {
  'Full Stack Developer': [
    'React',
    'Node.js',
    'Express',
    'MongoDB',
    'JavaScript',
    'TypeScript',
    'Docker',
    'REST API',
    'Git',
    'SQL'
  ],
  'Software Engineer': [
    'Python',
    'Java',
    'Data Structures',
    'Algorithms',
    'SQL',
    'Git',
    'Docker',
    'Linux',
    'System Design',
    'CI/CD'
  ],
  'Data Scientist': [
    'Python',
    'Machine Learning',
    'Pandas',
    'NumPy',
    'Scikit-learn',
    'SQL',
    'Deep Learning',
    'NLP',
    'Data Science',
    'Docker'
  ],
  'DevOps Engineer': [
    'Docker',
    'Kubernetes',
    'Linux',
    'AWS',
    'CI/CD',
    'Git',
    'Jenkins',
    'Terraform',
    'Bash',
    'Microservices'
  ],
  'Java Developer': [
    'Java',
    'Spring Boot',
    'Hibernate',
    'Microservices',
    'SQL',
    'Docker',
    'REST API',
    'Git',
    'Kafka',
    'Jenkins'
  ],
  'Cloud Architect': [
    'AWS',
    'Cloud Computing',
    'Docker',
    'Kubernetes',
    'Terraform',
    'Linux',
    'Microservices',
    'Security',
    'Python',
    'Networking'
  ]
};

export const AVAILABLE_ROLES = Object.keys(ROLE_STANDARDS);

const CATEGORY_TO_ROLE_MAP = {
  'data science': 'Data Scientist',
  'data scientist': 'Data Scientist',
  'hadoop': 'Data Scientist',
  'etl developer': 'Data Scientist',
  'python developer': 'Software Engineer',
  'software engineer': 'Software Engineer',
  'blockchain': 'Software Engineer',
  'automation testing': 'Software Engineer',
  'testing': 'Software Engineer',
  'dotnet developer': 'Software Engineer',
  'sap developer': 'Software Engineer',
  'database': 'Software Engineer',
  'java developer': 'Java Developer',
  'devops engineer': 'DevOps Engineer',
  'network security engineer': 'Cloud Architect',
  'cloud architect': 'Cloud Architect',
  'web designing': 'Full Stack Developer',
  'full stack developer': 'Full Stack Developer'
};

export function resolveTargetRole(userTargetRole, predictedCategory) {
  if (userTargetRole && ROLE_STANDARDS[userTargetRole]) {
    return userTargetRole;
  }
  const savedLocal =
    typeof window !== 'undefined' ? localStorage.getItem('ascend_target_role') : null;
  if (savedLocal && ROLE_STANDARDS[savedLocal]) {
    return savedLocal;
  }
  if (userTargetRole) {
    const mapped = CATEGORY_TO_ROLE_MAP[userTargetRole.trim().toLowerCase()];
    if (mapped && ROLE_STANDARDS[mapped]) return mapped;
  }
  if (predictedCategory) {
    const mapped = CATEGORY_TO_ROLE_MAP[predictedCategory.trim().toLowerCase()];
    if (mapped && ROLE_STANDARDS[mapped]) return mapped;
  }
  return 'Full Stack Developer';
}

export function computeRoleSkillGap(targetRole, extractedSkills = []) {
  const normalizedRole = resolveTargetRole(targetRole);
  const requiredSkills = ROLE_STANDARDS[normalizedRole] || ROLE_STANDARDS['Full Stack Developer'];

  const candidateSkillsLower = new Set(
    (extractedSkills || []).map((s) =>
      typeof s === 'string' ? s.toLowerCase().trim() : (s.canonical || s.skill || '').toLowerCase().trim()
    )
  );

  // Also handle common synonyms (e.g. "natural language processing" <-> "nlp")
  if (candidateSkillsLower.has('natural language processing')) candidateSkillsLower.add('nlp');
  if (candidateSkillsLower.has('nlp')) candidateSkillsLower.add('natural language processing');
  if (candidateSkillsLower.has('spring')) candidateSkillsLower.add('spring boot');
  if (candidateSkillsLower.has('sklearn')) candidateSkillsLower.add('scikit-learn');

  const possessedSkills = requiredSkills.filter((s) =>
    candidateSkillsLower.has(s.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(
    (s) => !candidateSkillsLower.has(s.toLowerCase())
  );
  const matchPct = Math.round((possessedSkills.length / requiredSkills.length) * 100);

  return {
    role: normalizedRole,
    requiredSkills,
    possessedSkills,
    missingSkills,
    matchPct
  };
}
