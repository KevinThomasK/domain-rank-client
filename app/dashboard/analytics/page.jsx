"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GrDocumentConfig } from "react-icons/gr";
import { CiSquareRemove } from "react-icons/ci";
import axios from "axios";
import { listAccounts } from "@/lib/api";
import { IoMdAdd } from "react-icons/io";
import { FaRegTrashAlt } from "react-icons/fa";

const AnalyticsProperties = () => {
  const { data: session } = useSession();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [externalAccounts, setExternalAccounts] = useState([]);
  const [existingAccounts, setExistingAccounts] = useState([]);

  useEffect(() => {
    // Fetch properties from the API

    const fetchProperties = async () => {
      try {
        setLoading(true);
        const externalData = await listAccounts();
        setExternalAccounts(externalData);

        const existingResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/accounts`,
          {
            headers: { Authorization: `Bearer ${session?.user.token}` },
          }
        );
        setExistingAccounts(existingResponse.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching sites:", error);
      }
    };

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

    if (session) {
      fetchProperties();
      fetchAuthUrl();
    }
  }, [session]);

  const handleAdd = async (account) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyticsaccounts/add`,
        {
          account_name: account.accountName,
          account_id: account.accountId,
          property_name: account.propertyName,
          property_id: account.propertyId,
          project_id: 1, // Replace with the actual project_id or pass it dynamically
        },
        {
          headers: { Authorization: `Bearer ${session?.user.token}` }, // Add authorization token
        }
      );

      toast.success("Account added successfully");

      setExistingAccounts((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding account:", error);

      toast.error(error.response?.data?.error || "Error adding account");
    }
  };

  // Remove a site from the database
  const removeSite = async (siteName) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analyticsaccount/remove`,
        {
          headers: { Authorization: `Bearer ${session?.user.token}` },
          data: { property_name: siteName },
        }
      );
      toast.success("Account removed successfully");
      setExistingAccounts((prev) =>
        prev.filter((site) => site.property_name !== siteName)
      );
    } catch (error) {
      console.error("Error removing account:", error);
      toast.error(error.response?.data?.error || "Error removing account");
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

  const isSiteAdded = (siteName, propertyId) =>
    existingAccounts.some(
      (site) =>
        site.account_name === siteName && site.property_id === propertyId
    );

  if (loading) {
    return (
      <>
        <Skeleton className="w-full h-10 mb-6" />
        <Skeleton className="w-full h-10 mb-6" />
        <Skeleton className="w-full h-10 mb-6" />
        <Skeleton className="w-full h-10 mb-6" />
        <Skeleton className="w-full h-10 mb-6" />
        <Skeleton className="w-full h-10" />
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-gray-600">
        {error}
      </div>
    );
  }

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Connect to Google Analytics
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

      <div className="max-w-8xl mx-auto p-6 bg-gray-50 shadow-md rounded-lg">
        <div className="overflow-x-auto">
          {externalAccounts.length === 0 ? (
            <p className="text-center text-gray-600 py-4">Not Authenticated</p>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100 ">
                  <th className="py-3 px-6 text-left text-gray-600 font-bold uppercase">
                    Account Name
                  </th>

                  <th className="py-3 px-6 text-left text-gray-600 font-bold uppercase">
                    Property Name
                  </th>

                  <th className="py-3 px-6 text-center text-gray-600 font-bold uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {externalAccounts?.data?.map((property, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100`}
                  >
                    <td className="py-4 px-6 text-gray-700">
                      {property.accountName}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {property.propertyName}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {isSiteAdded(
                        property.accountName,
                        property.propertyId
                      ) ? (
                        <Button
                          className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-black transition duration-150 ease-in-out"
                          onClick={() => removeSite(property.propertyName)}
                        >
                          <FaRegTrashAlt /> Remove
                        </Button>
                      ) : (
                        <Button
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-black transition duration-150 ease-in-out"
                          onClick={() => handleAdd(property)}
                        >
                          <IoMdAdd /> Add
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsProperties;
