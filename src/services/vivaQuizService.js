/**
 * SkillVault Advanced Course Mastery & AI Viva Quiz Engine
 * Dynamically detects exact certificate & hackathon topics and samples from a deep,
 * randomized pool of technical viva questions so questions are always fresh and topic-accurate.
 */

// Deep multi-domain question banks
const TOPIC_QUESTION_BANKS = {
  kannada_innovation: [
    {
      id: 'kan_1',
      question: 'When developing digital applications for regional languages like Kannada, why is full UTF-8 Unicode encoding essential for script rendering?',
      options: [
        'UTF-8 compresses images and CSS files by 50%',
        'It standardizes vowel modifiers (Ottakshara/Maathre), conjunct consonants, and prevents character corruption across browsers and operating systems',
        'UTF-8 eliminates the need for JavaScript frameworks',
        'It automatically translates English code variables into Kannada'
      ],
      correctIndex: 1,
      explanation: 'Kannada script features complex conjunct consonants (Ottaksharas) and dependent vowel signs. Standard UTF-8 Unicode (range U+0C80 to U+0CFF) ensures accurate glyph shaping and rendering across all devices.'
    },
    {
      id: 'kan_2',
      question: 'In Natural Language Processing (NLP) for Kannada, what is one of the main computational challenges compared to English?',
      options: [
        'Kannada has only 10 words in its vocabulary',
        'Kannada is highly agglutinative and morphologically rich, meaning multiple suffixes and words combine (Sandhi/Samasa) into complex wordforms',
        'Kannada text cannot be stored in cloud SQL databases',
        'Kannada grammar does not have subject-object-verb structures'
      ],
      correctIndex: 1,
      explanation: 'Agglutinative languages concatenate morphemes to form words. Kannada NLP requires advanced morphological analyzers and stemmers to break down compound words (Sandhi) for search, translation, and sentiment analysis.'
    },
    {
      id: 'kan_3',
      question: 'For a Kannada digital portal reaching rural communities in Karnataka with intermittent mobile data, which cloud architecture pattern is most suitable?',
      options: [
        'Pure server-side rendering requiring 5G connectivity for every button click',
        'Progressive Web App (PWA) with Service Workers and IndexedDB for offline-first caching and background synchronization',
        'Streaming 4K video feeds directly from origin servers without local cache',
        'Disabling mobile browser support entirely'
      ],
      correctIndex: 1,
      explanation: 'An offline-first PWA uses browser Service Workers to cache localized content and IndexedDB to queue user actions locally, syncing with the cloud once network connectivity resumes.'
    },
    {
      id: 'kan_4',
      question: 'When designing a vernacular user interface (UI) for Kannada digital innovation, why must typography and line-height be calibrated differently from Latin fonts?',
      options: [
        'Kannada fonts require zero line-height to fit text onto the screen',
        'Kannada glyphs feature extended ascenders and subscript consonants (Ottu) that require taller line-height (1.6 to 1.8x) to prevent glyph clipping and visual clutter',
        'All regional fonts must be rendered in bold red color by law',
        'Latin fonts use 16-bit colors whereas Kannada fonts only use black and white'
      ],
      correctIndex: 1,
      explanation: 'Because Kannada script uses subscript conjuncts (Vattakshara) below the baseline and vowel signs above, standard English line-heights cause overlapping and unreadable text. Proper typographic padding ensures legibility.'
    },
    {
      id: 'kan_5',
      question: 'How can crowdsourced digital platforms verify the authenticity of regional cultural and historical contributions submitted by users?',
      options: [
        'Accept all submissions blindly without validation',
        'Multi-tiered peer verification, moderator consensus, and cryptographic audit timestamps for tamper-evident provenance',
        'Delete all user submissions after 24 hours',
        'Require users to fax physical paperwork to university offices'
      ],
      correctIndex: 1,
      explanation: 'Digital archives and crowdsourcing platforms use community peer review alongside cryptographic audit trails to confirm historical accuracy and prevent fraudulent or vandalized contributions.'
    },
    {
      id: 'kan_6',
      question: 'What is the role of Web Accessibility (a11y) and Speech Synthesis (TTS) in expanding digital literacy through regional Kannada applications?',
      options: [
        'TTS is only used for background music in web games',
        'It enables voice-driven navigation and screen reading for non-literate and visually impaired citizens, democratizing access to government and educational portals',
        'It replaces HTML and CSS with audio files',
        'TTS slows down cloud database queries by 80%'
      ],
      correctIndex: 1,
      explanation: 'Voice synthesis in vernacular languages allows users who struggle with reading digital text to listen to government schemes, educational resources, and market prices in their native language.'
    }
  ],

  nptel_design_innovation: [
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
    },
    {
      id: 'dti_5',
      question: 'What are the 3 statutory criteria that must be satisfied for an engineering invention to be granted a Patent?',
      options: [
        'High price, complex code, and government approval',
        'Novelty (newness), Inventive Step (non-obviousness to skilled person), and Industrial Applicability (utility)',
        'Written in C++, hosted on AWS, and registered on GitHub',
        'Over 1,000 pages of documentation, 10 team members, and a trademark'
      ],
      correctIndex: 1,
      explanation: 'Patent law globally requires: 1) Novelty (never disclosed publicly), 2) Inventive step (not obvious to an expert in the field), and 3) Industrial utility (practical functional use).'
    },
    {
      id: 'dti_6',
      question: 'In Human-Centered Design (HCD), why is the "Define / Problem Statement" phase crucial before jumping into ideation?',
      options: [
        'It sets the maximum budget for marketing advertisements',
        'It frames a actionable, user-centric Point of View (POV) so teams solve the real root problem rather than superficial symptoms',
        'It writes all unit tests in advance',
        'It selects the programming language for the project'
      ],
      correctIndex: 1,
      explanation: 'Framing a precise problem statement ("How Might We...") prevents engineering teams from building technically brilliant solutions for the wrong problem.'
    },
    {
      id: 'dti_7',
      question: 'What is "Frugal Innovation" (Jugaad engineering) in emerging markets like India?',
      options: [
        'Cutting corners to build dangerous, disposable electronics',
        'Maximizing high value and robust functionality while drastically minimizing resource consumption, complexity, and production cost',
        'Buying secondhand servers from scrap yards',
        'Downloading pirated software tools'
      ],
      correctIndex: 1,
      explanation: 'Frugal innovation designs affordable, high-quality solutions tailored for resource-constrained environments by removing unnecessary complexity and focusing on core utility.'
    }
  ],

  hackathon_engineering: [
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
        'Pay for enterprise API tiers with personal credit cards during the pitch',
        'Remove the feature entirely from the presentation'
      ],
      correctIndex: 1,
      explanation: 'Graceful fallbacks (like local cache or pre-recorded response buffers) guarantee that unpredictable live network drops during your presentation do not break the demo.'
    },
    {
      id: 'hack_4',
      question: 'How does client-side OCR (like Tesseract.js in WebAssembly) provide a technical edge over traditional backend OCR in a prototype?',
      options: [
        'It processes documents directly inside the user browser, reducing server compute costs to zero and ensuring complete data privacy',
        'It makes images load 1000x faster than cloud databases',
        'It works without downloading any language model files',
        'It automatically fixes blurry camera angles using hardware laser autofocus'
      ],
      correctIndex: 0,
      explanation: 'Browser WASM OCR performs inference locally on client CPU/GPU threads, giving instant feedback, protecting privacy, and eliminating expensive cloud OCR API bills.'
    },
    {
      id: 'hack_5',
      question: 'In a competitive hackathon pitch, what is the recommended structure for a 3-minute jury presentation?',
      options: [
        '2 minutes introducing team members, 1 minute reading code syntax line-by-line',
        '30s Problem & Target Audience, 90s Live Working Demo showing unique innovation, 30s Architecture & Cloud Scalability, 30s Future Impact',
        'Read 40 bullet points from a PowerPoint deck with zero live software demonstration',
        'Apologize for unfinished bugs and explain why the project did not compile'
      ],
      correctIndex: 1,
      explanation: 'Top-tier hackathon presentations prioritize the live working prototype and problem-solution fit within the first 90 seconds while jury attention is peak.'
    },
    {
      id: 'hack_6',
      question: 'Why should rapid prototypes adopt responsive mobile-first styling even if primarily evaluated on laptops?',
      options: [
        'Mobile layouts run on faster CPU frequencies than desktop monitors',
        'Jury members frequently open the project link on their personal smartphones during evaluation and networking rounds',
        'Laptops cannot display CSS media queries',
        'Desktop browsers are being phased out in 2026'
      ],
      correctIndex: 1,
      explanation: 'Judges and recruiters regularly scan QR codes or open links on their phones; responsive mobile optimization guarantees the demo shines across all screen dimensions.'
    }
  ],

  cloud_computing: [
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
    },
    {
      id: 'cc_5',
      question: 'What is the key architectural difference between Serverless Compute (AWS Lambda) and Virtual Machines (Amazon EC2)?',
      options: [
        'Lambda runs only on Windows, EC2 runs only on Linux',
        'Lambda is event-driven and scales automatically from zero with per-millisecond billing; EC2 provides dedicated provisioned virtual machines billed continuously while running',
        'EC2 cannot connect to relational databases',
        'Lambda code never executes in cloud data centers'
      ],
      correctIndex: 1,
      explanation: 'Serverless abstract away server provisioning and patching, auto-scaling up on demand and scaling to zero when idle, making it ideal for event-driven microservices.'
    },
    {
      id: 'cc_6',
      question: 'In Cloud Security, what is the Principle of Least Privilege (PoLP) when configuring IAM Policies?',
      options: [
        'Granting all developers AdministratorAccess so builds never fail with permissions errors',
        'Assigning only the minimum permissions necessary for an identity to perform its specific required tasks and nothing more',
        'Disabling multi-factor authentication (MFA) for root accounts',
        'Encrypting passwords using plain text in public GitHub repos'
      ],
      correctIndex: 1,
      explanation: 'Least privilege prevents catastrophic security blast radiuses: compromised credentials or rogue processes cannot access resources beyond their explicitly granted permissions.'
    },
    {
      id: 'cc_7',
      question: 'How does Object Versioning in cloud buckets (like AWS S3) protect student credential data against accidental or malicious deletion?',
      options: [
        'It renames files with random numbers every hour',
        'It preserves multiple historical variants of an object; deleting an object merely places a Delete Marker, allowing instant rollbacks',
        'It doubles cloud network speed by splitting files into 10 servers',
        'It sends SMS alerts to student cellphones for every GET request'
      ],
      correctIndex: 1,
      explanation: 'S3 versioning prevents permanent data loss: even if someone overwrites or deletes a file, older versions remain intact and can be restored immediately.'
    }
  ],

  fullstack_web: [
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
    },
    {
      id: 'fs_5',
      question: 'In the Node.js asynchronous event loop, what is the execution priority between Microtasks (Promises) and Macrotasks (setTimeout)?',
      options: [
        'Macrotasks always execute before microtasks',
        'Microtasks (Promise.then, queueMicrotask) are drained immediately after the current operation finishes and before the next macrotask runs',
        'Node.js executes all code sequentially with zero asynchronous queues',
        'setTimeout(..., 0) executes before synchronous code'
      ],
      correctIndex: 1,
      explanation: 'The microtask queue has higher priority: as soon as the synchronous call stack empties, all resolved Promise callbacks run before the event loop advances to timers or I/O callbacks.'
    },
    {
      id: 'fs_6',
      question: 'What is the purpose of Cross-Origin Resource Sharing (CORS) preflight `OPTIONS` requests?',
      options: [
        'To download the web page favicon image',
        'To ask the target server for permission before sending non-simple cross-origin requests (e.g. custom headers, PUT/DELETE/JSON methods)',
        'To reboot the web server before accepting API traffic',
        'To encrypt the client IP address'
      ],
      correctIndex: 1,
      explanation: 'Browsers send an automatic OPTIONS preflight request to confirm whether the foreign API server allows the requested HTTP method, custom headers, and client origin.'
    }
  ],

  ai_ml_ocr: [
    {
      id: 'ai_1',
      question: 'In document OCR pipelines (such as Tesseract.js), what is the purpose of image binarization (grayscale to black & white) prior to character recognition?',
      options: [
        'To invert the colors of the image for dark mode',
        'To separate foreground text pixels from background noise, watermarks, and photographic gradients, maximizing OCR accuracy',
        'To reduce image resolution to 10 pixels',
        'To remove all vowels from the document'
      ],
      correctIndex: 1,
      explanation: 'Binarization (using algorithms like Otsu thresholding or adaptive thresholding) creates a high-contrast binary bitmap, eliminating shadows and gradients so the OCR engine detects clean character contours.'
    },
    {
      id: 'ai_2',
      question: 'In Machine Learning classification, what is the difference between Precision and Recall?',
      options: [
        'Precision and recall are mathematically identical',
        'Precision measures how many selected items were relevant (True Positives / All Predicted Positives), while Recall measures how many true items were identified (True Positives / All Actual Positives)',
        'Precision measures execution speed in milliseconds, recall measures memory usage',
        'Recall only applies to neural networks, precision only applies to linear regression'
      ],
      correctIndex: 1,
      explanation: 'Precision focuses on avoiding false alarms (high confidence), while Recall focuses on not missing genuine cases (capturing all authentic certificates).'
    },
    {
      id: 'ai_3',
      question: 'When fine-tuning a deep learning vision model for certificate verification, how does "Data Augmentation" prevent model Overfitting?',
      options: [
        'By deleting half of the training dataset',
        'By applying random rotations, brightness shifts, zooms, and perspective distortions, teaching the model to recognize credentials under varying lighting and camera angles',
        'By forcing the model to run on fewer CPU threads',
        'By converting all certificates into raw audio waveforms'
      ],
      correctIndex: 1,
      explanation: 'Data augmentation synthetically diversifies training samples, preventing the neural network from memorizing exact pixel layouts and forcing it to learn invariant structural features.'
    },
    {
      id: 'ai_4',
      question: 'What is a primary advantage of running client-side AI inference with WebAssembly (WASM) compared to cloud server APIs?',
      options: [
        'Client-side WASM guarantees 100% training accuracy with 0 parameters',
        'Zero cloud server hosting bills, complete document privacy (data never leaves student browser), and offline execution capability',
        'WASM converts Python code into hardware silicon chips',
        'WASM runs faster than quantum computers'
      ],
      correctIndex: 1,
      explanation: 'WASM compiles C/C++ or Rust inference code into near-native bytecode running directly on client CPU/GPU threads, ensuring zero cloud API costs and absolute data sovereignty.'
    }
  ],

  python_datascience: [
    {
      id: 'py_1',
      question: 'Why are NumPy vectorized array operations significantly faster than standard Python `for` loops?',
      options: [
        'NumPy arrays are stored in encrypted cloud folders',
        'NumPy uses contiguous C memory layouts and executes compiled SIMD (Single Instruction, Multiple Data) CPU vector instructions without Python interpreter overhead',
        'NumPy skips floating point calculations',
        'Python loops run only on 16-bit processors'
      ],
      correctIndex: 1,
      explanation: 'NumPy eliminates Python dynamic type checking inside loops by executing vectorized operations at compiled C speed utilizing hardware vector registers.'
    },
    {
      id: 'py_2',
      question: 'In Pandas DataFrame processing, what is the difference between `.loc[]` and `.iloc[]`?',
      options: [
        '.loc is label-based indexing (column names/index labels), while .iloc is integer position-based indexing (0 to n-1)',
        '.loc is used for saving files, .iloc is used for loading files',
        '.loc works only on strings, .iloc works only on numbers',
        'There is no difference in modern Pandas'
      ],
      correctIndex: 0,
      explanation: '`.loc` references rows and columns by their semantic labels or boolean masks, while `.iloc` references purely by numerical integer position regardless of label names.'
    },
    {
      id: 'py_3',
      question: 'What is the Python Global Interpreter Lock (GIL) and how does it affect CPU-bound multithreaded programs?',
      options: [
        'It allows unlimited simultaneous CPU threads on all cores',
        'It is a mutex mechanism that allows only one native thread to execute Python bytecodes at once, meaning CPU-bound tasks require multiprocessing rather than multithreading to scale',
        'It locks user files with AES encryption',
        'It prevents Python programs from running on Windows'
      ],
      correctIndex: 1,
      explanation: 'The GIL prevents multi-core parallelism for CPU-heavy tasks in CPython. To utilize all CPU cores for heavy computing, developers use `multiprocessing` or native compiled libraries like NumPy.'
    }
  ],

  cybersecurity_blockchain: [
    {
      id: 'sec_1',
      question: 'Why is the "Avalanche Effect" in Cryptographic Hash Functions (like SHA-256) critical for detecting tampered certificates?',
      options: [
        'It causes the computer screen to freeze when errors happen',
        'Changing even a single bit or letter in the certificate results in a completely unrecognizable, radically different hash digest output (~50% of bits flipping)',
        'It encrypts files with passwords generated from mountain names',
        'It guarantees files can be decrypted without keys'
      ],
      correctIndex: 1,
      explanation: 'A strong cryptographic hash exhibits high avalanche properties: any minor modification to input metadata produces an unpredictable, vastly different hash, instantly exposing forgery.'
    },
    {
      id: 'sec_2',
      question: 'In asymmetric public-key cryptography (like RSA or ECDSA), how does a Digital Signature prove both authenticity and non-repudiation?',
      options: [
        'The document is signed with the recipient public key and verified with an email address',
        'The issuer signs a hash of the credential using their private key; anyone can verify the signature using the issuer public key, proving it was generated solely by the holder of that private key',
        'The user scans their handwritten physical signature onto a webcam',
        'The signature is stored in browser cookies'
      ],
      correctIndex: 1,
      explanation: 'Because only the authentic issuer possesses the private key, a valid signature mathematically guarantees the issuer authorized the credential and cannot deny having issued it.'
    },
    {
      id: 'sec_3',
      question: 'How do SQL Injection (SQLi) attacks compromise cloud databases and how are they prevented?',
      options: [
        'By turning off the database power switch; prevented by battery backups',
        'By injecting malicious SQL syntax through unsanitized user inputs; prevented by using Parameterized Queries (Prepared Statements) or ORMs',
        'By downloading too many PDF files at once',
        'SQLi only affects HTML and CSS code'
      ],
      correctIndex: 1,
      explanation: 'Parameterized queries treat user input strictly as literal data rather than executable SQL code, preventing attackers from altering database query logic.'
    }
  ]
};

