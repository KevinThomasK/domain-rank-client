"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { TbCloudSearch } from "react-icons/tb";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const MozAnalysis = () => {
  const { data: session, status } = useSession();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [websitesData, setWebsitesData] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const { slug } = useParams();
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [mozResults, setMozResults] = useState([]);
  const [dataSource, setDataSource] = useState("");

  const handleFetchData = async () => {
    if (!selectedWebsite) {
      setError("Please select a website");
      return;
    }

    setLoading(true);
    setError("");
    setSummaryData(null);
    setDataSource(""); // Reset source on new request

    try {
      // Check if data exists in the database first
      const checkResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/checkMozData?url=${encodeURIComponent(selectedWebsite)}`
      );

      if (!checkResponse.ok) {
        throw new Error("Failed to check database for existing data");
      }

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        // If data exists, use it from the database
        setSummaryData(checkData.mozData);
        setDataSource("Database ✅"); // Set source as database
      } else {
        // If not, fetch new data from the API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fetchMozData`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: selectedWebsite }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch MOZ data");
        }

        const data = await response.json();
        setSummaryData(data.mozData);
        setDataSource("API 🌍"); // Set source as API
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMore = () => {
    setShowMore(!showMore);
  };

  //fetch websites
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        setWebsitesLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/websites/${slug}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );

        const result = await response.json();
        if (response.ok) {
          setWebsitesLoading(false);
          setWebsitesData(result.websites);
        } else {
          setWebsitesLoading(false);
          console.error("Error fetching websites:", result.message);
        }
      } catch (error) {
        setWebsitesLoading(false);
        console.error("Failed to fetch websites:", error);
      }
    };

    if (slug) {
      fetchWebsites();
    }
  }, [slug, session?.user.token]);

  //update website state while select website
  const handleWebsiteChange = (value) => {
    const parsedValue = JSON.parse(value);
    setSelectedWebsite(parsedValue.website);
    setSelectedWebsiteId(parsedValue.id);
  };

  // Fetch MOZ Data for all websites

  const fetchMozDataForWebsites = async () => {
    if (!websitesData || websitesData.length === 0) {
      setError("No websites available for fetching MOZ data.");
      return;
    }

    setLoading(true);
    setError("");
    setMozResults([]); // Clear previous results

    try {
      const results = [];
      for (const website of websitesData) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fetchMozData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ url: website.website }), // Send one website at a time
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch MOZ data for ${website.website}`);
          }

          const data = await response.json();
          results.push({ ...data.mozData, website: website.website }); // Combine result with website
        } catch (err) {
          console.error(`Error fetching MOZ data for ${website.website}:`, err);
          results.push({
            website: website.website,
            error: err.message, // Mark as error
          });
        }
      }

      setMozResults(results); // Update state with all results
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        MOZ Analysis Tool
      </h1>
      <div className="flex items-center mt-12">
        <Select onValueChange={handleWebsiteChange}>
          <SelectTrigger className="w-[400px] h-11 border rounded-md px-4 py-2 text-lg">
            <SelectValue placeholder="Select a website" />
          </SelectTrigger>
          <SelectContent className="text-lg">
            {websitesData.map((data) => (
              <SelectItem
                key={data.id}
                value={JSON.stringify({
                  website: data.website,
                  id: data.id,
                })}
              >
                {data.website}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 flex items-center gap-2 ml-5"
          onClick={handleFetchData}
          disabled={loading}
        >
          {loading ? (
            <>Fetching...</>
          ) : (
            <>
              <TbCloudSearch size={20} /> Check MOZ Data
            </>
          )}
        </Button>
      </div>

      {summaryData && (
        <div className="mt-8 bg-white border border-gray-300 rounded-lg shadow-lg p-8">
          <div className="mt-4 text-gray-600 text-sm">
            <strong>Data Source:</strong> {dataSource}
          </div>
          {/* Header */}
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            Analysis Results for:{" "}
            <span className="text-indigo-600 font-semibold">
              {selectedWebsite}
            </span>
          </h3>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-6 text-gray-800">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Domain Authority:
              </span>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md font-medium">
                {summaryData.domain_authority}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Page Authority:
              </span>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-medium">
                {summaryData.page_authority}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Spam Score:
              </span>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-md font-medium">
                {summaryData.spam_score}%
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Linking Root Domains:
              </span>
              <span className="bg-green-50 text-green-600 px-3 py-1 rounded-md font-medium">
                {summaryData.root_domains_to_root_domain || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Ranking Keywords:
              </span>
              <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-md font-medium">
                {summaryData.ranking_keywords || "N/A"}
              </span>
            </div>
          </div>

          {/* View More Button */}
          <div className="text-center mt-8">
            <button
              className="bg-indigo-500 text-white px-6 py-2 rounded-md shadow-md hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
              onClick={handleToggleMore}
            >
              {showMore ? "Hide Details" : "View More Details"}
            </button>
          </div>

          {/* Additional Details */}
          {showMore && (
            <div className="mt-8 bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg shadow-inner">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Detailed Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                {Object.entries(summaryData).map(([key, value], index) => (
                  <p key={index} className="flex items-start">
                    <span className="font-medium capitalize text-gray-600 mr-2">
                      {key.replace(/_/g, " ")}:
                    </span>
                    <span>{value || "N/A"}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-6">
        <Button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 focus:ring-4 focus:ring-blue-300"
          onClick={fetchMozDataForWebsites}
          disabled={websitesLoading || websitesData.length === 0}
        >
          {websitesLoading ? "Loading websites..." : "Fetch MOZ Data"}
        </Button>
      </div>

      {mozResults.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="min-w-full bg-gradient-to-br from-white via-gray-50 to-gray-100">
            <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">
                  Website
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">
                  Domain Authority
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">
                  Page Authority
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">
                  Spam Score
                </th>
                <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">
                  Linking Root Domains
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mozResults.map((data, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="py-4 px-6 text-sm font-medium text-gray-700">
                    {data.website}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {data.domain_authority || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {data.page_authority || "N/A"}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {data.spam_score || "N/A"}%
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {data.root_domains_to_root_domain || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mozResults.length === 0 && !websitesLoading && (
        <p className="text-center text-gray-600 mt-6">
          No MOZ data fetched yet. Click the button above to fetch data.
        </p>
      )}
    </div>
  );
};

export default MozAnalysis;
