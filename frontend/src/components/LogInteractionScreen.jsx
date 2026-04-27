import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import {
  updateFormField,
  setFormData,
  addChatMessage,
  setExtractedData,
  setLoading,
  resetForm,
} from '../store/interactionSlice'

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export default function LogInteractionScreen() {
  const dispatch = useDispatch()
  const { formData, chatMessages, extractedData, loading } = useSelector(
    (s) => s.interaction
  )
  const [chatInput, setChatInput] = useState('')
  const [saved, setSaved] = useState(false)

  const handleField = (field, value) => {
    dispatch(updateFormField({ field, value }))
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    dispatch(addChatMessage({ role: 'user', text: userMsg }))
    dispatch(setLoading(true))
    try {
      const res = await axios.post(`${API}/chat`, { message: userMsg })
      const extracted = res.data.extracted
      dispatch(setExtractedData(extracted))
      dispatch(addChatMessage({ role: 'ai', text: 'I extracted the following. Please confirm:', data: extracted }))
    } catch (e) {
      dispatch(addChatMessage({ role: 'ai', text: 'Sorry, something went wrong. Please try again.' }))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handleConfirm = () => {
    if (extractedData) {
      dispatch(setFormData(extractedData))
      dispatch(addChatMessage({ role: 'ai', text: '✅ Form filled! Review and click Save Interaction.' }))
      dispatch(setExtractedData(null))
    }
  }

  const handleSave = async () => {
    if (!formData.hcp_name) { alert('Please enter HCP Name!'); return }
    try {
      dispatch(setLoading(true))
      await axios.post(`${API}/interactions`, formData)
      setSaved(true)
      setTimeout(() => { setSaved(false); dispatch(resetForm()) }, 2500)
    } catch (e) {
      alert('Error saving interaction!')
    } finally {
      dispatch(setLoading(false))
    }
  }

  const sentimentConfig = {
    positive: { label: '😊 Positive', activeStyle: { background: '#E1F5EE', borderColor: '#1D9E75', color: '#085041' } },
    neutral:  { label: '😐 Neutral',  activeStyle: { background: '#E6F1FB', borderColor: '#1a56a0', color: '#0C447C' } },
    negative: { label: '😟 Negative', activeStyle: { background: '#FCEBEB', borderColor: '#E24B4A', color: '#791F1F' } },
  }

  const suggestedFollowups = [
    'Schedule follow-up in 2 weeks',
    'Share Product Enrollment Form PDF',
    'Discuss Phase II dosage schedule',
  ]

  return (
    <div style={s.page}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={s.screen}>
        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.headerDot} />
            <span style={s.headerTitle}>Log HCP Interaction</span>
          </div>
          <span style={s.headerBadge}>HCP Module</span>
        </div>

        <div style={s.body}>
          {/* ── LEFT: Form ── */}
          <div style={s.left}>
            <div style={s.sectionLabel}>Interaction Details</div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>HCP Name *</label>
                <input style={s.inp} placeholder="Search or select HCP..."
                  value={formData.hcp_name}
                  onChange={e => handleField('hcp_name', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Interaction Type</label>
                <select style={s.inp} value={formData.interaction_type}
                  onChange={e => handleField('interaction_type', e.target.value)}>
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Date</label>
                <input style={s.inp} type="date"
                  value={formData.interaction_date}
                  onChange={e => handleField('interaction_date', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Products Discussed</label>
                <input style={s.inp} placeholder="e.g. Cardivax 10mg"
                  value={formData.products_discussed}
                  onChange={e => handleField('products_discussed', e.target.value)} />
              </div>
            </div>

            {/* Sentiment Pills */}
            <div style={s.field}>
              <label style={s.label}>HCP Sentiment</label>
              <div style={s.sentRow}>
                {Object.entries(sentimentConfig).map(([key, cfg]) => (
                  <div key={key}
                    onClick={() => handleField('sentiment', key)}
                    style={{
                      ...s.sentPill,
                      ...(formData.sentiment === key ? cfg.activeStyle : {})
                    }}>
                    {cfg.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Outcomes</label>
              <textarea style={s.textarea} rows={3}
                placeholder="Key outcomes or agreements..."
                value={formData.outcomes}
                onChange={e => handleField('outcomes', e.target.value)} />
            </div>

            <div style={s.field}>
              <label style={s.label}>Follow-up Actions</label>
              <textarea style={s.textarea} rows={2}
                placeholder="Next steps or tasks..."
                value={formData.follow_up_actions}
                onChange={e => handleField('follow_up_actions', e.target.value)} />
            </div>

            {/* AI Suggested Follow-ups */}
            <div style={s.aiSuggest}>
              <div style={s.aiSuggestTitle}>✨ AI Suggested Follow-ups</div>
              {suggestedFollowups.map((item, i) => (
                <div key={i} style={s.aiSuggestItem}
                  onClick={() => handleField('follow_up_actions', item)}>
                  → {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Chat ── */}
          <div style={s.right}>
            <div style={s.aiBadge}>
              <div style={s.aiDot} />
              AI Assistant — Log via chat
            </div>

            <div style={s.chatArea}>
              {chatMessages.length === 0 && (
                <div style={s.bubbleAI}>
                  Hi! Describe your HCP interaction and I'll fill the form for you automatically. 👋
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                  {msg.role === 'user'
                    ? <div style={s.bubbleUser}>{msg.text}</div>
                    : <div style={s.bubbleAI}>
                        {msg.text}
                        {msg.data && (
                          <div style={s.extractedCard}>
                            {Object.entries(msg.data).map(([k, v]) =>
                              v ? (
                                <div key={k} style={s.cardRow}>
                                  <span style={s.cardKey}>{k.replace(/_/g, ' ')}</span>
                                  <span style={s.cardVal}>{String(v)}</span>
                                </div>
                              ) : null
                            )}
                            <div style={s.confirmRow}>
                              <button style={s.btnConfirm} onClick={handleConfirm}>✓ Fill Form</button>
                              <button style={s.btnDiscard} onClick={() => dispatch(setExtractedData(null))}>✗ Discard</button>
                            </div>
                          </div>
                        )}
                      </div>
                  }
                </div>
              ))}
              {loading && <div style={s.bubbleAI}>Thinking... ⏳</div>}
            </div>

            <div style={s.chatInputRow}>
              <textarea style={s.chatInp} rows={2}
                placeholder="Describe your interaction..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChat()
                  }
                }} />
              <button style={s.btnSend} onClick={handleChat} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          {saved && (
            <span style={{ color: '#1D9E75', fontWeight: 500, fontSize: 13 }}>
              ✅ Interaction saved successfully!
            </span>
          )}
          <button style={s.btnSave} onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Interaction'}
          </button>
          <button style={s.btnCancel} onClick={() => dispatch(resetForm())}>
            Cancel
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#888' }}>
            * Required fields
          </span>
        </div>
      </div>
    </div>
  )
}

// ── All Styles ──
const s = {
  page: {
    fontFamily: "'Inter', sans-serif",
    background: '#f0f4f8',
    minHeight: '80vh',
    padding: '24px 16px',
  },
  screen: {
    background: '#fff',
    borderRadius: 12,
    border: '0.5px solid #e2e8f0',
    overflow: 'hidden',
    maxWidth: 1100,
    margin: '0 auto',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  header: {
    background: '#1a56a0',
    padding: '13px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerDot: { width: 10, height: 10, borderRadius: '50%', background: '#5DCAA5' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: 500 },
  headerBadge: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: 11,
    padding: '3px 10px',
    borderRadius: 20,
    border: '0.5px solid rgba(255,255,255,0.3)',
  },
  body: { display: 'grid', gridTemplateColumns: '1fr 320px', minHeight: 520 },
  left: { padding: 22, borderRight: '0.5px solid #e8edf3', overflowY: 'auto' },
  right: { padding: 16, background: '#f7f9fc', display: 'flex', flexDirection: 'column' },
  sectionLabel: {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
    color: '#94a3b8', textTransform: 'uppercase', marginBottom: 14,
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 500, color: '#4a5568' },
  inp: {
    fontSize: 13, padding: '8px 12px',
    border: '0.5px solid #cbd5e1',
    borderRadius: 8, outline: 'none',
    background: '#fff', color: '#1a202c',
    width: '100%',
    transition: 'border-color 0.15s',
  },
  textarea: {
    fontSize: 13, padding: '8px 12px',
    border: '0.5px solid #cbd5e1',
    borderRadius: 8, outline: 'none',
    resize: 'none', width: '100%',
    fontFamily: "'Inter', sans-serif",
    color: '#1a202c', background: '#fff',
  },
  sentRow: { display: 'flex', gap: 8 },
  sentPill: {
    fontSize: 12, padding: '7px 14px',
    borderRadius: 8,
    border: '0.5px solid #e2e8f0',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  aiSuggest: {
    background: '#f0f7ff',
    borderLeft: '3px solid #1a56a0',
    borderRadius: '0 8px 8px 0',
    padding: '6px 10px',
    marginTop: 0,
  },
  aiSuggestTitle: {
    fontSize: 11, fontWeight: 500,
    color: '#1a56a0', marginBottom: 6,
  },
  aiSuggestItem: {
    fontSize: 12, color: '#185FA5',
    padding: '3px 0', cursor: 'pointer',
  },
  aiBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 500, color: '#1a56a0',
    background: '#E6F1FB', padding: '5px 12px',
    borderRadius: 20, marginBottom: 12, width: 'fit-content',
  },
  aiDot: { width: 8, height: 8, borderRadius: '50%', background: '#1D9E75' },
  chatArea: {
    flex: 1, overflowY: 'auto',
    display: 'flex', flexDirection: 'column',
    gap: 10, marginBottom: 10,
    minHeight: 250, maxHeight: 340,
  },
  bubbleAI: {
    background: '#fff', border: '0.5px solid #e2e8f0',
    borderRadius: '0 10px 10px 10px',
    padding: '9px 12px', fontSize: 12,
    color: '#2d3748', maxWidth: '96%',
  },
  bubbleUser: {
    background: '#1a56a0', color: '#fff',
    borderRadius: '10px 0 10px 10px',
    padding: '9px 12px', fontSize: 12,
    maxWidth: '96%', alignSelf: 'flex-end',
  },
  extractedCard: {
    background: '#f0f7ff', border: '0.5px solid #B5D4F4',
    borderRadius: 8, padding: '8px 10px', marginTop: 8,
  },
  cardRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '3px 0', borderBottom: '0.5px solid #d4e8fa',
    fontSize: 11,
  },
  cardKey: { color: '#1a56a0', fontWeight: 500, textTransform: 'capitalize' },
  cardVal: { color: '#2d3748', textAlign: 'right', maxWidth: '58%' },
  confirmRow: { display: 'flex', gap: 8, marginTop: 8 },
  btnConfirm: {
    fontSize: 12, padding: '5px 14px', borderRadius: 6,
    border: '0.5px solid #1D9E75', color: '#085041',
    background: '#E1F5EE', cursor: 'pointer', fontWeight: 500,
  },
  btnDiscard: {
    fontSize: 12, padding: '5px 14px', borderRadius: 6,
    border: '0.5px solid #ccc', color: '#666',
    background: '#fff', cursor: 'pointer',
  },
  chatInputRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  chatInp: {
    flex: 1, fontSize: 12, padding: '8px 10px',
    border: '0.5px solid #cbd5e1', borderRadius: 8,
    resize: 'none', fontFamily: "'Inter', sans-serif",
    background: '#fff', color: '#1a202c',
  },
  btnSend: {
    fontSize: 12, padding: '8px 16px', borderRadius: 8,
    border: 'none', background: '#1a56a0',
    color: '#fff', cursor: 'pointer', fontWeight: 500,
  },
  footer: {
    padding: '13px 20px', borderTop: '0.5px solid #e8edf3',
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#f8fafc',
  },
  btnSave: {
    fontSize: 13, padding: '9px 24px', borderRadius: 8,
    border: 'none', background: '#1a56a0',
    color: '#fff', cursor: 'pointer', fontWeight: 500,
  },
  btnCancel: {
    fontSize: 13, padding: '9px 18px', borderRadius: 8,
    border: '0.5px solid #cbd5e1', color: '#64748b',
    background: '#fff', cursor: 'pointer',
  },
}