/**
 * Fisher-Yates shuffle algorithm to randomize array elements
 */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Detects the specific topic tags from certificate metadata
 */
export const detectCertificateTopics = (certificate) => {
  if (!certificate) return { primaryTopic: 'cloud_computing', topicLabel: 'Cloud Computing & Security', poolKeys: ['cloud_computing'] };

  const title = (certificate.title || '').toLowerCase();
  const issuer = (certificate.issuer || '').toLowerCase();
  const category = (certificate.category || '').toLowerCase();
  const rawText = (certificate.rawOcrText || '').toLowerCase();
  const combined = `${title} ${issuer} ${category} ${rawText}`;

  // 1. Kannada / Regional Innovation Hackathons
  if (combined.includes('kannada') || (combined.includes('hackathon') && (combined.includes('innovation') || combined.includes('nie') || combined.includes('hackerrank')))) {
    return {
      primaryTopic: 'kannada_innovation',
      topicLabel: 'Kannada Digital Innovation & Regional Hackathon',
      poolKeys: ['kannada_innovation', 'hackathon_engineering']
    };
  }

  // 2. NPTEL / Swayam / Design & Technology
  if (combined.includes('design') || combined.includes('technology and innovation') || combined.includes('nptel') || combined.includes('swayam') || combined.includes('iit')) {
    return {
      primaryTopic: 'nptel_design_innovation',
      topicLabel: 'NPTEL Design, Technology & Innovation',
      poolKeys: ['nptel_design_innovation', 'hackathon_engineering']
    };
  }

  // 3. General Hackathons / Rapid Prototyping
  if (category === 'hackathon' || combined.includes('hackathon') || combined.includes('hack') || combined.includes('competition')) {
    return {
      primaryTopic: 'hackathon_engineering',
      topicLabel: 'Hackathon Sprint Engineering & Rapid MVP',
      poolKeys: ['hackathon_engineering', 'fullstack_web']
    };
  }

  // 4. AI, Machine Learning, Computer Vision, OCR
  if (combined.includes('ai') || combined.includes('artificial intelligence') || combined.includes('machine learning') || combined.includes('ocr') || combined.includes('deep learning') || combined.includes('neural')) {
    return {
      primaryTopic: 'ai_ml_ocr',
      topicLabel: 'AI, Machine Learning & Document OCR',
      poolKeys: ['ai_ml_ocr', 'python_datascience']
    };
  }

  // 5. Python & Data Science
  if (combined.includes('python') || combined.includes('data science') || combined.includes('pandas') || combined.includes('analytics')) {
    return {
      primaryTopic: 'python_datascience',
      topicLabel: 'Python & Data Science Engineering',
      poolKeys: ['python_datascience', 'ai_ml_ocr']
    };
  }

  // 6. Cybersecurity, Cryptography, Blockchain
  if (combined.includes('security') || combined.includes('blockchain') || combined.includes('crypto') || combined.includes('ledger') || combined.includes('cyber')) {
    return {
      primaryTopic: 'cybersecurity_blockchain',
      topicLabel: 'Cybersecurity, Cryptography & Cloud Trust',
      poolKeys: ['cybersecurity_blockchain', 'cloud_computing']
    };
  }

  // 7. Full-Stack Web Development, React, Node
  if (combined.includes('web') || combined.includes('react') || combined.includes('node') || combined.includes('javascript') || combined.includes('fullstack') || combined.includes('frontend')) {
    return {
      primaryTopic: 'fullstack_web',
      topicLabel: 'Full-Stack Systems & Modern Web Architecture',
      poolKeys: ['fullstack_web', 'cloud_computing']
    };
  }

  // 8. Default to Cloud Architecture & DevOps
  return {
    primaryTopic: 'cloud_computing',
    topicLabel: 'Cloud Architecture & High Availability',
    poolKeys: ['cloud_computing', 'cybersecurity_blockchain']
  };
};

