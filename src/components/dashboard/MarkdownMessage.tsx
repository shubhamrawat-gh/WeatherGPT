import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownMessageProps {
  content: string
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-content text-xs sm:text-sm leading-relaxed font-sans dark:text-[#e2e8f0] text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-semibold dark:text-white text-slate-900 mt-4 mb-2 pb-1 border-b dark:border-white/[0.08] border-slate-200">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-semibold dark:text-white text-slate-900 mt-3.5 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold dark:text-white text-slate-900 mt-3 mb-1 text-brand-green">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold dark:text-slate-200 text-slate-800 mt-2 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 dark:text-[#d1d5db] text-slate-700 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold dark:text-white text-slate-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic dark:text-slate-300 text-slate-600">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-slate-400">
              {children}
            </del>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 pl-4 list-disc space-y-1 dark:text-[#d1d5db] text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 pl-4 list-decimal space-y-1 dark:text-[#d1d5db] text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 marker:text-brand-green">
              {children}
            </li>
          ),
          hr: () => (
            <hr className="my-4 border-t dark:border-white/[0.08] border-slate-200" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-3.5 border-l-2 border-brand-green dark:text-[#a8b3bc] text-slate-600 italic dark:bg-[#121212] bg-slate-100 py-1.5 rounded-r motion-block-entrance">
              {children}
            </blockquote>
          ),
          // Tables (GFM)
          table: ({ children }) => (
            <div className="my-3.5 overflow-x-auto rounded-xl border dark:border-white/[0.08] border-slate-200 dark:bg-[#121212] bg-white shadow-xs motion-block-entrance">
              <table className="w-full text-left text-xs border-collapse min-w-[320px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 border-b dark:border-white/[0.08] border-slate-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y dark:divide-white/[0.06] divide-slate-100">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="dark:hover:bg-white/[0.04] hover:bg-slate-50 transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-xs dark:text-white text-slate-900 uppercase tracking-wider font-mono">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2.5 text-xs dark:text-[#d1d5db] text-slate-700 font-sans">
              {children}
            </td>
          ),
          // Code Blocks & Inline Code
          code: ({ className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded dark:bg-[#181818] bg-slate-100 border dark:border-white/[0.08] border-slate-200 font-mono text-[11px] text-brand-green"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <pre className="my-3 p-3.5 rounded-xl dark:bg-[#101010] bg-slate-100 border dark:border-white/[0.08] border-slate-200 overflow-x-auto text-xs font-mono dark:text-slate-200 text-slate-800 motion-block-entrance">
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
                  className="w-3.5 h-3.5 rounded border dark:border-[#1c2d38] border-slate-300 text-brand-green mr-1.5 align-middle pointer-events-none"
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
