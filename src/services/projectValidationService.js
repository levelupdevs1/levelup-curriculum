/**
 * Project Validation Service
 * Validates GitHub repos and live URLs, fetches code content for AI review
 */

// GitHub API base URL
const GITHUB_API_BASE = "https://api.github.com";

// Files to fetch from repos (prioritized)
const TARGET_FILES = [
  "index.html",
  "index.htm",
  "src/index.html",
  "public/index.html",
  "style.css",
  "styles.css",
  "css/style.css",
  "src/style.css",
  "src/styles.css",
  "script.js",
  "main.js",
  "app.js",
  "js/script.js",
  "src/script.js",
  "src/main.js",
  "src/App.jsx",
  "src/App.js",
  "README.md",
];

// Max content length per file (to avoid token limits)
const MAX_FILE_CONTENT_LENGTH = 3000;
const MAX_TOTAL_CONTENT_LENGTH = 8000;

/**
 * Parse GitHub URL to extract owner and repo name
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/branch
 * - git@github.com:owner/repo.git
 */
export const parseGitHubUrl = (url) => {
  if (!url) return null;

  try {
    // Handle SSH format
    if (url.startsWith("git@github.com:")) {
      const match = url.match(/git@github\.com:([^/]+)\/([^/.]+)/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    }

    // Handle HTTPS format
    const urlObj = new URL(url);
    if (urlObj.hostname !== "github.com") return null;

    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1].replace(".git", ""),
      };
    }
  } catch {
    // Invalid URL
  }

  return null;
};

/**
 * Check if a URL is accessible (basic validation)
 */
export const validateUrl = async (url) => {
  if (!url) return { valid: false, error: "No URL provided" };

  try {
    // Validate URL format
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { valid: false, error: "URL must use HTTP or HTTPS" };
    }

    // Try to fetch with HEAD request (faster, no body)
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors", // Avoid CORS issues for basic check
    });

    // no-cors returns opaque response, so we can't check status
    // If we get here without error, the URL is likely valid
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `URL not accessible: ${error.message}` };
  }
};

/**
 * Fetch repository information from GitHub API
 */
export const fetchRepoInfo = async (owner, repo) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // Note: For higher rate limits, add: Authorization: `token ${GITHUB_TOKEN}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: "Repository not found" };
      }
      if (response.status === 403) {
        return { success: false, error: "GitHub API rate limit exceeded" };
      }
      return { success: false, error: `GitHub API error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        language: data.language,
        defaultBranch: data.default_branch,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        size: data.size,
        stars: data.stargazers_count,
        private: data.private,
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
 * Fetch file content from GitHub repository
 */
export const fetchFileContent = async (
  owner,
  repo,
  filePath,
  branch = "main",
) => {
  try {
    // Try the specified branch first, then fall back to 'master'
    const branches = [branch, "master", "main"];

    for (const branchName of branches) {
      try {
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filePath}?ref=${branchName}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();

          // GitHub returns content as base64 encoded
          if (data.content && data.encoding === "base64") {
            const content = atob(data.content.replace(/\n/g, ""));
            return {
              success: true,
              content: content.slice(0, MAX_FILE_CONTENT_LENGTH),
              path: filePath,
              size: data.size,
              truncated: content.length > MAX_FILE_CONTENT_LENGTH,
            };
          }
        }
      } catch {
        // Try next branch
      }
    }

    return { success: false, error: "File not found" };
  } catch (error) {
    return { success: false, error: `Failed to fetch file: ${error.message}` };
  }
};

/**
 * Fetch repository tree to find available files
 */
export const fetchRepoTree = async (owner, repo, branch = "main") => {
  try {
    const branches = [branch, "master", "main"];

    for (const branchName of branches) {
      try {
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branchName}?recursive=1`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            files: data.tree
              .filter((item) => item.type === "blob")
              .map((item) => item.path),
          };
        }
      } catch {
        // Try next branch
      }
    }

    return { success: false, error: "Could not fetch repository tree" };
  } catch (error) {
    return { success: false, error: `Failed to fetch tree: ${error.message}` };
  }
};

/**
 * Fetch key files from a GitHub repository for review
 * Returns formatted content suitable for AI review
 */