/**
 * Generates a dynamic, randomized set of viva questions for the certificate.
 * Always produces a fresh randomized subset, and shuffles option order so it is NEVER static!
 */
export const getQuestionsForCertificate = (certificate, count = 5) => {
  const { poolKeys, topicLabel } = detectCertificateTopics(certificate);

  // Combine questions from all relevant pools
  let combinedPool = [];
  poolKeys.forEach(key => {
    if (TOPIC_QUESTION_BANKS[key]) {
      combinedPool = combinedPool.concat(TOPIC_QUESTION_BANKS[key]);
    }
  });

  // Fallback to cloud if empty
  if (combinedPool.length === 0) {
    combinedPool = TOPIC_QUESTION_BANKS.cloud_computing;
  }

  // Randomize question pool
  const randomizedPool = shuffleArray(combinedPool);

  // Take requested count (default 5)
  const selectedQuestions = randomizedPool.slice(0, Math.min(count, randomizedPool.length));

  // Also randomize the 4 options for each question so correct answers aren't in the same position
  return selectedQuestions.map((q) => {
    const originalOptions = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex }));
    const shuffledOptions = shuffleArray(originalOptions);
    const newCorrectIndex = shuffledOptions.findIndex(o => o.isCorrect);

    return {
      ...q,
      options: shuffledOptions.map(o => o.text),
      correctIndex: newCorrectIndex,
      topicLabel
    };
  });
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
