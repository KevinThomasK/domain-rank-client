"use client";

import { useParams, useRouter } from "next/navigation";
import ProjectLayout from "@/components/ProjectLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaPlus, FaSync, FaHistory } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

export default function SingleProjectPage() {
  const { data: session, status } = useSession();
  const { slug } = useParams(); // Get the project slug from the URL
  const router = useRouter();

  const [toggleState, setToggleState] = useState([false, false, false]);
  const [keywordsData, setKeywordsData] = useState([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [project, setProject] = useState("");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("Google");

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await fetch(
          `https://domain-rank-node.onrender.com/projects/${slug}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setProject(result);
        } else {
          console.error("Error fetching project:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    if (slug) {
      fetchProjectDetails(); // Fetch project details when slug is available
    }
  }, [slug, session?.user.token]);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const response = await fetch(
          `https://domain-rank-node.onrender.com/keywords/${slug}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );

        const result = await response.json();
        if (response.ok) {
          setKeywordsData(result.keywords);
          console.log("Fetched keywords:", result.keywords);
        } else {
          console.error("Error fetching keywords:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch keywords:", error);
      }
    };

    if (slug) {
      fetchKeywords(); // Fetch keywords when the slug is available
    }
  }, [slug, session?.user.token]);

  const handleToggle = (index) => {
    setToggleState((prev) =>
      prev.map((state, idx) => (idx === index ? !state : state))
    );
  };

  const handleDelete = (index) => {
    const updatedKeywords = keywordsData.filter((_, idx) => idx !== index);
    setKeywordsData(updatedKeywords);
  };

  const handleRefresh = (index) => {
    console.log("Refresh for index", index);
  };

  const handleHistory = (index) => {
    const keyword = keywordsData[index].keyword;
    router.push(`/projects/${slug}/keywords/${keyword}`);
  };

  const handleAddKeyword = async () => {
    const newKeywordData = {
      project_id: slug, // Use the slug as the project_id
      keyword: newKeyword,
      search_engine: selectedSearchEngine,
      search_location: "Default Location",
      latest_auto_search_rank: 0, // Default value for auto search rank
      latest_manual_check_rank: 0, // Default value for manual check rank
      status: "Active", // Default status
    };

    // Send the data to the backend API
    try {
      const response = await fetch(
        "https://domain-rank-node.onrender.com/keywords",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(newKeywordData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setKeywordsData((prev) => [
          ...prev,
          {
            keyword: newKeywordData.keyword,
            search_engine: newKeywordData.search_engine,
            latest_auto_search_rank: newKeywordData.latest_auto_search_rank,
          },
        ]);
        setIsSidebarOpen(false);
        setNewKeyword("");
        setSelectedSearchEngine("Google");
      } else {
        // Handle error
        console.error("Error creating keyword:", result.error);
      }
    } catch (error) {
      console.error("Failed to add keyword:", error);
    }
  };

  return (
    <ProjectLayout>
      <div className="mb-5">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="mt-2 text-xl text-blue-800">{project.domain_name}</p>
        <div className="flex justify-between items-center mt-14">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search keywords..."
              className="w-[400px] p-2 border rounded-md"
            />
            <Button
              className="flex items-center gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaPlus className="mr-2" /> Add New Keyword
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Keyword</th>
                <th className="px-4 py-2 border">Search Engine</th>
                <th className="px-4 py-2 border">Rank</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywordsData.length > 0 ? (
                keywordsData.map((data, index) => (
                  <tr key={index} className="odd:bg-gray-100 text-center">
                    <td className="px-4 py-2 border">{data.keyword}</td>
                    <td className="px-4 py-2 border">{data.search_engine}</td>
                    <td className="px-4 py-2 border">
                      {data.latest_auto_search_rank}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex justify-center items-center gap-6">
                        <FaSync
                          className="text-blue-400 cursor-pointer text-xl"
                          onClick={() => handleRefresh(index)}
                          title="Check Ranking Now"
                        />
                        <FaHistory
                          className="text-yellow-400 cursor-pointer text-xl"
                          onClick={() => handleHistory(index)}
                          title="View Ranking History"
                        />
                        <TfiTrash
                          className="cursor-pointer text-xl text-red-400"
                          onClick={() => handleDelete(index)}
                          title="Delete"
                        />
                        <Switch
                          checked={toggleState[index]}
                          onCheckedChange={() => handleToggle(index)}
                          className="w-[40px] h-[20px] bg-gray-300 rounded-full"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No keywords to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform transition-all duration-300 ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <h2 className="mb-6 font-bold">Add New Keyword</h2>
        <div>
          <label className="block">Keyword</label>
          <Input
            type="text"
            placeholder="Enter keyword"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="mb-2 mt-2 h-[50px] text-lg"
          />
        </div>
        <div>
          <label className="block">Search Engine</label>
          <Select
            onValueChange={(value) => setSelectedSearchEngine(value)}
            value={selectedSearchEngine}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedSearchEngine}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Bing">Bing</SelectItem>
              <SelectItem value="Yahoo">Yahoo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddKeyword}>Save Keyword</Button>
          <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </ProjectLayout>
  );
}
