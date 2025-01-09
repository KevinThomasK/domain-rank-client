"use client";
import { useEffect, useState } from "react";
import { listSites } from "@/lib/api";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { GrDocumentConfig } from "react-icons/gr";
import { CiSquareRemove } from "react-icons/ci";
import { FaRegTrashAlt } from "react-icons/fa";

const page = () => {
  const { data: session } = useSession();
  const [externalSites, setExternalSites] = useState([]);
  const [existingSites, setExistingSites] = useState([]);
  const [authUrl, setAuthUrl] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    async function fetchSites() {
      try {
        const externalData = await listSites();
        setExternalSites(externalData);

        const existingResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchconsole/websites`,
          {
            headers: { Authorization: `Bearer ${session?.user.token}` },
          }
        );
        setExistingSites(existingResponse.data);
      } catch (error) {
        console.error("Error fetching sites:", error);
        //toast.error("Error fetching site data");
      }
    }

    //Fetch the authorization URL
    async function fetchAuthUrl() {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-auth-url`
        );
        setAuthUrl(response.data.authUrl);
      } catch (error) {
        console.error("Error fetching auth URL:", error);
      }
    }

    // async function fetchAuthUrl() {
    //   try {
    //     const response = await axios.get(
    //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-access-token`,
    //       {
    //         headers: { Authorization: `Bearer ${session?.user.token}` },
    //       }
    //     );
    //     console.log(response.data, "....data...");
    //     setAuthUrl(response.data);
    //   } catch (error) {
    //     console.error("Error fetching auth URL:", error);
    //   }
    // }

    if (session) {
      fetchSites();
      fetchAuthUrl();
    }
  }, [session, isDeleteModalOpen]);

  // Add a site to the database
  const addSite = async (siteName) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchconsole/website`,
        { site_name: siteName },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
        }
      );
      toast.success("Site added successfully");
      setExistingSites((prev) => [...prev, { site_name: siteName }]);
    } catch (error) {
      console.error("Error adding site:", error);
      toast.error(error.response?.data?.error || "Error adding site");
    }
  };

  // Remove a site from the database
  const removeSite = async (siteName) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/searchconsole/website`,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
          data: { site_name: siteName },
        }
      );
      toast.success("Site removed successfully");
      setExistingSites((prev) =>
        prev.filter((site) => site.site_name !== siteName)
      );
    } catch (error) {
      console.error("Error removing site:", error);
      toast.error(error.response?.data?.error || "Error removing site");
    }
  };

  const removeAuthentication = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-access-token`
      );
      toast.info("Authentication removed");
    } catch (error) {
      console.error("Error removing authentication:", error);
      toast.error(
        error.response?.data?.error || "Error removing authentication"
      );
    }
  };

  // Check if a site is already added to the database
  const isSiteAdded = (siteName) =>
    existingSites.some((site) => site.site_name === siteName);

  return (
    <>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            <h2 className="text-xl font-semibold mb-4">
              Remove Authentication
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to remove authentication?
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
                  await removeAuthentication();
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Connect to Search Console
        </h1>
        <div className="flex items-center mb-20">
          {authUrl && (
            <div>
              <a
                href={authUrl}
                className="inline-block px-6 py-2 bg-[#1A73E8] text-white text-lg rounded-lg shadow-md hover:bg-[#0F5BB5] focus:ring focus:ring-blue-300 flex justify-center items-center"
              >
                <GrDocumentConfig className="mr-2" /> Authenticate
              </a>
            </div>
          )}
          <button
            className="bg-red-500 flex items-center justify-between text-white text-lg rounded-lg shadow-md ml-14 px-6 py-2 hover:bg-[#A61D1D] focus:ring focus:ring-blue-300"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <CiSquareRemove style={{ fontSize: "23px", marginRight: "8px" }} />{" "}
            Remove Authentication
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sites</h2>
          <ul className="space-y-4">
            {externalSites.length === 0 ? (
              <li className="text-center text-gray-600 py-4">
                Not Authenticated
              </li>
            ) : (
              externalSites.map((site) => (
                <li
                  key={site.siteUrl}
                  className="flex items-center justify-between px-4 py-2 bg-white border rounded-lg shadow-md hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <span>{site.siteUrl}</span>
                  {isSiteAdded(site.siteUrl) ? (
                    <Button
                      className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-black transition duration-150 ease-in-out"
                      onClick={() => removeSite(site.siteUrl)}
                    >
                      <FaRegTrashAlt /> Remove
                    </Button>
                  ) : (
                    <Button
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-black transition duration-150 ease-in-out"
                      onClick={() => addSite(site.siteUrl)}
                    >
                      <IoMdAdd /> Add
                    </Button>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default page;
