"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const ProjectWebsitePage = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams();
  const [project, setProject] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newWebsite, setNewWebsite] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedOwnership, setSelectedOwnership] = useState("Primary");
  const [selectedWebsiteType, setSelectedWebsiteType] = useState("Business");
  const [websitesData, setWebsitesData] = useState([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setProjectLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${slug}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setProjectLoading(false);
          setProject(result);
        } else {
          setProjectLoading(false);
          console.error("Error fetching project:", result.message);
        }
      } catch (error) {
        setProjectLoading(false);
        console.error("Failed to fetch project:", error);
      }
    };

    if (slug) {
      fetchProjectDetails();
    }
  }, [slug, session?.user.token]);

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

  const handleAddWebsite = async () => {
    const newWebsiteData = {
      project_id: slug,
      website: newWebsite,
      ownership_type: selectedOwnership,
      website_type: selectedWebsiteType,
      status: "Active",
    };
    setIsSubmitted(true);
    console.log(
      slug,
      newWebsite,
      selectedOwnership,
      selectedWebsiteType,
      "test"
    );

    if (!newWebsite || !selectedOwnership || !selectedWebsiteType) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/websites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(newWebsiteData),
        }
      );

      const result = await response.json();
      //console.log(result, "result");
      if (response.ok) {
        setWebsitesData((prev) => [
          ...prev,
          {
            id: result.website.id,
            website: result.website.website,
            ownership_type: newWebsiteData.ownership_type,
            website_type: newWebsiteData.website_type,
            status: result.website.status,
          },
        ]);
        setIsSidebarOpen(false);
        setNewWebsite("");
        setSelectedOwnership("Primary");
        setIsSubmitted(false);
        toast.success("Website added");
      } else {
        console.error("Error creating website:", result.error);
      }
    } catch (error) {
      console.error("Failed to add website:", error);
    }
  };

  //update/toggle status
  const toggleStatus = async (index) => {
    const website = websitesData[index];
    const newStatus = website.status === "Active" ? "Inactive" : "Active";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/website/${website.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status.");
      }

      // Update the local state only if the API call is successful
      setWebsitesData((prevData) =>
        prevData.map((item, idx) =>
          idx === index ? { ...item, status: newStatus } : item
        )
      );

      console.log(`Website status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error.message);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <div>
      {projectLoading ? (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-[450px]" />

            <Skeleton className="h-4 w-[400px]" />
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </>
      )}

      <div className="flex justify-between items-center mt-14 mb-10">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search website..."
            className="w-[400px] p-2 border rounded-md"
          />
          <Button
            className="flex items-center gap-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <FaPlus className="mr-2" /> Add New Website
          </Button>
        </div>
      </div>

      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border w-1/2">Website </th>
            <th className="px-4 py-2 border">Ownership </th>
            <th className="px-4 py-2 border">Website </th>
            <th className="px-4 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {websitesData.length > 0 ? (
            websitesData.map((data, index) => (
              <tr key={index} className="odd:bg-gray-100 text-center">
                <td className="px-4 py-2 border">{data.website}</td>
                <td className="px-4 py-2 border">{data.ownership_type}</td>
                <td className="px-4 py-2 border">{data.website_type}</td>

                <td className="px-4 py-2 border">
                  {" "}
                  <Button
                    onClick={() => toggleStatus(index)}
                    className={`py-2 px-3 text-sm rounded-md text-white ${
                      data.status === "Active" ? "bg-green-600" : "bg-gray-500"
                    }`}
                  >
                    {data.status}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-2">
                No websites found
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          <label className="block">Website </label>
          <Input
            type="text"
            placeholder="Enter website url"
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
          <label className="block mb-4">Ownership Type</label>
          <Select
            onValueChange={(value) => setSelectedOwnership(value)}
            value={selectedOwnership}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedOwnership}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primary">Primary</SelectItem>
              <SelectItem value="Competitor">Competitor</SelectItem>
            </SelectContent>
          </Select>
          {!selectedOwnership && isSubmitted && (
            <p className="text-red-500 text-sm">Ownership type is required.</p>
          )}
        </div>
        <div>
          <label className="block mb-4">Website Type</label>
          <Select
            onValueChange={(value) => setSelectedWebsiteType(value)}
            value={selectedWebsiteType}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedWebsiteType}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Directory">Directory</SelectItem>
            </SelectContent>
          </Select>
          {!selectedWebsiteType && isSubmitted && (
            <p className="text-red-500 text-sm">Website type is required.</p>
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

export default ProjectWebsitePage;
