interface TerminalBarProps {
  expanded: boolean
  onToggle: () => void
  output: string[]
}

export default function TerminalBar({ expanded, onToggle, output }: TerminalBarProps) {
  return (
    <div className={`bg-[#1A1D21] text-gray-300 transition-all ${expanded ? 'h-32' : 'h-8'}`}>
      {/* Terminal Header */}
      <div
        className="h-8 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Console</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#00875A] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00875A] animate-pulse"></span>
            Ready
          </span>
          <button className="hover:bg-white/10 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      {expanded && (
        <div className="h-[calc(100%-32px)] overflow-auto px-4 py-2 font-mono text-sm">
          {output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
