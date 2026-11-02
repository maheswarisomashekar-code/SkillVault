/**
 * Target Role Skill Gap & Cloud Career Readiness Analyzer Service
 * Computes live match score against industry cloud roles based on verified certificates,
 * software projects, and student profile skills.
 */

export const TARGET_ROLES = [
  {
    id: 'cloud-architect',
    title: 'Cloud Solutions Architect',
    level: 'Associate / Graduate',
    icon: 'Cloud',
    description: 'Designs resilient, scalable, and secure cloud infrastructures across AWS, GCP, or Azure.',
    requiredSkills: [
      'Cloud Computing',
      'Cloud Architecture',
      'Microservices',
      'Docker',
      'REST API',
      'Security',
      'Database Management',
      'Cloud Storage',
      'Firebase'
    ],
    recommendedCerts: [
      { name: 'AWS Certified Solutions Architect - Associate', issuer: 'Amazon Web Services' },
      { name: 'Google Cloud Associate Cloud Engineer (ACE)', issuer: 'Google Cloud' },
      { name: 'Microsoft Certified: Azure Fundamentals (AZ-900)', issuer: 'Microsoft' }
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps & Platform Engineer',
    level: 'Associate / Junior',
    icon: 'Terminal',
    description: 'Automates CI/CD deployment pipelines, manages container clusters, and maintains platform reliability.',
    requiredSkills: [
      'Docker',
      'Kubernetes',
      'CI/CD',
      'Git',
      'Linux',
      'Cloud Computing',
      'Cloud Storage',
      'Python',
      'REST API'
    ],
    recommendedCerts: [
      { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation (CNCF)' },
      { name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp' },
      { name: 'Docker Certified Associate', issuer: 'Docker / Mirantis' }
    ]
  },
  {
    id: 'fullstack-cloud',
    title: 'Full-Stack Cloud Developer',
    level: 'Junior / Associate',
    icon: 'Code',
    description: 'Builds end-to-end web applications with reactive frontends and scalable serverless/cloud backends.',
    requiredSkills: [
      'React',
      'JavaScript',
      'Node.js',
      'Web Development',
      'Database Management',
      'Firebase',
      'REST API',
      'Git',
      'Cloud Storage'
    ],
    recommendedCerts: [
      { name: 'AWS Certified Developer - Associate', issuer: 'Amazon Web Services' },
      { name: 'Meta Front-End / Full-Stack Professional Certificate', issuer: 'Coursera / Meta' },
      { name: 'Node.js Application Developer (JSNAD)', issuer: 'OpenJS Foundation' }
    ]
  },
  {
    id: 'data-ai-engineer',
    title: 'Data & AI Cloud Systems Engineer',
    level: 'Associate',
    icon: 'Cpu',
    description: 'Develops cloud data pipelines, ETL workflows, model serving microservices, and analytical warehouses.',
    requiredSkills: [
      'Python',
      'SQL',
      'Database Management',
      'Machine Learning',
      'Cloud Computing',
      'Data Pipelines',
      'Docker',
      'REST API',
      'Analytics'
    ],
    recommendedCerts: [
      { name: 'Google Cloud Professional Data Engineer', issuer: 'Google Cloud' },
      { name: 'Databricks Certified Associate Developer for Apache Spark', issuer: 'Databricks' },
      { name: 'AWS Certified Data Analytics - Specialty', issuer: 'Amazon Web Services' }
    ]
  },
  {
    id: 'cloud-security',
    title: 'Cloud Security & Compliance Analyst',
    level: 'Junior / Associate',
    icon: 'ShieldCheck',
    description: 'Implements zero-trust access control, cryptographic verification, and cloud audit governance.',
    requiredSkills: [
      'Security',
      'Cryptography',
      'Authentication',
      'Cloud Computing',
      'Audit Logging',
      'Linux',
      'Database Management',
      'Git'
    ],
    recommendedCerts: [
      { name: 'CompTIA Security+ (SY0-701)', issuer: 'CompTIA' },
      { name: 'AWS Certified Security - Specialty', issuer: 'Amazon Web Services' },
      { name: 'GIAC Cloud Security Automation (GCSA)', issuer: 'SANS Institute' }
    ]
  }
];

/**
 * Analyzes student credentials, projects, and skills against target cloud roles
 */
export const analyzeRoleReadiness = (roleId, profile, certificates = [], projects = []) => {
  const role = TARGET_ROLES.find(r => r.id === roleId) || TARGET_ROLES[0];

  // 1. Collect all keywords from student's profile, certificates, and projects
  const studentKeywords = new Set();

  // Profile skills
  (profile?.skills || []).forEach(s => studentKeywords.add(s.toLowerCase().trim()));

  // Certificate titles, categories, issuers
  certificates.forEach(c => {
    if (c.title) studentKeywords.add(c.title.toLowerCase());
    if (c.category) studentKeywords.add(c.category.toLowerCase());
    if (c.issuer) studentKeywords.add(c.issuer.toLowerCase());
    if (c.description) studentKeywords.add(c.description.toLowerCase());
    // Also add individual words
    (c.title || '').split(/\s+/).forEach(w => {
      if (w.length > 2) studentKeywords.add(w.toLowerCase());
    });
  });

  // Projects tech stacks and descriptions
  projects.forEach(p => {
    (p.techStack || []).forEach(t => studentKeywords.add(t.toLowerCase().trim()));
    if (p.title) studentKeywords.add(p.title.toLowerCase());
    if (p.description) {
      (p.description || '').split(/\s+/).forEach(w => {
        if (w.length > 2) studentKeywords.add(w.toLowerCase());
      });
    }
  });

  // Combine into searchable text
  const corpus = Array.from(studentKeywords).join(' ');

  // 2. Evaluate required skills
  const matchedSkills = [];
  const missingSkills = [];

  role.requiredSkills.forEach(req => {
    const reqLower = req.toLowerCase();
    const isMatched = corpus.includes(reqLower) || 
      (reqLower === 'cloud computing' && (corpus.includes('cloud') || corpus.includes('gcp') || corpus.includes('aws'))) ||
      (reqLower === 'security' && (corpus.includes('security') || corpus.includes('sha-256') || corpus.includes('cryptography'))) ||
      (reqLower === 'database management' && (corpus.includes('database') || corpus.includes('sql') || corpus.includes('nosql') || corpus.includes('firestore'))) ||
      (reqLower === 'web development' && (corpus.includes('react') || corpus.includes('html') || corpus.includes('javascript') || corpus.includes('web')));

    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // 3. Compute score
  const totalRequired = role.requiredSkills.length;
  const matchRatio = matchedSkills.length / totalRequired;
  
  // Baseline 25% + up to 75%
  let score = Math.round(matchRatio * 100);
  if (score < 25 && (certificates.length > 0 || projects.length > 0)) {
    score = 25 + Math.round(matchRatio * 75);
  }

  let statusLabel = 'Foundational Stage';
  let statusColor = '#f59e0b';
  let badgeText = 'Needs Target Certifications';

  if (score >= 80) {
    statusLabel = 'High Readiness • Interview Ready';
    statusColor = '#10b981';
    badgeText = 'Highly Competitive';
  } else if (score >= 55) {
    statusLabel = 'Moderate Readiness • Strong Foundation';
    statusColor = '#0ea5e9';
    badgeText = 'Job Candidate';
  }

  return {
    role,
    score,
    statusLabel,
    statusColor,
    badgeText,
    matchedSkills,
    missingSkills,
    totalRequired,
    recommendedCerts: role.recommendedCerts,
    verifiedCount: certificates.length,
    projectCount: projects.length
  };
};
