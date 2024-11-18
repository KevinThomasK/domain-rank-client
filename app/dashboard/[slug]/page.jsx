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
import { BsCloudCheck } from "react-icons/bs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

export default function SingleProjectPage() {
  const { data: session, status } = useSession();
  const { slug } = useParams(); // Get the project slug from the URL
  const router = useRouter();
  const [keywordsData, setKeywordsData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [project, setProject] = useState("");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("Google");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchPositionData, setSearchPositionData] = useState([]);
  const [isSearchPositionVisible, setIsSearchPositionVisible] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null);
  const [selectedKeywordName, setSelectedKeywordName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch project details
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
      fetchProjectDetails(); // Fetch project details when slug is available
    }
  }, [slug, session?.user.token]);

  // Fetch keywords
  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        setKeywordsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywords/${slug}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );

        const result = await response.json();
        if (response.ok) {
          setKeywordsLoading(false);
          setKeywordsData(result.keywords);
          console.log("Fetched keywords:", result.keywords);
        } else {
          setKeywordsLoading(false);
          console.error("Error fetching keywords:", result.message);
        }
      } catch (error) {
        setKeywordsLoading(false);
        console.error("Failed to fetch keywords:", error);
      }
    };

    if (slug) {
      fetchKeywords(); // Fetch keywords when the slug is available
    }
  }, [slug, session?.user.token]);

  //open prompt to delete a keyword
  const handleDelete = async (index) => {
    const keywordId = keywordsData[index].id;
    const keywordName = keywordsData[index].keyword;

    setSelectedKeywordIndex(index);
    setSelectedKeywordName(keywordName);
    setIsDeleteModalOpen(true);
  };

  const fetchKeywordPosition = async (url, keyword) => {
    const maxResultsToCheck = 100;
    const resultsPerPage = 10;

    for (let start = 1; start <= maxResultsToCheck; start += resultsPerPage) {
      try {
        const response = await fetch(
          `/api/search?query=${encodeURIComponent(keyword)}&start=${start}`
        );
        const data = await response.json();

        if (data.items) {
          const positionInPage = data.items.findIndex((item) =>
            item.link.startsWith(url)
          );

          if (positionInPage !== -1) {
            return start + positionInPage;
          }
        } else {
          break;
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        throw new Error("Failed to fetch search results");
      }
    }

    return "Not Found";
  };

  const handleSearchPosition = async (index) => {
    setLoading(true);
    setPosition(null);
    const url = project.domain_name;
    const keyword = keywordsData[index].keyword;

    try {
      const resultPosition = await fetchKeywordPosition(url, keyword);
      setPosition(resultPosition);

      const keywordId = keywordsData[index].id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywords/${keywordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({
            latest_manual_check_rank: resultPosition,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setKeywordsData((prevKeywordsData) =>
          prevKeywordsData.map((keywordData, idx) =>
            idx === index
              ? { ...keywordData, latest_manual_check_rank: resultPosition }
              : keywordData
          )
        );

        // Store the search result data in the state
        setSearchPositionData((prevData) => [
          ...prevData,
          { keyword, domain: url, position: resultPosition },
        ]);

        // Make the position result table visible
        setIsSearchPositionVisible(true);
      } else {
        console.error("Error updating keyword rank:", result.message);
      }
    } catch (error) {
      console.error("Error fetching position:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = (index) => {
    const keyword = keywordsData[index].keyword;
    router.push(`/projects/${slug}/keywords/${keyword}`);
  };

  //add a keyword
  const handleAddKeyword = async () => {
    const newKeywordData = {
      project_id: slug, // Use the slug as the project_id
      keyword: newKeyword,
      search_engine: selectedSearchEngine,
      search_location: "Default Location",
      latest_auto_search_rank: 0,
      latest_manual_check_rank: 0,
      status: "Active",
    };
    setIsSubmitted(true);

    if (!newKeyword || !selectedSearchEngine) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywords`,
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
      console.log(result, "result");
      if (response.ok) {
        setKeywordsData((prev) => [
          ...prev,
          {
            id: result.keyword.id,
            keyword: result.keyword.keyword,
            search_engine: newKeywordData.search_engine,
            latest_auto_search_rank: newKeywordData.latest_auto_search_rank,
            status: result.keyword.status,
          },
        ]);
        setIsSidebarOpen(false);
        setNewKeyword("");
        setSelectedSearchEngine("Google");
        setIsSubmitted(false);
        toast.success("Keyword added");
      } else {
        console.error("Error creating keyword:", result.error);
      }
    } catch (error) {
      console.error("Failed to add keyword:", error);
    }
  };

  //check rank of all keywords
  const handleAutoRankCheck = async () => {
    setLoading(true);
    const updatedSearchPositionData = [];

    try {
      for (const keywordData of keywordsData) {
        const keyword = keywordData.keyword;
        const url = project.domain_name;
        console.log(keyword, "key word name");
        // Fetch the position for each keyword
        const resultPosition = await fetchKeywordPosition(url, keyword);

        // Update the keyword's latest_auto_search_rank
        const keywordId = keywordData.id;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywordsauto/${keywordId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
            body: JSON.stringify({
              latest_auto_search_rank: resultPosition,
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          setKeywordsData((prevKeywordsData) =>
            prevKeywordsData.map((data) =>
              data.id === keywordId
                ? { ...data, latest_auto_search_rank: resultPosition }
                : data
            )
          );

          // Store the rank data for each keyword
          updatedSearchPositionData.push({
            keyword,
            domain: url,
            position: resultPosition,
          });
        } else {
          console.error("Error updating keyword rank:", result.message);
        }
      }

      // Update search position data state with all the results
      setSearchPositionData(updatedSearchPositionData);

      // Make the position result table visible
      setIsSearchPositionVisible(true);
    } catch (error) {
      console.error("Error fetching position:", error);
    } finally {
      setLoading(false);
    }
  };

  //delete a keyword
  const confirmDelete = async (index) => {
    const keywordId = keywordsData[index].id;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywords/${keywordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        const updatedKeywords = keywordsData.filter((_, idx) => idx !== index);
        setKeywordsData(updatedKeywords);
      } else {
        console.error("Error deleting keyword:", result.error);
      }
    } catch (error) {
      console.error("Failed to delete keyword:", error);
    }
  };

  //update status of keyword
  const toggleStatus = async (index) => {
    const keyword = keywordsData[index];
    const newStatus = keyword.status === "Active" ? "Inactive" : "Active";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/keywords/${keyword.id}/status`,
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
      setKeywordsData((prevData) =>
        prevData.map((item, idx) =>
          idx === index ? { ...item, status: newStatus } : item
        )
      );

      console.log(`Keyword status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error.message);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the keyword{" "}
              <span className="font-bold text-red-600">
                {selectedKeywordName}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await confirmDelete(selectedKeywordIndex);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
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
            <p className="mt-2 text-xl text-blue-800">{project.domain_name}</p>
          </>
        )}

        {keywordsLoading ? (
          <div className="flex items-center space-x-4 mt-5"></div>
        ) : (
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
            {/* Add Check Rank Auto Button */}
            <Button
              className="flex items-center gap-2 bg-green-600 text-white"
              onClick={handleAutoRankCheck}
            >
              <BsCloudCheck />
              Check Rank Auto
            </Button>
          </div>
        )}

        <div className="mt-10">
          {keywordsLoading ? (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Keyword</th>
                  <th className="px-4 py-2 border">Search Engine</th>
                  <th className="px-4 py-2 border">Rank (Auto Check)</th>
                  <th className="px-4 py-2 border">Rank (Manual Check)</th>
                  <th className="px-4 py-2 border">Actions</th>
                  <th className="px-4 py-2 border">Status</th>
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
                        {data.latest_manual_check_rank || "Not Checked"}
                      </td>
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        <Button
                          className="text-white"
                          onClick={() => handleSearchPosition(index)}
                          disabled={loading || data.status === "Inactive"}
                        >
                          {loading ? (
                            <FaSync className="animate-spin" />
                          ) : (
                            "Check"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-blue-600"
                          onClick={() => handleHistory(index)}
                        >
                          <FaHistory />
                        </Button>
                        <Button
                          variant="destructive"
                          className="text-white"
                          onClick={() => handleDelete(index)}
                        >
                          <TfiTrash />
                        </Button>
                      </td>
                      <td className="px-2 py-2 border">
                        <button
                          onClick={() => toggleStatus(index)}
                          className={`py-2 px-3 text-sm rounded-md text-white ${
                            data.status === "Active"
                              ? "bg-green-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {data.status}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-2">
                      No keywords found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
            className={`mb-2 mt-2 h-[50px] text-lg ${
              !newKeyword && isSubmitted ? "border-red-500" : ""
            }`}
          />
          {!newKeyword && isSubmitted && (
            <p className="text-red-500 text-sm">Keyword is required.</p>
          )}
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
          {!selectedSearchEngine && isSubmitted && (
            <p className="text-red-500 text-sm">Search engine is required.</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAddKeyword}>Save Keyword</Button>
          <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>

      {isSearchPositionVisible && (
        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-lg rounded-lg border border-gray-200">
            <thead className="bg-blue-600 text-white text-sm uppercase">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Keyword</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Domain/URL
                </th>
                <th className="px-6 py-4 text-left font-semibold">Rank</th>
              </tr>
            </thead>
            <tbody>
              {searchPositionData.length > 0 ? (
                searchPositionData.map((data, index) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-50 even:bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                  >
                    <td className="px-6 py-4 text-gray-800">{data.keyword}</td>
                    <td className="px-6 py-4 text-gray-600">{data.domain}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {data.position === "Not Found" ? (
                        <span className="text-red-600">Not in top 100</span>
                      ) : (
                        <span className="text-green-600">
                          Ranked at {data.position}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No position data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
