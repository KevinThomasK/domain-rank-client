"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { DatePickerDemo } from "@/components/ui/date-picker";
import ProjectLayout from "@/components/ProjectLayout";
import Link from "next/link";

const RankingHistory = () => {
  const { keyword } = useParams();
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("Google");
  const [rankingHistory, setRankingHistory] = useState([
    { searchDate: "12-01-2024", rank: 4 },
    { searchDate: "10-02-2024", rank: 3 },
    { searchDate: "14-03-2024", rank: 5 },
    { searchDate: "05-04-2024", rank: 6 },
  ]);

  return (
    <ProjectLayout>
      <div className="p-6 w-full">
        <Link href="/projects" className="text-2xl underline">
          Project Name
        </Link>
        <div className="flex flex-col mt-6 mb-8 sm:flex-row justify-between items-center">
          <h1 className="text-3xl ">Ranking History: keyword name</h1>
          <p className="text-lg">Search Engine: {selectedSearchEngine}</p>
        </div>

        <div className="flex gap-4 mt-5">
          <div>
            <label className="block text-lg">From Date</label>
            <DatePickerDemo />
          </div>
          <div>
            <label className="block text-lg">To Date</label>
            <DatePickerDemo />
          </div>
        </div>

        <div className="mt-6">
          <table className="min-w-[600px] table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Search Date</th>
                <th className="px-4 py-2 border">Rank</th>
              </tr>
            </thead>
            <tbody>
              {rankingHistory.map((entry, index) => (
                <tr key={index} className="odd:bg-gray-100 text-center">
                  <td className="px-4 py-2 border">{entry.searchDate}</td>
                  <td className="px-4 py-2 border">{entry.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProjectLayout>
  );
};

export default RankingHistory;
