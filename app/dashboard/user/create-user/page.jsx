"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { MdAssignmentAdd } from "react-icons/md";
import AssignProjectModal from "@/components/AssignProjectModal";

export default function UserManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "user",
    status: "active",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/get-all-users`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/projects`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        setProjects(data);
        console.log(data, "projects");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/add-auth-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`, // Ensure token is valid
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to create user");
      const responseData = await response.json();
      setMessage({ type: "success", text: "User created successfully!" });
      const newUser = responseData.user; // Extract the user object from the response
      console.log(newUser, "newUser");
      setUsers((prev) => [...prev, newUser]); // Append new user to state
      setFormData({ name: "", email: "", userType: "user", status: "active" }); // Reset form
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create user", // Use 'err' instead of 'errorData'
      });
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/edit-auth-user/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(currentUser),
        }
      );
      if (!response.ok) throw new Error("Failed to edit user");

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        )
      );
      setIsEditModalOpen(false);
      toast.success("User updated successfully!");
    } catch (err) {
      toast.error("Failed to edit user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-auth-user/${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((user) => user.id !== currentUser.id));
      setIsDeleteModalOpen(false);
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const openAssignModal = (user) => {
    setCurrentUser(user);
    setIsAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setCurrentUser(null);
    setSelectedProject("");
    setIsAssignModalOpen(false);
  };

  const assignProject = async () => {
    if (!currentUser || !selectedProject) {
      toast.info("Please select a project.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/assign-project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            project_id: selectedProject,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign project");
      const data = await response.json();
      toast.success("Project assigned successfully!");
      closeAssignModal();
    } catch (error) {
      console.error("Error assigning project:", error);
      toast.error(error.message);
    }
  };

  return (
    <main>
      <div className="max-w-9xl mx-auto mt-12 py-10 px-20 bg-white shadow-lg rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Create User
        </h1>
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="userType" // Fixed: Matches formData key
              value={formData.userType}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2"></div>
          <Button type="submit">Create User</Button>
        </form>
      </div>
      <div className="mt-10">
        <div className="mb-4 mt-4">
          <input
            type="text"
            placeholder="Search users..."
            className="w-[400px] border border-gray-300 rounded-md px-4 py-2 ml-auto flex"
          />
        </div>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="w-full border-collapse border p-6 bg-white rounded-lg">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Role</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border px-4 py-2">{user.name}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.user_type}</td>
                  <td className="border px-4 py-2">{user.status}</td>
                  <td className="border px-4 py-2">
                    <Button
                      className="mx-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-700 transform hover:scale-105 transition-transform duration-300 "
                      onClick={() => openAssignModal(user)}
                    >
                      <MdAssignmentAdd /> Project
                    </Button>

                    <button
                      className="text-blue-500 hover:underline mx-2"
                      onClick={() => openEditModal(user)}
                    >
                      ✏️
                    </button>
                    <button
                      className="text-blue-500 hover:underline mx-1"
                      onClick={() => openDeleteModal(user)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditUser}
        title="Edit User"
      >
        <div className="space-y-4">
          {" "}
          {/* Add vertical space between form fields */}
          <input
            type="text"
            value={currentUser?.name || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, name: e.target.value })
            }
            placeholder="Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            value={currentUser?.email || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, email: e.target.value })
            }
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={currentUser?.user_type || "user"}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, userType: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
          </select>
          <select
            value={currentUser?.status || "active"}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, status: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
      >
        <p>{`Are you sure you want to delete "${currentUser?.name}"?`}</p>
      </Modal>

      {/* Assign Project Modal */}
      <AssignProjectModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        onAssign={assignProject}
        projects={projects}
        selectedUser={currentUser}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
    </main>
  );
}
