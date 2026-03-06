'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts'

interface QueryResult {
  columns: string[]
  data: Record<string, unknown>[]
  rowCount: number
}

interface LineageNode {
  id: string
  label: string
  type: 'source' | 'model' | 'metric'
  x: number
  y: number
}

interface LineageEdge {
  from: string
  to: string
}

interface ResultsPanelProps {
  results: QueryResult | null
  isLoading: boolean
  lineage?: { nodes: LineageNode[]; edges: LineageEdge[] }
}

const COLORS = ['#6B4FBB', '#0D9488', '#EAB308', '#EF4444', '#3B82F6', '#EC4899', '#10B981', '#F59E0B']

export default function ResultsPanel({ results, isLoading, lineage }: ResultsPanelProps) {
  const [viewMode, setViewMode] = useState<'table' | 'bar' | 'pie' | 'line' | 'area'>('table')
  const [fullscreen, setFullscreen] = useState(false)

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-[#6B4FBB] mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-[#5E6C84]">Running query...</span>
        </div>
      </div>
    )
  }

  if (!results && lineage) {
    return <LineageView lineage={lineage} />
  }

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-[#5E6C84]">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Run a query to see results</p>
        </div>
      </div>
    )
  }

  if (fullscreen && viewMode !== 'table') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="h-14 bg-[#F4F5F7] flex items-center justify-between px-6 border-b">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-[#1A1D21]">Chart View</span>
            <span className="text-xs text-[#5E6C84]">{results.rowCount} rows</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('table')} className="px-4 py-2 text-xs bg-gray-100 text-[#1A1D21] rounded hover:bg-gray-200">Table</button>
            <button onClick={() => setFullscreen(false)} className="px-4 py-2 text-xs bg-[#6B4FBB] text-white rounded hover:bg-[#5A3FA8]">Close</button>
          </div>
        </div>
        <div className="flex-1 p-6 bg-white">
          {viewMode === 'bar' && <BarChartView results={results} fullscreen />}
          {viewMode === 'pie' && <PieChartView results={results} fullscreen />}
          {viewMode === 'line' && <LineChartView results={results} fullscreen />}
          {viewMode === 'area' && <AreaChartView results={results} fullscreen />}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-10 bg-[#F4F5F7] flex items-center border-b px-4 justify-between">
        <div className="flex gap-1">
          <ViewButton active={viewMode === 'table'} onClick={() => setViewMode('table')}>Table</ViewButton>
          <ViewButton active={viewMode === 'bar'} onClick={() => setViewMode('bar')}>Bar</ViewButton>
          <ViewButton active={viewMode === 'pie'} onClick={() => setViewMode('pie')}>Pie</ViewButton>
          <ViewButton active={viewMode === 'line'} onClick={() => setViewMode('line')}>Line</ViewButton>
          <ViewButton active={viewMode === 'area'} onClick={() => setViewMode('area')}>Area</ViewButton>
        </div>
        <div className="text-xs text-[#5E6C84]">{results.rowCount} rows</div>
      </div>

      <div className={`flex-1 overflow-auto bg-white p-4 ${viewMode !== 'table' ? 'cursor-pointer hover:bg-gray-50' : ''}`} onClick={() => viewMode !== 'table' && setFullscreen(true)}>
        {viewMode === 'table' && <TableView results={results} />}
        {viewMode === 'bar' && <BarChartView results={results} />}
        {viewMode === 'pie' && <PieChartView results={results} />}
        {viewMode === 'line' && <LineChartView results={results} />}
        {viewMode === 'area' && <AreaChartView results={results} />}
        {viewMode !== 'table' && <div className="text-center text-xs text-gray-400 mt-2">Click chart for fullscreen</div>}
      </div>
    </div>
  )
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${active ? 'bg-[#6B4FBB] text-white' : 'text-[#5E6C84] hover:bg-gray-200'}`}>
      {children}
    </button>
  )
}

function TableView({ results }: { results: QueryResult }) {
  return (
    <table className="w-full text-xs results-table">
      <thead className="sticky top-0">
        <tr>{results.columns.map(col => <th key={col} className="text-left px-4 py-3 font-medium text-[#5E6C84] border-b bg-[#F4F5F7]">{col}</th>)}</tr>
      </thead>
      <tbody>
        {results.data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {results.columns.map(col => (
              <td key={col} className="px-4 py-2 border-b border-gray-100">
                {typeof row[col] === 'number' && col.toLowerCase().includes('revenue') ? `$${row[col].toLocaleString()}` : row[col]?.toLocaleString() ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BarChartView({ results, fullscreen = false }: { results: QueryResult; fullscreen?: boolean }) {
  if (results.columns.length < 2) return <div className="text-[#5E6C84]">Need at least 2 columns</div>
  const xKey = results.columns[0]
  const dataKeys = results.columns.slice(1).filter(col => typeof results.data[0]?.[col] === 'number')

  return (
    <ResponsiveContainer width="100%" height={fullscreen ? "85%" : "100%"}>
      <BarChart data={results.data} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip contentStyle={{ background: '#1A1D21', border: 'none', borderRadius: 8, color: '#fff' }} />
        <Legend />
        {dataKeys.map((key, i) => <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  )
}

function PieChartView({ results, fullscreen = false }: { results: QueryResult; fullscreen?: boolean }) {
  if (results.columns.length < 2) return <div className="text-[#5E6C84]">Need at least 2 columns</div>
  const nameKey = results.columns[0]
  const valueKey = results.columns.find(col => typeof results.data[0]?.[col] === 'number') || results.columns[1]
  const data = results.data.map((row) => ({ name: row[nameKey], value: Number(row[valueKey]) || 0 }))
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <ResponsiveContainer width="100%" height={fullscreen ? "85%" : "100%"}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`} outerRadius={fullscreen ? 350 : 180} fill="#8884d8" dataKey="value" minAngle={15}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#1A1D21', border: 'none', borderRadius: 8, color: '#fff' }} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

