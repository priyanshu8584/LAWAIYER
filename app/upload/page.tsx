import { UploadBox } from "@/components/UploadBox";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1c2737_0%,#0b1018_35%,#06090f_100%)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <UploadBox />
      </div>
    </main>
  );
}
