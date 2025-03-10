"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";



export default function LeftSidebar({  Links,Header} : {Links: {name: string, path: string}[], Header: string}) {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-20 flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">{Header}</div>

      <nav className="flex flex-col mt-4">
        {Links.map((link) => (
          <Link key={link.path} href={link.path}>
            <div
              className={`p-3 hover:bg-gray-700 cursor-pointer ${
                pathname === link.path ? "bg-gray-700" : ""
              }`}
            >
              {link.name}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
