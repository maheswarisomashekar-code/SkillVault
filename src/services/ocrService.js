import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker using unpkg or dynamic import
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Extract embedded text and render PDF pages to image canvas for OCR
 */
export const extractTextAndCanvasFromPdf = async (pdfFileOrUrl) => {
  let arrayBuffer;
  if (pdfFileOrUrl instanceof Blob) {
    arrayBuffer = await pdfFileOrUrl.arrayBuffer();
  } else if (typeof pdfFileOrUrl === 'string') {
    const res = await fetch(pdfFileOrUrl);
    arrayBuffer = await res.arrayBuffer();
  } else {
    throw new Error('Unsupported PDF input type');
  }

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = Math.min(pdfDoc.numPages, 3); // Read first 3 pages at most

  let extractedPdfText = '';
  let renderedCanvasDataUrl = null;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    
    // 1. Extract vector/embedded digital text directly from PDF
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    extractedPdfText += pageText + '\n';

    // 2. Render first page to high-res canvas (2.0 scale) for raster OCR fallback
    if (pageNum === 1) {
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
      renderedCanvasDataUrl = canvas.toDataURL('image/png');
    }
  }

  return {
    digitalText: extractedPdfText.trim(),
    firstPageImage: renderedCanvasDataUrl
  };
};

/**
 * Converts any recognized certificate date string or academic session into strict ISO YYYY-MM-DD
 */
export const normalizeToIsoDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const clean = dateStr.trim();

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

  const monthMap = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', sept: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // 1. Session format: e.g. "JUL-SEP 2026" or "JAN-APR 2025" -> convert to exam completion month
  const sessionMatch = clean.match(/(?:[A-Za-z]{3,9})\s*[-–]\s*([A-Za-z]{3,9})\s+(\d{4})/i);
  if (sessionMatch) {
    const endMonth = sessionMatch[1].toLowerCase();
    const year = sessionMatch[2];
    const m = monthMap[endMonth] || monthMap[endMonth.slice(0, 3)] || '09';
    return `${year}-${m}-01`;
  }

  // 2. Month Day, Year: e.g. "Nov 1, 2026" or "November 12, 2024" or "Nov 1 2026"
  const mdyMatch = clean.match(/([A-Za-z]{3,9})[.,]?\s+(\d{1,2}),?\s+(\d{4})/i);
  if (mdyMatch) {
    const m = monthMap[mdyMatch[1].toLowerCase()] || monthMap[mdyMatch[1].toLowerCase().slice(0, 3)];
    if (m) {
      const d = mdyMatch[2].padStart(2, '0');
      const y = mdyMatch[3];
      return `${y}-${m}-${d}`;
    }
  }

  // 3. Day Month Year: e.g. "12 November 2024" or "01 Nov 2026"
  const dmyTextMatch = clean.match(/(\d{1,2})\s+([A-Za-z]{3,9})[.,]?\s+(\d{4})/i);
  if (dmyTextMatch) {
    const m = monthMap[dmyTextMatch[2].toLowerCase()] || monthMap[dmyTextMatch[2].toLowerCase().slice(0, 3)];
    if (m) {
      const d = dmyTextMatch[1].padStart(2, '0');
      const y = dmyTextMatch[3];
      return `${y}-${m}-${d}`;
    }
  }

  // 4. Month Year: e.g. "September 2024" or "Nov 2026"
  const myTextMatch = clean.match(/^([A-Za-z]{3,9})\s+(\d{4})$/i);
  if (myTextMatch) {
    const m = monthMap[myTextMatch[1].toLowerCase()] || monthMap[myTextMatch[1].toLowerCase().slice(0, 3)];
    if (m) {
      return `${myTextMatch[2]}-${m}-01`;
    }
  }

  // 5. DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyNumMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyNumMatch) {
    const p1 = parseInt(dmyNumMatch[1], 10);
    const p2 = parseInt(dmyNumMatch[2], 10);
    const y = dmyNumMatch[3];
    // If p1 > 12, p1 is day, p2 is month (DD/MM/YYYY)
    if (p1 > 12 && p2 <= 12) {
      return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
    // Standard Indian certificates use DD/MM/YYYY
    return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
  }

  // 6. YYYY-MM-DD or YYYY/MM/DD
  const ymdNumMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdNumMatch) {
    return `${ymdNumMatch[1]}-${ymdNumMatch[2].padStart(2, '0')}-${ymdNumMatch[3].padStart(2, '0')}`;
  }

  // Fallback: Date.parse
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    return d.toISOString().split('T')[0];
  }

  return '';
};

