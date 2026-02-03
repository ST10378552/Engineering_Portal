import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './ActionList.css'

export default function ActionListView({ onEdit }) {
  const [actions, setActions] = useState([])
  const [filteredActions, setFilteredActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState(null) // State for the details toggle

  useEffect(() => {
    fetchActions()
  }, [])

  useEffect(() => {
    const results = actions.filter(item => 
      item.responsibility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.main_equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.plant_area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contractor?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredActions(results)
  }, [searchTerm, actions])

  async function fetchActions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('date_raised', { ascending: false })
    
    if (error) console.error('Error fetching actions:', error)
    else {
      setActions(data || [])
      setFilteredActions(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this record permanently? This cannot be undone.")) {
      const { error } = await supabase.from('actions').delete().eq('id', id)
      if (error) alert(error.message)
      else fetchActions()
    }
  }

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const getPriorityClass = (p) => (p === 'High' || p === 'Urgent' ? 'prio-high' : p === 'Medium' ? 'prio-medium' : 'prio-low')
  
  const getStatusClass = (s) => {
    if (s === 'Closed' || s === 'Complete') return 'status-complete'
    if (s === 'In Progress') return 'status-progress'
    if (s === 'On Hold') return 'status-hold'
    return 'status-open'
  }

  return (
    <div className="table-view-container animate-in">
      <div className="table-header-card search-header">
        <div className="header-left">
          <h2 className="table-main-title">Maintenance Review Board</h2>
          <p className="table-sub-title">Action Item Registry</p>
        </div>
        
        <div className="header-actions">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Filter by asset, person, or issue..." 
              className="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchActions} className="sync-btn">SYNC</button>
        </div>
      </div>

      <div className="table-outer-shell">
        <div className="scroll-container">
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Admin</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px' }}>Priority</th>
                <th style={{ width: '300px' }}>Issue & Asset</th>
                <th style={{ width: '200px' }}>Responsibility</th>
                <th style={{ width: '180px' }}>Target Date</th>
                <th style={{ width: '120px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="loading-cell">Syncing Registry...</td></tr>
              ) : filteredActions.map((item) => (
                <React.Fragment key={item.id}>
                  {/* MAIN ROW */}
                  <tr className={expandedRow === item.id ? 'row-expanded-active' : ''}>
                    <td className="admin-cell">
                      <div className="admin-btns-row">
                        <button className="mini-btn edit" onClick={() => onEdit(item)}>✏️</button>
                        <button className="mini-btn delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                      </div>
                    </td>
                    <td><span className={`badge ${getStatusClass(item.status)}`}>{item.status}</span></td>
                    <td><span className={`badge prio-badge ${getPriorityClass(item.priority)}`}>{item.priority}</span></td>
                    <td>
                      <p className="text-bold">{item.issue}</p>
                      <p className="text-tiny uppercase">{item.main_equipment} | {item.plant_area}</p>
                    </td>
                    <td><span className="resp-name-tag">{item.responsibility}</span></td>
                    <td className="text-bold">{item.target_date || 'N/A'}</td>
                    <td>
                      <button className="info-toggle-btn" onClick={() => toggleRow(item.id)}>
                        {expandedRow === item.id ? 'CLOSE' : 'MORE INFO'}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAIL PANE */}
                  {expandedRow === item.id && (
                    <tr className="expanded-detail-row">
                      <td colSpan="7">
                        <div className="detail-pane animate-in">
                          <div className="detail-grid">
                            
                            {/* Technical Details Column */}
                            <div className="detail-col">
                              <label>Maintenance Strategy</label>
                              <p className="detail-text">{item.action_details || 'No specific steps listed'}</p>
                              
                              <label>Learning Points</label>
                              <p className="detail-text highlight-blue">{item.learning_points || 'No learning points recorded'}</p>
                              
                              <label>Comments</label>
                              <p className="detail-text">{item.comments || 'No additional comments'}</p>
                            </div>
                            
                            {/* Status & Compliance Column */}
                            <div className="detail-col">
                              <label>Progress Report</label>
                              <p className="detail-text">{item.progress_report || 'Awaiting update'}</p>
                              
                              <label>Next Steps & Constraints</label>
                              <p className="detail-text highlight-red"><strong>Next:</strong> {item.next_steps || 'N/A'}</p>
                              <p className="detail-text"><strong>Constraints:</strong> {item.constraints || 'None'}</p>

                              <label>Training & Awareness</label>
                              <p className="detail-text">{item.training_and_awareness || 'N/A'}</p>
                            </div>

                            {/* Milestones & Files Column */}
                            <div className="detail-col">
                              <label>Timeline Milestones</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Date Raised:</span> {item.date_raised}</div>
                                <div className="ms-item"><span>Target Date:</span> {item.target_date || 'N/A'}</div>
                                <div className="ms-item"><span>Start Date:</span> {item.action_start_date || 'N/A'}</div>
                                <div className="ms-item"><span>Completion:</span> {item.action_completion_date || 'N/A'}</div>
                                <div className="ms-item"><span>Training Comp:</span> {item.training_comp_date || 'N/A'}</div>
                              </div>
                              
                              <label style={{marginTop: '1.5rem'}}>Documentation</label>
                              {item.attachment_url ? (
                                <a href={item.attachment_url} target="_blank" rel="noreferrer" className="attachment-link">
                                  📂 VIEW SYSTEM ATTACHMENT
                                </a>
                              ) : (
                                <p className="detail-text">No files attached</p>
                              )}
                              
                              <label style={{marginTop: '1.5rem'}}>Source Info</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Source:</span> {item.source}</div>
                                <div className="ms-item"><span>Discipline:</span> {item.discipline}</div>
                                <div className="ms-item"><span>Aspect:</span> {item.aspect}</div>
                                <div className="ms-item"><span>Vendor:</span> {item.contractor || 'Internal'}</div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}