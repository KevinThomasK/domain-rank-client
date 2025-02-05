"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const MonitoredWebsites = () => {
  const [websites, setWebsites] = useState([]);
  const [websitesList, setWebsitesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWebsitesHistory = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/websites_history`
        );
        const data = await response.json();
        setWebsites(data);
      } catch (error) {
        console.error("Error fetching websites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsitesHistory();
  }, []);

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/websites`
        );
        const data = await response.json();
        setWebsitesList(data);
      } catch (error) {
        console.error("Error fetching websites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-500";
      case "fail":
        return "bg-red-500";
      case "slow":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const formatTime = (check_time) => {
    const date = new Date(check_time); // Parse the check_time
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Only show time
  };

  const formatDate = (check_time) => {
    const date = new Date(check_time);
    return date.toLocaleDateString(); // Return date in MM/DD/YYYY format
  };

  // Filter websites by selected date
  const filteredWebsites = selectedDate
    ? websites.filter(
        (website) => formatDate(website.check_time) === selectedDate
      )
    : websites;

  // Extract unique dates for the date dropdown
  const uniqueDates = [
    ...new Set(websites.map((website) => formatDate(website.check_time))),
  ];

  // Handle date selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const uniqueTimes = [
    ...new Set(
      filteredWebsites.map((website) => formatTime(website.check_time))
    ),
  ];

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddWebsite = async () => {
    if (!newWebsite || !newWebsiteUrl) {
      setError("Please provide both site name and URL.");
      return;
    }

    const addWebsite = {
      Site_name: newWebsite,
      URL: newWebsiteUrl,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/monitor/websites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(addWebsite),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // If successful, add the new website to the list
        setWebsitesList((prevList) => [...prevList, data]);
        setShowAddWebsiteForm(false); // Hide the form
        setNewWebsite(""); // Clear form inputs
        setNewWebsiteUrl("");
        toast.success("website added");
      } else {
        setError("Error adding website. Please try again.");
        toast.error("something went wrong");
      }
    } catch (error) {
      console.error("Error adding website:", error);
      toast.error("something went wrong");
      setError("An error occurred while adding the website.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Website Health Monitor</h1>
      {/* Search and Add New Website */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search Website"
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Website
        </button>
      </div>
      {/* Date Filter Dropdown */}
      <div className="mb-4">
        <label htmlFor="dateFilter" className="mr-2">
          Select Date:
        </label>
        <select
          id="dateFilter"
          value={selectedDate}
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Dates</option>
          {uniqueDates.map((date, index) => (
            <option key={index} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div class="flex items-center justify-center ">
          <div class="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b text-left">Name</th>
                {/* Dynamically render time as the X-axis */}
                {uniqueTimes.map((time, index) => (
                  <th key={index} className="py-2 px-2 border-b text-center">
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {websitesList.map((website) => {
                return (
                  <tr key={website.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-left font-medium">
                      {website.site_name}
                    </td>
                    {/* Render the status dynamically based on check_time */}
                    {uniqueTimes.map((time) => {
                      // Find the status for the current time
                      const websiteHistory = filteredWebsites.find(
                        (history) =>
                          history.site_id === website.id &&
                          formatTime(history.check_time) === time
                      );
                      const status = websiteHistory
                        ? websiteHistory.status
                        : "unknown";
                      return (
                        <td
                          key={time}
                          className="py-1 px-1 border-b text-center"
                        >
                          <div
                            className={`h-4 w-full ${getStatusColor(status)}`}
                          ></div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend below the table */}
      <div className="mt-10">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="h-4 w-4 bg-green-500 mr-2"></div>
            <span>Success</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-red-500 mr-2"></div>
            <span>Fail</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-yellow-500 mr-2"></div>
            <span>Slow</span>
          </div>
        </div>
      </div>

      {/* sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform transition-all duration-300 ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <h2 className="mb-6 font-bold">Add New Website</h2>
        <div>
          <label className="block">Site Name </label>
          <Input
            type="text"
            placeholder="Enter site name"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Site name is required.</p>
          )}
        </div>
        <div>
          <label className="block">Site URL </label>
          <Input
            type="text"
            placeholder="Enter site url"
            value={newWebsiteUrl}
            onChange={(e) => setNewWebsiteUrl(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsiteUrl && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>
        <div className="flex gap-2 mt-5">
          <Button onClick={handleAddWebsite}>Save Website</Button>
          <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonitoredWebsites;
