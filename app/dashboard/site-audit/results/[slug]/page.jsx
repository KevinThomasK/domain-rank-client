"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { CiViewList } from "react-icons/ci";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

const ResultPage = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [activeMenu, setActiveMenu] = useState("uniqueLinks");
  const [directories, setDirectories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  // Fetch Jobs on Page Load
  useEffect(() => {
    const fetchJobsFromDB = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/results/${slug}`
        );
        console.log(response, "response.....");
        const jobData = response.data;

        setJob(jobData);

        // Extract directories from uniqueLinks
        const uniqueDirectories = Array.from(
          new Set(
            jobData.result.uniqueLinks
              ?.map((link) => {
                // Remove protocol (https:// or http://)
                const urlWithoutProtocol = link.replace(/^https?:\/\//, "");

                // Find the second-to-last '/' after removing the protocol
                const secondLastSlashIndex = urlWithoutProtocol.lastIndexOf(
                  "/",
                  urlWithoutProtocol.lastIndexOf("/") - 1
                );

                // If the second last slash exists, extract the directory part
                if (
                  secondLastSlashIndex > -1 &&
                  urlWithoutProtocol.length > secondLastSlashIndex + 1
                ) {
                  return `https://${urlWithoutProtocol.substring(
                    0,
                    secondLastSlashIndex + 1
                  )}`;
                }

                // Return null for incomplete URLs like https:// or invalid directories
                return null;
              })
              .filter(Boolean) // Remove null values (non-directory links)
          )
        );
        setDirectories(uniqueDirectories);
      } catch (error) {
        console.error("Failed to fetch jobs from database:", error.message);
      }
    };

    fetchJobsFromDB();
  }, [slug]);

  if (!job) {
    return <div>Loading...</div>;
  }

  const closeModal = () => {
    setSelectedImage(null); // Close the modal
  };

  // Handle Image Click to show modal
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleViewMetadata = (link) => {
    const matchingPage = job.result.pages?.find((page) => page.url === link);
    setSelectedMetadata(matchingPage || null); // Update selected metadata
  };

  // Copy function
  const copyAllUniqueLinks = (uniqueLinks) => {
    if (!uniqueLinks || uniqueLinks.length === 0) {
      toast("No URL's available to copy", {
        theme: "colored",
      });
      return;
    }

    const urls = uniqueLinks.join("\n");

    navigator.clipboard
      .writeText(urls)
      .then(() =>
        toast("All URLs copied!", {
          theme: "colored",
        })
      )
      .catch(() => toast.error("Failed to copy."));
  };

  return (
    <>
      <div className="flex items-center  bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 mr-16">
          Site Audit Result
        </h1>
        <div className="sticky top-0 z-20 border-gray-200">
          <h1 className="font-bold text-gray-900 text-2xl">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black text-2xl hover:text-indigo-800 transition-colors duration-300 decoration-indigo-500"
            >
              {job.url}
            </a>
          </h1>
        </div>
      </div>
      <div className="flex bg-gray-50 min-h-full">
        {/* Sidebar */}

        <div className="w-1/6 max-w-[350px]  h-screen sticky top-0 pr-8">
          <ul className="flex flex-col space-y-4">
            {[
              { id: "uniqueLinks", label: "Pages" },
              { id: "uniqueImages", label: "Images" },
              { id: "pages", label: "Meta Datas" },
              { id: "errors", label: "Broken Links" },
              { id: "directories", label: "Directories" },
              { id: "image-details", label: "Image Details" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full text-left px-4 py-2 font-medium rounded-lg shadow-md transition ${
                    activeMenu === item.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto w-5/6">
          {activeMenu === "uniqueLinks" && (
            <div className="bg-white shadow-lg rounded-xl p-6">
              {/* Copy Button */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Unique Links
                </h2>
                <button
                  onClick={() => copyAllUniqueLinks(job.result.uniqueLinks)}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium shadow-md"
                >
                  Copy All URLs
                </button>
              </div>

              <ol className="list-decimal pl-6 space-y-5">
                {job.result.uniqueLinks?.map((link, index) => (
                  <li
                    key={index}
                    className="space-y-4 border-b pb-4 last:border-none"
                  >
                    <div className="flex items-center justify-between">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition duration-300 hover:underline max-w-2xl truncate"
                      >
                        {link}
                      </a>
                      <Button
                        variant="ghost"
                        className="hover:bg-gray-100 rounded-full p-2"
                        onClick={() => handleViewMetadata(link)}
                      >
                        <CiViewList className="text-xl" />
                      </Button>
                    </div>

                    {/* Display selected metadata */}
                    {selectedMetadata && selectedMetadata.url === link && (
                      <div className="mt-4 p-6 bg-gray-50 border rounded-lg shadow-inner">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">
                          {selectedMetadata.title}
                        </h2>
                        <a
                          href={selectedMetadata.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-500 truncate block mb-3 hover:underline"
                        >
                          {selectedMetadata.url}
                        </a>

                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-gray-700">
                              Meta Description{" "}
                              <span className="text-sm text-gray-500">
                                (
                                {
                                  (selectedMetadata.metaTags?.description || "")
                                    .length
                                }{" "}
                                characters)
                              </span>
                            </p>
                            <p className="text-gray-600">
                              {selectedMetadata.metaTags?.description || (
                                <span className="text-gray-400">
                                  No description available
                                </span>
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-700">
                              Meta Keywords{" "}
                              <span className="text-sm text-gray-500">
                                (
                                {
                                  (selectedMetadata.metaTags?.keywords || "")
                                    .length
                                }{" "}
                                characters)
                              </span>
                            </p>
                            <p className="text-gray-600">
                              {selectedMetadata.metaTags?.keywords || (
                                <span className="text-gray-400">
                                  No keywords available
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeMenu === "uniqueImages" && (
            <div className="p-8 bg-white rounded-lg">
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                {job?.result?.uniqueImages?.map((image, index) => (
                  <div
                    key={index}
                    className="bg-white p-2 rounded shadow cursor-pointer"
                    onClick={() => handleImageClick(image)} // Show image details in modal on click
                  >
                    <img
                      src={image.url}
                      alt={`Unique Image ${index}`}
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Details Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 "
              onClick={closeModal}
            >
              <div
                className="bg-white rounded-lg p-6 w-1/3 "
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                  onClick={closeModal}
                >
                  ×
                </button>
                <h3 className="text-xl font-semibold mb-4">Image Details</h3>
                <img
                  src={selectedImage.url}
                  alt={`Image Details`}
                  className="w-full h-auto rounded-md  max-h-[380px] object-contain"
                />
                <p className="mt-10">
                  <strong>Alt Text:</strong>{" "}
                  {selectedImage.altText || "No Alt Text"}
                </p>
                <p>
                  <strong>Width:</strong> {selectedImage.width}px
                </p>
                <p>
                  <strong>Height:</strong> {selectedImage.height}px
                </p>
                <p>
                  <strong>Size:</strong> {selectedImage.sizeInKB} KB (
                  {selectedImage.sizeInMB} MB)
                </p>
                <p className="mt-4 text-sm break-all">
                  <strong>URL:</strong>{" "}
                  <a
                    href={selectedImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {selectedImage.url || "No URL"}
                  </a>
                </p>
              </div>
            </div>
          )}
          {activeMenu === "pages" && (
            <div>
              <ul className="space-y-6">
                {job.result.pages?.map((page, index) => (
                  <li
                    key={index}
                    className="p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col space-y-3">
                      <strong className="text-xl font-semibold text-gray-900">
                        {page.title}
                        <span className="text-sm text-gray-500 ml-2">
                          ({(page.title || "").length} characters)
                        </span>
                      </strong>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-medium text-blue-600 hover:text-blue-800 transition-colors truncate"
                      >
                        {page.url}
                      </a>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold text-gray-800">
                        Meta Description{" "}
                        <span className="text-sm text-gray-500">
                          (
                          {
                            (
                              page.metaTags?.description ||
                              page.metaTags?.Description ||
                              ""
                            ).length
                          }{" "}
                          characters)
                        </span>
                      </p>
                      <p className="text-gray-600">
                        {page.metaTags?.description ||
                          page.metaTags?.Description || (
                            <span className="text-gray-400">
                              No description available
                            </span>
                          )}
                      </p>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold text-gray-800">
                        Meta Keywords{" "}
                        <span className="text-sm text-gray-500">
                          (
                          {
                            (
                              page.metaTags?.keywords ||
                              page.metaTags?.Keywords ||
                              ""
                            ).length
                          }{" "}
                          characters)
                        </span>
                      </p>
                      <p className="text-gray-600">
                        {page.metaTags?.keywords || page.metaTags?.Keywords || (
                          <span className="text-gray-400">
                            No keywords available
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeMenu === "errors" && (
            <div className="p-4 bg-white rounded-lg min-h-screen">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 border-b">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 border-b">
                        URL
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 border-b">
                        Parent URL
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-800 border-b">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(job?.result.errors) &&
                    job?.result.errors.length > 0 ? (
                      job.result.errors.map((error, index) => (
                        <tr key={index} className="hover:bg-gray-100">
                          <td className="px-4 py-2 text-sm text-gray-800 border-b">
                            {index + 1}{" "}
                            {/* Display row number starting from 1 */}
                          </td>
                          <td className="px-4 py-2 text-sm text-indigo-600 border-b">
                            <a
                              href={error.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-800"
                            >
                              {error.url}
                            </a>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 border-b">
                            {error.parentUrl ? (
                              <a
                                href={error.parentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                {error.parentUrl}
                              </a>
                            ) : (
                              <span className="text-gray-400">
                                No Parent URL
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-red-600 border-b">
                            {error.error}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-2 text-sm text-gray-600 text-center border-b"
                        >
                          No broken links found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === "directories" && (
            <div className="p-8 bg-white min-h-screen rounded-lg">
              <ul className="space-y-3">
                {directories.map((directory, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300 hover:border-indigo-600 hover:bg-indigo-50 transition duration-300 ease-in-out"
                  >
                    <a
                      href={directory}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 text-lg font-medium flex items-center space-x-2 hover:text-indigo-700"
                    >
                      <span>{directory}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeMenu === "image-details" && (
            <div className="p-8 bg-white rounded-lg">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full table-auto border-collapse text-sm">
                  <thead className="bg-gray-200 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-2 border-b text-left font-semibold">
                        Preview
                      </th>
                      <th className="px-4 py-2 border-b text-left font-semibold">
                        Alt Text
                      </th>
                      <th className="px-4 py-2 border-b text-left font-semibold">
                        Width (px)
                      </th>
                      <th className="px-4 py-2 border-b text-left font-semibold">
                        Height (px)
                      </th>
                      <th className="px-4 py-2 border-b text-left font-semibold">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.result.uniqueImages.map((image, index) => (
                      <tr
                        key={index}
                        className="hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer border-b"
                        onClick={() => handleImageClick(image)}
                      >
                        {/* Image preview */}
                        <td className="px-4 py-2">
                          <img
                            src={image.url}
                            alt={image.altText || "No Alt Text"}
                            className="w-14 h-14 object-contain rounded-md border border-gray-300 shadow-sm"
                          />
                        </td>
                        {/* Alt Text */}
                        <td className="px-4 py-2 text-gray-800">
                          {image.altText || (
                            <span className="text-gray-500">No Alt Text</span>
                          )}
                        </td>
                        {/* Width */}
                        <td className="px-4 py-2 text-gray-800">
                          {image.width || "Unknown"}
                        </td>
                        {/* Height */}
                        <td className="px-4 py-2 text-gray-800">
                          {image.height || "Unknown"}
                        </td>
                        {/* Size */}
                        <td className="px-4 py-2 text-gray-800">
                          {image.sizeInKB
                            ? `${image.sizeInKB} KB (${image.sizeInMB} MB)`
                            : "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ResultPage;
