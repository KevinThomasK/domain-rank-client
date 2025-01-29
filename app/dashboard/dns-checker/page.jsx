"use client";
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DnsChecker = () => {
  const [domainUrl, setDomainUrl] = useState("");
  const [dnsInfo, setDnsInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckDns = async () => {
    setIsLoading(true);
    setDnsInfo(null);
    setError("");

    try {
      // Make API request to your backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dns-check`,
        { url: domainUrl }
      );

      // Assuming the response contains DNS information
      if (response.data && response.data.dns) {
        setDnsInfo(response.data.dns); // Adjust based on the actual response structure
      } else {
        setError("DNS information not found.");
      }
    } catch (err) {
      setError("Failed to fetch DNS information. Please try again.");
      console.error("Error checking DNS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">DNS Checker</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div>
              <label
                htmlFor="url"
                className="block text-md font-medium text-gray-700"
              >
                Enter Website URL
              </label>
              <Input
                type="text"
                id="url"
                value={domainUrl}
                onChange={(e) => setDomainUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., https://example.com"
                required
              />
            </div>

            <Button
              type="button"
              onClick={handleCheckDns}
              disabled={isLoading}
              className="w-full max-w-60 py-2 px-4 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300"
            >
              {isLoading ? "Checking..." : "Check DNS"}
            </Button>
          </form>

          {/* Show DNS Results */}
          {dnsInfo && (
            <div className="mt-6 p-6 bg-green-100 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-6">
                DNS Information:
              </h2>
              <div className="space-y-6">
                {/* A Records */}
                {dnsInfo.A && dnsInfo.A.length > 0 && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      A Records:
                    </h3>
                    {dnsInfo.A.map((record, index) => (
                      <div key={index} className="mt-2">
                        <p className="text-base text-gray-700">
                          <span className="font-bold">IP Address:</span>{" "}
                          {record}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* AAAA Records */}
                {dnsInfo.AAAA && dnsInfo.AAAA.length > 0 && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      AAAA Records:
                    </h3>
                    {dnsInfo.AAAA.map((record, index) => (
                      <div key={index} className="mt-2">
                        <p className="text-base text-gray-700">
                          <span className="font-bold">IP Address:</span>{" "}
                          {record}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* MX Records */}
                {dnsInfo.MX && dnsInfo.MX.length > 0 && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      MX Records:
                    </h3>
                    {dnsInfo.MX.map((record, index) => (
                      <div key={index} className="mt-2">
                        <p className="text-base text-gray-700">
                          <span className="font-bold">Priority:</span>{" "}
                          {record.priority}
                        </p>
                        <p className="text-base text-gray-700">
                          <span className="font-bold">Exchange:</span>{" "}
                          {record.exchange}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TXT Records */}
                {dnsInfo.TXT && dnsInfo.TXT.length > 0 && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      TXT Records:
                    </h3>
                    {dnsInfo.TXT.map((record, index) => (
                      <div key={index} className="mt-2">
                        <p className="text-base text-gray-700">
                          <span className="font-bold">Value:</span> {record}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* NS Records */}
                {dnsInfo.NS && dnsInfo.NS.length > 0 && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      NS Records:
                    </h3>
                    {dnsInfo.NS.map((record, index) => (
                      <div key={index} className="mt-2">
                        <p className="text-base text-gray-700">
                          <span className="font-bold">Nameserver:</span>{" "}
                          {record}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* SOA Records */}
                {dnsInfo.SOA && (
                  <div className="p-4 bg-white rounded-md shadow-md">
                    <h3 className="text-base font-semibold text-gray-800">
                      SOA Record:
                    </h3>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Primary NS:</span>{" "}
                      {dnsInfo.SOA.nsname}
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Hostmaster:</span>{" "}
                      {dnsInfo.SOA.hostmaster}
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Serial:</span>{" "}
                      {dnsInfo.SOA.serial}
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Refresh:</span>{" "}
                      {dnsInfo.SOA.refresh} seconds
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Retry:</span>{" "}
                      {dnsInfo.SOA.retry} seconds
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Expire:</span>{" "}
                      {dnsInfo.SOA.expire} seconds
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-bold">Minimum TTL:</span>{" "}
                      {dnsInfo.SOA.minttl} seconds
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Handling */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 rounded-lg">
              <h2 className="text-lg font-semibold text-red-800">Error:</h2>
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DnsChecker;
