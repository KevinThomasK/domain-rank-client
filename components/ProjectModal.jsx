import { useState } from "react";
import { Button } from "./ui/button";

const ProjectModal = ({ isOpen, onClose, projects, onAssign }) => {
  const [selectedProjects, setSelectedProjects] = useState([]);

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };

  const handleAssign = () => {
    onAssign(selectedProjects);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-auto bg-black bg-opacity-40 flex justify-center items-center ">
      <div className="bg-white p-6 border border-gray-300 rounded-lg shadow-lg w-full mx-auto text-center max-w-[600px]">
        <h2 className="text-2xl font-semibold mb-4">Select Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.id} className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => toggleProjectSelection(project.id)}
                />
                {project.name}
              </label>
            </li>
          ))}
        </ul>
        <div className="flex">
          <Button
            onClick={handleAssign}
            className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600 focus:outline-none mr-6"
          >
            Save Projects
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 mt-4 rounded hover:bg-gray-600 focus:outline-none"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
