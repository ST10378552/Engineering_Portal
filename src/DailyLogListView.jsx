import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './DailyLogList.css'

export default function DailyLogListView({ onEdit }) {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  const totals = {
    breakdown: filteredLogs.reduce((acc, curr) => acc + (Number(curr.breakdown_hours) || 0), 0),
    incidents: filteredLogs.filter(l => l.safety_incidents === true).length,
    tasks: filteredLogs.reduce((acc, curr) => acc + (Number(curr.planned_tasks_count) || 0), 0)
  }

  return (
    <div className="table-view-container animate-in">
      {/* Summary Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <label>Total Logs</label>
          <div className="stat-value">{filteredLogs.length}</div>
        </div>
        <div className="stat-card urgent">
          <label>Safety Incidents</label>
          <div className="stat-value">{totals.incidents}</div>
        </div>
        <div className="stat-card progress">
          <label>Total Breakdown Hrs</label>
          <div className="stat-value">{totals.breakdown}h</div>
        </div>
        <div className="stat-card complete">
          <label>Planned Tasks Done</label>
          <div className="stat-value">{totals.tasks}</div>
        </div>
      </div>

      <div className="table-header-card search-header">
        <div className="header-left">
          <h2 className="table-main-title">Operations Review Board</h2>
          <p className="table-sub-title">Daily Activity & Safety Registry</p>
        </div>
        
        <div className="header-actions">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search staff, dept, or details..." 
              className="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchLogs} className="sync-btn"><span>🔄</span> Sync</button>
        </div>
      </div>

      <div className="table-outer-shell">
        <div className="scroll-container">
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Admin</th>
                <th style={{ width: '150px' }}>Date / Logged By</th>
                <th style={{ width: '150px' }}>Dept / Disc</th>
                <th style={{ width: '200px' }}>Safety & Compliance</th>
                <th style={{ width: '180px' }}>Maintenance Metrics</th>
                <th style={{ width: '400px' }}>Operational Narrative</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-cell">Loading Ops Data...</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className={log.safety_incidents ? 'row-red-alert' : ''}>
                  <td className="admin-cell">
                    <div className="admin-btns">
                      <button className="edit-btn" onClick={() => onEdit(log)}>✏️</button>
                      <button className="delete-btn" onClick={() => handleDelete(log.id)}>🗑️</button>
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
                        Incidents: {log.safety_incidents ? 'YES' : 'NONE'}
                      </span>
                      <span className={`mini-badge ${log.daily_5s_completed ? 'success' : 'neutral'}`}>
                        5S: {log.daily_5s_completed ? 'DONE' : 'NO'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="metrics-summary">
                      <p>Breakdown: <strong>{log.breakdown_hours}h</strong></p>
                      <p>Downtime: <strong>{log.downtime_hours}h</strong></p>
                      <p>Tasks: <strong>{log.planned_tasks_count} (P) / {log.reactive_tasks_count} (R)</strong></p>
                    </div>
                  </td>
                  <td>
                    <div className="details-box">
                      {log.daily_log_details || "No details provided"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}