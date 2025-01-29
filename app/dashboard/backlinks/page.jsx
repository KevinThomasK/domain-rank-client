"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdAdd } from "react-icons/io";
import { Textarea } from "@/components/ui/textarea";

const BacklinksList = () => {
  const [backlinks, setBacklinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("backlinks_website");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBSidebarOpen, setIsBSidebarOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState("");
  const [newWebsiteUrl, setNewWebsiteUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOwnership, setSelectedOwnership] = useState("Manual");
  const [selectedWebsiteType, setSelectedWebsiteType] = useState("Text");

  const tabs = [
    { id: "backlinks_website", label: "Backlinks Website" },
    { id: "backlinks", label: "Backlinks" },
  ];

  const fetchBacklinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/backlinks_website`
      );
      if (!res.ok) throw new Error("Failed to fetch backlinks");
      const data = await res.json();
      setBacklinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklinks();
  }, []);

  const handleAddWebsite = () => {
    console.log("first");
  };

  const handleAddBacklinkWebsite = async () => {
    setIsSubmitted(true);
    if (!newWebsite || !newWebsiteUrl) {
      return; // Don't proceed if the required fields are empty
    }

    const token = localStorage.getItem("token"); // Assuming you store the token in localStorage

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/backlinks_website`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token to the header
          },
          body: JSON.stringify({
            Website_name: newWebsite,
            URL: newWebsiteUrl,
            Remarks: remarks,
            // Created_by omitted, letting backend handle it (set to null or default value)
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create backlink");
      }

      const data = await response.json();
      console.log("Backlink created:", data);
      toast.success("created backlink");
      // Clear form fields after successful submission
      setNewWebsite("");
      setNewURL("");
      setRemarks("");
      setIsBSidebarOpen(false); // Close the sidebar after saving
    } catch (error) {
      toast.error("something went wrong");
      console.error("Error creating backlink:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Back Links Dashboard
        </h1>
        <Button
          className="bg-green-600"
          onClick={() => setIsBSidebarOpen(true)}
        >
          <IoMdAdd />
          Add Backlinks Website
        </Button>
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
        <div className="mt-6 w-5/6 bg-white shadow rounded-lg p-6">
          <h1 className="text-xl mb-4">Backlinks websites List</h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">
                  Website Name
                </th>
                <th className="border border-gray-300 px-4 py-2">URL</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backlinks.map((backlink) => (
                <tr key={backlink.Id}>
                  <td className="border border-gray-300 px-4 py-2">
                    {backlink.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {backlink.website_name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {backlink.url}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <Button
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() => handleEdit(backlink)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() => handleDelete(backlink.Id)}
                    >
                      Delete
                    </Button>
                    <Button
                      className=" text-white px-3 py-1 rounded"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      Add Backlink
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <h2 className="mb-6 font-bold">Add Backlink </h2>
        <div>
          <label className="block">Linked From </label>
          <Input
            type="text"
            placeholder="Enter linked from"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block">Linked To </label>
          <Input
            type="text"
            placeholder="Enter linked to"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block">Anchor Text </label>
          <Input
            type="text"
            placeholder="Enter anchor text"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block">Do follow </label>
          <Input
            type="text"
            placeholder="Enter do follow"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>
        <div>
          <label className="block mb-4">Source</label>
          <Select
            onValueChange={(value) => setSelectedOwnership(value)}
            value={selectedOwnership}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedOwnership}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primary">Manual</SelectItem>
              <SelectItem value="Competitor">Search console</SelectItem>
              <SelectItem value="Competitor">Google analytics</SelectItem>
            </SelectContent>
          </Select>
          {!selectedOwnership && isSubmitted && (
            <p className="text-red-500 text-sm">Ownership type is required.</p>
          )}
        </div>
        <div>
          <label className="block mb-4">Link Type</label>
          <Select
            onValueChange={(value) => setSelectedWebsiteType(value)}
            value={selectedWebsiteType}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedWebsiteType}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Business">Text</SelectItem>
              <SelectItem value="Directory">Image</SelectItem>
              <SelectItem value="Directory">Button</SelectItem>
              <SelectItem value="Directory">Video</SelectItem>
            </SelectContent>
          </Select>
          {!selectedWebsiteType && isSubmitted && (
            <p className="text-red-500 text-sm">Website type is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block font-bold">Remarks</label>
          <Textarea
            placeholder="Enter remarks"
            rows={5}
            className="mb-2 mt-2 w-full text-lg"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <Button onClick={handleAddWebsite}>Save Backlink</Button>
          <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
      {/* sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform transition-all duration-300 ${
          isBSidebarOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <h2 className="mb-6 font-bold">Add Backlink </h2>
        <div>
          <label className="block">Website Name</label>
          <Input
            type="text"
            placeholder="Enter Website Name"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block">Website Url </label>
          <Input
            type="text"
            placeholder="Enter Website url"
            value={newWebsiteUrl}
            onChange={(e) => setNewWebsiteUrl(e.target.value)}
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newWebsite && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newWebsite && isSubmitted && (
            <p className="text-red-500 text-sm">Website url is required.</p>
          )}
        </div>{" "}
        <div>
          <label className="block font-bold">Remarks</label>
          <Textarea
            placeholder="Enter remarks"
            rows={5}
            className="mb-2 mt-2 w-full text-lg"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <Button onClick={handleAddBacklinkWebsite}>Save Backlink</Button>
          <Button onClick={() => setIsBSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BacklinksList;
