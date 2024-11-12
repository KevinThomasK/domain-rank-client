// app/search/page.js
"use client";
import { useState } from "react";

export default function SearchPage() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPosition(null); // Clear previous position result

    try {
      const resultPosition = await fetchKeywordPosition(url, keyword);
      setPosition(resultPosition); // Set the position of the URL
    } catch (error) {
      console.error("Error fetching search results:", error);
      setPosition("Error fetching position");
    } finally {
      setLoading(false);
    }
  };

  // Fetches the position of the URL in search results for a keyword
  const fetchKeywordPosition = async (url, keyword) => {
    const maxResultsToCheck = 100;
    const resultsPerPage = 10;

    for (let start = 1; start <= maxResultsToCheck; start += resultsPerPage) {
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(keyword)}&start=${start}`
        );
        const data = await response.json();

        // Log the response data to inspect it
        console.log(`Data from API (start=${start}):`, data);

        if (data.items) {
          // Log the links of the current batch of results
          console.log(`Results for page starting at ${start}:`);
          data.items.forEach((item, index) => {
            console.log(`Position ${start + index}: ${item.link}`);
          });

          const positionInPage = data.items.findIndex(
            (item) => item.link === url
          );
          if (positionInPage !== -1) {
            return start + positionInPage;
          }
        } else {
          break; // No more results to check
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        throw new Error("Failed to fetch search results");
      }
    }

    return "Not Found"; // URL not found within the limit
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Search URL Position
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter the URL"
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: "black",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Keyword:</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter the keyword"
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              fontSize: "16px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              color: "black",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "4px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Display the result */}
      {position !== null && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <h3>Position of URL</h3>
          <p>
            {position === "Not Found"
              ? "The URL was not found in the top 100 results"
              : `The URL is ranked at position: ${position}`}
          </p>
        </div>
      )}
    </div>
  );
}
