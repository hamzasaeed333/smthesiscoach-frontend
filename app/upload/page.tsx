"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [universityTemplate, setUniversityTemplate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF or DOCX files are allowed.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`File size must be under ${MAX_SIZE_MB}MB.`);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setUploadProgress(null);
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!universityTemplate.trim()) {
      setError("Please enter your university template.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1) Get logged-in user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error("You must be logged in to upload.");
      }
      const userId = userData.user.id;

      // 2) Build a unique storage path
      const timestamp = Date.now();
      const safeFileName = selectedFile.name.replace(/\s+/g, "-");
      const filePath = `${userId}/${timestamp}-${safeFileName}`;

      // 3) Fake progress ticking while real upload happens in background
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 90) return prev; // hold until real upload finishes
          return prev + 10;
        });
      }, 200);

      // 4) Upload to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from("thesis-drafts")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        clearInterval(progressInterval);
        throw new Error(uploadError.message);
      }

      // 5) Insert record into documents table
      const { error: insertError } = await supabase.from("documents").insert({
        user_id: userId,
        file_name: selectedFile.name,
        file_path: filePath,
        file_type: selectedFile.type,
        university_template: universityTemplate.trim(),
      });

      clearInterval(progressInterval);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setUploadProgress(100);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy text-white px-4">
      <div className="bg-navy/80 p-8 rounded-lg w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Upload Thesis Draft</h1>
        <p className="text-neutral/70 text-center mb-6">
          Drag and drop your file, or click to browse
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
            ${isDragging ? "border-green-400 bg-green-400/10" : "border-neutral/30 bg-white/5"}
          `}
        >
          <p className="text-neutral/80">
            Drag & drop your file here, or{" "}
            <span className="text-green-400 underline">browse</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg text-sm">
            Selected: <strong>{selectedFile.name}</strong>{" "}
            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <input
          type="text"
          placeholder="University Template (e.g. IIUI)"
          value={universityTemplate}
          onChange={(e) => setUniversityTemplate(e.target.value)}
          className="w-full mt-4 px-4 py-2 rounded bg-navy/60 text-white border border-teal-500/30 focus:outline-none"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/40 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {uploadProgress !== null && (
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-400 h-3 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-neutral/70 mt-1 text-right">{uploadProgress}%</p>
          </div>
        )}

        {selectedFile && uploadProgress === null && (
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        )}

        {uploadProgress === 100 && (
          <p className="mt-3 text-green-400 text-sm text-center">Upload complete ✅</p>
        )}
      </div>
    </div>
  );
}