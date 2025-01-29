"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DomainAgeChecker = () => {
  const [domainUrl, setDomainUrl] = useState("");
  const [domainAge, setDomainAge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckDomainAge = async () => {
    setIsLoading(true);
    setDomainAge(null);
    setError("");

    try {
      // Make API request to your backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/domain-age`,
        { url: domainUrl }
      );

      // Assuming the response contains domain age information
      if (response.data && response.data.domain_age) {
        setDomainAge(response.data.domain_age); // Adjust based on the actual response structure
      } else {
        setError("Domain age data not found.");
      }
    } catch (err) {
      setError("Failed to fetch domain age. Please try again.");
      console.error("Error checking domain age:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Domain Age Checker
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div>
              <label
                htmlFor="url"
                className="block text-md font-medium text-gray-700"
              >
                Enter Website URL
              </label>
              <Input
                type="text"
                id="url"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., https://example.com"
                required
              />
            </div>

            <Button
              type="button"
              onClick={handleCheckDomainAge}
              disabled={isLoading}
              className="w-full max-w-60 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300"
            >
              {isLoading ? "Checking..." : "Check Domain Age"}
            </Button>
          </form>

          {/* Show Results */}
          {domainAge && (
            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800">
                Domain Age:
              </h2>
              <p className="text-green-600">{domainAge} years</p>
            </div>
          )}

          {/* Error Handling */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800">Error:</h2>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainAgeChecker;
