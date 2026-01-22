/**
 * AI-Powered Project Validation Service
 * Anti-hallucination system for rigorous code review
 * Validates GitHub repos + live URLs against assignment requirements
 */

// GitHub API base URL
const GITHUB_API_BASE = "https://api.github.com";

// Enhanced file limits for comprehensive review
const MAX_FILE_CONTENT_LENGTH = 8000;
const MAX_TOTAL_CONTENT_LENGTH = 30000;
const MAX_FILES_TO_FETCH = 25;
const MAX_DIRECTORY_DEPTH = 4;

// Comprehensive ignore patterns
const IGNORE_PATTERNS = [
  /^\.git/,
  /^node_modules/,
  /^\.next/,
  /^dist\//,
  /^build\//,
  /^out\//,
  /^\.vscode/,
  /^\.idea/,
  /^__pycache__/,
  /^target\//,
  /^\.gradle/,
  /^\.mvn/,
  /^\.cache/,
  /^coverage\//,
  /^\.nyc_output/,
  /\.lock$/i,
  /\.log$/i,
  /\.(png|jpg|jpeg|gif|svg|ico|bmp|webp)$/i,
  /\.(woff|woff2|ttf|eot|otf)$/i,
  /\.(mp3|mp4|wav|avi|mov|mkv)$/i,
  /\.(pdf|docx?|xlsx?|pptx?)$/i,
  /\.(zip|tar|gz|rar|7z)$/i,
  /\.(min\.js|min\.css|bundle\.js)$/i,
  /\.map$/i,
  /\.snap$/i,
  /\.(env|local)$/i,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^Cargo\.lock$/,
  /^Gemfile\.lock$/,
  /^composer\.lock$/,
  /^Poetry\.lock$/,
  /\.DS_Store$/,
  /Thumbs\.db$/i,
];

/**
 * Parse GitHub URL with enhanced validation
 */
export const parseGitHubUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  try {
    const trimmedUrl = url.trim();

    // Handle SSH format
    if (trimmedUrl.startsWith("git@github.com:")) {
      const match = trimmedUrl.match(
        /git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?/,
      );
      if (match) {
        return { owner: match[1], repo: match[2], url: trimmedUrl };
      }
    }

    // Handle HTTPS format
    if (trimmedUrl.startsWith("http")) {
      const urlObj = new URL(trimmedUrl);
      if (
        urlObj.hostname !== "github.com" &&
        !urlObj.hostname.includes("github.io")
      ) {
        return null;
      }

      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repo = pathParts[1].replace(/\.git$/, "");
        const branch =
          pathParts.length > 3 && pathParts[2] === "tree" ? pathParts[3] : null;

        return {
          owner,
          repo,
          branch,
          url: trimmedUrl,
        };
      }
    }
  } catch (error) {
  }

  return null;
};

/**
 * Enhanced URL validation with timeout and retry
 */
export const validateUrl = async (url, timeout = 10000) => {
  if (!url) return { valid: false, error: "No URL provided" };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      signal: controller.signal,
      headers: {
        "User-Agent": "ProjectValidation/1.0",
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    const isHTML =
      contentType.includes("text/html") ||
      contentType.includes("application/xhtml+xml");

    return {
      valid: response.ok,
      isHTML,
      status: response.status,
      contentType,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      valid: false,
      error: error.name === "AbortError" ? "Request timeout" : error.message,
    };
  }
};

/**
 * Fetch repository info with enhanced metadata
 */
export const fetchRepoInfo = async (owner, repo, token = null) => {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ProjectValidation/1.0",
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        return { success: false, error: "Repository not found or private" };
      }
      if (response.status === 403) {
        return {
          success: false,
          error: "GitHub API rate limit exceeded. Please try again later.",
        };
      }
      if (response.status === 401) {
        return { success: false, error: "Authentication required" };
      }
      return {
        success: false,
        error: `GitHub API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();

    // Fetch additional repo statistics
    let languages = {};
    try {
      const langsResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
        { headers },
      );
      if (langsResponse.ok) {
        languages = await langsResponse.json();
      }
    } catch (langError) {
    }

    return {
      success: true,
      data: {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        language: data.language,
        languages: languages,
        defaultBranch: data.default_branch,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        size: data.size,
        stars: data.stargazers_count,
        forks: data.forks_count,
        openIssues: data.open_issues_count,
        private: data.private,
        hasIssues: data.has_issues,
        hasProjects: data.has_projects,
        hasWiki: data.has_wiki,
        license: data.license?.name,
        topics: data.topics || [],
        visibility: data.visibility,
        archived: data.archived,
        disabled: data.disabled,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch repo info: ${error.message}`,
    };
  }
};

