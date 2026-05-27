"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Props {
  value: string;
  onChange: (v: string) => void;
  height?: number;
}

export default function MarkdownEditor({ value, onChange, height = 300 }: Props) {
  return (
    <div data-color-mode="dark" className="rounded-lg overflow-hidden border border-admin-border">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        preview="edit"
      />
    </div>
  );
}