export const fetchProjectContent = async (repoUrl) => {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      success: false,
      error:
        "Invalid GitHub URL format. Expected: https://github.com/owner/repo",
    };
  }

  const { owner, repo } = parsed;

  // First, verify the repo exists and get info
  const repoInfo = await fetchRepoInfo(owner, repo);
  if (!repoInfo.success) {
    return {
      success: false,
      error: repoInfo.error,
      validationFailed: true,
    };
  }

  // Check if repo is private
  if (repoInfo.data.private) {
    return {
      success: false,
      error: "Repository is private. Please make it public for review.",
      validationFailed: true,
    };
  }

  // Get the repo tree to see what files exist
  const tree = await fetchRepoTree(owner, repo, repoInfo.data.defaultBranch);
  const availableFiles = tree.success ? tree.files : [];

  // Find which target files exist in the repo
  const filesToFetch = TARGET_FILES.filter((targetFile) =>
    availableFiles.some(
      (file) => file.toLowerCase() === targetFile.toLowerCase(),
    ),
  );

  if (filesToFetch.length === 0) {
    // If no standard files found, try to get any HTML/CSS/JS files
    const webFiles = availableFiles.filter((f) =>
      /\.(html?|css|jsx?|tsx?)$/i.test(f),
    );
    filesToFetch.push(...webFiles.slice(0, 5));
  }

  if (filesToFetch.length === 0) {
    return {
      success: false,
      error: "No HTML, CSS, or JavaScript files found in repository",
      validationFailed: true,
      repoInfo: repoInfo.data,
    };
  }

  // Fetch content of each file
  const fileContents = [];
  let totalContentLength = 0;

  for (const filePath of filesToFetch) {
    if (totalContentLength >= MAX_TOTAL_CONTENT_LENGTH) break;

    const result = await fetchFileContent(
      owner,
      repo,
      filePath,
      repoInfo.data.defaultBranch,
    );

    if (result.success) {
      const contentToAdd = result.content.slice(
        0,
        MAX_TOTAL_CONTENT_LENGTH - totalContentLength,
      );
      fileContents.push({
        path: result.path,
        content: contentToAdd,
        truncated:
          result.truncated || contentToAdd.length < result.content.length,
      });
      totalContentLength += contentToAdd.length;
    }
  }

  if (fileContents.length === 0) {
    return {
      success: false,
      error: "Could not fetch any file contents from repository",
      validationFailed: true,
      repoInfo: repoInfo.data,
    };
  }

  return {
    success: true,
    repoInfo: repoInfo.data,
    files: fileContents,
    availableFiles: availableFiles.slice(0, 20), // First 20 files for context
  };
};

/**
 * Format project content for AI review prompt
 */
export const formatProjectForReview = (projectData, requirements) => {
  if (!projectData.success) {
    return `
PROJECT VALIDATION FAILED:
Error: ${projectData.error}
${projectData.repoInfo ? `Repository: ${projectData.repoInfo.fullName}` : ""}

IMPORTANT: This submission should be marked as FAILED because the project could not be validated.
`;
  }

  let formatted = `
PROJECT SUBMISSION DETAILS:
Repository: ${projectData.repoInfo.fullName}
Primary Language: ${projectData.repoInfo.language || "Not detected"}
Last Updated: ${new Date(projectData.repoInfo.updatedAt).toLocaleDateString()}

FILES IN REPOSITORY: ${projectData.availableFiles?.join(", ") || "Unknown"}

PROJECT REQUIREMENTS TO CHECK:
${requirements}

=== ACTUAL CODE CONTENT ===
`;

  for (const file of projectData.files) {
    formatted += `
--- FILE: ${file.path} ${file.truncated ? "(truncated)" : ""} ---
${file.content}
--- END FILE ---
`;
  }

  formatted += `
=== END OF CODE ===

REVIEW INSTRUCTIONS:
1. Check if the code meets ALL the requirements listed above
2. Verify the HTML structure is correct (header, nav, main, footer)
3. Check CSS styling (colors, fonts, spacing)
4. Look for semantic HTML usage
5. Score based on how well requirements are met
6. If key requirements are missing, the submission should FAIL
`;

  return formatted;
};

/**
 * Validate a project submission completely
 * Returns validation result with content ready for AI review
 */
export const validateProjectSubmission = async (submission, requirements) => {
  const results = {
    repoValidation: null,
    liveUrlValidation: null,
    projectContent: null,
    readyForReview: false,
    formattedContent: null,
  };

  // Validate GitHub repo
  if (submission.repoUrl) {
    const parsed = parseGitHubUrl(submission.repoUrl);
    if (!parsed) {
      results.repoValidation = {
        valid: false,
        error: "Invalid GitHub URL format",
      };
    } else {
      // Fetch project content
      results.projectContent = await fetchProjectContent(submission.repoUrl);
      results.repoValidation = {
        valid: results.projectContent.success,
        error: results.projectContent.error,
      };
    }
  } else {
    results.repoValidation = {
      valid: false,
      error: "No repository URL provided",
    };
  }

  // Validate live URL (basic check)
  if (submission.liveUrl) {
    results.liveUrlValidation = await validateUrl(submission.liveUrl);
  }

  // Determine if ready for review
  results.readyForReview = results.repoValidation?.valid === true;

  // Format content for AI if validation passed
  if (results.readyForReview && results.projectContent) {
    results.formattedContent = formatProjectForReview(
      results.projectContent,
      requirements,
    );
  } else {
    // Format error message for AI
    results.formattedContent = `
PROJECT VALIDATION FAILED:
- Repository URL: ${submission.repoUrl || "Not provided"}
- Repository Error: ${results.repoValidation?.error || "Unknown error"}
- Live URL: ${submission.liveUrl || "Not provided"}
- Live URL Valid: ${results.liveUrlValidation?.valid ? "Yes" : "No"}

IMPORTANT: This submission should be marked as FAILED (score: 0) because the project could not be validated.
The student must provide a valid, public GitHub repository with actual code.
`;
  }

  return results;
};

export default {
  parseGitHubUrl,
  validateUrl,
  fetchRepoInfo,
  fetchFileContent,
  fetchRepoTree,
  fetchProjectContent,
  formatProjectForReview,
  validateProjectSubmission,
};
