"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white">
      <Link href="/" className="font-bold text-lg">SaaS Platform</Link>
      <div className="flex gap-6 items-center">
        <Link href="/pricing" className="text-slate-300 hover:text-white">Pricing</Link>
        {user ? (
          <>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">Dashboard</Link>
            {user.role === "admin" && (
              <Link href="/admin" className="text-slate-300 hover:text-white">Admin</Link>
            )}
            <span className="text-sm text-slate-400">{user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded text-sm">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-300 hover:text-white">Login</Link>
            <Link href="/register" className="bg-blue-600 px-3 py-1 rounded text-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
