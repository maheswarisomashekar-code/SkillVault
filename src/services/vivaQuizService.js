/**
 * SkillVault Course Mastery & AI Viva Quiz Engine
 * Generates tailored, realistic technical viva questions based on the student's
 * specific certificate title, issuing organization, and category.
 */

// Domain question banks with scenario-based viva questions
const DOMAIN_QUESTION_BANKS = {
  cloud: [
    {
      id: 'cc_1',
      question: 'When designing a cloud architecture for high availability and disaster recovery across multiple regions, which strategy provides the lowest Recovery Point Objective (RPO)?',
      options: [
        'Nightly cross-region snapshot backup with manual restoration',
        'Active-Active multi-region deployment with real-time asynchronous database replication',
        'Single-region deployment with automated vertical scaling (larger VM instance)',
        'Cold standby server powered off in a secondary region'
      ],
      correctIndex: 1,
      explanation: 'Active-Active multi-region architecture with continuous asynchronous/synchronous replication provides minimal RPO (near zero data loss) and near-zero RTO during regional cloud outages.'
    },
    {
      id: 'cc_2',
      question: 'In AWS / Cloud storage, what is the primary security advantage of using Pre-signed URLs for certificate downloads instead of making storage buckets publicly readable?',
      options: [
        'Pre-signed URLs reduce storage bandwidth costs to zero',
        'They provide time-limited, cryptographically signed access without compromising private bucket permissions',
        'Pre-signed URLs convert PDF documents into smaller JPEG files',
        'They bypass cloud IAM authentication completely for all users forever'
      ],
      correctIndex: 1,
      explanation: 'Pre-signed URLs allow the client to download a specific private cloud object securely within an exact time window (e.g. 15 minutes) without opening public access to the bucket.'
    },
    {
      id: 'cc_3',
      question: 'How does Cloudflare / CloudFront Edge CDN caching improve global student portfolio access latency?',
      options: [
        'By re-executing all database write queries at edge servers',
        'By caching static compiled assets (JS, CSS, images) at Point of Presence (PoP) edge nodes closest to the user',
        'By increasing the physical CPU clock frequency of the origin server',
        'By disabling HTTPS encryption for international traffic'
      ],
      correctIndex: 1,
      explanation: 'Edge CDNs terminate TLS handshakes and serve static assets from geographically distributed edge caches (PoPs), dropping round-trip latency from 300ms+ down to under 20ms.'
    },
    {
      id: 'cc_4',
      question: 'What is the role of a Cryptographic SHA-256 Digest in cloud credential verification?',
      options: [
        'It compresses files so they take up 50% less cloud disk space',
        'It generates a deterministic, irreversible 256-bit hash fingerprint that changes completely if any byte is tampered with',
        'It automatically translates English certificates into Kannada or Hindi',
        'It guarantees 100% cloud uptime even without internet access'
      ],
      correctIndex: 1,
      explanation: 'SHA-256 provides mathematically tamper-evident integrity: modifying even a single character in the certificate changes the entire hash digest (Avalanche effect), exposing forgery.'
    }
  ],

  nptel_design: [
    {
      id: 'dti_1',
      question: 'In the Design Thinking methodology, which phase focuses on developing empathy with users and uncovering unarticulated user friction before building any solution?',
      options: [
        'Prototype phase',
        'Empathize / Needfinding phase',
        'Commercialization phase',
        'Intellectual Property Filing phase'
      ],
      correctIndex: 1,
      explanation: 'Empathize is the foundational first step where developers observe and engage with users to understand emotional and functional friction before framing solutions.'
    },
    {
      id: 'dti_2',
      question: 'What is the primary difference between "Incremental Innovation" and "Disruptive / Radical Innovation"?',
      options: [
        'Incremental innovation introduces unproven technologies to create new markets, while radical innovation makes minor tweaks',
        'Incremental innovation optimizes existing products for established markets, whereas radical/disruptive innovation transforms or creates entirely new value networks',
        'Incremental innovation requires government patents, radical innovation does not',
        'There is no difference in modern engineering'
      ],
      correctIndex: 1,
      explanation: 'Incremental innovation focuses on continuous gradual improvements (e.g. faster UI rendering), while radical innovation creates a paradigm shift (e.g. moving from paper certificates to cryptographic cloud ledgers).'
    },
    {
      id: 'dti_3',
      question: 'Why is rapid low-fidelity prototyping (MVP) critical before developing a full-scale cloud platform?',
      options: [
        'It eliminates the need for software testing and QA',
        'It allows engineering teams to fail early, validate user assumptions with minimal resource burn, and iterate quickly',
        'Low-fidelity prototypes can be immediately sold to enterprise customers',
        'It guarantees that the final code will have zero bugs'
      ],
      correctIndex: 1,
      explanation: 'Rapid prototyping reduces market risk by validating core value propositions before investing significant engineering, cloud hosting, and database costs.'
    },
    {
      id: 'dti_4',
      question: 'In innovation management, what is the role of Intellectual Property (IP) such as patents and trademarks?',
      options: [
        'To legally protect unique novel mechanisms and brand identity while granting exclusive commercial rights',
        'To prevent open-source software libraries from being used',
        'To automatically guarantee venture capital funding',
        'To replace academic degrees in engineering colleges'
      ],
      correctIndex: 0,
      explanation: 'IP rights provide legal protection against unauthorized copying of novel technical inventions (patents) and distinctive brand goodwill (trademarks).'
    }
  ],

  hackathon: [
    {
      id: 'hack_1',
      question: 'During a 24-48 hour Hackathon sprint, what is the most effective engineering strategy to deliver a working demo that impresses judges?',
      options: [
        'Spend the first 30 hours architecting a distributed microservices cluster before writing frontend code',
        'Scope a lean Minimum Viable Product (MVP) with 1-2 core standout features, high visual polish, and clean end-to-end user flow',
        'Write 100% unit test code coverage before building any UI components',
        'Avoid using open-source packages or frameworks and code everything from raw C++'
      ],
      correctIndex: 1,
      explanation: 'Hackathon judges value working, functional software that clearly proves the problem statement with polished UI and a compelling live demo over incomplete complex backends.'
    },
    {
      id: 'hack_2',
      question: 'When multiple team members collaborate rapidly on a hackathon repository, which Git branch strategy prevents breaking the demo?',
      options: [
        'Everyone commits directly to the production master branch simultaneously',
        'Feature branches (`feature/ocr`, `feature/ui`) merged into master only after basic smoke testing',
        'Emailing zip files of code between team members',
        'Disabling git commits until the final hour before submission'
      ],
      correctIndex: 1,
      explanation: 'Short-lived feature branches with quick pull-request reviews prevent merge conflicts and protect the working master branch from broken builds.'
    },
    {
      id: 'hack_3',
      question: 'What is an essential technique for handling external API rate limits or failures during a live hackathon presentation?',
      options: [
        'Crash the application and blame the venue Wi-Fi',
        'Implement resilient fallback mock data or client-side caching so the demo never hangs',
        'Pay for enterprise enterprise API tiers with personal credit cards during the pitch',
        'Remove the feature entirely from the presentation'
      ],
      correctIndex: 1,
      explanation: 'Graceful fallbacks (like local cache or pre-recorded response buffers) guarantee that unpredictable live network drops during your presentation do not break the demo.'
    },
    {
      id: 'hack_4',
      question: 'How does client-side OCR (like Tesseract.js in WebAssembly) provide a technical edge over traditional backend OCR?',
      options: [
        'It processes documents directly inside the user browser, reducing server compute costs to zero and ensuring complete data privacy',
        'It makes images load 1000x faster than cloud databases',
        'It works without downloading any language model files',
        'It automatically fixes blurry camera angles using hardware laser autofocus'
      ],
      correctIndex: 0,
      explanation: 'Browser WASM OCR performs inference locally on client CPU/GPU threads, giving instant feedback, protecting privacy, and eliminating expensive cloud OCR API bills.'
    }
  ],

  fullstack: [
    {
      id: 'fs_1',
      question: 'Why does Vite provide dramatically faster development server startup compared to legacy Webpack?',
      options: [
        'Vite compiles the entire application into machine assembly language',
        'Vite leverages native browser ES Modules (ESM) and pre-bundles dependencies with lightning-fast esbuild written in Go',
        'Vite skips code validation and ignores JavaScript syntax errors',
        'Vite runs only in cloud containers and not locally'
      ],
      correctIndex: 1,
      explanation: 'Vite transforms source code on-demand when the browser requests it using native ESM, instead of re-bundling the entire project on every save.'
    },
    {
      id: 'fs_2',
      question: 'In React, what problem does the `useCallback` or `useMemo` hook solve in state-heavy applications?',
      options: [
        'It prevents infinite network requests to the database',
        'It memoizes function references and expensive calculations to prevent unnecessary child component re-renders',
        'It stores user passwords directly in memory',
        'It automatically converts CSS styles into Tailwind classes'
      ],
      correctIndex: 1,
      explanation: 'useMemo/useCallback memoize values and callback functions across re-renders, avoiding costly calculations and unnecessary re-renders in children.'
    },
    {
      id: 'fs_3',
      question: 'What is the main security risk of storing authentication tokens or passwords in browser `localStorage`?',
      options: [
        'localStorage is limited to 100 characters',
        'Any Cross-Site Scripting (XSS) vulnerability allows malicious scripts to read and exfiltrate the stored tokens',
        'localStorage is automatically deleted every 5 minutes',
        'localStorage requires paid cloud licenses'
      ],
      correctIndex: 1,
      explanation: 'JavaScript running on the same domain can read localStorage; therefore, sensitive auth session tokens are safer in `httpOnly` secure cookies to prevent XSS theft.'
    },
    {
      id: 'fs_4',
      question: 'How do REST APIs use HTTP status codes to communicate outcome semantics?',
      options: [
        '200 for Success, 401 for Unauthorized, 404 for Not Found, 500 for Internal Server Error',
        'All responses should return 200 OK regardless of whether an error occurred',
        'Status codes are only used for CSS styles',
        'HTTP codes 100 through 500 are chosen randomly by web servers'
      ],
      correctIndex: 0,
      explanation: 'HTTP status codes standardize communication: 2xx (Success), 3xx (Redirect), 4xx (Client errors like unauthorized or missing routes), and 5xx (Server failures).'
    }
  ]
};

