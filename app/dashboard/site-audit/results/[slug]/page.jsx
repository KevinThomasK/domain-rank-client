"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const ResultPage = () => {
  const { slug } = useParams();
  const [job, setJob] = useState(null);
  const [activeMenu, setActiveMenu] = useState("uniqueLinks");
  const [directories, setDirectories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 max-w-[350px] bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Menu</h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveMenu("uniqueLinks")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "uniqueLinks"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Pages
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveMenu("uniqueImages")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "uniqueImages"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Images
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveMenu("pages")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "pages"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Meta Datas
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveMenu("errors")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "errors"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Broken Links
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveMenu("directories")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "directories"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Directories
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveMenu("image-details")}
              className={`block w-full text-left px-4 py-2 rounded ${
                activeMenu === "image-details"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Image Details
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto ml-4">
        <div className="sticky top-0 bg-white z-10 border-b-2 border-gray-300 pb-2 mb-6 ">
          <h1 className="font-semibold text-gray-900 p-6">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 text-3xl hover:text-indigo-800 transition-colors duration-300"
            >
              {job.url}
            </a>
          </h1>
        </div>

        {activeMenu === "uniqueLinks" && (
          <div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <ol className="list-decimal pl-6 space-y-3">
                {job.result.uniqueLinks?.map((link, index) => (
                  <li
                    key={index}
                    className="text-blue-700 hover:text-blue-900 transition-colors duration-300"
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeMenu === "uniqueImages" && (
          <div>
            <h2 className="text-xl font-bold mb-4"> Images</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                className="w-full h-auto rounded-md  max-h-[500px] object-contain"
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
            <h2 className="text-xl font-bold mb-4">Meta Datas</h2>
            <ul className="space-y-4">
              {job.result.pages?.map((page, index) => (
                <li
                  key={index}
                  className="p-5 bg-gray-50 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <strong className="text-2xl font-semibold text-gray-900">
                    {page.title}
                    <span className="text-sm text-gray-500 ml-2">
                      ({(page.title || "").length} characters)
                    </span>
                  </strong>
                  <a
                    href={page.url}
                    target="blank"
                    className="text-lg font-semibold text-blue-600 truncate block"
                  >
                    {page.url}
                  </a>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-800">
                      Meta Description{" "}
                      <span className="text-sm text-gray-500">
                        {`(${
                          (
                            page.metaTags?.description ||
                            page.metaTags?.Description ||
                            ""
                          ).length
                        } characters)`}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      {page.metaTags?.description ||
                        page.metaTags?.Description || (
                          <span className="text-gray-500">
                            No description available
                          </span>
                        )}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-gray-800">
                      Meta Keywords{" "}
                      <span className="text-sm text-gray-500">
                        {`(${
                          (
                            page.metaTags?.keywords ||
                            page.metaTags?.Keywords ||
                            ""
                          ).length
                        } characters)`}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      {page.metaTags?.keywords || page.metaTags?.Keywords || (
                        <span className="text-gray-500">
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
          <div>
            <h2 className="text-xl font-bold mb-4">Broken Links</h2>
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
                          {index + 1} {/* Display row number starting from 1 */}
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
                            <span className="text-gray-400">No Parent URL</span>
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
          <>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Directories
            </h2>
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
          </>
        )}
        {activeMenu === "image-details" && (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Image Details
            </h2>
            <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 border-b text-left text-gray-700 font-bold">
                    Preview
                  </th>
                  <th className="px-2 py-1 border-b text-left text-gray-700 font-bold">
                    Alt Text
                  </th>
                  <th className="px-2 py-1 border-b text-left text-gray-700 font-bold">
                    Width (px)
                  </th>
                  <th className="px-2 py-1 border-b text-left text-gray-700 font-bold">
                    Height (px)
                  </th>
                  <th className="px-2 py-1 border-b text-left text-gray-700 font-bold">
                    Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {job.result.uniqueImages.map((image, index) => (
                  <tr
                    key={index}
                    className="hover:bg-indigo-50 transition duration-300 ease-in-out cursor-pointer"
                    onClick={() => setSelectedImage(image)} // Open modal on row click
                  >
                    {/* Image preview */}
                    <td className="px-2 py-1 border-b">
                      <img
                        src={image.url}
                        alt={image.altText || "No Alt Text"}
                        className="w-12 h-12 object-contain rounded-md border border-gray-200"
                      />
                    </td>
                    {/* Alt Text */}
                    <td className="px-2 py-1 border-b text-gray-800">
                      {image.altText || (
                        <span className="text-gray-500">No Alt Text</span>
                      )}
                    </td>
                    {/* Width */}
                    <td className="px-2 py-1 border-b text-gray-800">
                      {image.width || "Unknown"}
                    </td>
                    {/* Height */}
                    <td className="px-2 py-1 border-b text-gray-800">
                      {image.height || "Unknown"}
                    </td>
                    {/* Size */}
                    <td className="px-2 py-1 border-b text-gray-800">
                      {image.sizeInKB
                        ? `${image.sizeInKB} KB (${image.sizeInMB} MB)`
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
                    className="w-full h-auto rounded-md  max-h-[500px] object-contain"
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
          </>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
