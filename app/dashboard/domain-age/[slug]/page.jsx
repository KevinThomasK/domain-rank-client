"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

const DomainAgeChecker = () => {
  const [domainUrl, setDomainUrl] = useState("");
  const [domainAge, setDomainAge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [websitesData, setWebsitesData] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("check");
  const tabs = [
    { id: "check", label: "Check Domain Age" },
    { id: "websitesCheck", label: "Website Domain Age" },
  ];
  const params = useParams();
  const slug = params.slug;
  const { data: session, status } = useSession();

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

  const handleCheckWebsiteDomainAge = async (websiteUrl) => {
    setIsLoading(true);

    // Update the specific website data to reset any previous error or domain age
    setWebsitesData((prevState) =>
      prevState.map((website) =>
        website.website === websiteUrl
          ? { ...website, domainAge: null, error: "" }
          : website
      )
    );

    try {
      // Make API request to your backend with the specific URL
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/domain-age`,
        { url: websiteUrl }
      );

      // Assuming the response contains domain age information
      if (response.data && response.data.domain_age) {
        // Update the domain age for the specific website
        setWebsitesData((prevState) =>
          prevState.map((website) =>
            website.website === websiteUrl
              ? { ...website, domainAge: response.data.domain_age, error: null }
              : website
          )
        );
      } else {
        setWebsitesData((prevState) =>
          prevState.map((website) =>
            website.website === websiteUrl
              ? { ...website, error: "Domain age data not found." }
              : website
          )
        );
      }
    } catch (err) {
      // Handle error and update the website's error state
      setWebsitesData((prevState) =>
        prevState.map((website) =>
          website.website === websiteUrl
            ? {
                ...website,
                error: "Failed to fetch domain age. Please try again.",
              }
            : website
        )
      );
      console.error("Error checking domain age:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  console.log(websitesData);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        Domain Age Check Dashboard
      </h1>
      <div className="bg-gray-50 flex ">
        <div className="w-1/6 pr-4 ">
          <div className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 font-medium rounded-lg shadow-md ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab === "check" && (
          <div className=" w-5/6 bg-white p-10 rounded-lg shadow-md ">
            <h1 className="text-2xl font-bold text-gray-800 mb-10">
              Domain Age Checker
            </h1>
            <div className="">
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
                  {isLoading ? "Checking..." : "Check  "}
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
        )}
        {activeTab === "websitesCheck" && (
          <div className="p-6 w-5/6 bg-white rounded-lg shadow-md">
            <ul className="space-y-4">
              {websitesData.map((website, index) => (
                <li
                  key={website.id}
                  className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-between space-x-4">
                    <a
                      href={website.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-words"
                    >
                      {website.website}
                    </a>

                    {/* Check Domain Age Button */}
                    <Button
                      onClick={() =>
                        handleCheckWebsiteDomainAge(website.website)
                      }
                      disabled={isLoading}
                      className="ml-4 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md"
                    >
                      {isLoading ? "Checking..." : "Check Age"}
                    </Button>
                  </div>

                  {/* Display Domain Age Result */}
                  {website.domainAge && (
                    <div className="mt-2 p-2 bg-green-100 rounded-lg">
                      <p className="text-green-600">
                        {website.domainAge} years
                      </p>
                    </div>
                  )}

                  {/* Error Handling for Specific Website */}
                  {website.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded-lg">
                      <p className="text-red-600">{website.error}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainAgeChecker;
