import React, { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// ── Search HCP ──
function SearchHCP() {
  const [name, setName] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/agent`, {
        message: `Search interactions for ${name}`
      })
      setResults(res.data.response)
    } catch (e) {
      setResults('Error searching. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>🔍 Search HCP</div>
      <div style={s.cardDesc}>Find past interactions for any doctor</div>
      <div style={s.row}>
        <input style={s.inp} placeholder="Enter doctor name..."
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button style={s.btn} onClick={handleSearch} disabled={loading}>
          {loading ? '...' : 'Search'}
        </button>
      </div>
      {results && (
        <div style={s.resultBox}>
          <pre style={s.pre}>{results}</pre>
        </div>
      )}
    </div>
  )
}

// ── Edit Interaction ──
function EditInteraction() {
  const [id, setId] = useState('')
  const [field, setField] = useState('sentiment')
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleEdit = async () => {
    if (!id || !value) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/agent`, {
        message: `Edit interaction id ${id}, change ${field} to ${value}`
      })
      setResult(res.data.response)
    } catch (e) {
      setResult('Error editing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>✏️ Edit Interaction</div>
      <div style={s.cardDesc}>Update an existing interaction record</div>
      <div style={s.row}>
        <input style={{...s.inp, width: 80}} placeholder="ID"
          value={id} onChange={e => setId(e.target.value)} type="number" />
        <select style={s.inp} value={field} onChange={e => setField(e.target.value)}>
          <option value="sentiment">Sentiment</option>
          <option value="outcomes">Outcomes</option>
          <option value="follow_up_actions">Follow-up Actions</option>
          <option value="products_discussed">Products Discussed</option>
        </select>
        <input style={s.inp} placeholder="New value..."
          value={value} onChange={e => setValue(e.target.value)} />
        <button style={s.btn} onClick={handleEdit} disabled={loading}>
          {loading ? '...' : 'Update'}
        </button>
      </div>
      {result && <div style={s.resultBox}>{result}</div>}
    </div>
  )
}

// ── Schedule Follow-up ──
function ScheduleFollowup() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSchedule = async () => {
    if (!name || !date) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/agent`, {
        message: `Schedule follow-up with ${name} on ${date}, notes: ${notes}`
      })
      setResult(res.data.response)
    } catch (e) {
      setResult('Error scheduling. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>📅 Schedule Follow-up</div>
      <div style={s.cardDesc}>Set a follow-up visit with a doctor</div>
      <div style={s.row}>
        <input style={s.inp} placeholder="Doctor name..."
          value={name} onChange={e => setName(e.target.value)} />
        <input style={s.inp} type="date"
          value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div style={s.row}>
        <input style={{...s.inp, flex: 1}} placeholder="Notes (optional)..."
          value={notes} onChange={e => setNotes(e.target.value)} />
        <button style={s.btn} onClick={handleSchedule} disabled={loading}>
          {loading ? '...' : 'Schedule'}
        </button>
      </div>
      {result && <div style={s.resultBox}>{result}</div>}
    </div>
  )
}

// ── Recommend Next Action ──
function RecommendAction() {
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRecommend = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/agent`, {
        message: `What should I do next with ${name}?`
      })
      setResult(res.data.response)
    } catch (e) {
      setResult('Error getting recommendation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.card}>
      <div style={s.cardTitle}>🤖 Recommend Next Action</div>
      <div style={s.cardDesc}>AI suggests what to do next with a doctor</div>
      <div style={s.row}>
        <input style={s.inp} placeholder="Enter doctor name..."
          value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRecommend()} />
        <button style={s.btn} onClick={handleRecommend} disabled={loading}>
          {loading ? '...' : 'Recommend'}
        </button>
      </div>
      {result && <div style={s.resultBox}>{result}</div>}
    </div>
  )
}

// ── Main ToolsPanel ──
export default function ToolsPanel() {
  const [activeTab, setActiveTab] = useState('search')

  const tabs = [
    { id: 'search', label: '🔍 Search HCP' },
    { id: 'edit', label: '✏️ Edit' },
    { id: 'schedule', label: '📅 Schedule' },
    { id: 'recommend', label: '🤖 Recommend' },
  ]

  return (
    <div style={s.wrapper}>
      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map(t => (
          <div key={t.id} style={{
            ...s.tab,
            ...(activeTab === t.id ? s.tabActive : {})
          }} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div style={s.tabContent}>
        {activeTab === 'search' && <SearchHCP />}
        {activeTab === 'edit' && <EditInteraction />}
        {activeTab === 'schedule' && <ScheduleFollowup />}
        {activeTab === 'recommend' && <RecommendAction />}
      </div>
    </div>
  )
}

// ── Styles ──
const s = {
  wrapper: {
    maxWidth: 1100, margin: '8px auto 0',
    background: '#fff', borderRadius: 12,
    border: '0.5px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  tabBar: {
    display: 'flex', background: '#f8fafc',
    borderBottom: '0.5px solid #e2e8f0',
  },
  tab: {
    padding: '12px 20px', fontSize: 13,
    color: '#64748b', cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontWeight: 500, transition: 'all 0.15s',
  },
  tabActive: {
    color: '#1a56a0',
    borderBottom: '2px solid #1a56a0',
    background: '#fff',
  },
  tabContent: { padding: 20 },
  card: {},
  cardTitle: {
    fontSize: 15, fontWeight: 600,
    color: '#1a202c', marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12, color: '#64748b', marginBottom: 14,
  },
  row: {
    display: 'flex', gap: 10,
    alignItems: 'center', marginBottom: 10,
    flexWrap: 'wrap',
  },
  inp: {
    flex: 1, fontSize: 13, padding: '8px 12px',
    border: '0.5px solid #cbd5e1', borderRadius: 8,
    outline: 'none', background: '#fff',
    color: '#1a202c', minWidth: 120,
    fontFamily: "'Inter', sans-serif",
  },
  btn: {
    fontSize: 13, padding: '8px 20px',
    borderRadius: 8, border: 'none',
    background: '#1a56a0', color: '#fff',
    cursor: 'pointer', fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  resultBox: {
    background: '#f0f7ff',
    border: '0.5px solid #B5D4F4',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 13, color: '#1a202c',
    marginTop: 8,
  },
  pre: {
    margin: 0, fontFamily: "'Inter', sans-serif",
    fontSize: 13, whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
}