function LineChartView({ results, fullscreen = false }: { results: QueryResult; fullscreen?: boolean }) {
  if (results.columns.length < 2) return <div className="text-[#5E6C84]">Need at least 2 columns</div>
  const xKey = results.columns[0]
  const dataKeys = results.columns.slice(1).filter(col => typeof results.data[0]?.[col] === 'number')

  return (
    <ResponsiveContainer width="100%" height={fullscreen ? "85%" : "100%"}>
      <LineChart data={results.data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip contentStyle={{ background: '#1A1D21', border: 'none', borderRadius: 8, color: '#fff' }} />
        <Legend />
        {dataKeys.map((key, i) => <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />)}
      </LineChart>
    </ResponsiveContainer>
  )
}

function AreaChartView({ results, fullscreen = false }: { results: QueryResult; fullscreen?: boolean }) {
  if (results.columns.length < 2) return <div className="text-[#5E6C84]">Need at least 2 columns</div>
  const xKey = results.columns[0]
  const dataKeys = results.columns.slice(1).filter(col => typeof results.data[0]?.[col] === 'number')

  return (
    <ResponsiveContainer width="100%" height={fullscreen ? "85%" : "100%"}>
      <AreaChart data={results.data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
        <Tooltip contentStyle={{ background: '#1A1D21', border: 'none', borderRadius: 8, color: '#fff' }} />
        <Legend />
        {dataKeys.map((key, i) => <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.4} strokeWidth={2} />)}
      </AreaChart>
    </ResponsiveContainer>
  )
}

function LineageView({ lineage }: { lineage: { nodes: LineageNode[]; edges: LineageEdge[] } }) {
  const nodeColors: Record<string, string> = { source: '#6B7280', model: '#0D9488', metric: '#EAB308' }
  const nodeWidth = 130, nodeHeight = 36

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center gap-6 p-3 border-b text-xs">
        <span className="text-[#5E6C84]">Node Type:</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#6B7280]"></span> Source</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#0D9488]"></span> Model</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#EAB308]"></span> Metric</span>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <svg viewBox="0 0 800 220" className="w-full h-full">
          {((lineage.edges) || []).map((edge, i) => {
            const from = lineage.nodes.find(n => n.id === edge.from)
            const to = lineage.nodes.find(n => n.id === edge.to)
            if (!from || !to) return null
            return <line key={i} x1={from.x + nodeWidth} y1={from.y + nodeHeight/2} x2={to.x} y2={to.y + nodeHeight/2} stroke="#CBD5E1" strokeWidth={2} />
          })}
          {((lineage.nodes) || []).map(node => (
            <g key={node.id}>
              <rect x={node.x} y={node.y} width={nodeWidth} height={nodeHeight} rx={6} fill={nodeColors[node.type]} />
              <text x={node.x + nodeWidth/2} y={node.y + nodeHeight/2 + 4} textAnchor="middle" fill="white" fontSize={12}>{node.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
