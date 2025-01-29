"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrConfigure } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { FaLongArrowAltUp, FaLongArrowAltDown } from "react-icons/fa";
import DatePicker from "react-datepicker"; // Install with `npm install react-datepicker`
import "react-datepicker/dist/react-datepicker.css";
import { IoFilter } from "react-icons/io5";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Utility function to get default dates
const getDefaultDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
};

const AnalyticsConsole = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [site, setSite] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("TrafficBySources");
  const [analytics, setAnalytics] = useState(null);
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [channelData, setChannelData] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [details, setDetails] = useState(null);
  const [totalPercentageChange, setTotalPercentageChange] = useState(null);
  const [startDatePage, setStartDatePage] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ); // 7 days ago
  const [endDatePage, setEndDatePage] = useState(new Date()); // Today

  const tabs = [
    { id: "TrafficBySources", label: "Traffic by Sources" },
    { id: "UsersBySources", label: "Users by Sources" },
    { id: "PageViewReport", label: "Page View Report" },
  ];
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedDimension, setSelectedDimension] = useState(
    "sessionDefaultChannelGrouping"
  );

  useEffect(() => {
    // Set default dates when component mounts
    setStartDate(getDefaultDate(-7)); // 7 days ago
    setEndDate(getDefaultDate(0)); // Today
  }, []);

  const listAnalyticsAccount = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/accounts`,
      {
        method: "GET",
        credentials: "include",
        headers: { Authorization: `Bearer ${session?.user.token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch analytics accounts");
    }
    return response.json();
  };

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const accountsData = await listAnalyticsAccount();
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
    fetchAccounts();
  }, []);

  const fetchAnalytics = async (account, dimension) => {
    setIsLoading(true);
    setAnalytics(null);
    setCurrentAccount(account.property_id);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            propertyId: account.property_id,
            startDate: startDate || "7daysAgo",
            endDate: endDate || "today",
            dimension: dimension,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPageAnalytics = async (account) => {
    setIsLoading(true);
    setActiveTab("TrafficBySources");
    setPageAnalytics(null);
    setCurrentAccount(account.property_id);
    try {
      console.log(startDate, "startDate");
      console.log(endDate, "endDate");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/page-analytics`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            propertyId: account.property_id,
            startDate: startDate || "7daysAgo",
            endDate: endDate || "today",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      const data = await response.json();

      setPageAnalytics(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (path, propertyId) => {
    if (!propertyId || !path) return;

    try {
      console.log(startDatePage.toISOString().split("T")[0], "startDatePage");
      console.log(endDatePage.toISOString().split("T")[0], "endDatePage");
      setIsLoading(true);
      setActiveTab("");
      setCurrentPage(decodeURIComponent(path));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/page-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            pagePath: decodeURIComponent(path),
            startDate: startDatePage.toISOString().split("T")[0], // Format to YYYY-MM-DD
            endDate: endDatePage.toISOString().split("T")[0],
            comparisonStartDate: new Date(
              startDatePage.setDate(startDatePage.getDate() - 7)
            ) // 7 days before startDate
              .toISOString()
              .split("T")[0],
          }),
        }
      );

      const data = await response.json();
      setDetails(data.details);
      setChannelData(data.channelDetails);
      setTotalPercentageChange(data.totalPercentageChange);

      // Fetch traffic data by date
      const trafficDataResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/traffic-by-date`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            pagePath: decodeURIComponent(path),
            startDate: startDatePage.toISOString().split("T")[0],
            endDate: endDatePage.toISOString().split("T")[0],
          }),
        }
      );

      const traffData = await trafficDataResponse.json();
      setTrafficData(traffData.dailyTraffic);
    } catch (error) {
      console.error("Error fetching page details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDimensionChange = (event) => {
    const newDimension = event.target.value; // Get the updated dimension value
    setSelectedDimension(newDimension); // Update the state
    fetchAnalytics(selectedAccount, newDimension); // Pass the updated dimension directly
  };

  // Sort trafficData by date
  const sortedTrafficData = trafficData?.slice().sort((a, b) => {
    const dateA = new Date(
      `${a.date.substring(0, 4)}-${a.date.substring(4, 6)}-${a.date.substring(
        6,
        8
      )}`
    );
    const dateB = new Date(
      `${b.date.substring(0, 4)}-${b.date.substring(4, 6)}-${b.date.substring(
        6,
        8
      )}`
    );
    return dateA - dateB; // Sort in ascending order
  });

  // Prepare chartData
  const chartData = {
    labels: sortedTrafficData?.map((item) => {
      const date = item.date; // Format: YYYYMMDD
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return `${day}/${month}/${year}`;
    }),
    datasets: [
      {
        label: "Active Users",
        data: sortedTrafficData.map((item) => item.activeUsers),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "New Users",
        data: sortedTrafficData.map((item) => item.newUsers),
        borderColor: "green",
        fill: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Google Analytics Dashboard
        </h1>
        <Link href="analytics">
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
            Select an Account:
          </label>
          <select
            id="siteSelector"
            className="w-full px-4 py-2 bg-white border rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-300"
            onChange={(e) => {
              const siteUrl = e.target.value;
              setSite(siteUrl);
            }}
          >
            <option value="">-- Select an Account --</option>
            {accounts.map((account) => (
              <option key={account.property_name} value={account.property_id}>
                {account.property_name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-gray-700 font-medium mb-2"
            >
              Start Date:
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full px-4 py-2 bg-white border rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-300"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-gray-700 font-medium mb-2"
            >
              End Date:
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full px-4 py-2 bg-white border rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-300"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            className="bg-green-500"
            disabled={!site}
            onClick={() => {
              const selectedAccount = accounts.find(
                (acc) => acc.property_id === site
              );
              if (selectedAccount) {
                setSelectedAccount(selectedAccount);
                fetchAnalytics(selectedAccount, selectedDimension);
                fetchPageAnalytics(selectedAccount);
              }
            }}
          >
            Fetch Analytics
          </Button>
        </div>
      </div>
      <div className="flex  mt-5">
        <div className="w-1/6 pr-4 ">
          <div className="flex flex-col space-y-2 mt-6">
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

        {activeTab === "TrafficBySources" && (
          <div className="p-6 w-5/6 bg-white shadow rounded-lg mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <p className="text-gray-600 text-lg font-medium">
                  Loading Analytics...
                </p>
                <svg
                  className="animate-spin h-5 w-5 ml-2 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : analytics && analytics.length > 0 ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Dimension:
                  </label>
                  <select
                    value={selectedDimension}
                    onChange={handleDimensionChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                  >
                    <option value="sessionDefaultChannelGrouping">
                      Channel Grouping
                    </option>
                    <option value="sessionSource">Source</option>
                    <option value="sessionMedium">Medium</option>
                    <option value="city">City</option>
                    <option value="deviceCategory">Device Category</option>
                    <option value="country">Country</option>
                    <option value="region">Region</option>
                    <option value="operatingSystem">Operating System</option>
                    <option value="language">Language</option>
                    <option value="browser">Browser</option>
                    <option value="userAgeBracket">Age Bracket</option>
                    <option value="userGender">Gender</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-auto w-full max-w-full border-collapse border border-gray-300 rounded-md shadow-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b capitalize">
                          {selectedDimension.replace(/([A-Z])/g, " $1").trim()}{" "}
                          {/* Format dimension name */}
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          Active Users
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          Event Count
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          New Users
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          Sessions
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          Engaged Sessions
                        </th>
                        <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                          Bounce Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((item, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100 transition`}
                        >
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.dimension}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.activeUsers}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.eventCount}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.newUsers}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.sessions}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {item.engagedSessions}
                          </td>
                          <td className="px-6 py-4 text-gray-700 border-b">
                            {parseFloat(item.bounceRate).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No analytics data to display.</p>
            )}
          </div>
        )}

        {activeTab === "PageViewReport" && (
          <div className="mt-6 w-5/6 bg-white shadow rounded-lg p-6">
            {isLoading ? (
              <div className="flex">
                <p className="text-gray-600 text-lg font-medium">
                  Loading Page Analytics...
                </p>

                <svg
                  className="animate-spin h-5 w-5 ml-2 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : pageAnalytics && pageAnalytics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full max-w-full border-collapse border border-gray-300 rounded-md shadow-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Page Path
                      </th>

                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Active Users
                      </th>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        New Users
                      </th>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Sessions
                      </th>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Engaged Sessions
                      </th>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Bounce Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageAnalytics.map((item, index) => (
                      // <tr
                      //   key={index}
                      //   className={`${
                      //     index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      //   } hover:bg-gray-100 transition cursor-pointer`}
                      //   onClick={() =>
                      //     router.push(
                      //       `page-details/${encodeURIComponent(
                      //         item.pagePath
                      //       )}?propertyId=${currentAccount}`
                      //     )
                      //   }
                      // >
                      // <tr
                      //   key={index}
                      //   className={`${
                      //     index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      //   } hover:bg-gray-100 transition cursor-pointer`}
                      //   onClick={() =>
                      //     window.open(
                      //       `page-details/${encodeURIComponent(
                      //         item.pagePath
                      //       )}?propertyId=${currentAccount}`,
                      //       "_blank"
                      //     )
                      //   }
                      // >
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition cursor-pointer`}
                        onClick={() =>
                          fetchDetails(
                            encodeURIComponent(item.pagePath),
                            currentAccount
                          )
                        }
                      >
                        <td className="px-6 py-4 text-gray-700 border-b">
                          {item.pagePath}
                        </td>

                        <td className="px-6 py-4 text-gray-700 border-b">
                          {item.activeUsers}
                        </td>
                        <td className="px-6 py-4 text-gray-700 border-b">
                          {item.newUsers}
                        </td>
                        <td className="px-6 py-4 text-gray-700 border-b">
                          {item.sessions}
                        </td>
                        <td className="px-6 py-4 text-gray-700 border-b">
                          {item.engagedSessions}
                        </td>
                        <td className="px-6 py-4 text-gray-700 border-b">
                          {parseFloat(item.bounceRate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">
                No page analytics data to display.
              </p>
            )}
          </div>
        )}

        {activeTab === "" &&
          (isLoading ? (
            <div className="mt-6 w-5/6 bg-white shadow rounded-lg p-6">
              <div className="flex">
                <p className="text-gray-600 text-lg font-medium">
                  Loading Page Analytics...
                </p>
                <svg
                  className="animate-spin h-5 w-5 ml-2 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
          ) : (
            <div className="mt-6 w-5/6 bg-white shadow rounded-lg p-6">
              <div className="flex-col">
                <h2 className="text-2xl font-bold mb-4">Page: {currentPage}</h2>

                <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg shadow ">
                  {/* Start Date */}
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm font-medium text-gray-700">
                      Start Date:
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="dd-MM-yyyy"
                      className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col">
                    <label className="mb-2 text-sm font-medium text-gray-700">
                      End Date:
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      dateFormat="dd-MM-yyyy"
                      className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Apply Button */}
                  <div className="flex justify-center mt-4 md:mt-0">
                    <Button
                      onClick={fetchDetails}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mt-6"
                    >
                      <IoFilter />
                      Apply
                    </Button>
                  </div>
                </div>
                <div className="p-6 bg-white shadow rounded-lg grid-cols-1 grid gap-8">
                  <table className="table-auto w-full border border-gray-400 ">
                    <thead className="bg-gray-100">
                      <tr className="border-b border-gray-400">
                        <th className="px-6 py-2 text-left font-semibold">
                          Country
                        </th>
                        <th className="px-6 py-2 text-left font-semibold flex items-center">
                          Active Users
                          {totalPercentageChange && (
                            <span
                              className={`ml-2 flex items-center ${
                                totalPercentageChange > 0
                                  ? "text-green-500"
                                  : totalPercentageChange < 0
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {totalPercentageChange > 0 ? (
                                <FaLongArrowAltUp className="mr-1" />
                              ) : totalPercentageChange < 0 ? (
                                <FaLongArrowAltDown className="mr-1" />
                              ) : null}
                              {Math.abs(totalPercentageChange)}%
                            </span>
                          )}
                        </th>
                        <th className="px-6 py-2 text-left font-semibold">
                          New Users
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {details?.map((detail, index) => (
                        <tr
                          key={index}
                          className={`${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4">{detail.country}</td>
                          <td className="px-6 py-4 flex items-center">
                            <span className="mr-6">{detail.activeUsers}</span>
                            {detail.percentageChange !== "N/A" && (
                              <span
                                className={`flex items-center ml-2 ${
                                  detail.percentageChange > 0
                                    ? "text-green-500"
                                    : detail.percentageChange < 0
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {detail.percentageChange > 0 ? (
                                  <FaLongArrowAltUp className="mr-1" />
                                ) : detail.percentageChange < 0 ? (
                                  <FaLongArrowAltDown className="mr-1" />
                                ) : null}
                                {Math.abs(detail.percentageChange)}%
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">{detail.newUsers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Channel-based analytics table */}

                  {channelData && (
                    <div>
                      <table className="table-auto w-full border border-gray-400">
                        <thead className="bg-gray-100">
                          <tr className="border border-gray-400">
                            <th className="px-6 py-2 text-left font-semibold ">
                              Channel
                            </th>
                            <th className="px-6 py-2 text-left font-semibold flex items-center ">
                              Active Users
                            </th>
                            <th className="px-6 py-2 text-left font-semibold ">
                              New Users
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {channelData?.map((channel, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } `}
                            >
                              <td className="px-6 py-4 ">{channel.channel}</td>
                              <td className="px-6 py-4 flex items-center ">
                                <span className="mr-6">
                                  {channel.activeUsers}
                                </span>
                                <span
                                  className={`flex items-center ml-2 ${
                                    channel.percentageChange > 0
                                      ? "text-green-500"
                                      : channel.percentageChange < 0
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {channel.percentageChange > 0 ? (
                                    <FaLongArrowAltUp className="mr-1" />
                                  ) : channel.percentageChange < 0 ? (
                                    <FaLongArrowAltDown className="mr-1" />
                                  ) : null}
                                  {Math.abs(channel.percentageChange)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 ">{channel.newUsers}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Line data={chartData} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AnalyticsConsole;
