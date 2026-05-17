const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Chat", href: "/chat" },
  { label: "Upload", href: "/upload" },
];

export function Sidebar() {
  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-slate-100 shadow-[0_20px_80px_rgba(15,23,42,0.24)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
        Law AI
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-white">
        Counsel Workspace
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Manage uploads, indexed knowledge, and contract analysis from one
        secure dashboard.
      </p>

      <nav className="mt-8 space-y-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Storage Stack
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Ready for UploadThing or S3, PostgreSQL metadata, and Qdrant or
          Pinecone retrieval.
        </p>
      </div>
    </aside>
  );
}
