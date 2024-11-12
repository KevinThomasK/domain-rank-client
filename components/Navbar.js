// components/Navbar.js
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Import the Input component from Shadcn

export default function Navbar({
  selectedProject,
  setSelectedProject,
  addNewProject,
  dropdownSearch,
  setDropdownSearch,
  filterTerm,
  setFilterTerm,
}) {
  return (
    <div className="w-100% bg-white shadow-md z-50 p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          {/* Dropdown for project selection */}
          <Select
            onValueChange={(value) => setSelectedProject(value)}
            value={selectedProject}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue>{selectedProject || "Select a project"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              {/* Map through filtered projects for dropdown */}
              {dropdownSearch && dropdownSearch.length > 0 && (
                <SelectItem value={dropdownSearch}>
                  No projects found
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Search input for filtering */}
          <Input
            type="text"
            placeholder="Search projects..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="w-[400px]"
          />
        </div>

        {/* Add New Project Button */}
        <Button onClick={addNewProject} className="ml-2">
          Add New Project
        </Button>
      </div>
    </div>
  );
}
