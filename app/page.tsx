'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import EditorPanel from '@/components/EditorPanel'
import ResultsPanel from '@/components/ResultsPanel'
import SchemaPanel from '@/components/SchemaPanel'
import TerminalBar from '@/components/TerminalBar'
import Header from '@/components/Header'
import UploadModal from '@/components/UploadModal'

export type TabType = 'results' | 'lineage' | 'docs' | 'tools'
export type FileType = 'sql' | 'yaml'

export interface QueryResult {
  columns: string[]
  data: Record<string, unknown>[]
  rowCount: number
}

export interface LineageNode {
  id: string
  label: string
  type: 'source' | 'model' | 'metric'
  x: number
  y: number
}

export interface LineageEdge {
  from: string
  to: string
}

export interface TableSize {
  table: string
  row_count: number
  size_bytes: number
}

export interface MCPTool {
  name: string
  description: string
}

// MCP Tools available
const MCP_TOOLS: MCPTool[] = [
  { name: 'get_monthly_revenue', description: 'View monthly revenue trends' },
  { name: 'get_customer_segments', description: 'Analyze customer segments' },
  { name: 'get_product_performance', description: 'Top performing products' },
  { name: 'get_table_sizes', description: 'Table row counts & sizes' },
  { name: 'get_lineage', description: 'Data lineage graph' },
  { name: 'get_metrics', description: 'Defined metrics' },
]

const TABLE_QUERIES: Record<string, string> = {
  orders: `SELECT DATE_TRUNC('month', order_date) AS month, COUNT(*) AS total_orders, SUM(order_total) AS revenue
FROM orders WHERE order_status NOT IN ('Cancelled', 'Refunded') GROUP BY 1 ORDER BY 1`,
  customers: `SELECT customer_segment, COUNT(*) AS customer_count, AVG(lifetime_value) AS avg_ltv
FROM customers GROUP BY customer_segment ORDER BY avg_ltv DESC`,
  products: `SELECT p.category, p.product_name, SUM(oi.quantity) AS total_sold, SUM(oi.item_total) AS revenue
FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY 1, 2 ORDER BY revenue DESC LIMIT 20`,
  order_items: `SELECT * FROM order_items LIMIT 20`,
  campaigns: `SELECT * FROM campaigns LIMIT 20`,
  website_analytics: `SELECT * FROM website_analytics LIMIT 20`
}

const YAML_FILES: Record<string, string> = {
  'sem_order_sales.yml': `version: 2

models:
  - name: fct_orders
    description: "Fact table for orders"
    metrics:
      - name: total_revenue
        description: "Total revenue from all orders"
        type: sum
        expression: order_total

      - name: order_count
        description: "Total number of orders"
        type: count
        expression: order_id`,
  'sem_customers.yml': `version: 2

models:
  - name: dim_customers
    description: "Dimension table for customers"
    metrics:
      - name: total_customers
        description: "Total number of customers"
        type: count
        expression: customer_id

      - name: avg_lifetime_value
        description: "Average customer lifetime value"
        type: average
        expression: lifetime_value`
}

function generateSQLFromText(text: string, tables: string[]): string {
  const t = text.toLowerCase()
  if (t.includes('revenue') || t.includes('sales')) {
    if (t.includes('month')) {
      return `SELECT DATE_TRUNC('month', order_date) AS month, SUM(order_total) AS revenue FROM orders WHERE order_status NOT IN ('Cancelled', 'Refunded') GROUP BY 1 ORDER BY 1`
    }
    return `SELECT SUM(order_total) AS total_revenue FROM orders WHERE order_status NOT IN ('Cancelled', 'Refunded')`
  }
  if (t.includes('customer')) {
    if (t.includes('segment')) {
      return `SELECT customer_segment, COUNT(*) AS count FROM customers GROUP BY customer_segment`
    }
    if (t.includes('top')) {
      return `SELECT customer_id, SUM(order_total) AS lifetime_value FROM orders GROUP BY customer_id ORDER BY lifetime_value DESC LIMIT 10`
    }
    return `SELECT * FROM customers LIMIT 20`
  }
  if (t.includes('product')) {
    return `SELECT p.product_name, SUM(oi.quantity) AS total_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY 1 ORDER BY total_sold DESC LIMIT 10`
  }
  if (t.includes('order')) {
    return `SELECT COUNT(*) AS total_orders FROM orders`
  }
  return `-- Try: "show revenue by month" or "top customers"`
}

