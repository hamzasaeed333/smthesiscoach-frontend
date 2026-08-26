"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface ReportData {
  id: string;
  document_id: string;
  word_count: number;
  estimated_pages: number;
  found_headings: string[];
  missing_headings: string[];
  created_at: string;
}

interface DocumentData {
  file_name: string;
  university_template: string;
}

const UPCOMING_CATEGORIES = [
  { name: "Margins", description: "Left, right, top, bottom margin checks" },
  { name: "Heading Styles", description: "Font, size, bold, numbering consistency" },
  { name: "Page Numbering", description: "Roman/Arabic numbering, placement" },
  { name: "Line Spacing", description: "Consistent spacing throughout document" },
  { name: "Referencing", description: "Citation style consistency (APA/IEEE)" },
  { name: "Font Consistency", description: "Body text font family and size" },
];

function ComplianceReportContent() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [report, setReport] = useState<ReportData | null>(null);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setError("No document selected. Please open a report from your dashboard.");
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("*")
          .eq("document_id", documentId)
          .single();

        if (reportError || !reportData) {
          throw new Error("No compliance report found for this document.");
        }

        const { data: docData, error: docError } = await supabase
          .from("documents")
          .select("file_name, university_template")
          .eq("id", documentId)
          .single();

        if (docError || !docData) {
          throw new Error("Could not load document details.");
        }

        setReport(reportData);
        setDocument(docData);
      } catch (err: any) {
        setError(err.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-white">
        <p className="text-neutral/70">Loading report...</p>
      </div>
    );
  }

  if (error || !report || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-white px-4">
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg p-4 max-w-md text-center">
          {error || "Something went wrong."}
        </div>
      </div>
    );
  }

  const totalHeadings = report.found_headings.length + report.missing_headings.length;
  const passCount = report.found_headings.length;
  const failCount = report.missing_headings.length;

  return (
    <div className="min-h-screen bg-navy text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Compliance Report</h1>
        <p className="text-neutral/70 mb-6">
          {document.file_name}
          {document.university_template && ` · ${document.university_template}`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{report.word_count}</p>
            <p className="text-xs text-neutral/60 mt-1">Word Count</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{report.estimated_pages}</p>
            <p className="text-xs text-neutral/60 mt-1">Estimated Pages</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{passCount}</p>
            <p className="text-xs text-neutral/60 mt-1">Passed</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{failCount}</p>
            <p className="text-xs text-neutral/60 mt-1">Failed</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Headings</h2>
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral/60 text-left">
                  <th className="px-4 py-2 font-medium">Heading</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {report.found_headings.map((heading) => (
                  <tr key={`found-${heading}`} className="border-b border-white/5">
                    <td className="px-4 py-2 capitalize">{heading}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-green-400">
                        ✅ Pass
                      </span>
                    </td>
                    <td className="px-4 py-2 text-neutral/50">—</td>
                  </tr>
                ))}
                {report.missing_headings.map((heading) => (
                  <tr key={`missing-${heading}`} className="border-b border-white/5">
                    <td className="px-4 py-2 capitalize">{heading}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 text-red-400">
                        ❌ Fail
                      </span>
                    </td>
                    <td className="px-4 py-2 text-neutral/70">
                      Add a heading titled "{heading}" to your document.
                    </td>
                  </tr>
                ))}
                {totalHeadings === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-neutral/50">
                      No heading data available for this document.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-neutral/70">Other Checks</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {UPCOMING_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="bg-white/5 rounded-lg p-4 border border-dashed border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-neutral/80">{cat.name}</p>
                  <span className="text-xs bg-white/10 text-neutral/60 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                </div>
                <p className="text-xs text-neutral/50">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-navy text-white">
          <p className="text-neutral/70">Loading...</p>
        </div>
      }
    >
      <ComplianceReportContent />
    </Suspense>
  );
}