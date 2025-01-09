"use client";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaPlus, FaSearch, FaChartBar } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CgWebsite } from "react-icons/cg";
import { TbWorldSearch } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import { FaSquareGooglePlus } from "react-icons/fa6";
import { FaGooglePlusG } from "react-icons/fa";

export default function DashboardPage({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession(); // Get session data (including token)
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Track if editing or adding a project

  useEffect(() => {
    // Reset selected project when the user navigates back to the dashboard
    if (pathname === "/dashboard") {
      setSelectedProject(null);
    }
  }, [pathname]);

  useEffect(() => {
    // Fetch projects only if session is available
    if (status === "authenticated" && session?.user?.token) {
      fetchProjects();
    }
  }, [session, status]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const sortedProjects = data.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
        setProjects(sortedProjects); // Set the sorted projects
      } else {
        alert("Failed to fetch projects.");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addNewProject = () => {
    setIsSidebarOpen(true);
    setIsEditing(false); // Set to false for new project creation
    setNewProjectName("");
    setNewProjectUrl("");
    setNewProjectDescription("");
  };

  const saveNewProject = async (e) => {
    e.preventDefault();

    if (!newProjectName) {
      toast.error("Project Name is required");
      return;
    }

    if (!session?.user?.token) {
      toast.error("You are not logged in.");
      return;
    }

    const newProject = {
      name: newProjectName.trim(),
      domain_name: newProjectUrl.trim() || null,
      description: newProjectDescription.trim() || null,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
          body: JSON.stringify(newProject),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setProjects([result.project, ...projects]);
        setIsSidebarOpen(false);
        setNewProjectName("");
        setNewProjectUrl("");
        setNewProjectDescription("");
        toast.success("Project added successfully");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Something went wrong");
        console.log(errorData, "err data");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("There was an error creating the project.");
    }
  };

  const dropdownFilteredProjects = projects.filter(
    (project) =>
      project.name &&
      project.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  // Load selectedProject from local storage on mount
  useEffect(() => {
    const storedProject = localStorage.getItem("selectedProject");
    if (storedProject) {
      setSelectedProject(JSON.parse(storedProject)); // Parse stored string back to object
    }
  }, []);

  // Save selectedProject to local storage whenever it changes
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem("selectedProject", JSON.stringify(selectedProject));
    }
  }, [selectedProject]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view projects.</div>;
  }

  return (
    <>
      <header className="flex justify-between items-center pb-6 pt-6 pr-10 pl-10 bg-gray-100 sticky top-0 border border-b-slate-300 bg-white z-10">
        {/* Left: SEO AUDITOR Heading */}
        <Link
          href="/dashboard"
          className="text-3xl font-bold flex-1 text-gray-700"
        >
          SEO-AUDITOR
        </Link>

        {/* Center: Select and Add New Project Button */}
        <div className="flex flex-1 justify-center items-center gap-2">
          <Select
            onValueChange={(value) => {
              const selected = dropdownFilteredProjects.find(
                (project) => project.name === value
              );
              if (selected) {
                setSelectedProject(selected); // Update the selected project
                router.push(`/dashboard/${selected.id}`); // Redirect to the selected project's page
              }
            }}
            value={selectedProject?.name || ""}
          >
            <SelectTrigger className="w-[500px] h-12 text-lg bg-white">
              <SelectValue placeholder="Select a project">
                {selectedProject ? selectedProject.name : "Select a project"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  className="mb-2 w-full h-[50px] text-lg bg-white"
                />
              </div>
              {dropdownFilteredProjects.map((project, index) => (
                <SelectItem
                  key={index}
                  value={project.name || `placeholder-${index}`} // Fallback value
                  className="cursor-pointer"
                >
                  {project.name || "Unnamed Project"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsSidebarOpen(true)} // Open Sidebar
            className="ml-2 h-10"
          >
            <FaPlus className="mr-1" /> Add New Project
          </Button>
        </div>

        {/* Right: User Avatar */}
        <div className="flex flex-1 justify-end items-center gap-4">
          <span className="text-md text-gray-700 capitalize">
            {session?.user?.name}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-12 w-12">
                <AvatarImage src="/profile-pic.jpg" alt="Profile" />
                <AvatarFallback className="bg-black text-white">
                  {session?.user?.name?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Logout
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar (New Project Form) */}
        <div
          className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300`}
        >
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h2>

          {/* Project Form Fields */}
          <div>
            <label className="block font-bold">Project Name</label>
            <Input
              type="text"
              placeholder="Enter project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="mb-2 mt-2 w-full h-[50px] text-lg"
              required
            />
          </div>

          <div>
            <label className="block font-bold">Website Domain Name</label>
            <Input
              type="text"
              placeholder="Enter website domain"
              value={newProjectUrl}
              onChange={(e) => setNewProjectUrl(e.target.value)}
              className="mb-2 mt-2 w-full h-[50px] text-lg"
            />
          </div>

          <div>
            <label className="block font-bold">Project Description</label>
            <Textarea
              placeholder="Enter project description"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              rows={5}
              className="mb-2 mt-2 w-full text-lg"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveNewProject}>Create Project</Button>
            <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-96px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 border-r border-slate-300  flex flex-col p-10 sticky top-[96px]">
          <nav className="space-y-4">
            {selectedProject ? (
              <Link
                className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
                href={`/dashboard/website/${selectedProject.id}`}
              >
                <CgWebsite className="text-xl text-blue-600" /> Websites
              </Link>
            ) : (
              <span className="flex items-center gap-3 text-lg text-gray-400 cursor-not-allowed">
                <CgWebsite className="text-xl text-blue-600" /> Websites
              </span>
            )}
            {selectedProject ? (
              <Link
                className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
                href={`/dashboard/${selectedProject.id}`}
              >
                <TbWorldSearch className="text-xl text-blue-600" /> Keywords
              </Link>
            ) : (
              <span className="flex items-center gap-3 text-lg text-gray-400 cursor-not-allowed">
                <TbWorldSearch className="text-xl text-blue-600" /> Keywords
              </span>
            )}
            {selectedProject ? (
              <Link
                className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
                href={`/dashboard/site-audit/${selectedProject.id}`}
              >
                <FaChartBar className="text-xl text-blue-600" /> Site Audit
              </Link>
            ) : (
              <span className="flex items-center gap-3 text-lg text-gray-400 cursor-not-allowed">
                <FaChartBar className="text-xl text-blue-600" /> Site Audit
              </span>
            )}
            <Link
              className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
              href={`/dashboard/console`}
            >
              <FaSquareGooglePlus className="text-xl text-blue-600" /> Search
              Console
            </Link>

            <Link
              className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
              href={`/dashboard/analyticsconsole`}
            >
              <FaGooglePlusG className="text-xl text-blue-600" />
              Analytics
            </Link>
            <Link
              className="flex items-center gap-3 text-lg text-gray-700 hover:text-black"
              href={`/dashboard/user/create-user`}
            >
              <FaRegUser className="text-xl text-blue-600" /> Add User
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