export default function AnalyticsPlatform() {
  const [activeTab, setActiveTab] = useState<TabType>('results')
  const [terminalExpanded, setTerminalExpanded] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>('orders')
  const [currentSQL, setCurrentSQL] = useState<string>(TABLE_QUERIES.orders)
  const [currentFile, setCurrentFile] = useState<string>('query.sql')
  const [fileType, setFileType] = useState<FileType>('sql')
  const [isEditingYAML, setIsEditingYAML] = useState(false)
  const [nlQuery, setNlQuery] = useState('')
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<string[]>([])
  const [tableSchema, setTableSchema] = useState<{ column: string; type: string }[]>([])
  const [lineage, setLineage] = useState<{ nodes: LineageNode[]; edges: LineageEdge[] } | null>(null)
  const [tableSizes, setTableSizes] = useState<TableSize[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['> ren3 analytics platform v1.1.0', '> Connected to: ecommerce.db', '> MCP Tools: 16 available', '> Ready.'])

  useEffect(() => {
    fetch('http://localhost:3001/api/tables').then(res => res.json()).then(data => setTables(data.tables || [])).catch(console.error)
  }, [])

  useEffect(() => {
    // Load table sizes using MCP tool
    fetch('http://localhost:3001/api/mcp/table-sizes').then(res => res.json()).then(data => setTableSizes(data.tables || [])).catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedTable) return
    fetch(`http://localhost:3001/api/tables/${selectedTable}/schema`).then(res => res.json()).then(data => setTableSchema(data.columns || [])).catch(console.error)
    const sql = TABLE_QUERIES[selectedTable] || `SELECT * FROM ${selectedTable} LIMIT 10`
    setCurrentSQL(sql); setCurrentFile('query.sql'); setFileType('sql')
    runTableQuery(sql)
  }, [selectedTable])

  useEffect(() => {
    fetch('http://localhost:3001/api/mcp/lineage').then(res => res.json()).then(data => setLineage(data)).catch(console.error)
  }, [])

  const runTableQuery = async (sql: string) => {
    setIsLoading(true)
    setTerminalOutput(prev => [...prev, `> ${sql.split('\n')[0]}`])
    try {
      const response = await fetch('http://localhost:3001/api/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sql }) })
      if (!response.ok) throw new Error('Query failed')
      const result = await response.json()
      setQueryResults(result)
      setTerminalOutput(prev => [...prev, '> Query executed successfully', `> Returned ${result.rowCount} rows`])
    } catch (error) {
      setTerminalOutput(prev => [...prev, `> Error: ${error instanceof Error ? error.message : 'Query failed'}`])
    } finally {
      setIsLoading(false)
    }
  }

  const runMCPTool = async (toolName: string) => {
    setIsLoading(true)
    setTerminalOutput(prev => [...prev, `> Running MCP tool: ${toolName}`])
    try {
      const response = await fetch(`http://localhost:3001/api/mcp/${toolName}`)
      if (!response.ok) throw new Error('MCP tool failed')
      const result = await response.json()
      setQueryResults({
        columns: result.columns || Object.keys(result).filter(k => k !== 'table' && k !== 'stats' && k !== 'nodes' && k !== 'edges'),
        data: result.rows || [result],
        rowCount: result.rowCount || (result.rows ? result.rows.length : 1)
      })
      setTerminalOutput(prev => [...prev, `> ${toolName} completed`, `> Returned ${result.rowCount || 1} rows`])
      setActiveTab('results')
    } catch (error) {
      setTerminalOutput(prev => [...prev, `> Error: ${error instanceof Error ? error.message : 'MCP tool failed'}`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNL2SQL = () => {
    if (!nlQuery.trim()) return
    const generatedSQL = generateSQLFromText(nlQuery, tables)
    setCurrentSQL(generatedSQL); setCurrentFile('query.sql'); setFileType('sql')
    setTerminalOutput(prev => [...prev, `> NL: "${nlQuery}"`, `> Generated SQL`])
    setActiveTab('results')
    runTableQuery(generatedSQL)
  }

  const handleRunQuery = async () => {
    if (fileType === 'yaml') {
      YAML_FILES[currentFile] = currentSQL
      setTerminalOutput(prev => [...prev, `> Saved ${currentFile}`])
      return
    }
    setIsLoading(true)
    setTerminalOutput(prev => [...prev, '> Running query...'])
    try {
      const response = await fetch('http://localhost:3001/api/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sql: currentSQL }) })
      if (!response.ok) throw new Error('Query failed')
      const result = await response.json()
      setQueryResults(result)
      setTerminalOutput(prev => [...prev, '> Query executed successfully', `> Returned ${result.rowCount} rows`])
    } catch (error) {
      setTerminalOutput(prev => [...prev, `> Error: ${error instanceof Error ? error.message : 'Query failed'}`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableSelect = (table: string) => {
    setIsEditingYAML(false)
    if (table.endsWith('.yml') || table.endsWith('.yaml')) {
      setSelectedTable(null)
      setCurrentFile(table)
      setCurrentSQL(YAML_FILES[table] || '# YAML file content')
      setFileType('yaml')
      setActiveTab('docs')
      setTerminalOutput(prev => [...prev, `> Opened ${table}`])
      return
    }
    setSelectedTable(table)
    setActiveTab('results')
  }

  const handleUploadSuccess = (tableName: string, rows: number, columns: string[]) => {
    setTerminalOutput(prev => [...prev, `> Uploaded ${rows} rows to table: ${tableName}`, `> Columns: ${columns.join(", ")}`])
    // Refresh tables list
    fetch("http://localhost:3001/api/tables").then(res => res.json()).then(data => setTables(data.tables || [])).catch(console.error)
    fetch("http://localhost:3001/api/mcp/table-sizes").then(res => res.json()).then(data => setTableSizes(data.tables || [])).catch(console.error)
    // Select the new table
    setSelectedTable(tableName)
  }

  const handleToolSelect = (tool: MCPTool) => {
    runMCPTool(tool.name)
  }

  return (
    <div className="h-screen flex flex-col bg-[#FAFBFC]">
      <Header onRunQuery={handleRunQuery} isLoading={isLoading} onUploadClick={() => setShowUploadModal(true)} mcpTools={MCP_TOOLS} onMCPToolSelect={(toolName) => runMCPTool(toolName)} />

      {/* NL2SQL Input */}
      <div className="h-14 bg-white border-b px-4 flex items-center gap-3">
        <span className="text-xs text-[#5E6C84] font-medium">Ask:</span>
        <input type="text" value={nlQuery} onChange={(e) => setNlQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNL2SQL()} placeholder='e.g., "show revenue by month" or "top customers"' className="flex-1 h-9 px-3 border border-gray-300 rounded text-xs outline-none focus:border-[#6B4FBB]" />
        <button onClick={handleNL2SQL} className="px-4 h-9 bg-[#6B4FBB] text-white text-xs rounded hover:bg-[#5A3FA8]">Generate SQL</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar selectedTable={selectedTable} onSelectTable={handleTableSelect} tables={tables} tableSizes={tableSizes} />
        <div className="flex-1 flex flex-col min-w-0">
          <EditorPanel sql={currentSQL} onSQLChange={setCurrentSQL} fileName={currentFile} fileType={fileType} />
          <div className="h-10 bg-[#F4F5F7] flex items-center border-b px-4">
            <button className={`px-4 py-1 text-xs font-medium border-b-2 ${activeTab === 'results' ? 'border-[#6B4FBB] text-[#6B4FBB]' : 'border-transparent text-[#5E6C84]'}`} onClick={() => setActiveTab('results')}>Results</button>
            <button className={`px-4 py-1 text-xs font-medium border-b-2 ${activeTab === 'lineage' ? 'border-[#6B4FBB] text-[#6B4FBB]' : 'border-transparent text-[#5E6C84]'}`} onClick={() => setActiveTab('lineage')}>Lineage</button>
            <button className={`px-4 py-1 text-xs font-medium border-b-2 ${activeTab === 'tools' ? 'border-[#6B4FBB] text-[#6B4FBB]' : 'border-transparent text-[#5E6C84]'}`} onClick={() => setActiveTab('tools')}>MCP Tools</button>
            <button className={`px-4 py-1 text-xs font-medium border-b-2 ${activeTab === 'docs' ? 'border-[#6B4FBB] text-[#6B4FBB]' : 'border-transparent text-[#5E6C84]'}`} onClick={() => setActiveTab('docs')}>{fileType === 'yaml' ? 'YAML' : 'Docs'}</button>
          </div>
          <div className="flex-1 overflow-hidden bg-white">
            {activeTab === 'results' && <ResultsPanel results={queryResults} isLoading={isLoading} />}
            {activeTab === 'lineage' && <ResultsPanel results={null} isLoading={false} lineage={lineage || undefined} />}
            {activeTab === 'tools' && (
              <div className="h-full overflow-auto bg-white p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-[#1A1D21] mb-1">MCP Tools</h3>
                  <p className="text-xs text-[#5E6C84]">Click a tool to execute it against your database</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MCP_TOOLS.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleToolSelect(tool)}
                      disabled={isLoading}
                      className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-[#6B4FBB] hover:bg-[#FAFBFC] transition-colors text-left"
                    >
                      <span className="text-xs font-medium text-[#6B4FBB] mb-1">{tool.name.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-[#5E6C84]">{tool.description}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#F4F5F7] rounded-lg">
                  <h4 className="text-xs font-medium text-[#1A1D21] mb-2">Available Tools (16)</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs text-[#5E6C84]">
                    <span>execute_query</span>
                    <span>list_databases</span>
                    <span>list_tables</span>
                    <span>list_columns</span>
                    <span>describe_table</span>
                    <span>get_table_sample</span>
                    <span>get_table_stats</span>
                    <span>get_table_sizes</span>
                    <span>list_views</span>
                    <span>get_lineage</span>
                    <span>get_metrics</span>
                    <span>get_monthly_revenue</span>
                    <span>get_customer_segments</span>
                    <span>get_product_performance</span>
                    <span>switch_database</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'docs' && (
              <div className="h-full overflow-auto bg-white p-4">
                {fileType === 'yaml' ? (
                  <div className="text-xs h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#EAB308]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
                        <span className="font-medium text-[#1A1D21]">{currentFile}</span>
                      </div>
                      <button onClick={() => setIsEditingYAML(!isEditingYAML)} className={`px-3 py-1.5 text-xs rounded ${isEditingYAML ? 'bg-[#00875A] text-white' : 'bg-[#6B4FBB] text-white hover:bg-[#5A3FA8]'}`}>{isEditingYAML ? 'Done' : 'Edit'}</button>
                    </div>
                    {isEditingYAML ? (
                      <textarea value={currentSQL} onChange={(e) => setCurrentSQL(e.target.value)} className="flex-1 bg-[#1A1E1E] text-[#D4D4D4] p-4 rounded font-mono text-xs resize-none outline-none" style={{ fontFamily: "'SF Mono', Monaco, monospace" }} />
                    ) : (
                      <pre className="flex-1 bg-[#1A1E1E] text-[#D4D4D4] p-4 rounded font-mono text-xs overflow-auto">{currentSQL}</pre>
                    )}
                  </div>
                ) : (
                  <div className="text-[#5E6C84]">
                    <h3 className="text-lg font-semibold text-[#1A1D21] mb-4">Documentation</h3>
                    <p className="mb-4">Click on a metric file (.yml) in the sidebar to view and edit YAML content.</p>
                    <h4 className="text-sm font-medium text-[#1A1D21] mb-2">Quick Links</h4>
                    <ul className="text-xs space-y-1">
                      <li>• <a href="#" className="text-[#6B4FBB] hover:underline">SQL Syntax Guide</a></li>
                      <li>• <a href="#" className="text-[#6B4FBB] hover:underline">dbt YAML Reference</a></li>
                      <li>• <a href="#" className="text-[#6B4FBB] hover:underline">DuckDB Functions</a></li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <SchemaPanel tableName={selectedTable} schema={tableSchema} />
      </div>
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} onUploadSuccess={handleUploadSuccess} />
      <TerminalBar expanded={terminalExpanded} onToggle={() => setTerminalExpanded(!terminalExpanded)} output={terminalOutput} />
    </div>
  )
}
