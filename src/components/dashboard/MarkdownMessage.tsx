import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownMessageProps {
  content: string
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-content text-xs sm:text-sm leading-relaxed font-sans text-[#e2e8f0]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2 pb-1 border-b border-[#1c2d38]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-semibold text-white mt-3.5 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-white mt-3 mb-1 text-emerald-400">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 text-[#c1ccd6] leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-slate-500">
              {children}
            </del>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 pl-4 list-disc space-y-1 text-[#c1ccd6]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 pl-4 list-decimal space-y-1 text-[#c1ccd6]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-brand-green">
              {children}
            </li>
          ),
          hr: () => (
            <hr className="my-4 border-t border-[#1c2d38]" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-3.5 border-l-2 border-brand-green text-[#a8b3bc] italic bg-[#001e2b] py-1.5 rounded-r">
              {children}
            </blockquote>
          ),
          // Tables (GFM)
          table: ({ children }) => (
            <div className="my-3.5 overflow-x-auto rounded-xl border border-[#1c2d38] bg-[#001e2b] shadow-sm">
              <table className="w-full text-left text-xs border-collapse min-w-[320px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#002d3f] text-white border-b border-[#1c2d38]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#1c2d38]/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#002d3f]/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-xs text-white uppercase tracking-wider font-mono">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-xs text-[#c1ccd6] font-sans">
              {children}
            </td>
          ),
          // Code Blocks & Inline Code
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-[#002838] border border-[#1c2d38] font-mono text-[11px] text-emerald-300"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="my-3 p-3.5 rounded-xl bg-[#00141e] border border-[#1c2d38] overflow-x-auto text-xs font-mono text-slate-200">
                <code {...props}>{children}</code>
              </pre>
            )
          },
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="w-3.5 h-3.5 rounded border-[#1c2d38] text-brand-green mr-1.5 align-middle pointer-events-none"
                  {...props}
                />
              )
            }
            return <input type={type} {...props} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
