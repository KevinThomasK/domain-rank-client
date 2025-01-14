"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FaLongArrowAltUp, FaLongArrowAltDown } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import DatePicker from "react-datepicker"; // Install with `npm install react-datepicker`
import "react-datepicker/dist/react-datepicker.css";
import { IoFilter } from "react-icons/io5";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PageDetails({ params }) {
  const searchParams = useSearchParams();
  //const { path } = params;
  const [propertyId, setPropertyId] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [details, setDetails] = useState(null);
  const [totalPercentageChange, setTotalPercentageChange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState(null);

  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ); // 7 days ago
  const [endDate, setEndDate] = useState(new Date()); // Today

  useEffect(() => {
    async function unwrapParams() {
      const unwrappedParams = await params;
      setPath(unwrappedParams.path);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
    if (propertyId) {
      setPropertyId(propertyId);
    }
  }, [searchParams]);

  const fetchDetails = async () => {
    if (!propertyId || !path) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/page-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            pagePath: decodeURIComponent(path),
            startDate: startDate.toISOString().split("T")[0], // Format to YYYY-MM-DD
            endDate: endDate.toISOString().split("T")[0],
            comparisonStartDate: new Date(
              startDate.setDate(startDate.getDate() - 7)
            ) // 7 days before startDate
              .toISOString()
              .split("T")[0],
          }),
        }
      );

      const data = await response.json();
      setDetails(data.details);
      setChannelData(data.channelDetails);
      setTotalPercentageChange(data.totalPercentageChange);

      // Fetch traffic data by date
      const trafficDataResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/traffic-by-date`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            pagePath: decodeURIComponent(path),
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
          }),
        }
      );

      const traffData = await trafficDataResponse.json();
      setTrafficData(traffData.dailyTraffic);
    } catch (error) {
      console.error("Error fetching page details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [propertyId, path]);

  const chartData = {
    labels: trafficData.map((item) => {
      const date = item.date; // Format: YYYYMMDD
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return `${day}/${month}/${year}`;
    }),
    datasets: [
      {
        label: "Active Users",
        data: trafficData.map((item) => item.activeUsers),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "New Users",
        data: trafficData.map((item) => item.newUsers),
        borderColor: "green",
        fill: false,
      },
    ],
  };

  console.log(trafficData, "traffic data");

  if (loading)
    return (
      <>
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-4" />
      </>
    );

  if (!details || !channelData)
    return <p>No details available for this page.</p>;

  return (
    <>
      {" "}
      <h2 className="text-2xl font-bold mb-4">
        Page: {decodeURIComponent(path)}
      </h2>
      <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50 rounded-lg shadow ">
        {/* Start Date */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            Start Date:
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd-MM-yyyy"
            className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">
            End Date:
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd-MM-yyyy"
            className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Apply Button */}
        <div className="flex justify-center mt-4 md:mt-0">
          <Button
            onClick={fetchDetails}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition mt-6"
          >
            <IoFilter />
            Apply
          </Button>
        </div>
      </div>
      <div className="p-6 bg-white shadow rounded-lg grid-cols-2 grid gap-8">
        <table className="table-auto w-full border border-gray-400 ">
          <thead className="bg-gray-100">
            <tr className="border-b border-gray-400">
              <th className="px-6 py-2 text-left font-semibold">Country</th>
              <th className="px-6 py-2 text-left font-semibold flex items-center">
                Active Users
                {totalPercentageChange && (
                  <span
                    className={`ml-2 flex items-center ${
                      totalPercentageChange > 0
                        ? "text-green-500"
                        : totalPercentageChange < 0
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {totalPercentageChange > 0 ? (
                      <FaLongArrowAltUp className="mr-1" />
                    ) : totalPercentageChange < 0 ? (
                      <FaLongArrowAltDown className="mr-1" />
                    ) : null}
                    {Math.abs(totalPercentageChange)}%
                  </span>
                )}
              </th>
              <th className="px-6 py-2 text-left font-semibold">New Users</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <td className="px-6 py-4">{detail.country}</td>
                <td className="px-6 py-4 flex items-center">
                  <span className="mr-6">{detail.activeUsers}</span>
                  {detail.percentageChange !== "N/A" && (
                    <span
                      className={`flex items-center ml-2 ${
                        detail.percentageChange > 0
                          ? "text-green-500"
                          : detail.percentageChange < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {detail.percentageChange > 0 ? (
                        <FaLongArrowAltUp className="mr-1" />
                      ) : detail.percentageChange < 0 ? (
                        <FaLongArrowAltDown className="mr-1" />
                      ) : null}
                      {Math.abs(detail.percentageChange)}%
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{detail.newUsers}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Channel-based analytics table */}

        {channelData && (
          <div>
            <table className="table-auto w-full border border-gray-400">
              <thead className="bg-gray-100">
                <tr className="border border-gray-400">
                  <th className="px-6 py-2 text-left font-semibold ">
                    Channel
                  </th>
                  <th className="px-6 py-2 text-left font-semibold flex items-center ">
                    Active Users
                  </th>
                  <th className="px-6 py-2 text-left font-semibold ">
                    New Users
                  </th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((channel, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } `}
                  >
                    <td className="px-6 py-4 ">{channel.channel}</td>
                    <td className="px-6 py-4 flex items-center ">
                      <span className="mr-6">{channel.activeUsers}</span>
                      <span
                        className={`flex items-center ml-2 ${
                          channel.percentageChange > 0
                            ? "text-green-500"
                            : channel.percentageChange < 0
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {channel.percentageChange > 0 ? (
                          <FaLongArrowAltUp className="mr-1" />
                        ) : channel.percentageChange < 0 ? (
                          <FaLongArrowAltDown className="mr-1" />
                        ) : null}
                        {Math.abs(channel.percentageChange)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 ">{channel.newUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Line data={chartData} />
      </div>
    </>
  );
}
