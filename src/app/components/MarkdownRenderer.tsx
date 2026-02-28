import React, { useState } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";

import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

// ===============================
// Register languages
// ===============================
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("sh", bash);
SyntaxHighlighter.registerLanguage("markdown", markdown);

// ===============================
// Retro terminal theme
// ===============================
const retroTerminalStyle: any = {
  'code[class*="language-"]': {
    color: "#00FF00",
    background: "#000000",
    fontFamily: "monospace",
    lineHeight: "1.5",
  },
  'pre[class*="language-"]': {
    color: "#00FF00",
    background: "#000000",
    padding: "1em",
    overflow: "auto",
  },
  comment: { color: "#888" },
  keyword: { color: "#FF00FF" },
  string: { color: "#FFFF00" },
  number: { color: "#FFFF00" },
  function: { color: "#00FFFF" },
  operator: { color: "#00FF00" },
};

// ===============================
// Types
// ===============================
interface MarkdownRendererProps {
  content: string;
}

// ===============================
// Component
// ===============================
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // headings
    h1: (props) => (
      <h1
        className="text-2xl font-bold text-[#000080] mb-3 pb-2 retro-border-bottom"
        {...props}
      />
    ),

    h2: (props) => (
      <h2 className="text-xl font-bold text-[#000080] mb-2 mt-4" {...props} />
    ),

    h3: (props) => (
      <h3 className="text-lg font-bold text-[#000080] mb-2 mt-3" {...props} />
    ),

    // paragraph
    p: (props) => (
      <p className="mb-3 leading-relaxed text-justify" {...props} />
    ),

    // ✅ FIXED blockquote (correct element)
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="retro-border-inset bg-[#FFFFCC] p-3 my-2 border-l-4 border-[#FF4500] italic text-sm"
        {...props}
      >
        {children}
      </blockquote>
    ),

    ul: (props) => <ul className="my-3 ml-6 list-none" {...props} />,

    ol: (props) => <ol className="my-3 ml-6 list-decimal pl-4" {...props} />,

    // ✅ FIXED li (removed ordered prop)
    li: ({ children, ...props }) => (
      <li className="mb-1 flex items-start" {...props}>
        <span className="text-[#FF4500] font-bold mr-2 mt-1">▪</span>
        <span>{children}</span>
      </li>
    ),

    hr: () => (
      <div className="my-4 border-t-2 border-b-2 border-gray-400 h-1 retro-border-inset" />
    ),

    a: (props) => (
      <a
        className="text-[#FF4500] underline hover:text-[#000080] font-bold"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),

    img: ({ alt, ...props }) => (
      <span className="inline-block my-4 retro-border-outset p-2 bg-[#C0C0C0] w-full">
        <img className="w-full border-2 border-black" {...props} />
        {alt && (
          <span className="block text-xs text-center mt-2 text-gray-600">
            {alt}
          </span>
        )}
      </span>
    ),

    // ===============================
    // Code blocks with copy button
    // ===============================
    code({
      inline,
      className,
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) {
      const match = /language-(\w+)/.exec(className || "");
      const [copied, setCopied] = useState(false);

      const text = String(children).replace(/\n$/, "");

      const copy = async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Code copied");
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Copy failed");
        }
      };

      if (!inline && match) {
        return (
          <div className="relative group my-3">
            <button
              onClick={copy}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-gray-300 p-1"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            <SyntaxHighlighter
              style={retroTerminalStyle}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.85rem",
              }}
            >
              {text}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className="bg-black text-[#00FF00] px-1 py-0.5 font-mono text-xs"
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className="markdown-content text-justify">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
