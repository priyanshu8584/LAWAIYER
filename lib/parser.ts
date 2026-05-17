import pdf from "@cedrugs/pdf-parse";

type ParsedDocumentInput = {
  fileName: string;
  fileUrl: string;
  fileType?: string;
};

export async function parseUploadedDocument({
  fileName,
  fileUrl,
  fileType,
}: ParsedDocumentInput) {
  const response = await fetch(fileUrl);
  const resolvedType = fileType || response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`Unable to fetch uploaded file: ${response.status}`);
  }

  if (resolvedType === "application/pdf") {
    const buffer = Buffer.from(await response.arrayBuffer());
    const parsed = await pdf(buffer);
    const content = parsed.text.trim();

    if (!content) {
      throw new Error(`No readable text was extracted from ${fileName}.`);
    }

    return {
      fileName,
      content,
      status: "parsed" as const,
    };
  }

  if (resolvedType.startsWith("text/")) {
    const content = await response.text();

    if (!content.trim()) {
      throw new Error(`No readable text was extracted from ${fileName}.`);
    }

    return {
      fileName,
      content,
      status: "parsed" as const,
    };
  }

  return {
    fileName,
    content: "",
    status: "unsupported" as const,
  };
}