/**
 * Enhanced file content fetcher with multiple fallbacks
 */
export const fetchFileContent = async (
  owner,
  repo,
  filePath,
  branch = null,
  token = null,
) => {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ProjectValidation/1.0",
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    // Try multiple branch names in order
    const branchAttempts = branch ? [branch] : [];
    branchAttempts.push("main", "master", "develop", "gh-pages");

    for (const branchName of branchAttempts) {
      try {
        const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branchName}`,
          { headers },
        );

        if (response.ok) {
          const data = await response.json();

          if (data.type === "file" && data.content) {
            let content = "";
            if (data.encoding === "base64") {
              content = atob(data.content.replace(/\n/g, ""));
            } else {
              content = data.content;
            }

            // Detect file type for better handling
            const extension = filePath.split(".").pop().toLowerCase();
            const isTextFile = [
              "js",
              "ts",
              "jsx",
              "tsx",
              "py",
              "java",
              "c",
              "cpp",
              "cs",
              "go",
              "rs",
              "php",
              "rb",
              "swift",
              "kt",
              "scala",
              "html",
              "css",
              "scss",
              "less",
              "json",
              "yml",
              "yaml",
              "xml",
              "md",
              "txt",
              "sh",
              "bash",
              "zsh",
              "sql",
              "graphql",
              "dockerfile",
              "env",
              "ini",
              "toml",
              "lock",
            ].includes(extension);

            return {
              success: true,
              content: isTextFile
                ? content.slice(0, MAX_FILE_CONTENT_LENGTH)
                : "[BINARY FILE]",
              path: filePath,
              size: data.size,
              sha: data.sha,
              truncated: isTextFile && content.length > MAX_FILE_CONTENT_LENGTH,
              encoding: data.encoding,
              isBinary: !isTextFile,
              extension,
              url: data.html_url,
            };
          }
        } else if (response.status === 404) {
          continue; // Try next branch
        }
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      error: `File not found in any branch: ${filePath}`,
    };
  } catch (error) {
    return { success: false, error: `Failed to fetch file: ${error.message}` };
  }
};

/**
 * Enhanced repository tree fetcher with directory structure
 */
export const fetchRepoTree = async (
  owner,
  repo,
  branch = "main",
  token = null,
) => {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "ProjectValidation/1.0",
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    // First get default branch if not provided
    let targetBranch = branch;
    if (!targetBranch) {
      const repoInfo = await fetchRepoInfo(owner, repo, token);
      if (repoInfo.success) {
        targetBranch = repoInfo.data.defaultBranch;
      } else {
        targetBranch = "main";
      }
    }

    // Fetch tree recursively
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
      { headers },
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch tree: ${response.status}`,
      };
    }

    const data = await response.json();

    // Organize files by directory
    const files = [];
    const directories = new Set();

    data.tree.forEach((item) => {
      if (item.type === "blob") {
        files.push({
          path: item.path,
          size: item.size,
          sha: item.sha,
          url: item.url,
        });

        // Extract directory
        const dirPath = item.path.split("/").slice(0, -1).join("/");
        if (dirPath) {
          directories.add(dirPath);
        }
      }
    });

    // Calculate directory depth
    const directoryDepths = Array.from(directories).map((dir) => ({
      path: dir,
      depth: dir.split("/").length,
    }));

    return {
      success: true,
      files,
      directories: Array.from(directories),
      directoryDepths,
      totalFiles: files.length,
      sha: data.sha,
      truncated: data.truncated || false,
    };
  } catch (error) {
    return { success: false, error: `Failed to fetch tree: ${error.message}` };
  }
};

/**
 * Smart file prioritization for comprehensive review
 */
