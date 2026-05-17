import { LoginForm } from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#c7d2fe_0%,#f8fafc_35%,#e2e8f0_100%)]" />
      <div className="absolute left-[-10%] top-[-5%] h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] h-80 w-80 rounded-full bg-amber-200/50 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/85 shadow-[0_30px_120px_rgba(15,23,42,0.18)] backdrop-blur xl:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden flex-col justify-between bg-slate-950 px-10 py-12 text-slate-100 xl:flex">
          <div className="space-y-6">
            <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Law AI Workspace
            </span>
            <div className="space-y-4">
              <h1 className="max-w-lg font-serif text-5xl leading-tight text-white">
                Review legal documents with faster research and safer AI
                workflows.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300">
                This workspace is set up for Gemini, PostgreSQL, and Qdrant or
                Pinecone retrieval. The public
                experience is intentionally locked to a single login page for
                now.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              "Matter-aware document chat",
              "Embeddings and vector search pipeline",
              "Secure upload and storage integration",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                Secure Login
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Sign in to Law AI
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Access is currently limited to authenticated users while the
                  research, upload, and chat modules are being prepared.
                </p>
              </div>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-slate-500">
              Need admin access? Contact your workspace owner to provision an
              account.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
