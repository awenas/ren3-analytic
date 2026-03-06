'use client'

import { useState } from 'react'

interface EditorPanelProps {
  sql: string
  onSQLChange?: (sql: string) => void
  fileName?: string
  fileType?: 'sql' | 'yaml'
}

export default function EditorPanel({ sql, onSQLChange, fileName = 'query.sql', fileType = 'sql' }: EditorPanelProps) {
  const [activeFile, setActiveFile] = useState(fileName)

  const tabs = [
    { name: fileName, modified: false },
  ]

  return (
    <div className="flex flex-col h-1/2 min-h-[200px] border-b">
      {/* Editor Tabs */}
      <div className="h-8 bg-[#F4F5F7] flex items-center border-b overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`flex items-center gap-2 px-3 h-full border-r border-gray-200 cursor-pointer shrink-0 ${
              activeFile === tab.name
                ? 'bg-white border-b-2 border-b-[#6B4FBB] text-[#6B4FBB]'
                : 'hover:bg-gray-100 text-[#5E6C84]'
            }`}
          >
            {tab.modified && (
              <span className="w-2 h-2 rounded-full bg-[#6B4FBB]" />
            )}
            <span className="text-xs">{tab.name}</span>
          </div>
        ))}
      </div>

      {/* SQL/YAML Editor */}
      <div className="flex-1 bg-[#1E1E1E] p-3">
        <textarea
          value={sql}
          onChange={(e) => onSQLChange?.(e.target.value)}
          className="w-full h-full bg-[#1E1E1E] text-[#D4D4D4] font-mono text-xs resize-none outline-none"
          spellCheck={false}
          style={{ fontFamily: "'SF Mono', Monaco, 'Andale Mono', monospace" }}
        />
      </div>

      {/* Editor Toolbar */}
      <div className="h-6 bg-[#F4F5F7] flex items-center px-3 text-xs text-[#5E6C84] border-t">
        <span>{fileType.toUpperCase()}</span>
        <span className="mx-2">•</span>
        <span>UTF-8</span>
        <span className="mx-2">•</span>
        <span>Ln {sql.split('\n').length}, Col 1</span>
      </div>
    </div>
  )
}