const prioritizeFiles = (files, repoInfo) => {
  const priority = {
    critical: [], // README, config, entry points
    high: [], // Source files in main directories
    medium: [], // Test files, documentation
    low: [], // Everything else
  };

  // Build file scoring system
  const scores = files.map((file) => {
    const path = file.path;
    const lowerPath = path.toLowerCase();
    const filename = path.split("/").pop().toLowerCase();
    const extension = filename.split(".").pop();
    const depth = path.split("/").length;

    let score = 0;
    let category = "low";

    // Critical files
    if (
      filename === "readme.md" ||
      filename === "readme.txt" ||
      filename === "readme" ||
      filename === "package.json" ||
      filename === "requirements.txt" ||
      filename === "pom.xml" ||
      filename === "build.gradle" ||
      filename === "cargo.toml" ||
      filename === "composer.json" ||
      filename === "go.mod" ||
      filename === "dockerfile" ||
      filename === "docker-compose.yml" ||
      filename === ".gitignore" ||
      filename === "index.html" ||
      filename === "app.js" ||
      filename === "app.py" ||
      filename === "main.js" ||
      filename === "main.py" ||
      filename === "main.rs" ||
      filename === "main.go" ||
      filename === "program.cs" ||
      filename === "application.properties" ||
      filename === ".env.example" ||
      filename === ".env.sample"
    ) {
      score += 100;
      category = "critical";
    }

    // High priority: source files
    if (
      lowerPath.includes("/src/") ||
      lowerPath.includes("/app/") ||
      lowerPath.includes("/lib/") ||
      lowerPath.includes("/components/") ||
      lowerPath.includes("/pages/") ||
      lowerPath.includes("/routes/") ||
      lowerPath.includes("/controllers/") ||
      lowerPath.includes("/models/") ||
      lowerPath.includes("/views/") ||
      lowerPath.includes("/public/") ||
      (depth <= 2 &&
        [
          "js",
          "ts",
          "jsx",
          "tsx",
          "py",
          "java",
          "cs",
          "go",
          "rs",
          "php",
          "rb",
        ].includes(extension))
    ) {
      score += 50;
      if (category === "low") category = "high";
    }

    // Medium priority: tests, docs, configs
    if (
      lowerPath.includes("/test/") ||
      lowerPath.includes("/tests/") ||
      lowerPath.includes("/__tests__/") ||
      lowerPath.includes("/spec/") ||
      lowerPath.includes("/docs/") ||
      lowerPath.includes("/documentation/") ||
      lowerPath.includes("/config/") ||
      lowerPath.includes("/configuration/") ||
      filename.includes("test") ||
      filename.includes("spec") ||
      filename.endsWith(".config.js") ||
      filename.endsWith(".config.ts") ||
      filename.endsWith(".settings.json")
    ) {
      score += 30;
      if (category === "low") category = "medium";
    }

    // Penalize deep nesting
    if (depth > MAX_DIRECTORY_DEPTH) {
      score -= 20;
    }

    // Penalize large files (but not too much for source files)
    if (file.size > 100000 && !["high", "critical"].includes(category)) {
      score -= 10;
    }

    return { path, score, category, depth, size: file.size };
  });

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  // Group by category
  scores.forEach(({ path, category }) => {
    priority[category].push(path);
  });

  // Take top N files across all categories
  const allFiles = [
    ...priority.critical,
    ...priority.high,
    ...priority.medium,
    ...priority.low,
  ].slice(0, MAX_FILES_TO_FETCH);

  return allFiles;
};

/**
 * Comprehensive project content fetcher with anti-hallucination safeguards
 */
