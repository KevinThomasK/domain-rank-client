"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FaStaylinked } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoCopyOutline } from "react-icons/io5";
import { RiSlideshowLine } from "react-icons/ri";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/github.css";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const Page = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { slug } = useParams();
  const [project, setProject] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websitesData, setWebsitesData] = useState([]);

  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  // const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
  const [scrapingJobs, setScrapingJobs] = useState([]);
  const [visibleResults, setVisibleResults] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isLinksVisible, setLinksVisible] = useState(false);

  //Fetch Jobs on Page Load
  useEffect(() => {
    const fetchJobsFromDB = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/scraping-jobs`
        );
        setScrapingJobs(response.data || []);
      } catch (error) {
        console.error("Failed to fetch jobs from database:", error.message);
      }
    };

    fetchJobsFromDB();
  }, []);

  const startScraping = async (url, websiteId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/scrape`,
        {
          url,
          websiteId,
        }
      );

      const newJob = {
        id: response.data.jobId,
        status: "in-progress",
        progress: 0,
        websiteId,
        url,
      };

      setScrapingJobs((prevJobs) => [...prevJobs, newJob]);

      toast.success("Audit started!");
    } catch (error) {
      toast.error("Failed to start audit.");
      console.error(error.message);
    }
  };

  //project details fetch
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

  //website fetch
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

  // /fetchJobStatus function
  const fetchJobStatus = async (jobId, index) => {
    console.log(jobId, "job id");
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`
      );
      const { status, progress, result } = response.data;

      if (result) {
        try {
          // Ensure result is a valid JSON string before saving
          const jsonResult =
            typeof result === "string" ? result : JSON.stringify(result);

          const updateResponse = await axios.patch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/update-scraping-job`,
            {
              jobId: jobId, // Use the correct jobId (job_id)
              result: jsonResult, // Pass the stringified result to the backend
            }
          );

          if (updateResponse.status === 200) {
            console.log("Job updated successfully in the backend");
          } else {
            console.log("Result is null, skipping update.");
          }
        } catch (error) {
          console.log(error);
        }
      }

      setScrapingJobs((prevJobs) =>
        prevJobs.map((job, idx) =>
          idx === index
            ? { ...job, status, progress: progress || 0, result }
            : job
        )
      );

      // Save the updated jobs to the database
      const updatedJobs = scrapingJobs.map((job, idx) =>
        idx === index
          ? { ...job, status, progress: progress || 0, result }
          : job
      );

      const validJobs = scrapingJobs.filter((job) => job.websiteId);
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/scraping-jobs`, {
        jobs: validJobs,
      });
    } catch (error) {
      console.error("Failed to fetch job status:", error.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      scrapingJobs.forEach((job, index) => {
        if (job.status === "in-progress") {
          fetchJobStatus(job.id, index);
        }
      });
    }, 2000);

    //console.log(interval, "intervel");

    return () => clearInterval(interval);
  }, [scrapingJobs]);

  const handleWebsiteChange = (value) => {
    const parsedValue = JSON.parse(value);
    setSelectedWebsite(parsedValue.website);
    setSelectedWebsiteId(parsedValue.id);
  };

  const toggleResultVisibility = (index) => {
    setVisibleResults((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const copyToClipboard = (result) => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast("Copied!", {
      theme: "colored",
    });
  };

  // const handleShowResult = () => {
  //   setShowResult(!showResult);
  // };

  const handleShowResult = (jobId) => {
    router.push(`/dashboard/site-audit/results/${jobId}`);
  };

  return (
    <div className="mb-5 p-6 bg-gray-50 min-h-full">
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
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Site Audit Dashboard
              </h1>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Select a Website:
                </label>
                <Select onValueChange={handleWebsiteChange}>
                  <SelectTrigger className="w-full px-4 py-2 bg-white border rounded-lg shadow-md focus:outline-none focus:ring focus:ring-blue-300">
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
              </div>

              <div className="mt-4">
                <Button
                  className="w-full max-w-60 bg-green-500 px-4 py-2 rounded-lg shadow-md text-white font-medium flex items-center justify-center"
                  disabled={!selectedWebsite}
                  onClick={() =>
                    startScraping(selectedWebsite, selectedWebsiteId)
                  }
                >
                  <FaStaylinked className="mr-2" />
                  Start Audit
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      {responseMessage && <p>{responseMessage}</p>}

      <div className="mt-6">
        {scrapingJobs.filter((job) => job.url === selectedWebsite).length >
        0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-left">
                  <th className="px-6 py-3 text-sm font-semibold">Date</th>
                  <th className="px-6 py-3 text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scrapingJobs
                  .filter((job) => job.url === selectedWebsite)
                  .map((job) => {
                    const jobDate = new Date(job.date);
                    const isValidDate = !isNaN(jobDate);
                    const displayDate = isValidDate ? jobDate : new Date();

                    return (
                      <tr
                        key={job.id}
                        className="border-b transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 text-gray-600 text-sm">
                          {displayDate.toLocaleDateString("en-GB")},{" "}
                          {displayDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-3">
                          {job.status === "in-progress" ? (
                            <span className="text-yellow-500 font-semibold">
                              In Progress
                            </span>
                          ) : job.status === "completed" ? (
                            <span className="text-green-500 font-semibold">
                              Completed
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">
                              {job.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {job.status === "in-progress" && (
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                              <span className="ml-2 text-gray-500 text-sm">
                                Processing...
                              </span>
                            </div>
                          )}
                          {job.status === "completed" && job.result && (
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleShowResult(job.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-blue-600"
                              >
                                View Result
                              </Button>
                              {/* <Button
                                onClick={() => copyToClipboard(job.result)}
                                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm shadow hover:bg-green-600 flex items-center"
                              >
                                <IoCopyOutline className="mr-1" />
                                Copy Result
                              </Button> */}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">
            No scraping jobs found for this website.
          </p>
        )}
      </div>
    </div>
  );
};

{
  /* {job.status === "in-progress" && (
              <div className="mt-2">
                <strong>Progress:</strong>
                <div className="relative w-full h-4 bg-gray-200 rounded mt-1">
                  <div
                    className="absolute top-0 left-0 h-4 bg-blue-600 rounded transition-all duration-300 ease-in-out"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.progress}%</p>
              </div>
            )} */
}

export default Page;
