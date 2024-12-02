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

  const startScraping = async (url, websiteId) => {
    try {
      toast.info(`Site Audit started for ${selectedWebsite}`);
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
      console.log(scrapingJobs, "scrj");

      toast.success("Scraping started!");
    } catch (error) {
      toast.error("Failed to start scraping.");
      console.error(error.message);
    }
  };

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

  const fetchJobStatus = async (jobId, index) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`
      );

      const { status, progress, result } = response.data;
      console.log(status, progress, result, "s-p-r");
      setScrapingJobs((prevJobs) =>
        prevJobs.map((job, idx) =>
          idx === index
            ? { ...job, status, progress: progress || 100, result }
            : job
        )
      );
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

    return () => clearInterval(interval);
  }, [scrapingJobs]);

  //socket effect

  const handleWebsiteChange = (value) => {
    const parsedValue = JSON.parse(value);
    setSelectedWebsite(parsedValue.website);
    setSelectedWebsiteId(parsedValue.id);
  };

  const handleScrape = async () => {
    if (!selectedWebsite || !selectedWebsiteId) {
      alert("Please select a website and websiteId!");
      return;
    }

    try {
      const requestBody = {
        url: selectedWebsite, // Assuming selectedWebsite contains the URL
        websiteId: selectedWebsiteId, // Assuming selectedWebsiteId contains the website ID
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/scrape`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`, // Include token if required
          },
          body: JSON.stringify(requestBody), // Send the JSON body
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to start the scraping task."
        );
      }

      const responseData = await response.json(); // Parse the JSON response
      setResponseMessage(`Job started! Job ID: ${responseData.jobId}`);
      console.log(responseData, "response data");
    } catch (error) {
      console.error("Error starting scrape:", error);
      setResponseMessage(
        error.message || "An error occurred while starting the scrape."
      );
    } finally {
      console.log("first");
    }
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
          <div key={job.id} className="border p-4 rounded shadow mb-4">
            <p>
              <strong>URL:</strong> {job.url}
            </p>
            <p>
              <strong>Website ID:</strong> {job.websiteId}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {job.status === "in-progress" ? "In Progress" : job.status}
            </p>
            {job.status === "in-progress" && (
              <p>
                <strong>Progress:</strong> {job.progress}%
              </p>
            )}
            {job.status === "completed" && job.result && (
              <pre className="bg-gray-100 p-2 rounded overflow-x-scroll">
                {JSON.stringify(job.result, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