/**
 * Selects or generates the best 4 viva questions based on the certificate metadata
 */
export const getQuestionsForCertificate = (certificate) => {
  if (!certificate) return DOMAIN_QUESTION_BANKS.cloud;

  const title = (certificate.title || '').toLowerCase();
  const issuer = (certificate.issuer || '').toLowerCase();
  const category = (certificate.category || '').toLowerCase();
  const rawText = (certificate.rawOcrText || '').toLowerCase();

  // Match NPTEL / Design / Innovation
  if (title.includes('design') || title.includes('innovation') || title.includes('nptel') || issuer.includes('nptel') || issuer.includes('swayam') || rawText.includes('nptel')) {
    return DOMAIN_QUESTION_BANKS.nptel_design;
  }

  // Match Hackathon / Competition
  if (category === 'hackathon' || title.includes('hackathon') || title.includes('kannada') || issuer.includes('hackerrank') || title.includes('innovation hackathon')) {
    return DOMAIN_QUESTION_BANKS.hackathon;
  }

  // Match Full-Stack / Web / Software
  if (title.includes('web') || title.includes('react') || title.includes('node') || title.includes('javascript') || title.includes('fullstack') || title.includes('frontend')) {
    return DOMAIN_QUESTION_BANKS.fullstack;
  }

  // Default to Cloud Computing & Security
  return DOMAIN_QUESTION_BANKS.cloud;
};

/**
 * Calculates grade evaluation and badge based on viva score percentage
 */
export const evaluateVivaResult = (scorePercent) => {
  if (scorePercent >= 90) {
    return {
      status: 'PASSED',
      badge: 'Gold Distinction',
      color: '#eab308',
      summary: 'Exceptional mastery of core theoretical and real-world engineering concepts.',
      icon: '🏆'
    };
  } else if (scorePercent >= 70) {
    return {
      status: 'PASSED',
      badge: 'Certified Proficiency',
      color: '#10b981',
      summary: 'Solid understanding of fundamental course competencies. Viva verified.',
      icon: '✅'
    };
  } else {
    return {
      status: 'RETRY_NEEDED',
      badge: 'Review Required',
      color: '#f43f5e',
      summary: 'Score fell below the 70% threshold. Review the explanations and retry the viva.',
      icon: '⚠️'
    };
  }
};