export const fetchProjectContent = async (repoUrl, options = {}) => {
  const startTime = Date.now();

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      success: false,
      error:
        "Invalid GitHub URL format. Expected: https://github.com/owner/repo",
      validationFailed: true,
    };
  }

  const { owner, repo, branch } = parsed;

  // 1. Fetch comprehensive repository info
  const repoInfo = await fetchRepoInfo(owner, repo, options.githubToken);
  if (!repoInfo.success) {
    return {
      success: false,
      error: repoInfo.error,
      validationFailed: true,
      step: "repo_info_fetch",
    };
  }

  if (repoInfo.data.private && !options.githubToken) {
    return {
      success: false,
      error: "Repository is private. Authentication token required.",
      validationFailed: true,
      private: true,
    };
  }

  // 2. Fetch complete file tree
  const tree = await fetchRepoTree(
    owner,
    repo,
    branch || repoInfo.data.defaultBranch,
    options.githubToken,
  );
  if (!tree.success) {
    return {
      success: false,
      error: tree.error,
      validationFailed: true,
      step: "tree_fetch",
      repoInfo: repoInfo.data,
    };
  }

  // 3. Filter for relevant files
  const relevantFiles = tree.files.filter((file) => {
    // Skip ignored patterns
    if (IGNORE_PATTERNS.some((pattern) => pattern.test(file.path))) {
      return false;
    }

    // Skip very large files (>1MB)
    if (file.size > 1000000) {
      return false;
    }

    return true;
  });

  if (relevantFiles.length === 0) {
    return {
      success: false,
      error:
        "No relevant code files found. Repository may be empty or contain only binary/assets.",
      validationFailed: true,
      repoInfo: repoInfo.data,
      treeInfo: tree,
    };
  }

  // 4. Prioritize and select files for review
  const filesToFetch = prioritizeFiles(relevantFiles, repoInfo.data);

  // 5. Fetch file contents with progress tracking
  const fileContents = [];
  let totalContentLength = 0;
  let fetchedFiles = 0;
  let skippedFiles = 0;

  for (const filePath of filesToFetch) {
    if (totalContentLength >= MAX_TOTAL_CONTENT_LENGTH) {
      break;
    }

    const fileInfo = tree.files.find((f) => f.path === filePath);
    if (!fileInfo) continue;

    const result = await fetchFileContent(
      owner,
      repo,
      filePath,
      branch || repoInfo.data.defaultBranch,
      options.githubToken,
    );

    if (
      result.success &&
      result.content &&
      result.content !== "[BINARY FILE]"
    ) {
      const availableSpace = MAX_TOTAL_CONTENT_LENGTH - totalContentLength;
      const contentToAdd = result.content.slice(0, availableSpace);

      fileContents.push({
        path: result.path,
        content: contentToAdd,
        size: result.size,
        sha: result.sha,
        truncated:
          result.truncated || contentToAdd.length < result.content.length,
        isBinary: result.isBinary,
        extension: result.extension,
        url: result.url,
      });

      totalContentLength += contentToAdd.length;
      fetchedFiles++;
    } else {
      skippedFiles++;
    }
  }

  if (fileContents.length === 0) {
    return {
      success: false,
      error: "Could not fetch any readable file contents",
      validationFailed: true,
      repoInfo: repoInfo.data,
      treeInfo: tree,
    };
  }

  // 6. Calculate coverage metrics
  const totalRelevantSize = relevantFiles.reduce(
    (sum, file) => sum + (file.size || 0),
    0,
  );
  const fetchedSize = fileContents.reduce(
    (sum, file) => sum + (file.size || 0),
    0,
  );
  const coveragePercentage =
    totalRelevantSize > 0
      ? Math.round((fetchedSize / totalRelevantSize) * 100)
      : 0;

  const elapsedTime = Date.now() - startTime;

  return {
    success: true,
    repoInfo: repoInfo.data,
    files: fileContents,
    treeInfo: {
      totalFiles: tree.totalFiles,
      relevantFiles: relevantFiles.length,
      directories: tree.directories,
      sha: tree.sha,
    },
    metrics: {
      filesFetched: fetchedFiles,
      filesSkipped: skippedFiles,
      totalContentLength,
      coveragePercentage,
      elapsedTime,
    },
    availableFiles: relevantFiles.map((f) => f.path).slice(0, 50),
    validationTimestamp: new Date().toISOString(),
  };
};

/**
 * Enhanced live URL analyzer
 */
