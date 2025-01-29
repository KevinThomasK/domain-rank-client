"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useState } from "react";

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
  ];
  const [heading, setHeading] = useState(""); // Previously 'subject'
  const [hints, setHints] = useState(""); // Previously 'context'
  const [contentWordCount, setContentWordCount] = useState(100); // Previously 'wordCount'
  const [toneBias, setToneBias] = useState("neutral"); // Previously 'bias'
  const [creativityLevel, setCreativityLevel] = useState(50); // Previously 'creativity'
  const [outputContent, setOutputContent] = useState(""); // Previously 'generatedContent'
  const [isGenerating, setIsGenerating] = useState(false); // Previously 'loading'

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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaGenerator;
