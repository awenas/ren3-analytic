interface HeaderProps {
  onRunQuery: () => void
  isLoading: boolean
}

export default function Header({ onRunQuery, isLoading }: HeaderProps) {
  return (
    <header className="h-14 bg-[#1A1D21] flex items-center px-4 text-white shrink-0">
      {/* Logo + Project Name */}
      <div className="flex items-center gap-3">
        {/* ReN3 Logo */}
        <svg
          viewBox="0 0 32 32"
          className="w-8 h-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="#6B4FBB" />
          <path
            d="M8 16L16 8L24 16L16 24L8 16Z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M12 16L16 12L20 16L16 20L12 16Z"
            fill="#6B4FBB"
          />
          <circle cx="16" cy="16" r="2" fill="white" />
        </svg>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">ecommerce-demo</span>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* New Button */}
        <button className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>

        {/* Run Button */}
        <button
          onClick={onRunQuery}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#00875A] hover:bg-[#007253] rounded text-sm font-medium transition-colors disabled:opacity50"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
          {isLoading ? 'Running...' : 'Run'}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-600 mx-2" />

        {/* User Menu */}
        <button className="flex items-center gap-2 text-gray-300 hover:text-white">
          <div className="w-7 h-7 rounded-full bg-[#6B4FBB] flex items-center justify-center text-sm font-medium">
            A
          </div>
        </button>
      </div>
    </header>
  )
}
