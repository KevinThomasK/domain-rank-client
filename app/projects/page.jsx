"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sidebar } from "./sidebar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function ProjectsPage() {
  const { data: session, status } = useSession(); // Get session data (including token)
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Track if editing or adding a project

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

  const saveNewProject = async () => {
    if (!session?.user?.token) {
      alert("You are not logged in.");
      return;
    }

    const newProject = {
      name: newProjectName,
      domain_name: newProjectUrl,
      description: newProjectDescription,
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

      const result = await response.json();

      if (response.ok) {
        setProjects([result.project, ...projects]);
        setIsSidebarOpen(false);
        setNewProjectName("");
        setNewProjectUrl("");
        setNewProjectDescription("");
      } else {
        alert(`Error: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("There was an error creating the project.");
    }
  };

  const handleSaveEditedProject = async () => {
    if (!session?.user?.token) {
      alert("You are not logged in.");
      return;
    }

    const updatedProject = {
      name: newProjectName,
      domain_name: newProjectUrl,
      description: newProjectDescription,
      updated_by: session.user.id, // Add updated_by to pass the user ID
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${selectedProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
          body: JSON.stringify(updatedProject),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setProjects(
          projects.map((project) =>
            project.id === selectedProject.id
              ? { ...project, ...updatedProject }
              : project
          )
        );
        setIsSidebarOpen(false);
        setNewProjectName("");
        setNewProjectUrl("");
        setNewProjectDescription("");
      } else {
        alert(`Error: ${result.error || result.message}`);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("There was an error updating the project.");
    }
  };

  const handleEditProject = (projectId) => {
    console.log(projectId);
    const projectToEdit = projects.find((project) => project.id === projectId);
    setIsEditing(true); // Set to true for editing mode
    setIsSidebarOpen(true);
    setSelectedProject(projectToEdit);
    setNewProjectName(projectToEdit.name);
    setNewProjectUrl(projectToEdit.domain_name);
    setNewProjectDescription(projectToEdit.description || "");
  };

  const handleDeleteProject = async (projectId) => {
    console.log("Delete project ID:", projectId);
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects/${projectId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.user.token}`,
            },
          }
        );

        if (response.ok) {
          setProjects(projects.filter((project) => project.id !== projectId));
        } else {
          alert("Failed to delete the project.");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(filterTerm.toLowerCase())
  );

  const dropdownFilteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const handleProjectClick = (slug) => {
    router.push(`/projects/${slug}`);
  };

  if (status === "loading") {
    return (
      <div class="flex items-center justify-center h-screen">
        <div class="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view projects.</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 p-5 bg-gray-50">
        <header className="flex justify-between items-center mb-5">
          <div className="flex gap-2 items-center">
            <Select
              onValueChange={(value) => setSelectedProject(value)}
              value={selectedProject}
            >
              <SelectTrigger className="w-[500px] h-[50px] text-lg bg-white">
                <SelectValue>
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
                  <SelectItem key={index} value={project.name}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Search projects..."
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="w-[500px] h-[50px] text-lg bg-white"
            />
          </div>

          <Button onClick={addNewProject} className="ml-2">
            <FaPlus className="mr-1" /> Add New Project
          </Button>
        </header>

        <div className="grid gap-5">
          {filteredProjects.map((project, index) => (
            <Card
              key={index}
              className="cursor-pointer"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Description of {project.name}</p>
                <p>{project.domain_name}</p>
              </CardContent>
              <CardContent className="flex justify-end gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project.id);
                  }}
                  variant="outline"
                >
                  <FaEdit className="mr-1" /> Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  variant="outline"
                >
                  <FaTrash className="mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <div
        className={`fixed top-0 right-0 bottom-0 w-[700px] bg-white shadow-lg p-5 flex flex-col gap-4 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300`}
      >
        <h2 className="text-xl mb-4">
          {isEditing ? "Edit Project" : "Add New Project"}
        </h2>

        <div>
          <label className="block font-bold">Project Name</label>
          <Input
            type="text"
            placeholder="Enter project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="mb-2 mt-2 w-full h-[50px] text-lg"
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
          <Button
            onClick={isEditing ? handleSaveEditedProject : saveNewProject}
          >
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
          <Button onClick={() => setIsSidebarOpen(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