export const analyzeLiveUrl = async (url, repoInfo = null) => {
  if (!url) return null;

  try {
    const validation = await validateUrl(url, 15000);

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
        url,
      };
    }

    // Try to fetch page content for analysis
    let pageContent = "";
    let title = "";
    let metaDescription = "";

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ProjectValidator/1.0)",
        },
      });

      if (response.ok) {
        const html = await response.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        title = titleMatch ? titleMatch[1].trim() : "";

        // Extract meta description
        const descMatch = html.match(
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i,
        );
        metaDescription = descMatch ? descMatch[1].trim() : "";

        // Extract body content (simplified)
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          // Remove scripts and styles
          pageContent = bodyMatch[1]
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 2000);
        }
      }
    } catch (fetchError) {
    }

    return {
      valid: true,
      url,
      title,
      metaDescription,
      pageContent,
      ...validation,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Analysis failed: ${error.message}`,
      url,
    };
  }
};

/**
 * STRICT ANTI-HALLUCINATION FORMATTER
 * Forces AI to examine code systematically
 */
export const formatProjectForReview = (
  projectData,
  requirements,
  liveUrlData = null,
) => {
  if (!projectData.success) {
    return `=== STRICT ANTI-HALLUCINATION REVIEW ===

REPOSITORY VALIDATION FAILED:
Error: ${projectData.error}
Step: ${projectData.step || "unknown"}
${projectData.repoInfo ? `Repository: ${projectData.repoInfo.fullName}` : ""}

CRITICAL: This submission CANNOT be reviewed because the repository could not be accessed.
AI MUST RETURN: Score: 0%, Status: FAILED
Reason: Repository inaccessible - cannot verify any requirements.`;
  }

  // Calculate review metrics
  const totalFiles = projectData.treeInfo?.totalFiles || 0;
  const reviewedFiles = projectData.files.length;
  const coverage = projectData.metrics?.coveragePercentage || 0;

  let formatted = `=== STRICT ANTI-HALLUCINATION REVIEW ===
# MANDATORY: AI MUST FOLLOW THESE RULES

## CRITICAL REVIEW RULES:
1. ONLY use evidence from the code below
2. NEVER assume features exist without code proof
3. NEVER fill gaps with assumptions
4. MARK REQUIREMENTS as NOT MET if no code evidence
5. CITE SPECIFIC LINE NUMBERS and file paths
6. DO NOT accept partial implementations
7. DO NOT give credit for inferred functionality

## PROJECT METADATA:
Repository: ${projectData.repoInfo.fullName}
Primary Language: ${projectData.repoInfo.language || "Mixed"}
Languages Used: ${Object.keys(projectData.repoInfo.languages || {}).join(", ") || "Unknown"}
Default Branch: ${projectData.repoInfo.defaultBranch}
Last Commit: ${new Date(projectData.repoInfo.pushedAt).toLocaleDateString()}

## CODE COVERAGE ANALYSIS:
Total Files in Repo: ${totalFiles}
Files Reviewed: ${reviewedFiles}
Code Coverage: ${coverage}%
Review Depth: ${coverage >= 70 ? "GOOD" : coverage >= 40 ? "MODERATE" : "LIMITED"}

## REPOSITORY STRUCTURE:
${
  projectData.treeInfo?.directories
    ?.slice(0, 20)
    .map((dir) => `- ${dir}`)
    .join("\n") || "No directories found"
}
${projectData.treeInfo?.directories?.length > 20 ? `... and ${projectData.treeInfo.directories.length - 20} more directories` : ""}

## AVAILABLE FILES (${projectData.availableFiles?.length || 0}):
${
  projectData.availableFiles
    ?.slice(0, 30)
    .map((file, i) => `${i + 1}. ${file}`)
    .join("\n") || "No files listed"
}
${projectData.availableFiles?.length > 30 ? `... and ${projectData.availableFiles.length - 30} more files` : ""}`;

  // Add live URL info if available
  if (liveUrlData) {
    formatted += `

## LIVE URL ANALYSIS:
URL: ${liveUrlData.url}
Status: ${liveUrlData.valid ? "✅ Accessible" : "❌ Inaccessible"}
${liveUrlData.title ? `Title: ${liveUrlData.title}` : ""}
${liveUrlData.metaDescription ? `Description: ${liveUrlData.metaDescription.substring(0, 200)}...` : ""}
${liveUrlData.pageContent ? `Content Preview: ${liveUrlData.pageContent.substring(0, 500)}...` : ""}`;
  }

  // Add requirements section
  formatted += `

## ASSIGNMENT REQUIREMENTS:
${requirements}

## EVIDENCE-BASED VERIFICATION INSTRUCTIONS:
For EACH requirement above:
1. SEARCH the code below for IMPLEMENTATION EVIDENCE
2. If found: Quote exact code with file path and line numbers
3. If not found: State "NO EVIDENCE FOUND IN CODE"
4. Mark: ✅ FULLY IMPLEMENTED or ❌ NOT IMPLEMENTED

SCORING PROTOCOL:
- ✅ = Requirement has clear, complete code implementation
- ❌ = No code found OR incomplete implementation
- Score = (✅ requirements / total requirements) × 100
- Round down to nearest integer

PASS/FAIL CRITERIA:
- PASS: Score ≥ 70% AND all critical requirements met
- FAIL: Score < 70% OR any critical requirement missing

## ACTUAL CODE CONTENT (${reviewedFiles} files):
`;

  // Format each file with line numbers
  projectData.files.forEach((file, fileIndex) => {
    formatted += `\n--- FILE ${fileIndex + 1}: ${file.path} ---`;
    if (file.truncated) formatted += " [TRUNCATED]";
    if (file.isBinary) formatted += " [BINARY]";
    formatted += "\n";

    if (!file.isBinary && file.content) {
      const lines = file.content.split("\n");
      lines.forEach((line, lineNumber) => {
        formatted += `${lineNumber + 1}: ${line}\n`;
      });
    } else if (file.isBinary) {
      formatted += "[Binary file - cannot display content]\n";
    }

    formatted += `--- END ${file.path} ---\n`;
  });

  // Final instructions
  formatted += `

=== FINAL VERIFICATION ===
AI REVIEWER MUST PROVIDE:
1. Requirement-by-requirement analysis with evidence
2. Exact code citations OR "NO EVIDENCE FOUND"
3. Total score calculation
4. Pass/Fail determination
5. Specific feedback on missing implementations

REMEMBER: No assumptions. No hallucinations. Evidence only.`;

  return formatted;
};

/**
 * Complete validation pipeline with anti-hallucination safeguards
 */
export const validateProjectSubmission = async (
  submission,
  requirements,
  options = {},
) => {
  const results = {
    repoValidation: null,
    liveUrlAnalysis: null,
    projectContent: null,
    validationSummary: null,
    readyForReview: false,
    formattedContent: null,
    validationId: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  const repoUrl = submission.repoUrl || submission.githubUrl;
  const liveUrl = submission.liveUrl;

  // Validate repository
  if (repoUrl) {
    // Basic URL validation
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      results.repoValidation = {
        valid: false,
        error: "Invalid GitHub URL format",
      };
    } else {
      // Comprehensive repository analysis
      results.projectContent = await fetchProjectContent(repoUrl, options);
      results.repoValidation = {
        valid: results.projectContent.success,
        error: results.projectContent.error,
        parsed,
      };
    }
  } else {
    results.repoValidation = {
      valid: false,
      error: "No repository URL provided",
    };
  }

  // Analyze live URL if provided
  if (liveUrl) {
    results.liveUrlAnalysis = await analyzeLiveUrl(
      liveUrl,
      results.projectContent?.repoInfo,
    );
  }

  // Determine if ready for review
  results.readyForReview = results.repoValidation?.valid === true;

  // Generate validation summary
  results.validationSummary = {
    repoAccessible: results.repoValidation?.valid || false,
    liveUrlAccessible: results.liveUrlAnalysis?.valid || false,
    filesAvailable: results.projectContent?.files?.length || 0,
    coverage: results.projectContent?.metrics?.coveragePercentage || 0,
    timestamp: new Date().toISOString(),
    validationId: results.validationId,
  };

  // Format content for AI review
  if (results.readyForReview && results.projectContent) {
    results.formattedContent = formatProjectForReview(
      results.projectContent,
      requirements,
      results.liveUrlAnalysis,
    );
  } else {
    // Format error message with strict instructions
    results.formattedContent = `=== STRICT ANTI-HALLUCINATION REVIEW ===

VALIDATION FAILED - CANNOT PROCEED WITH REVIEW

REPOSITORY STATUS: ${results.repoValidation?.valid ? "✅ Accessible" : "❌ Inaccessible"}
${results.repoValidation?.error ? `Error: ${results.repoValidation.error}` : ""}

LIVE URL STATUS: ${results.liveUrlAnalysis?.valid ? "✅ Accessible" : "❌ Inaccessible or not provided"}

VALIDATION SUMMARY:
- Repository accessible: ${results.repoValidation?.valid ? "YES" : "NO"}
- Code fetched: ${results.projectContent?.files?.length || 0} files
- Review possible: ${results.readyForReview ? "YES" : "NO"}

CRITICAL INSTRUCTION FOR AI:
This submission CANNOT be properly reviewed because the repository could not be accessed.
You MUST return:
- Score: 0%
- Status: FAILED
- Reason: Repository inaccessible - cannot verify any requirements
- Feedback: Student must fix repository access issues

DO NOT attempt to review without code evidence.
DO NOT make assumptions about the project.
DO NOT provide partial scores.`;
  }

  return results;
};

// Export all functions
export default {
  parseGitHubUrl,
  validateUrl,
  fetchRepoInfo,
  fetchFileContent,
  fetchRepoTree,
  fetchProjectContent,
  analyzeLiveUrl,
  formatProjectForReview,
  validateProjectSubmission,
};
