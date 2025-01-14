"use client";
import { useEffect, useState } from "react";
import {
  listSites,
  getSearchAnalytics,
  getPages,
  getCrawlErrors,
  getSitemaps,
} from "@/lib/api";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GrConfigure } from "react-icons/gr";
import Link from "next/link";
import { IoFilter } from "react-icons/io5";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Dashboard = () => {
  const [sites, setSites] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [pages, setPages] = useState(null);
  const [crawlErrors, setCrawlErrors] = useState(null);
  const [sitemaps, setSitemaps] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics");
  const [site, setSite] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    device: "",
    queryContains: "",
    queryNotContains: "",
    queryExactMatch: "",
    urlContains: "",
    urlNotContains: "",
    urlExactMatch: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(2024, 0, 1));
  const [endDate, setEndDate] = useState(new Date(2024, 11, 31));
  const [errorMessage, setErrorMessage] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(null);

  const tabs = [
    { id: "analytics", label: "Search Analytics" },
    { id: "pages", label: "Pages" },
    //{ id: "crawlErrors", label: "Crawl Errors" },
    { id: "sitemaps", label: "Sitemaps" },
  ];
  const { data: session } = useSession();
  const listSearchConsoleWebsites = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchconsole/websites`,
      {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${session?.user.token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search console websites");
    }
    return response.json();
  };

  useEffect(() => {
    async function fetchSites() {
      try {
        const siteData = await listSearchConsoleWebsites();
        setSites(siteData);
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    }
    fetchSites();
  }, []);

  const fetchAnalytics = async (siteUrl) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getSearchAnalytics(
        siteUrl,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        {
          ...filters,

          country: filters.country.trim(),
          device: filters.device.trim(),
          queryContains: filters.queryContains.trim(),
          queryNotContains: filters.queryNotContains.trim(),
          queryExactMatch: filters.queryExactMatch.trim(),
          urlContains: filters.urlContains.trim(),
          urlNotContains: filters.urlNotContains.trim(),
          urlExactMatch: filters.urlExactMatch.trim(),
        }
      );
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = (site) => {
    fetchAnalytics(site);
  };

  const applyPageFilters = (site) => {
    fetchPages(site);
  };

  const fetchPages = async (siteUrl) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await getPages(
        siteUrl,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        {
          ...filters,

          country: filters.country.trim(),
          device: filters.device.trim(),
          urlContains: filters.urlContains.trim(),
          urlNotContains: filters.urlNotContains.trim(),
          urlExactMatch: filters.urlExactMatch.trim(),
        }
      );
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchCrawlErrors = async (siteUrl) => {
  //   try {
  //     const data = await getCrawlErrors(siteUrl);
  //     setCrawlErrors(data);
  //   } catch (error) {
  //     console.error("Error fetching crawl errors:", error);
  //   }
  // };

  const fetchSitemaps = async (siteUrl) => {
    try {
      const data = await getSitemaps(siteUrl);
      setSitemaps(data);
    } catch (error) {
      console.error("Error fetching sitemaps:", error);
    }
  };

  const [sortConfig, setSortConfig] = useState({
    key: "query", // Default sorting key
    direction: "asc", // Default sorting direction
  });

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setShowSortMenu(null); // Close the menu after selecting
  };

  const handleMenuToggle = (key) => {
    setShowSortMenu((prevKey) => (prevKey === key ? null : key)); // Toggle menu visibility
  };

  const sortedRows = () => {
    if (!analytics || !analytics.rows) return [];
    const rows = [...analytics.rows];
    rows.sort((a, b) => {
      const aValue = a[sortConfig.key] || a.keys[0]; // Handle nested 'keys' if needed
      const bValue = b[sortConfig.key] || b.keys[0];

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    return rows;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Google Search Console Dashboard
          </h1>
          <Link href="searchconsole">
            <Button className="bg-blue-700">
              <GrConfigure /> Configure
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="mb-6">
            <label
              htmlFor="siteSelector"
              className="block text-gray-700 font-medium mb-2"
            >
              Select a Site:
            </label>
            <select
              id="siteSelector"
              className="w-full px-4 py-2 bg-white border rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-300"
              onChange={(e) => {
                const siteUrl = e.target.value;
                setSite(siteUrl);
                if (siteUrl) {
                  fetchAnalytics(siteUrl);
                  fetchPages(siteUrl);
                  //fetchCrawlErrors(siteUrl);
                  fetchSitemaps(siteUrl);
                }
              }}
            >
              <option value="">-- Select a Site --</option>
              {sites.map((site) => (
                <option key={site.site_name} value={site.site_name}>
                  {site.site_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex">
          {/* Side Menu Tabs */}
          <div className="w-1/6 pr-4">
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

          {/* Content Area */}
          <div className="w-5/6 bg-white shadow rounded-lg p-6">
            {activeTab === "analytics" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Search Analytics
                </h2>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                    {errorMessage}
                  </div>
                )}

                {/* Filter Section */}
                <>
                  {analytics ? (
                    <div className="mb-4 px-4 py-2 bg-white rounded-lg shadow-md">
                      <div className="flex flex-wrap items-center gap-6">
                        {/* Country Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="country"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Country
                          </label>
                          <select
                            id="country"
                            value={filters.country}
                            onChange={(e) =>
                              handleFilterChange("country", e.target.value)
                            }
                            className="px-4 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All</option>
                            <option value="US">US</option>
                            <option value="IN">India</option>
                            <option value="GB">UK</option>
                          </select>
                        </div>

                        {/* Device Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="device"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Device
                          </label>
                          <select
                            id="device"
                            value={filters.device}
                            onChange={(e) =>
                              handleFilterChange("device", e.target.value)
                            }
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">All</option>
                            <option value="mobile">Mobile</option>
                            <option value="desktop">Desktop</option>
                            <option value="tablet">Tablet</option>
                          </select>
                        </div>

                        {/* Query Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="queryContains"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Query
                          </label>
                          <input
                            id="queryContains"
                            type="text"
                            value={filters.queryContains}
                            onChange={(e) =>
                              handleFilterChange(
                                "queryContains",
                                e.target.value
                              )
                            }
                            placeholder="Contains"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* URL Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="urlContains"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            URL
                          </label>
                          <input
                            id="urlContains"
                            type="text"
                            value={filters.urlContains}
                            onChange={(e) =>
                              handleFilterChange("urlContains", e.target.value)
                            }
                            placeholder="Contains"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Date Filters */}
                        <div className="flex items-center">
                          <label
                            htmlFor="startDate"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Start
                          </label>
                          <DatePicker
                            id="startDate"
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Start"
                            className="px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="flex items-center">
                          <label
                            htmlFor="endDate"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            End
                          </label>
                          <DatePicker
                            id="endDate"
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="End"
                            className="px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* URL Not Contains Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="urlNotContains"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            URL Not Contains
                          </label>
                          <input
                            id="urlNotContains"
                            type="text"
                            value={filters.urlNotContains || ""}
                            onChange={(e) =>
                              handleFilterChange(
                                "urlNotContains",
                                e.target.value
                              )
                            }
                            placeholder="Not contains"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Query Not Contains Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="queryNotContains"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Query Not Contains
                          </label>
                          <input
                            id="queryNotContains"
                            type="text"
                            value={filters.queryNotContains}
                            onChange={(e) =>
                              handleFilterChange(
                                "queryNotContains",
                                e.target.value
                              )
                            }
                            placeholder="Not Contains"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Query Exact Match Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="queryExactMatch"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            Query Exact Match
                          </label>
                          <input
                            id="queryExactMatch"
                            type="text"
                            value={filters.queryExactMatch}
                            onChange={(e) =>
                              handleFilterChange(
                                "queryExactMatch",
                                e.target.value
                              )
                            }
                            placeholder="Exact Match"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* URL Not Contains Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="urlNotContains"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            URL Not Contains
                          </label>
                          <input
                            id="urlNotContains"
                            type="text"
                            value={filters.urlNotContains}
                            onChange={(e) =>
                              handleFilterChange(
                                "urlNotContains",
                                e.target.value
                              )
                            }
                            placeholder="Not Contains"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* URL Exact Match Filter */}
                        <div className="flex items-center">
                          <label
                            htmlFor="urlExactMatch"
                            className="mr-2 text-gray-700 font-medium"
                          >
                            URL Exact Match
                          </label>
                          <input
                            id="urlExactMatch"
                            type="text"
                            value={filters.urlExactMatch}
                            onChange={(e) =>
                              handleFilterChange(
                                "urlExactMatch",
                                e.target.value
                              )
                            }
                            placeholder="Exact Match"
                            className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Apply Filters Button */}
                        <div>
                          <Button
                            onClick={() => applyFilters(site)}
                            className="bg-green-500"
                          >
                            <IoFilter className="inline-block mr-2" />
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
                {/* Analytics Table */}
                {isLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
                      role="status"
                    ></div>
                    <p className="mt-2 text-gray-500">Loading analytics...</p>
                  </div>
                ) : analytics &&
                  analytics.rows &&
                  analytics.rows.length > 0 &&
                  !errorMessage ? (
                  <table className="table-auto w-full text-left border border-gray-300 border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        {[
                          "keys",
                          "clicks",
                          "impressions",
                          "ctr",
                          "position",
                        ].map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-gray-600 font-medium relative"
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            <button
                              className="ml-2 text-gray-500 hover:text-gray-700"
                              onClick={() => handleMenuToggle(key)}
                            >
                              <IoFilter />
                            </button>
                            {showSortMenu === key && (
                              <div className="absolute bg-white border border-gray-300 rounded shadow-lg mt-1 right-0 w-32">
                                <button
                                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleSort(key, "asc")}
                                >
                                  Ascending
                                </button>
                                <button
                                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleSort(key, "desc")}
                                >
                                  Descending
                                </button>
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows().map((row, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2 text-gray-700">
                            {row.keys[0]}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.clicks}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.impressions}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {(row.ctr * 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.position.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">
                    No analytics data available. Please apply filters and try
                    again.
                  </p>
                )}
              </>
            )}
            {activeTab === "pages" && pages && (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Pages
                </h2>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-4 text-red-700 bg-red-100 border border-red-300 rounded">
                    {errorMessage}
                  </div>
                )}

                {pages ? (
                  <div className="mb-4 px-4 py-2 bg-white rounded-lg shadow-md">
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Country Filter */}
                      <div className="flex items-center">
                        <label
                          htmlFor="country"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          Country
                        </label>
                        <select
                          id="country"
                          value={filters.country}
                          onChange={(e) =>
                            handleFilterChange("country", e.target.value)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="US">US</option>
                          <option value="IN">India</option>
                          <option value="GB">UK</option>
                        </select>
                      </div>

                      {/* Device Filter */}
                      <div className="flex items-center">
                        <label
                          htmlFor="device"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          Device
                        </label>
                        <select
                          id="device"
                          value={filters.device}
                          onChange={(e) =>
                            handleFilterChange("device", e.target.value)
                          }
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All</option>
                          <option value="mobile">Mobile</option>
                          <option value="desktop">Desktop</option>
                          <option value="tablet">Tablet</option>
                        </select>
                      </div>

                      {/* URL Filter */}
                      <div className="flex items-center">
                        <label
                          htmlFor="urlContains"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          URL
                        </label>
                        <input
                          id="urlContains"
                          type="text"
                          value={filters.urlContains}
                          onChange={(e) =>
                            handleFilterChange("urlContains", e.target.value)
                          }
                          placeholder="Contains"
                          className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Date Filters */}
                      <div className="flex items-center">
                        <label
                          htmlFor="startDate"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          Start
                        </label>
                        <DatePicker
                          id="startDate"
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="Start"
                          className="px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <label
                          htmlFor="endDate"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          End
                        </label>
                        <DatePicker
                          id="endDate"
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate}
                          dateFormat="dd-MM-yyyy"
                          placeholderText="End"
                          className="px-1 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* URL Not Contains Filter */}
                      <div className="flex items-center">
                        <label
                          htmlFor="urlNotContains"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          URL Not Contains
                        </label>
                        <input
                          id="urlNotContains"
                          type="text"
                          value={filters.urlNotContains}
                          onChange={(e) =>
                            handleFilterChange("urlNotContains", e.target.value)
                          }
                          placeholder="Not Contains"
                          className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* URL Exact Match Filter */}
                      <div className="flex items-center">
                        <label
                          htmlFor="urlExactMatch"
                          className="mr-2 text-gray-700 font-medium"
                        >
                          URL Exact Match
                        </label>
                        <input
                          id="urlExactMatch"
                          type="text"
                          value={filters.urlExactMatch}
                          onChange={(e) =>
                            handleFilterChange("urlExactMatch", e.target.value)
                          }
                          placeholder="Exact Match"
                          className="px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Apply Filters Button */}
                      <div>
                        <Button
                          onClick={() => applyPageFilters(site)}
                          className="bg-green-500"
                        >
                          <IoFilter className="inline-block mr-1" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                {isLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
                      role="status"
                    ></div>
                    <p className="mt-2 text-gray-500">Loading pages...</p>
                  </div>
                ) : pages &&
                  pages.rows &&
                  pages.rows.length > 0 &&
                  !errorMessage ? (
                  <table className="table-auto w-full text-left border border-gray-300 border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-2 text-gray-600 font-medium">
                          Page
                        </th>
                        <th className="px-4 py-2 text-gray-600 font-medium">
                          Clicks
                        </th>
                        <th className="px-4 py-2 text-gray-600 font-medium">
                          Impressions
                        </th>
                        <th className="px-4 py-2 text-gray-600 font-medium">
                          CTR(%)
                        </th>
                        <th className="px-4 py-2 text-gray-600 font-medium">
                          Position
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.rows.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2 text-gray-700">
                            {row.keys[0]}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.clicks}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.impressions}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {(row.ctr * 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {row.position.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">
                    No pages data available. Please apply filters and try again.
                  </p>
                )}
              </>
            )}
            {activeTab === "crawlErrors" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Crawl Errors
                </h2>
                {crawlErrors && crawlErrors.length > 0 ? (
                  <ul>
                    {crawlErrors.map((error, index) => (
                      <li key={index} className="text-gray-700">
                        {error.category}: {error.count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No crawl errors to display.</p>
                )}
              </>
            )}
            {activeTab === "sitemaps" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  Sitemaps
                </h2>
                {sitemaps && sitemaps.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full max-w-full border-collapse border border-gray-300 rounded-md shadow-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Path
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Warnings
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Errors
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Type
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Submitted
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Pending
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Sitemaps Index
                          </th>{" "}
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Last Downloaded
                          </th>
                          <th className="px-6 py-2 text-left font-medium text-gray-700 border-b">
                            Last Submitted
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sitemaps.map((sitemap, index) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            } hover:bg-gray-100 transition`}
                          >
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.path}
                            </td>

                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.warnings}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.errors}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.contents?.map(
                                (content, contentIndex) => (
                                  <div key={contentIndex}>{content.type}</div>
                                )
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.contents?.map(
                                (content, contentIndex) => (
                                  <div key={contentIndex}>
                                    {content.submitted}
                                  </div>
                                )
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.isPending ? "Yes" : "No"}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.isSitemapsIndex ? "Yes" : "No"}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.lastDownloaded
                                ? new Date(
                                    sitemap.lastDownloaded
                                  ).toLocaleDateString(undefined, {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-700 border-b">
                              {sitemap.lastSubmitted
                                ? new Date(
                                    sitemap.lastSubmitted
                                  ).toLocaleDateString(undefined, {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No sitemaps to display.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
