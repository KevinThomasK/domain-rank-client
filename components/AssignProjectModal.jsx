const AssignProjectModal = ({
  isOpen,
  onClose,
  onAssign,
  projects,
  selectedUser,
  selectedProject,
  setSelectedProject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-3xl">
        <h2 className="text-lg font-semibold mb-10">
          Assign Project to {selectedUser?.name}
        </h2>

        <div className="mb-4">
          <label className="block font-medium mb-2">Select Project</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">-- Select a Project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={onAssign}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignProjectModal;
