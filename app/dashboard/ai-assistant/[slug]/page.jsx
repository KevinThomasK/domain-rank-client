"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const MetaGenerator = () => {
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [metaTitles, setMetaTitles] = useState([]);
  const [metaDescriptions, setMetaDescriptions] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("metaDataGenerator");
  const tabs = [
    { id: "metaDataGenerator", label: "Meta Data Generator" },
    { id: "contentCreator", label: "Content Creator" },
    { id: "history", label: "History" },
  ];
  const [heading, setHeading] = useState("");
  const [hints, setHints] = useState("");
  const [contentWordCount, setContentWordCount] = useState(100);
  const [toneBias, setToneBias] = useState("neutral");
  const [creativityLevel, setCreativityLevel] = useState(50);
  const [outputContent, setOutputContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const params = useParams();
  const slug = params.slug;
  const { data: session, status } = useSession();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentToDelete, setContentToDelete] = useState(null);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generated-contents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        setContents(response.data);
      } catch (error) {
        console.error("Error fetching contents:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.token) {
      fetchContents();
    }
  }, [session]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generated-contents/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );

      // Refresh the contents list after deletion
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generated-contents`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );
      setContents(response.data);
    } catch (error) {
      console.error("Error deleting content:", error);
    } finally {
      setContentToDelete(null); // Close the confirmation modal
    }
  };

  const truncateContent = (content, maxLength = 50) => {
    return content.length > maxLength
      ? `${content.substring(0, maxLength)}...`
      : content;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setOutputContent("");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-content`,
        {
          subject: heading,
          context: hints,
          wordCount: contentWordCount,
          bias: toneBias,
          creativity:
            creativityLevel <= 30
              ? "factual"
              : creativityLevel >= 70
              ? "creative"
              : "balanced",
          projectId: slug, // Pass the slug as projectId
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`, // Add the Authorization header
          },
        }
      );
      setOutputContent(response.data.content);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMetaTitles([]);
    setMetaDescriptions([]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-meta`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, context }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate meta data. Please try again.");
      }

      const data = await response.json();
      setMetaTitles(data.metaTitles || []);
      setMetaDescriptions(data.metaDescriptions || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Content copied to clipboard!", {
        theme: "colored",
      });
    } catch (error) {
      console.error("Failed to copy content:", error);
      toast("Failed to copy content!", {
        theme: "colored",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-10">
        AI Assistant Dashboard
      </h1>
      <div className="flex justify-between">
        <div className="w-1/6 pr-4 ">
          <div className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2 font-medium rounded-lg shadow-md ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab === "metaDataGenerator" && (
          <div className="w-5/6 mx-auto py-10 bg-white shadow rounded-lg p-10 ">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Meta Data Generator
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className=" p-6 space-y-4 ">
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject/Heading
                </label>
                <Input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Enter your subject or heading"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="context"
                  className="block text-sm font-medium text-gray-700"
                >
                  Context/Hints
                </label>
                <Textarea
                  id="context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  required
                  placeholder="Provide context or hints for better generation"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-60 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300"
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>

            {/* Results Section */}
            <div className="mt-8">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 shadow-md">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {metaTitles.length > 0 && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                    🎯 Generated Meta Titles
                  </h2>
                  <ul className="space-y-3">
                    {metaTitles.map((title, index) => (
                      <li
                        key={index}
                        className="text-gray-700 bg-gray-50 rounded-md px-4 py-2 hover:bg-gray-100 transition"
                      >
                        {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {metaDescriptions.length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                    📝 Generated Meta Descriptions
                  </h2>
                  <ul className="space-y-3">
                    {metaDescriptions.map((description, index) => (
                      <li
                        key={index}
                        className="text-gray-700 bg-gray-50 rounded-md px-4 py-2 hover:bg-gray-100 transition"
                      >
                        {index + 1}. {description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "contentCreator" && (
          <div className="w-5/6 mx-auto py-10 bg-white shadow rounded-lg p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Content Creator
            </h1>

            {/* Form */}
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="heading"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject/Heading
                </label>
                <Input
                  type="text"
                  id="heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  required
                  placeholder="Enter your subject or heading"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="hints"
                  className="block text-sm font-medium text-gray-700"
                >
                  Context/Hints
                </label>
                <Textarea
                  id="hints"
                  value={hints}
                  onChange={(e) => setHints(e.target.value)}
                  required
                  placeholder="Provide context or hints for better generation"
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></Textarea>
              </div>

              <div>
                <label
                  htmlFor="wordCount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Word Count
                </label>
                <Input
                  type="number"
                  id="wordCount"
                  value={contentWordCount}
                  min={50}
                  max={1000}
                  onChange={(e) => setContentWordCount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="toneBias"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bias
                </label>
                <select
                  id="toneBias"
                  value={toneBias}
                  onChange={(e) => setToneBias(e.target.value)}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="neutral">Neutral</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="creativity"
                  className="block text-sm font-medium text-gray-700 mb-5"
                >
                  Creativity
                </label>
                <input
                  type="range"
                  id="creativity"
                  value={creativityLevel}
                  min="0"
                  max="100"
                  onChange={(e) => setCreativityLevel(Number(e.target.value))}
                  className="mt-1 w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>Factual</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full mt-12 max-w-60 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>

            {/* Results Section */}
            <div className="mt-8">
              {outputContent && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                    ✨ Generated Content
                  </h2>
                  <p className="text-gray-700">{outputContent}</p>
                  <button
                    onClick={() => copyToClipboard(outputContent)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Copy Content
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="w-5/6 mx-auto py-10 bg-white shadow rounded-lg p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Generated Contents
            </h1>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Subject</th>
                  <th className="py-2 px-4 border-b">Context</th>
                  <th className="py-2 px-4 border-b">Word Count</th>
                  <th className="py-2 px-4 border-b">Bias</th>
                  <th className="py-2 px-4 border-b">Creativity</th>
                  <th className="py-2 px-4 border-b">Generated Content</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content.id}>
                    <td className="py-2 px-4 border-b">{content.subject}</td>
                    <td className="py-2 px-4 border-b">{content.context}</td>
                    <td className="py-2 px-4 border-b">{content.word_count}</td>
                    <td className="py-2 px-4 border-b">{content.bias}</td>
                    <td className="py-2 px-4 border-b">{content.creativity}</td>
                    <td className="py-2 px-4 border-b">
                      {truncateContent(content.generated_content)}
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="text-blue-500 hover:text-blue-700 ml-2"
                      >
                        Show Full Content
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {content.created_by == session?.user.id && (
                        <Button
                          onClick={() => setContentToDelete(content.id)} // Open confirmation modal
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal for Full Content */}
            {selectedContent && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
                <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl">
                  <h2 className="text-xl font-bold mb-4">
                    Full Generated Content
                  </h2>
                  <p className="whitespace-pre-wrap">
                    {selectedContent.generated_content}
                  </p>
                  <Button
                    onClick={() =>
                      copyToClipboard(selectedContent.generated_content)
                    }
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Copy Content
                  </Button>
                  <Button
                    onClick={() => setSelectedContent(null)}
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 ml-2"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {contentToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
            <div className="bg-white px-10 py-8 rounded-lg w-11/12 max-w-lg">
              <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
              <p className="mb-4">
                Are you sure you want to delete this content?
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => setContentToDelete(null)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(contentToDelete)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaGenerator;
