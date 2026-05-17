"use client";

import { useEffect, useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { toast } from "sonner";

type DocumentItem = {
  id: string;
  title: string;
  status: string;
  errorMessage?: string | null;
  createdAt?: string;
};

export function UploadBox() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDocuments() {
      try {
        const response = await fetch("/api/documents", { cache: "no-store" });
        const result = (await response.json()) as {
          documents?: DocumentItem[];
        };

        if (isMounted && result.documents) {
          setDocuments(result.documents);
        }
      } catch {
        // Keep the upload UI usable even if document status cannot be loaded.
      }
    }

    void loadDocuments();
    const interval = window.setInterval(() => {
      void loadDocuments();
    }, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  function getStatusClasses(documentStatus: string) {
    if (documentStatus === "indexed") {
      return "text-green-400 bg-green-400/10";
    }

    if (documentStatus === "failed") {
      return "text-orange-400 bg-orange-400/10";
    }

    return "text-yellow-400 bg-yellow-400/10";
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-semibold text-zinc-100 mb-2">Knowledge Base</h2>
      <p className="text-sm text-zinc-400 mb-8">
        Files uploaded here will be securely indexed into Qdrant for Retrieval-Augmented Generation (RAG).
      </p>

      <div className="rounded-2xl border border-zinc-700/50 bg-[#2f2f2f]/30 p-6">
        <UploadDropzone
          endpoint="documentUploader"
          onClientUploadComplete={(files) => {
            toast.success(
              `Uploaded ${files.length} file${files.length > 1 ? "s" : ""}. Indexing started.`,
            );
          }}
          onUploadError={(error) => {
            toast.error(error.message);
          }}
          appearance={{
            container:
              "border-0 bg-transparent p-0 ut-label:text-zinc-400 ut-button:bg-zinc-200 ut-button:text-zinc-900 ut-button:ut-readying:bg-zinc-300 ut-button:ut-uploading:bg-zinc-400 ut-allowed-content:text-zinc-500",
          }}
        />
      </div>



      <div className="mt-10 space-y-3">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          Indexed Documents
        </h3>

        {documents.length === 0 ? (
          <div className="text-sm text-zinc-500">
            No document records yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {document.title}
                  </p>
                  <span
                    className={`flex-shrink-0 rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(document.status)}`}
                  >
                    {document.status}
                  </span>
                </div>
                {document.status === "failed" && document.errorMessage ? (
                  <p className="mt-3 text-[11px] text-zinc-400 bg-zinc-800/50 p-2 rounded-md border border-zinc-700/30">
                    {document.errorMessage}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
