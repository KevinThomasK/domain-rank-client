"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrConfigure } from "react-icons/gr";
import { useRouter } from "next/navigation";

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

  const tabs = [
    { id: "TrafficBySources", label: "Traffic by Sources" },
    { id: "UsersBySources", label: "Users by Sources" },
    { id: "PageViewReport", label: "Page View Report" },
  ];

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

  const fetchAnalytics = async (account) => {
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
    setPageAnalytics(null);
    setCurrentAccount(account.property_id);
    try {
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
                fetchAnalytics(selectedAccount);
                fetchPageAnalytics(selectedAccount);
              }
            }}
          >
            Fetch Analytics
          </Button>
        </div>
      </div>
      <div className="flex justify-between mt-5">
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
          <div className="mt-6 w-5/6 bg-white shadow rounded-lg p-6">
            {isLoading ? (
              <div className="flex">
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
              <div className="overflow-x-auto">
                <table className="table-auto w-full max-w-full border-collapse border border-gray-300 rounded-md shadow-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-2 text-left font-semibold text-gray-700 border-b">
                        Channel
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
                          {item.channel}
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
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100 transition cursor-pointer`}
                        onClick={() =>
                          window.open(
                            `page-details/${encodeURIComponent(
                              item.pagePath
                            )}?propertyId=${currentAccount}`,
                            "_blank" // Open in a new tab
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
      </div>
    </div>
  );
};

export default AnalyticsConsole;
