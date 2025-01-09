const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function listSites() {
  const response = await fetch(`${API_BASE_URL}/list-sites`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sites");
  }
  return response.json();
}

export async function getSearchAnalytics(
  siteUrl,
  startDate,
  endDate,
  filters = {}
) {
  const response = await fetch(`${API_BASE_URL}/search-analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ siteUrl, startDate, endDate, ...filters }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch search analytics");
  }
  return response.json();
}

export async function getPages(siteUrl, startDate, endDate, filters = {}) {
  const response = await fetch(`${API_BASE_URL}/pages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ siteUrl, startDate, endDate, ...filters }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch pages");
  }
  return response.json();
}

export async function getCrawlErrors(siteUrl) {
  const response = await fetch(
    `${API_BASE_URL}/crawl-errors/${encodeURIComponent(siteUrl)}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch crawl errors");
  }
  return response.json();
}

export async function getSitemaps(siteUrl) {
  const response = await fetch(
    `${API_BASE_URL}/sitemaps/${encodeURIComponent(siteUrl)}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch sitemaps");
  }
  return response.json();
}

export async function listAccounts() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/properties`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sites");
  }
  return response.json();
}
