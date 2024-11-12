// components/ProjectLayout.js
import { Sidebar } from "../app/projects/sidebar"; // Import the Sidebar

export default function ProjectLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-5">{children}</main>
    </div>
  );
}
