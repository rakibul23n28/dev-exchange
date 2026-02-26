import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

// Custom retro terminal-style syntax highlighting theme
const retroTerminalStyle = {
  'code[class*="language-"]': {
    color: '#00FF00',
    background: '#000000',
    fontFamily: 'monospace',
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: 4,
    hyphens: 'none' as const,
  },
  'pre[class*="language-"]': {
    color: '#00FF00',
    background: '#000000',
    fontFamily: 'monospace',
    textAlign: 'left' as const,
    whiteSpace: 'pre' as const,
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: '1.5',
    tabSize: 4,
    hyphens: 'none' as const,
    padding: '1em',
    margin: '0',
    overflow: 'auto',
  },
  'comment': { color: '#888888' },
  'prolog': { color: '#888888' },
  'doctype': { color: '#888888' },
  'cdata': { color: '#888888' },
  'punctuation': { color: '#00FF00' },
  'property': { color: '#00FFFF' },
  'tag': { color: '#00FFFF' },
  'boolean': { color: '#FFFF00' },
  'number': { color: '#FFFF00' },
  'constant': { color: '#FFFF00' },
  'symbol': { color: '#FFFF00' },
  'deleted': { color: '#FF0000' },
  'selector': { color: '#FF00FF' },
  'attr-name': { color: '#00FFFF' },
  'string': { color: '#FFFF00' },
  'char': { color: '#FFFF00' },
  'builtin': { color: '#FF00FF' },
  'inserted': { color: '#00FF00' },
  'operator': { color: '#00FF00' },
  'entity': { color: '#00FFFF' },
  'url': { color: '#00FFFF' },
  'atrule': { color: '#FF00FF' },
  'attr-value': { color: '#FFFF00' },
  'keyword': { color: '#FF00FF' },
  'function': { color: '#00FFFF' },
  'class-name': { color: '#00FFFF' },
  'regex': { color: '#FFFF00' },
  'important': { color: '#FF4500', fontWeight: 'bold' },
  'variable': { color: '#00FFFF' },
};

// Register languages
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('js', javascript);
SyntaxHighlighter.registerLanguage('ts', typescript);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sh', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content text-justify">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-[#000080] mb-3 pb-2 retro-border-bottom" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-[#000080] mb-2 mt-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-[#000080] mb-2 mt-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed text-justify" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <div className="retro-border-inset bg-[#FFFFCC] p-3 my-2 border-l-4 border-[#FF4500]">
              <p className="text-sm italic" {...props} />
            </div>
          ),
          ul: ({ node, ...props }) => (
            <ul className="my-3 ml-6 list-none" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3 ml-6 list-decimal pl-4" {...props} />
          ),
          li: ({ node, ordered, ...props }) => {
            if (ordered) {
              return (
                 <li className="mb-1 pl-1" {...props}>
                    <span className="text-[#000080] font-bold mr-2"></span>
                    {props.children}
                 </li>
              );
            }
            return (
              <li className="mb-1 flex items-start" {...props}>
                <span className="text-[#FF4500] font-bold mr-2 mt-1">▪</span>
                <span>{props.children}</span>
              </li>
            );
          },
          hr: ({ node, ...props }) => (
            <div className="my-4 border-t-2 border-b-2 border-gray-400 h-1 retro-border-inset" />
          ),
          a: ({ node, ...props }) => (
            <a 
              className="text-[#FF4500] underline hover:text-[#000080] font-bold cursor-pointer" 
              target="_blank" 
              rel="noopener noreferrer" 
              {...props} 
            />
          ),
          img: ({ node, ...props }) => (
            <span className="inline-block my-4 retro-border-outset p-2 bg-[#C0C0C0] w-full">
              <img 
                className="w-full border-2 border-black" 
                {...props} 
              />
              {props.alt && (
                <span className="block text-xs text-center mt-2 text-gray-600">
                  {props.alt}
                </span>
              )}
            </span>
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const [isCopied, setIsCopied] = React.useState(false);

            const handleCopy = async () => {
              const text = String(children).replace(/\n$/, '');
              try {
                // Try modern clipboard API first
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                toast.success('Code copied to clipboard');
                setTimeout(() => setIsCopied(false), 2000);
              } catch (err) {
                // Fallback for when clipboard API is blocked
                try {
                  // Create a temporary textarea element
                  const textarea = document.createElement('textarea');
                  textarea.value = text;
                  textarea.style.position = 'fixed';
                  textarea.style.opacity = '0';
                  document.body.appendChild(textarea);
                  textarea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textarea);
                  setIsCopied(true);
                  toast.success('Code copied to clipboard');
                  setTimeout(() => setIsCopied(false), 2000);
                } catch (fallbackErr) {
                  console.error('Failed to copy:', err);
                  toast.error('Failed to copy to clipboard');
                }
              }
            };

            return !inline && match ? (
              <div className="relative group my-3">
                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopy}
                    className="bg-[#C0C0C0] p-1 border-2 border-white border-r-gray-600 border-b-gray-600 active:border-gray-600 active:border-r-white active:border-b-white focus:outline-none"
                    title="Copy code"
                  >
                    {isCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="retro-border-inset bg-black p-0 overflow-hidden">
                  <div className="bg-[#000080] text-white text-xs px-2 py-1 font-mono flex justify-between items-center">
                     <span>{match[1].toUpperCase()}</span>
                     <span className="text-[10px]">TERMINAL</span>
                  </div>
                  <SyntaxHighlighter
                    style={retroTerminalStyle}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      backgroundColor: '#000000',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                    }}
                    codeTagProps={{
                        style: { fontFamily: 'monospace' }
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <code className="bg-black text-[#00FF00] px-1 py-0.5 font-mono text-xs border border-gray-400" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}