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

const Page = () => {
  const { data: session, status } = useSession();
  const { slug } = useParams();
  const [project, setProject] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [websitesLoading, setWebsitesLoading] = useState(false);
  const [websitesData, setWebsitesData] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  // const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
  const [scrapingJobs, setScrapingJobs] = useState([]);
  const [visibleResults, setVisibleResults] = useState({});
  const [showResult, setShowResult] = useState(false);

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
      //toast.info(`Site Audit started for ${selectedWebsite}`);
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
      //console.log(scrapingJobs, "scrj");

      toast.success("Scraping started!");
    } catch (error) {
      toast.error("Failed to start scraping.");
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

  // const fetchJobStatus = async (jobId, index) => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`
  //     );

  //     const { status, progress, result } = response.data;
  //     console.log(status, progress, result, "s-p-r");
  //     setScrapingJobs((prevJobs) =>
  //       prevJobs.map((job, idx) =>
  //         idx === index
  //           ? { ...job, status, progress: progress || 0, result }
  //           : job
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Failed to fetch job status:", error.message);
  //   }
  // };

  // /fetchJobStatus function
  const fetchJobStatus = async (jobId, index) => {
    try {
      console.log(jobId, "job id");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`
      );
      const { status, progress, result } = response.data;

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

  const handleShowResult = () => {
    setShowResult(!showResult);
  };

  return (
    <div>
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
          <div className="flex items-center space-x-4">
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
            <Button
              className="flex items-center bg-blue-600"
              disabled={!selectedWebsite}
              onClick={() => startScraping(selectedWebsite, selectedWebsiteId)}
            >
              <FaStaylinked className="mr-2" />
              Web Scrape
            </Button>
          </div>
        )}
      </div>
      {responseMessage && <p>{responseMessage}</p>}
      <div className="mt-6">
        {scrapingJobs.map((job, index) => (
          <div key={job.id} className="border p-4 rounded shadow mb-4 bg-white">
            <p className="text-lg font-semibold">
              <strong>URL:</strong> {job.url}
            </p>
            {/* <p>
              <strong>Website ID:</strong> {job.websiteId}
            </p> */}
            <p>
              <strong>Status:</strong>{" "}
              {job.status === "in-progress" ? (
                <span className="text-yellow-500 font-semibold">
                  In Progress
                </span>
              ) : job.status === "completed" ? (
                <span className="text-green-500 font-semibold">Completed</span>
              ) : (
                <span className="text-red-500 font-semibold">{job.status}</span>
              )}
            </p>
            {job.status === "in-progress" && (
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
            )}

            {job.status === "completed" && job.result && (
              <div className="mt-2">
                <Button
                  onClick={() => toggleResultVisibility(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                >
                  <RiSlideshowLine />{" "}
                  {visibleResults[index] ? "Hide Result" : "Show Result"}
                </Button>
                <Button
                  onClick={() => copyToClipboard(job.result)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  <IoCopyOutline /> Copy Result
                </Button>
                {visibleResults[index] && (
                  <pre className="bg-gray-100 p-2 rounded overflow-x-scroll text-sm mt-2">
                    {JSON.stringify(job.result, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
