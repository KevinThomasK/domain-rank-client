"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaPlus, FaSync, FaHistory } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
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
import KeywordTable from "@/components/KeywordTable";
import TableModal from "@/components/TableModal";
import { CiViewList } from "react-icons/ci";

export default function SingleProjectPage() {
  const { data: session, status } = useSession();
  const { slug } = useParams();
  const [keywordsData, setKeywordsData] = useState([]);
  const [websitesData, setWebsitesData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [project, setProject] = useState("");
  const [ranks, setRanks] = useState("");
  const [data, setData] = useState("");
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("Google");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchPositionData, setSearchPositionData] = useState([]);
  const [isSearchPositionVisible, setIsSearchPositionVisible] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(null);
  const [selectedKeywordName, setSelectedKeywordName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarMode, setSidebarMode] = useState("addKeyword");
  const [selectedKeyword, setSelectedKeyword] = useState("");

  //update website state while select website
  const handleWebsiteChange = (value) => {
    const parsedValue = JSON.parse(value);
    setSelectedWebsite(parsedValue.website);
    setSelectedWebsiteId(parsedValue.id);
  };

  //fetch ranks from join ranks and keywords api
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ranks/project/${slug}/website/${selectedWebsiteId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setRanks(result);
        } else {
          console.error("Error fetching project:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    if (slug) {
      fetchRanks(); // Fetch project details when slug is available
    }
  }, [slug, selectedWebsiteId, keywordsData, session?.user.token]);

  //fetch all keywords for a specific project along with their corresponding rank for each website
  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${slug}/keywords`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        const result = await response.json();
        if (response.ok) {
          setData(result);
        } else {
          console.error("Error fetching table:", result.message);
        }
      } catch (error) {
        console.error("Failed to fetch table:", error);
      }
    };

    if (slug) {
      fetchTable();
    }
  }, [slug, session?.user.token]);

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
          //console.log("Fetched keywords:", result.keywords);
        } else {
          setKeywordsData([]);
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

  //rank check function
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
            item.link.includes(url)
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

  //rank check manual(single keyword)
  const handleSearchPosition = async (index) => {
    setLoading(true);
    setPosition(null);
    const url = selectedWebsite;
    const keyword = keywordsData[index].keyword;

    try {
      const resultPosition = await fetchKeywordPosition(url, keyword);
      if (isNaN(resultPosition)) {
        toast.info("Not found in the top 100 results");
        return;
      }
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
            website_id: selectedWebsiteId,
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
      toast.error("something went wrong, please try again later");
      console.error("Error fetching position:", error);
    } finally {
      setLoading(false);
    }
  };

  //get rank history
  const handleHistory = async (index) => {
    const keywordId = keywordsData[index].id;
    setSelectedKeyword(keywordsData[index].keyword);

    if (!keywordId || !selectedWebsiteId) {
      toast.info("Website not selected");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/rankhistory/${keywordId}/${selectedWebsiteId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        if (result.length === 0) {
          // Handle case where no history is found
          toast.info("No history found for the selected keyword and website.");
          setHistory([]); // Optionally set an empty state
          setSidebarMode(null); // Optionally reset sidebar mode
          setIsSidebarOpen(false);
          return;
        }
        setHistory(result);
        setSidebarMode("showHistory");
        setIsSidebarOpen(true);
      } else {
        // Handle backend errors
        if (response.status === 404 || response.status === 204) {
          toast.info("No history found for the selected keyword and website.");
        } else {
          toast.error("Something went wrong");
        }
        console.error("Error fetching rankhistory:", result.message);
      }
    } catch (error) {
      // Handle network or other unexpected errors
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  //add a keyword
  const handleAddKeyword = async () => {
    const newKeywordData = {
      project_id: slug,
      keyword: newKeyword,
      search_engine: selectedSearchEngine,
      search_location: "Default Location",
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
      //console.log(result, "result");
      if (response.ok) {
        setKeywordsData((prev) => [
          ...prev,
          {
            id: result.keyword.id,
            keyword: result.keyword.keyword,
            search_engine: newKeywordData.search_engine,
            status: result.keyword.status,
          },
        ]);
        setIsSidebarOpen(false);
        setNewKeyword("");
        setSelectedSearchEngine("Google");
        setIsSubmitted(false);
        toast.success("Keyword added");
      } else {
        toast.error("something went wrong");
        console.error("Error creating keyword:", result.error);
      }
    } catch (error) {
      toast.error("something went wrong");
      console.error("Failed to add keyword:", error);
    }
  };

  //check rank of all keywords(auto)
  const handleAutoRankCheck = async () => {
    setLoading(true);
    const updatedSearchPositionData = [];

    try {
      const activeKeywords = keywordsData.filter(
        (keywordData) => keywordData.status === "Active"
      );
      for (const keywordData of activeKeywords) {
        const keyword = keywordData.keyword;
        const url = selectedWebsite;

        // Fetch the position for each keyword
        const resultPosition = await fetchKeywordPosition(url, keyword);

        // Update the keyword's latest_auto_search_rank
        if (!url) {
          toast.info("Website not selected");
          return;
        }
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
              website_id: selectedWebsiteId,
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
          toast.error("something went wrong, please try again later");
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

      //console.log(`Keyword status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error.message);
      alert("Failed to update status. Please try again.");
    }
  };

  return (
    <>
      {/* delete confirm modal */}
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
      {/* heading and keywords table */}
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
            <Select onValueChange={handleWebsiteChange}>
              <SelectTrigger className="w-[400px] h-11 border rounded-md px-4 py-2 text-lg">
                <SelectValue placeholder="Select a website" />
              </SelectTrigger>
              <SelectContent className="text-lg">
                {websitesData.map((data) => (
                  <SelectItem
                    key={data.id}
                    value={JSON.stringify({
                      website: data.website,
                      id: data.id,
                    })}
                  >
                    {data.website}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                onClick={() => {
                  setIsSidebarOpen(true);
                  setSidebarMode("addKeyword");
                }}
              >
                <FaPlus className="mr-2" /> Add New Keyword
              </Button>
            </div>
            {/* view table button */}
            <div className="p-4">
              <Button
                className="bg-blue-700"
                onClick={() => setIsModalOpen(true)}
              >
                <CiViewList />
                Summary
              </Button>

              <TableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              >
                <h2 className="text-xl font-semibold mb-4">
                  Summary (Keyword Rank Table)
                </h2>
                <KeywordTable data={data} />
              </TableModal>
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
                  <th className="px-4 py-2 border w-1/3 text-left">Keyword</th>
                  <th className="px-4 py-2 border">Search Engine</th>
                  <th className="px-4 py-2 border">Rank (Auto Check)</th>
                  <th className="px-4 py-2 border">Rank (Manual Check)</th>
                  <th className="px-4 py-2 border">Actions</th>
                  <th className="px-4 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {ranks?.data?.length > 0 ? (
                  ranks.data.map((data, index) => (
                    <tr key={index} className="odd:bg-gray-100 text-center">
                      <td className="px-4 py-2 border text-left">
                        {data.keyword || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {data.search_engine || "N/A"}
                      </td>
                      <td className="px-4 py-2 border">
                        {data.latest_auto_search_rank === -1
                          ? "Not Found"
                          : data.latest_auto_search_rank !== null
                          ? data.latest_auto_search_rank
                          : "N/A"}
                      </td>

                      <td className="px-4 py-2 border">
                        {data.latest_manual_check_rank !== null
                          ? data.latest_manual_check_rank
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        <Button
                          className="text-white"
                          onClick={() => handleSearchPosition(index)}
                          disabled={
                            loading || data.keyword_status === "Inactive"
                          }
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
                        <Button
                          onClick={() => toggleStatus(index)}
                          className={`py-2 px-3 text-sm rounded-md text-white ${
                            data.keyword_status === "Active"
                              ? "bg-green-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {data.keyword_status}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : keywordsData.length > 0 ? (
                  keywordsData.map((data, index) => (
                    <tr key={index} className="odd:bg-gray-100 text-center">
                      <td className="px-4 py-2 border text-left">
                        {data.keyword}
                      </td>
                      <td className="px-4 py-2 border">{data.search_engine}</td>
                      <td className="px-4 py-2 border">{"N/A"}</td>
                      <td className="px-4 py-2 border">{"N/A"}</td>
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        <Button
                          className="text-white"
                          disabled={true}
                          onClick={() => handleSearchPosition(index)}
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
                          disabled={true}
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
                        <Button
                          onClick={() => toggleStatus(index)}
                          className={`py-2 px-3 text-sm rounded-md text-white ${
                            data.status === "Active"
                              ? "bg-green-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {data.status}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-2">
                      No keywords found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* sidebar modal*/}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform transition-all duration-300 ${
          isSidebarOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        {sidebarMode === "addKeyword" ? (
          <>
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
                <p className="text-red-500 text-sm">
                  Search engine is required.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddKeyword}>Save Keyword</Button>
              <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-2xl font-bold text-gray-800 border-b pb-2">
              Rank History
            </h2>
            <h3 className="mb-2 text-lg font-semibold text-gray-600">
              Keyword: <span className="font-normal">{selectedKeyword}</span>
            </h3>
            <h3 className="mb-4 text-lg font-semibold text-gray-600">
              Website: <span className="font-normal">{selectedWebsite}</span>
            </h3>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="px-4 py-2 text-gray-700 border border-gray-200">
                        Date
                      </th>
                      <th className="px-4 py-2 text-gray-700 border border-gray-200">
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-gray-100`}
                      >
                        <td className="px-4 py-2 text-gray-700 border border-gray-200">
                          {new Date(item.checked_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-700 border border-gray-200">
                          {item.rank}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-gray-500">No history available.</p>
            )}

            <Button
              onClick={() => {
                setIsSidebarOpen(false);
              }}
              variant="outline"
              className="mt-4"
            >
              Back
            </Button>
          </>
        )}
      </div>

      {/* search result table */}
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
