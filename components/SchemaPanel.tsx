interface SchemaPanelProps {
  tableName: string | null
  schema: { column: string; type: string }[]
}

export default function SchemaPanel({ tableName, schema }: SchemaPanelProps) {
  return (
    <div className="w-72 bg-[#F4F5F7] border-l flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b">
        <span className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">
          Schema
        </span>
      </div>

      {/* Table Info */}
      {tableName ? (
        <div className="flex-1 overflow-auto">
          <div className="p-3 border-b bg-white">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="font-medium text-[#1A1D21]">{tableName}</span>
            </div>
            <span className="text-xs text-[#5E6C84]">
              {schema.length} columns
            </span>
          </div>

          {/* Columns */}
          <div className="p-2">
            {schema.map((col, i) => (
              <div
                key={col.column}
                className="flex items-center justify-between py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#1A1D21]">{col.column}</span>
                </div>
                <span className="text-xs text-[#5E6C84] font-mono">{col.type}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#5E6C84] text-sm p-4 text-center">
          Select a table to view its schema
        </div>
      )}

      {/* Quick Info */}
      <div className="p-3 border-t bg-white">
        <div className="text-xs text-[#5E6C84]">
          <div className="flex justify-between mb-1">
            <span>Database:</span>
            <span className="text-[#1A1D21] font-medium">ecommerce.db</span>
          </div>
          <div className="flex justify-between">
            <span>Engine:</span>
            <span className="text-[#1A1D21] font-medium">AnalyticDB</span>
          </div>
        </div>
      </div>
    </div>
  )
}
