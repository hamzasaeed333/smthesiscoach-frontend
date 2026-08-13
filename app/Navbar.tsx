"use client";
import Link from "next/link";

export default function Navbar() {
  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/upload", label: "Upload" },
    { href: "/compliance-report", label: "Compliance Report" },
    { href: "/writing-feedback", label: "Writing Feedback" },
    { href: "/chapters", label: "Chapters" },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-slate-300 hover:text-white text-sm font-medium"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}