'use client'

import { useState } from 'react'

interface SidebarProps {
  selectedTable: string | null
  onSelectTable: (table: string) => void
  tables?: string[]
  tableSizes?: { table: string; row_count: number; size_bytes: number }[]
}

interface FileNode {
  name: string
  type: 'folder' | 'file' | 'model' | 'metric'
  children?: FileNode[]
}

const fileTree: FileNode[] = [
  {
    name: 'models',
    type: 'folder',
    children: [
      {
        name: 'marts',
        type: 'folder',
        children: [
          { name: 'fct_orders.sql', type: 'model' },
          { name: 'dim_customers.sql', type: 'model' },
          { name: 'fct_products.sql', type: 'model' },
        ]
      },
      {
        name: 'staging',
        type: 'folder',
        children: [
          { name: 'stg_orders.sql', type: 'model' },
          { name: 'stg_customers.sql', type: 'model' },
        ]
      },
      {
        name: 'intermediate',
        type: 'folder',
        children: [
          { name: 'int_order_items.sql', type: 'model' },
        ]
      },
    ]
  },
  {
    name: 'metrics',
    type: 'folder',
    children: [
      { name: 'sem_order_sales.yml', type: 'metric' },
      { name: 'sem_customers.yml', type: 'metric' },
    ]
  },
  {
    name: 'tests',
    type: 'folder',
    children: [
      { name: 'unique_orders.sql', type: 'file' },
      { name: 'not_null_customers.sql', type: 'file' },
    ]
  },
]

export default function Sidebar({ selectedTable, onSelectTable, tables = [], tableSizes = [] }: SidebarProps) {
  const [expanded, setExpanded] = useState<string[]>(['models', 'metrics', 'tests', 'marts', 'staging'])
  const [selectedFile, setSelectedFile] = useState<string | null>('fct_orders.sql')

  const toggleFolder = (name: string) => {
    setExpanded(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return (
          <svg className="w-4 h-4 text-[#5E6C84]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        )
      case 'model':
        return (
          <svg className="w-4 h-4 text-[#0D9488]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        )
      case 'metric':
        return (
          <svg className="w-4 h-4 text-[#EAB308]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-[#5E6C84]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const handleFileClick = (node: FileNode) => {
    setSelectedFile(node.name)
    onSelectTable(node.name)
  }

  const renderNode = (node: FileNode, depth = 0) => {
    const isExpanded = expanded.includes(node.name)
    const isFolder = node.type === 'folder'
    const isActive = selectedFile === node.name

    return (
      <div key={node.name}>
        <div
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer rounded transition-colors ${
            isActive
              ? 'bg-[#6B4FBB] text-white'
              : 'hover:bg-gray-100 text-[#1A1D21]'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.name)
            } else {
              handleFileClick(node)
            }
          }}
        >
          {isFolder && (
            <span className="text-[10px] text-[#5E6C84]">
              {isExpanded ? '▼' : '▶'}
            </span>
          )}
          {getIcon(node.type)}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {isFolder && isExpanded && node.children?.map(child => renderNode(child, depth + 1))}
      </div>
    )
  }

  const getTableRowCount = (tableName: string): number | null => {
    const found = tableSizes.find(t => t.table === tableName)
    return found ? found.row_count : null
  }

  const formatRowCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  return (
    <div className="w-60 bg-[#F4F5F7] border-r flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b">
        <span className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">
          Explorer
        </span>
        <button className="text-[#5E6C84] hover:text-[#1A1D21]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto py-2">
        {fileTree.map(node => renderNode(node))}
      </div>

      {/* Database Tables Section */}
      <div className="border-t">
        <div className="p-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#5E6C84] uppercase tracking-wide">
            Tables
          </span>
          <span className="text-xs text-[#5E6C84]">{tables.length}</span>
        </div>
        <div className="px-2 pb-2">
          {(tables.length > 0 ? tables : ['orders', 'customers', 'products', 'order_items', 'campaigns']).map(table => {
            const rowCount = getTableRowCount(table)
            return (
              <div
                key={table}
                onClick={() => onSelectTable(table)}
                className={`flex items-center justify-between py-1 px-2 cursor-pointer rounded transition-colors ${
                  selectedTable === table
                    ? 'bg-[#6B4FBB] text-white'
                    : 'hover:bg-gray-100 text-[#1A1D21]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-sm">{table}</span>
                </div>
                {rowCount !== null && (
                  <span className={`text-xs ${selectedTable === table ? 'text-white/70' : 'text-[#5E6C84]'}`}>
                    {formatRowCount(rowCount)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
