import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './DailyLogList.css'

export default function DailyLogListView({ onEdit }) {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    const results = logs.filter(log => 
      log.log_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.discipline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.daily_log_details?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLogs(results)
  }, [searchTerm, logs])

  async function fetchLogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching logs:', error)
    else {
      setLogs(data || [])
      setFilteredLogs(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this log entry? This action is permanent.")) {
      const { error } = await supabase.from('daily_logs').delete().eq('id', id)
      if (error) alert(error.message)
      else fetchLogs()
    }
  }

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="table-view-container animate-in">
      <div className="table-header-card search-header">
        <div className="header-left">
          <h2 className="table-main-title">Operations Review Board</h2>
          <p className="table-sub-title">Full Engineering Activity History</p>
        </div>
        <div className="header-actions">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Search history..." 
              className="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchLogs} className="sync-btn">SYNC</button>
        </div>
      </div>

      <div className="table-outer-shell">
        <div className="scroll-container">
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Action</th>
                <th style={{ width: '150px' }}>Date / Staff</th>
                <th style={{ width: '150px' }}>Dept / Disc</th>
                <th style={{ width: '200px' }}>Primary Status</th>
                <th style={{ width: '200px' }}>High-Level Metrics</th>
                <th style={{ width: '120px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-cell">Loading Ops History...</td></tr>
              ) : filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className={log.safety_incidents ? 'row-red-alert' : ''}>
                    <td className="admin-cell">
                      <div className="admin-btns-row">
                        <button className="mini-btn edit" onClick={() => onEdit(log)}>✏️</button>
                        <button className="mini-btn delete" onClick={() => handleDelete(log.id)}>🗑️</button>
                      </div>
                    </td>
                    <td>
                      <p className="text-bold">{new Date(log.created_at).toLocaleDateString()}</p>
                      <p className="text-tiny uppercase">{log.log_by}</p>
                    </td>
                    <td>
                      <p className="text-bold">{log.department}</p>
                      <p className="discipline-tag">{log.discipline}</p>
                    </td>
                    <td>
                      <div className="compliance-stack">
                        <span className={`mini-badge ${log.safety_incidents ? 'danger' : 'success'}`}>
                          Safety: {log.safety_incidents ? 'INCIDENT' : 'CLEAR'}
                        </span>
                        <span className={`mini-badge ${log.all_work_day_completed ? 'success' : 'neutral'}`}>
                          Tasks: {log.all_work_day_completed ? 'COMPLETE' : 'PENDING'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="metrics-summary">
                        <p>Downtime: <strong>{log.downtime_hours}h</strong></p>
                        <p>Tasks: <strong>{log.planned_tasks_count}P / {log.reactive_tasks_count}R</strong></p>
                      </div>
                    </td>
                    <td>
                      <button className="info-toggle-btn" onClick={() => toggleRow(log.id)}>
                        {expandedRow === log.id ? 'CLOSE' : 'MORE INFO'}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED SECTION WITH ALL COLUMNS */}
                  {expandedRow === log.id && (
                    <tr className="expanded-detail-row">
                      <td colSpan="6">
                        <div className="detail-pane animate-in">
                          <div className="detail-grid">
                            
                            {/* Technical Metrics */}
                            <div className="detail-col">
                              <label>Maintenance Performance</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Breakdown Hours:</span> {log.breakdown_hours}h</div>
                                <div className="ms-item"><span>Downtime Hours:</span> {log.downtime_hours}h</div>
                                <div className="ms-item"><span>Planned Tasks:</span> {log.planned_tasks_count}</div>
                                <div className="ms-item"><span>Reactive Tasks:</span> {log.reactive_tasks_count}</div>
                                <div className="ms-item"><span>Preventative Tasks:</span> {log.preventative_tasks_count}</div>
                              </div>
                              
                              <label style={{marginTop: '1.5rem'}}>Narrative Details</label>
                              <p className="detail-text"><strong>General:</strong> {log.daily_log_details || 'N/A'}</p>
                              <p className="detail-text"><strong>Breakdowns:</strong> {log.breakdown_details || 'N/A'}</p>
                            </div>

                            {/* Safety & Rework */}
                            <div className="detail-col">
                              <label>Safety & Quality</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Safety Ops Count:</span> {log.safety_ops_count}</div>
                                <div className="ms-item"><span>5S Completed:</span> {log.daily_5s_completed ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>Permits Validated:</span> {log.all_permits_signed_off ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>Training Done:</span> {log.any_training_completed ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>Rework Reported:</span> {log.any_rework_reported ? 'Yes' : 'No'}</div>
                              </div>
                              
                              <label style={{marginTop: '1.5rem'}}>Incident & Rework Logs</label>
                              <p className="detail-text highlight-red"><strong>Safety:</strong> {log.safety_incident_details || 'None'}</p>
                              <p className="detail-text"><strong>Rework:</strong> {log.rework_details || 'None'}</p>
                            </div>

                            {/* Compliance & Planning */}
                            <div className="detail-col">
                              <label>Admin & Financial Compliance</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>MRs Closed:</span> {log.all_mr_closed ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>PRs Generated:</span> {log.all_pr_generated ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>Receipting Up-to-date:</span> {log.is_receipting_up_to_date ? 'Yes' : 'No'}</div>
                                <div className="ms-item"><span>Accruals Updated:</span> {log.is_accruals_list_updated ? 'Yes' : 'No'}</div>
                              </div>

                              <label style={{marginTop: '1.5rem'}}>Future Planning</label>
                              <p className="detail-text highlight-blue"><strong>Next Day Plan:</strong> {log.planned_work_next_day || 'No plan entered'}</p>
                              <p className="detail-text"><strong>Unfinished Work:</strong> {log.work_not_completed_details || 'None'}</p>
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