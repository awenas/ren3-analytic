'use client'

import { useState } from 'react'

interface MCPTool {
  name: string
  description: string
}

interface HeaderProps {
  onRunQuery: () => void
  isLoading: boolean
  onUploadClick?: () => void
  mcpTools?: MCPTool[]
  onMCPToolSelect?: (toolName: string) => void
}

export default function Header({ onRunQuery, isLoading, onUploadClick, mcpTools = [], onMCPToolSelect }: HeaderProps) {
  const [showToolsMenu, setShowToolsMenu] = useState(false)

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

      {/* MCP Tools Dropdown */}
      {mcpTools.length > 0 && (
        <div className="ml-6 relative">
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            MCP Tools
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showToolsMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#1A1D21] border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-2">
                <div className="text-xs text-gray-400 px-2 py-1 uppercase tracking-wide">MCP Tools</div>
                {mcpTools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => {
                      onMCPToolSelect?.(tool.name)
                      setShowToolsMenu(false)
                    }}
                    className="w-full flex flex-col items-start px-3 py-2 text-sm text-gray-300 hover:bg-white/10 rounded transition-colors"
                  >
                    <span className="text-white">{tool.name.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-gray-500">{tool.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="ml-auto flex items-center gap-3">
        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>

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
