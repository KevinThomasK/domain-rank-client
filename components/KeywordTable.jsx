"use client";
import React from "react";

const KeywordTable = ({ data }) => {
  // Extract unique websites and keywords
  const uniqueWebsites = [
    ...new Map(data.map((item) => [item.website_id, item.website])).values(),
  ];
  const keywords = [
    ...new Map(data.map((item) => [item.keyword_id, item.keyword])).values(),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left bg-gray-100">
              Keywords
            </th>
            {uniqueWebsites.map((website, idx) => (
              <th
                key={idx}
                className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
                style={{
                  writingMode: "vertical-lr",
                  transform: "rotate(180deg)",
                  textOrientation: "mixed",
                }}
              >
                {website}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keywords.map((keyword, rowIdx) => (
            <tr key={rowIdx} className="even:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{keyword}</td>
              {uniqueWebsites.map((website, colIdx) => {
                // Find the rank corresponding to the keyword and website
                const rank =
                  data.find(
                    (item) =>
                      item.keyword === keyword && item.website === website
                  )?.latest_manual_check_rank || "No Record Found";

                return (
                  <td
                    key={colIdx}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    {rank}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KeywordTable;
