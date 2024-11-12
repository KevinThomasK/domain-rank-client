"use client";

import Link from "next/link";
import { VscGithubProject } from "react-icons/vsc";
import { LuUsers } from "react-icons/lu";

export function Sidebar() {
  return (
    <div className="w-64 h-screen p-5 border-r border-gray-300 bg-gray-50">
      <nav>
        <ul className="list-none mt-4">
          <li className="my-2">
            <Link
              href="/projects"
              className="flex items-center text-lg transition-colors duration-300 hover:text-blue-500 mb-5"
            >
              <VscGithubProject className="mr-1" />
              Projects
            </Link>
          </li>
          <li className="my-2">
            <Link
              href="/user/add"
              className="flex items-center text-lg transition-colors duration-300 hover:text-blue-500"
            >
              <LuUsers className="mr-1" />
              Users
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
