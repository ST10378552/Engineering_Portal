import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './ActionList.css'

export default function ActionListView({ onEdit }) {
  const [actions, setActions] = useState([])
  const [filteredActions, setFilteredActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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

  // DELETE LOGIC
  async function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this record? This cannot be undone.")) {
      const { error } = await supabase.from('actions').delete().eq('id', id)
      if (error) alert(error.message)
      else fetchActions()
    }
  }

  const stats = {
    total: filteredActions.length,
    urgent: filteredActions.filter(a => a.priority === 'Urgent' || a.priority === 'High').length,
    completed: filteredActions.filter(a => a.status === 'Closed' || a.status === 'Complete').length,
    inProgress: filteredActions.filter(a => a.status === 'In Progress').length
  }

  const downloadCSV = () => {
    const headers = ["Status", "Priority", "Issue", "Equipment", "Area", "Assigned To", "Date Raised"]
    const rows = filteredActions.map(a => [
      a.status, a.priority, a.issue, a.main_equipment, a.plant_area, a.responsibility, a.date_raised
    ])
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Engineering_Registry_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const getPriorityClass = (p) => (p === 'High' || p === 'Urgent' ? 'prio-high' : p === 'Medium' ? 'prio-medium' : 'prio-low')
  
  const getRowClass = (status) => {
    if (status === 'Closed' || status === 'Complete') return 'row-green'
    if (status === 'In Progress') return 'row-yellow'
    return 'row-white'
  }

  const getStatusClass = (s) => {
    if (s === 'Closed' || s === 'Complete') return 'status-complete'
    if (s === 'In Progress') return 'status-progress'
    if (s === 'On Hold') return 'status-hold'
    return 'status-open'
  }

  return (
    <div className="table-view-container animate-in">
      <div className="stats-grid">
        <div className="stat-card"><label>Total Registered</label><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card urgent"><label>Critical / Urgent</label><div className="stat-value">{stats.urgent}</div></div>
        <div className="stat-card progress"><label>In Progress</label><div className="stat-value">{stats.inProgress}</div></div>
        <div className="stat-card complete"><label>Total Completed</label><div className="stat-value">{stats.completed}</div></div>
      </div>

      <div className="table-header-card search-header">
        <div className="header-left">
          <h2 className="table-main-title italic">Maintenance Review Board</h2>
          <p className="table-sub-title font-bold">Action Item Registry</p>
        </div>
        
        <div className="header-actions">
          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search people, equipment, or areas..." 
              className="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={downloadCSV} className="export-btn">EXPORT CSV</button>
          <button onClick={fetchActions} className="sync-btn"><span>🔄</span> SYNC</button>
        </div>
      </div>

      <div className="table-outer-shell">
        <div className="scroll-container">
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Admin</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px' }}>Priority</th>
                <th style={{ width: '280px' }}>Issue & Origin</th>
                <th style={{ width: '280px' }}>Fix Strategy (Steps)</th>
                <th style={{ width: '200px' }}>Asset Info</th>
                <th style={{ width: '180px' }}>Responsibility</th>
                <th style={{ width: '280px' }}>Progress & Training</th>
                <th style={{ width: '280px' }}>Next Steps & Constraints</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="loading-cell">Syncing Registry...</td></tr>
              ) : filteredActions.map((item) => (
                <tr key={item.id} className={getRowClass(item.status)}>
                  {/* ADMIN TOOLS */}
                  <td className="admin-cell">
                    <div className="admin-btns">
                      <button title="Edit Record" className="edit-btn" onClick={() => onEdit(item)}>✏️</button>
                      <button title="Delete Record" className="delete-btn" onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </td>
                  <td><span className={`badge ${getStatusClass(item.status)}`}>{item.status}</span></td>
                  <td><span className={`badge prio-badge ${getPriorityClass(item.priority)}`}>{item.priority}</span></td>
                  <td>
                    <p className="text-bold">{item.issue}</p>
                    <p className="text-tiny uppercase">Raised: {item.date_raised}</p>
                  </td>
                  <td><div className="details-box">{item.action_details || "No procedure steps listed"}</div></td>
                  <td>
                    <p className="text-bold uppercase">{item.main_equipment}</p>
                    <p className="text-small">{item.plant_area}</p>
                  </td>
                  <td>
                    <div className="resp-stack">
                      <div className="resp-item">
                        <div className="avatar int">INT</div>
                        <span className="resp-name">{item.responsibility}</span>
                      </div>
                      {item.contractor && (
                        <div className="resp-item">
                          <div className="avatar ext">EXT</div>
                          <span className="resp-name">{item.contractor}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="info-block">
                      <p>{item.progress_report || "No updates"}</p>
                      <p className="text-tiny mt-10">Training: {item.training_and_awareness || "N/A"}</p>
                    </div>
                  </td>
                  <td>
                    <div className="info-block">
                      <p className="text-bold text-blue">{item.next_steps || "N/A"}</p>
                      <p className="text-tiny text-red mt-10">Constraint: {item.constraints || "None"}</p>
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