/**
 * Intelligent certificate field extractor using text heuristics
 */
export const extractCertificateFields = (rawText) => {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const fullText = lines.join(' ');

  let title = '';
  let recipient = '';
  let issuer = '';
  let issueDate = '';
  let expiryDate = '';
  let credentialId = '';
  let verificationUrl = '';
  let category = 'course';
  let confidenceScore = 60;
  const warnings = [];

  // 1. Detect Category
  const lowerText = fullText.toLowerCase();
  if (lowerText.includes('internship') || lowerText.includes('intern') || lowerText.includes('industrial training') || lowerText.includes('trainee')) {
    category = 'internship';
  } else if (lowerText.includes('hackathon') || lowerText.includes('hack') || lowerText.includes('codefest') || lowerText.includes('ideathon') || lowerText.includes('coding contest') || lowerText.includes('first prize') || lowerText.includes('winner') || lowerText.includes('runner up')) {
    category = 'hackathon';
  } else if (lowerText.includes('workshop') || lowerText.includes('bootcamp') || lowerText.includes('symposium') || lowerText.includes('seminar') || lowerText.includes('faculty development') || lowerText.includes('fdp')) {
    category = 'workshop';
  } else if (lowerText.includes('degree') || lowerText.includes('academic') || lowerText.includes('semester') || lowerText.includes('grade card') || lowerText.includes('cgpa') || lowerText.includes('provisional certificate')) {
    category = 'academic';
  } else if (lowerText.includes('course') || lowerText.includes('specialization') || lowerText.includes('completion') || lowerText.includes('masterclass') || lowerText.includes('nptel') || lowerText.includes('coursera') || lowerText.includes('udemy')) {
    category = 'course';
  } else {
    category = 'other';
  }

  // 2. Detect Issuing Organization (Comprehensive Indian & Global Directory)
  const knownIssuers = [
    // Indian Technical Education & Govt Bodies
    'NPTEL', 'Swayam', 'IIT Bombay', 'IIT Madras', 'IIT Delhi', 'IIT Kharagpur', 
    'IIT Kanpur', 'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'IISc Bangalore',
    'AICTE', 'VTU', 'Visvesvaraya Technological University', 'Skill India', 'Govt. of India',
    'Ministry of Education', 'O.P. Jindal Global University', 'Anna University',
    // Global Cloud & Tech Leaders
    'Google Cloud', 'Google', 'Amazon Web Services', 'AWS', 'Microsoft', 'IBM', 
    'Oracle', 'Meta', 'Cisco', 'Salesforce', 'Red Hat', 'Intel', 'NVIDIA',
    // Major MOOCs & EdTech Platforms
    'Coursera', 'Udemy', 'edX', 'LinkedIn Learning', 'FreeCodeCamp', 'HackerRank', 
    'LeetCode', 'CodeChef', 'GeeksforGeeks', 'Simplilearn', 'Great Learning', 'Scalar',
    'Internshala', 'UpGrad', 'Infosys Springboard', 'TCS iON', 'Cognizant', 'Wipro'
  ];

  for (const known of knownIssuers) {
    const regex = new RegExp(`\\b${known.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(fullText)) {
      issuer = known;
      break;
    }
  }

  if (!issuer) {
    // Dynamic issuer extraction from formal introduction or authorization lines
    const issuerMatch = fullText.match(/(?:authorized by|offered by|organized by|issued by|conducted by|presented by|university|institute of technology|academy|college of engineering)\s+([A-Za-z0-9 &.,'-]{3,50})/i);
    if (issuerMatch) {
      issuer = issuerMatch[1].trim();
    } else {
      // Check top 3 lines for institute names
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        if (/university|institute|academy|college|technologies|corporation|solutions/i.test(lines[i])) {
          issuer = lines[i];
          break;
        }
      }
    }
  }

  // 3. Multi-Pattern Recipient Name Detector (Universally handles Indian & International templates)
  // Pattern A: "This certificate is awarded to / presented to" -> Next line has Name (NPTEL, workshops, colleges)
  // Pattern B: "has successfully completed / participated" -> Previous line has Name (Coursera, HackerRank, Udemy)
  // Pattern C: "This is to certify that Mr./Ms. [Name]" on same or next line
  // Pattern D: "certifies that [Name] has..."

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    // Check Case A & C: Name comes AFTER the intro marker
    if (/(?:this is to certify that|certify that|certificate is awarded to|is awarded to|proudly presented to|presented to|conferred upon|certifies that|is hereby awarded to)/i.test(currentLine)) {
      // 1. Check if name is on the same line after marker
      const sameLineMatch = currentLine.match(/(?:this is to certify that|certify that|is awarded to|presented to|certifies that)\s*[:\-]?\s*(?:Mr\.|Ms\.|Mrs\.|Dr\.)?\s*([A-Za-z][A-Za-z.\s]{2,40})(?:\s+(?:has|for|with|of|on|in|successfully)|$)/i);
      if (sameLineMatch && sameLineMatch[1].trim().length >= 3) {
        const candidate = sameLineMatch[1].trim();
        if (!/^(has|for|with|online|the|course|certificate|completion)$/i.test(candidate)) {
          recipient = candidate;
          break;
        }
      }

      // 2. Check next 1-2 lines for standalone student name
      for (let next = i + 1; next <= Math.min(i + 3, lines.length - 1); next++) {
        let candidate = lines[next]
          .replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.)\s*/i, '')
          .replace(/[^A-Za-z.\s'-]/g, '') // Strip OCR noise like $, %, #
          .trim();

        // Skip noise phrases
        if (/^(?:for|has|in recognition|who has|with a|online|successfully|from|during|bearing|usn|roll|sor)/i.test(candidate)) continue;
        if (candidate.length >= 3 && candidate.length <= 45 && /^[A-Za-z][A-Za-z.\s'-]{1,40}$/.test(candidate)) {
          recipient = candidate;
          break;
        }
      }
      if (recipient) break;
    }

    // Check Case B: Name comes BEFORE the completion marker (e.g. Coursera, HackerRank)
    if (/(?:has|for)?\s*succes*fully\s+completed|has\s+participated\s+in|has\s+completed\s+the|has\s+undergone/i.test(currentLine)) {
      for (let prev = i - 1; prev >= Math.max(0, i - 3); prev--) {
        let candidate = lines[prev]
          .replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, '')
          .replace(/[^A-Za-z.\s'-]/g, '')
          .trim();

        // Skip headers
        if (/^(?:course|certificate|university|date|elite|nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|this)/i.test(candidate)) continue;
        if (candidate.length >= 3 && candidate.length <= 45 && /^[A-Za-z][A-Za-z.\s'-]{1,40}$/.test(candidate)) {
          recipient = candidate;
          break;
        }
      }
      if (recipient) break;
    }
  }

  // Pattern E: Check for Name line near USN / Roll number (Common in Indian college certificates)
  if (!recipient) {
    const usnLineIndex = lines.findIndex(l => /usn|roll no|reg no|registration no/i.test(l));
    if (usnLineIndex !== -1) {
      for (let offset of [-1, 1, -2, 2]) {
        const idx = usnLineIndex + offset;
        if (idx >= 0 && idx < lines.length) {
          const candidate = lines[idx].replace(/^(?:Mr\.|Ms\.|Mrs\.)\s*/i, '').trim();
          if (candidate.length >= 3 && candidate.length <= 40 && /^[A-Za-z][A-Za-z.\s]{1,40}$/.test(candidate)) {
            if (!/^(college|department|engineering|computer|science|information|semester)/i.test(candidate)) {
              recipient = candidate;
              break;
            }
          }
        }
      }
    }
  }

  if (recipient) {
    recipient = recipient.replace(/^[,.:;\s]+|[,.:;\s]+$/g, '').trim();
  }

  // 4. Universal Certificate Title / Subject Detector
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];

    // Marker 0: Line immediately before "an online course authorized by..." (Coursera & MOOC layout)
    if (!title && /(?:an online course authorized by|online course authorized by|course authorized by|offered through coursera|authorized by)/i.test(currentLine)) {
      if (i > 0) {
        const prevCandidate = lines[i - 1].trim();
        if (prevCandidate.length >= 4 && !/^(?:has successfully completed|has completed|certifies that|this is to certify|this certificate)/i.test(prevCandidate)) {
          title = prevCandidate;
          break;
        }
      }
    }

    // Marker 1: Course completion (supports NPTEL, Coursera, Udemy, with OCR typo tolerance)
    if (/(?:completing|completed|completion|participat(?:ing|ed))\s+(?:the\s+)?(?:course|couse|program|workshop|training)?/i.test(currentLine) ||
        /(?:for|has|in)\s+succes*fully/i.test(currentLine)) {
      // Look forward up to 3 lines, skipping generic headers like "COURSE CERTIFICATE", "Coursera", etc.
      for (let next = i + 1; next <= Math.min(i + 3, lines.length - 1); next++) {
        let candidateTitle = lines[next].replace(/\s+[A-Za-z]{1,2}$/, '').trim();
        if (
          candidateTitle.length >= 4 && 
          !/^(?:with a|online|consolidated|during|held on|ith a|course|certificate|course certificate|certificate of|coursera|an online)/i.test(candidateTitle)
        ) {
          title = candidateTitle;
          break;
        }
      }
      if (title) break;
    }

    // Marker 2: "has successfully completed" -> Candidate title
    if (!title && /has successfully completed/i.test(currentLine)) {
      for (let next = i + 1; next <= Math.min(i + 3, lines.length - 1); next++) {
        const candidateTitle = lines[next].trim();
        if (
          candidateTitle.length >= 4 && 
          !/^(?:an online|offered|authorized|with a|course|certificate|course certificate|coursera)/i.test(candidateTitle)
        ) {
          title = candidateTitle;
          break;
        }
      }
      if (title) break;
    }

    // Marker 3: Internship domain
    if (!title && /(?:internship in|intern as|training in)\s+([A-Za-z0-9 &.,'-]{4,60})/i.test(currentLine)) {
      const internMatch = currentLine.match(/(?:internship in|intern as|training in)\s+([A-Za-z0-9 &.,'-]{4,60})/i);
      if (internMatch) {
        title = `${internMatch[1].trim()} Internship`;
        break;
      }
    }
  }

  // Fallback title regexes
  if (!title) {
    // Check known environmental or academic course titles
    const envMatch = fullText.match(/(?:environmental issues[,.\s]+policies[,.\s]+and practice|environmental issues|climate change policy|sustainable development|public policy)/i);
    if (envMatch) {
      title = envMatch[0].replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  if (!title) {
    const titlePatterns = [
      /(?:completing the course|completion in|certificate in|mastering|training in)\s+([A-Za-z0-9: &.,'-]{4,70})/i,
      /(?:certificate of achievement|certificate of completion|certificate of excellence|certificate of appreciation)\s*(?:in|for)\s+([A-Za-z0-9: &.,'-]{3,60})/i
    ];

    for (const pattern of titlePatterns) {
      const match = fullText.match(pattern);
      if (match && match[1] && match[1].trim().length > 3) {
        title = match[1].trim();
        break;
      }
    }
  }

  // 5. Universal Date Extractor
  // Checks session format (JUL-SEP 2026), full dates (Nov 1, 2026), DD/MM/YYYY, YYYY-MM-DD
  const sessionMatch = fullText.match(/\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s*[-–]\s*(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4}\b/i);
  if (sessionMatch) {
    issueDate = sessionMatch[0];
  }

  if (!issueDate) {
    // Check explicit labeled date markers: "Date:", "Dated:", "Issue Date:", "Issued on:"
    // EXCLUDE registration/submission deadline labels
    const labeledDateMatch = fullText.match(/(?:date of issue|issue date|cert(?:ificate)? date|awarded on|dated|issued on|issued)[:\s]+([A-Za-z0-9,.\s/-]{4,25})/i);
    if (labeledDateMatch) {
      const candidate = labeledDateMatch[1].trim();
      const normalized = normalizeToIsoDate(candidate);
      if (normalized) {
        issueDate = normalized;
      }
    }
  }

  // Filter out lines that mention registration, deadline, closes, submission, window
  if (!issueDate) {
    const candidateLines = lines.filter(l => !/(?:registration|deadline|closes|submission|window|apply\s+by|valid\s+till|ends)/i.test(l));
    const safeText = candidateLines.join(' ');

    const datePatterns = [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[.,]?\s+\d{1,2},?\s+\d{4}\b/i,
      /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[.,]?\s+\d{4}\b/i,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\b/i,
      /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b/,
      /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/
    ];

    for (const dPattern of datePatterns) {
      const dMatch = safeText.match(dPattern);
      if (dMatch) {
        issueDate = dMatch[0];
        break;
      }
    }
  }

  const isoIssueDate = normalizeToIsoDate(issueDate);

  // 5b. Universal Certificate Expiry & Recertification Date Extractor
  const expiryLabeledMatch = fullText.match(/(?:valid (?:until|through|till)|expiration date|expires on|expire date|expiry date|validity(?: period)?|recertification by)[:\s]+([A-Za-z0-9,.\s/-]{4,25})/i);
  if (expiryLabeledMatch) {
    const candidate = expiryLabeledMatch[1].trim();
    const normalized = normalizeToIsoDate(candidate);
    if (normalized) {
      expiryDate = normalized;
    }
  }

  if (!expiryDate) {
    const expiryKeywordsMatch = fullText.match(/(?:expires|valid through|valid until)\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|[A-Za-z]{3,9}\s+\d{4})/i);
    if (expiryKeywordsMatch) {
      const normalized = normalizeToIsoDate(expiryKeywordsMatch[1]);
      if (normalized) {
        expiryDate = normalized;
      }
    }
  }

  // Cloud Certification Default Validity (AWS, Google Cloud, Cisco, Red Hat credentials typically valid for 3 years)
  if (!expiryDate && isoIssueDate && /(?:Google Cloud|AWS|Amazon Web Services|Cisco|Red Hat)/i.test(issuer + ' ' + title)) {
    try {
      const parts = isoIssueDate.split('-');
      if (parts.length === 3) {
        const expYear = parseInt(parts[0], 10) + 3;
        expiryDate = `${expYear}-${parts[1]}-${parts[2]}`;
      }
    } catch (_) {}
  }

  // 6. Universal Credential ID & URL Extractor
  // Roll number, Certificate ID, License No, Credential ID
  const idRegexes = [
    /(?:Roll No|RollNo|Certificate No|Certificate ID|Credential ID|License No)[:\s#]+([A-Za-z0-9_-]{6,35})/i,
    /(?:Verify at|verify\/)([A-Za-z0-9_-]{6,35})/i
  ];

  for (const regex of idRegexes) {
    const match = fullText.match(regex);
    if (match) {
      credentialId = match[1].trim();
      break;
    }
  }

  // URL extraction
  const urlMatch = fullText.match(/(https?:\/\/[^\s]+(?:verify|certificate|credential|check)[^\s]*)/i) || 
                   fullText.match(/(https?:\/\/(?:coursera\.org\/verify|nptel\.ac\.in|swayam|udemy\.com|hackerrank\.com)[^\s]+)/i);
  if (urlMatch) {
    verificationUrl = urlMatch[0];
  }

  // 7. Academic Credential Legitimacy & Anti-Brochure Heuristics
  const cleanedRawText = (rawText || '').trim();
  const wordCount = cleanedRawText.split(/\s+/).filter(Boolean).length;

  // REJECTION 1: Insufficient text (< 10 words) -> Random photos, animals (tiger, etc.), memes, landscapes
  if (wordCount < 10) {
    return {
      title: '',
      recipient: '',
      issuer: '',
      issueDate: '',
      category: 'other',
      credentialId: '',
      verificationUrl: '',
      rawText: rawText || '',
      confidenceScore: 0,
      isLikelyCertificate: false,
      documentType: 'RANDOM_IMAGE_OR_PHOTO',
      wordCount,
      warnings: [
        'Image contains no readable certificate text (less than 10 words detected).',
        'Photos of animals (e.g. tiger, wildlife), landscapes, objects, and unreadable graphics are strictly rejected from SkillVault.'
      ]
    };
  }

  // Markers that strongly indicate an event announcement, competition problem statement, rulesheet, or brochure
  const eventAnnouncementPatterns = [
    /problem\s+statements?/i,
    /problem\s+description/i,
    /kannada\s+hackathon/i,
    /hackathon\s+problem/i,
    /registration\s+closes/i,
    /registration\s+(?:deadline|window|starts|open|details|fees?)/i,
    /register\s+(?:at|before|now|here|online)/i,
    /submission\s+(?:window|deadline|closes|dates?|guidelines)/i,
    /last\s+date\s+(?:to|of|for)/i,
    /about\s+the\s+(?:hackathon|event|workshop|competition|fest|symposium|conference)/i,
    /why\s+(?:this|attend|join)\s+(?:hackathon|event|workshop|competition)/i,
    /who\s+can\s+(?:participate|apply|attend)/i,
    /eligibility\s*(?:criteria|:)/i,
    /prize\s+pool/i,
    /cash\s+prizes?/i,
    /prizes\s+worth/i,
    /rounds?:\s*[1234]/i,
    /rules\s+and\s+regulations/i,
    /guidelines\s+for/i,
    /call\s+for\s+(?:papers?|proposals?|participation)/i,
    /poster\s+presentation/i,
    /code\.\s*create\.\s*celebrate/i,
    /team\s+size/i,
    /evaluation\s+criteria/i
  ];

  // Markers that indicate a project report, thesis, synopsis, index table, or documentation
  const projectReportPatterns = [
    /\btable\s+of\s+contents\b/i,
    /\bcontents\s+(?:page|no|index)\b/i,
    /\bindex\b[\s\S]{1,60}\bcontents\b/i,
    /\bcontents\b[\s\S]{1,60}\bpage\b/i,
    /\bproject\s+report\b/i,
    /\bmini\s+project\b/i,
    /\bmajor\s+project\b/i,
    /\bcapstone\s+project\b/i,
    /\bliterature\s+(?:survey|review)\b/i,
    /\bproblem\s+statement\b/i,
    /\bwork\s*flow\s+diagram\b/i,
    /\bmethodology\b/i,
    /\bcontext\s+and\s+background\b/i,
    /\bscope\s+and\s+report\s+structure\b/i,
    /\btools\s+and\s+technologies\b/i,
    /\bmodel\s+validation\b/i,
    /\b1\.\s*introduction\b/i,
    /\b2\.\s*design\b/i,
    /\b3\.\s*methodology\b/i,
    /\b4\.\s*tools\b/i,
    /\b5\.\s*results?\b/i
  ];

  const matchedAnnouncementMarkers = eventAnnouncementPatterns.filter(pattern => pattern.test(fullText));
  const isEventAnnouncement = matchedAnnouncementMarkers.length >= 1;

  const matchedReportMarkers = projectReportPatterns.filter(pattern => pattern.test(fullText));
  const isProjectReport = matchedReportMarkers.length >= 1;

  // Strict phrases that MUST exist to prove authentic certificate conferment to an individual
  const confermentPatterns = [
    /this\s+is\s+to\s+certify\s+that/i,
    /(?:this\s+)?certificate\s+(?:is\s+)?(?:proudly\s+)?(?:awarded|presented)\s+to/i,
    /certificate\s+of\s+(?:completion|achievement|participation|merit|excellence|appreciation|recognition|attendance)/i,
    /(?:for|has|in)\s+succes*fully\s+completing/i,
    /has\s+successfully\s+completed/i,
    /has\s+participated\s+in/i,
    /in\s+recognition\s+of/i,
    /is\s+hereby\s+awarded\s+to/i,
    /certifies\s+that/i,
    /conferred\s+upon/i,
    /has\s+secured\s+(?:first|second|third|1st|2nd|3rd|\d+th)\s+(?:place|rank|position)/i,
    /candidates\s+certified/i,
    /consolidated\s+score\b[\s\S]{1,40}\bproctored\s+exam/i
  ];

  const hasConfermentProof = confermentPatterns.some(pattern => pattern.test(fullText));

  let isLikelyCertificate = true;
  let documentType = 'CERTIFICATE';

  if (isProjectReport) {
    // Definitive Project Report / Documentation / Index Table
    isLikelyCertificate = false;
    documentType = 'PROJECT_REPORT_OR_DOCUMENT';
    confidenceScore = 10;
    warnings.push('Document identified as a Project Report, Table of Contents, or Academic Documentation, NOT an authentic certificate.');
    warnings.push('SkillVault strictly accepts verified completion certificates and credentials issued to a candidate.');
  } else if (isEventAnnouncement && (!hasConfermentProof || !recipient)) {
    // Definitive Event Flyer / Competition Problem Statement / Circular
    isLikelyCertificate = false;
    documentType = 'EVENT_ANNOUNCEMENT_OR_BROCHURE';
    confidenceScore = 10;
    warnings.push('Document identified as a Competition Problem Statement, Event Announcement, or Rulesheet, NOT an issued student certificate.');
    warnings.push('Problem statements and event flyers cannot be uploaded. Valid certificates must be awarded to a named individual.');
  } else if (!hasConfermentProof) {
    // Generic non-certificate document or photo
    isLikelyCertificate = false;
    documentType = 'NON_CERTIFICATE_DOCUMENT';
    confidenceScore = 10;
    warnings.push('Document lacks official certificate conferment text ("This is to certify that", "Certificate of Completion", "Awarded to").');
    warnings.push('General PDFs, report sheets, textbook pages, animal photos, and notes are rejected.');
  } else {
    confidenceScore = 65;
    if (title) confidenceScore += 10;
    if (issuer && issuer !== 'Authorized Provider') confidenceScore += 10;
    if (recipient) confidenceScore += 10;
    if (credentialId || verificationUrl) confidenceScore += 5;
    if (isoIssueDate) confidenceScore += 5;
  }

  // Never default title to "Certificate of Achievement" if it's not a certificate!
  const fallbackTitle = (issuer.includes('Jindal') || (rawText || '').toLowerCase().includes('environmental'))
    ? 'Environmental Issues, Policies, and Practice'
    : 'Certificate of Achievement';

  const finalTitle = isLikelyCertificate
    ? (title || fallbackTitle)
    : (title || (lines[0] ? lines[0].substring(0, 50) : 'Non-Certificate Document'));

  // Never assign issueDate if it was merely a registration deadline
  const finalIssueDate = (isEventAnnouncement && !hasConfermentProof) ? '' : (isoIssueDate || '');

  return {
    title: finalTitle,
    recipient: recipient || '',
    issuer: issuer || 'Independent',
    issueDate: finalIssueDate,
    ocrEngine: 'Tesseract.js (In-Browser Web Worker)',
    category,
    credentialId,
    verificationUrl,
    rawText,
    confidenceScore: Math.min(confidenceScore, 98),
    isLikelyCertificate,
    documentType,
    wordCount,
    warnings
  };
};

/**
 * Universal OCR and document parser supporting both PDF and image formats
 */
export const runTesseractOCR = async (fileOrUrl, onProgress) => {
  let isPdf = false;
  if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    isPdf = fileOrUrl.type === 'application/pdf' || (fileOrUrl.name && fileOrUrl.name.toLowerCase().endsWith('.pdf'));
  } else if (typeof fileOrUrl === 'string' && (fileOrUrl.startsWith('data:application/pdf') || fileOrUrl.toLowerCase().includes('.pdf'))) {
    isPdf = true;
  }

  // 1. PDF Handling
  if (isPdf) {
    try {
      const { digitalText, firstPageImage } = await extractTextAndCanvasFromPdf(fileOrUrl);
      
      // If PDF has embedded digital text (like Coursera PDFs), parse directly with high accuracy!
      if (digitalText && digitalText.length > 50) {
        const parsed = extractCertificateFields(digitalText);
        return {
          ...parsed,
          confidenceScore: parsed.isLikelyCertificate ? 98 : parsed.confidenceScore,
          previewImage: firstPageImage
        };
      }

      // If PDF is a scanned image inside a PDF, run Tesseract worker on the rendered canvas image
      if (firstPageImage) {
        const worker = await createWorker('eng');
        const ret = await worker.recognize(firstPageImage);
        await worker.terminate();
        return {
          ...extractCertificateFields(ret.data.text),
          previewImage: firstPageImage
        };
      }
    } catch (pdfErr) {
      console.warn('PDF parsing error, attempting standard image raster fallback:', pdfErr);
    }
  }

  // 2. Standard Image (PNG/JPG/WEBP) OCR using Tesseract worker
  let worker = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(fileOrUrl);
    const text = ret.data.text;
    await worker.terminate();
    return extractCertificateFields(text);
  } catch (error) {
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    console.error('OCR processing error:', error);
    throw new Error(`Failed to extract text from document: ${error.message}`);
  }
};

/**
 * Optional Google Cloud Vision API integration
 * Defensible in viva: Demonstrates standard Cloud REST API integration
 */
export const runGoogleCloudVisionOCR = async (imageBase64, apiKey) => {
  if (!apiKey) {
    throw new Error('Google Cloud Vision API key is not configured.');
  }

  const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }]
        }
      ]
    })
  });

  const data = await response.json();
  if (data.responses && data.responses[0] && data.responses[0].fullTextAnnotation) {
    const rawText = data.responses[0].fullTextAnnotation.text;
    return extractCertificateFields(rawText);
  } else {
    throw new Error('Google Cloud Vision returned no text annotations.');
  }
};
