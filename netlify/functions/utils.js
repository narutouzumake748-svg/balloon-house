function checkAuth(email, password) {
  let users = [];
  try {
    users = JSON.parse(process.env.ADMIN_USERS || "[]");
  } catch (e) {
    users = [];
  }
  return users.some((u) => u.email === email && u.password === password);
}

const GITHUB_API = "https://api.github.com";
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = "main";

async function githubRequest(path, options = {}) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function getFile(filePath) {
  try {
    const data = await githubRequest(
      `/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BRANCH}`
    );
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return { content, sha: data.sha };
  } catch (e) {
    return { content: null, sha: null };
  }
}

async function putFile(filePath, contentOrBase64, message, sha, isBase64) {
  const content = isBase64
    ? contentOrBase64
    : Buffer.from(contentOrBase64, "utf-8").toString("base64");
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  return githubRequest(`/repos/${OWNER}/${REPO}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

async function deleteFile(filePath, message, sha) {
  return githubRequest(`/repos/${OWNER}/${REPO}/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: BRANCH }),
  });
}

module.exports = { checkAuth, getFile, putFile, deleteFile };
