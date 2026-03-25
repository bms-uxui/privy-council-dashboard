import { Link } from "react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface DocEmbedProps {
  title: string;
  url: string;
}

export default function DocEmbed({ title, url }: DocEmbedProps) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <Link
          to="/docs"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary"
        >
          <ArrowLeft size={14} />
          เอกสาร
        </Link>
        <span className="text-sm font-medium text-text">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary"
        >
          เปิดต้นฉบับ
          <ExternalLink size={14} />
        </a>
      </div>
      <iframe
        src={url}
        title={title}
        className="flex-1 w-full border-0"
        allow="clipboard-write"
      />
    </div>
  );
}
