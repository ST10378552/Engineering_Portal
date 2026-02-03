import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './TrainingList.css'

export default function TrainingListView({ onEdit }) {
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    fetchTrainingData()
  }, [])

  useEffect(() => {
    const results = records.filter(item => 
      item.trainee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.training_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trainer?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredRecords(results)
  }, [searchTerm, records])

  async function fetchTrainingData() {
    setLoading(true)
    const { data, error } = await supabase
      .from('training')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.error('Error fetching training data:', error)
    else {
      setRecords(data || [])
      setFilteredRecords(data || [])
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (window.confirm("Permanently delete this training record?")) {
      const { error } = await supabase.from('training').delete().eq('id', id)
      if (error) alert(error.message)
      else fetchTrainingData()
    }
  }

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="table-view-container animate-in">
      {/* HEADER SECTION */}
      <div className="table-header-card">
        <div className="header-left">
          <h2 className="table-main-title">Skill Matrix Registry</h2>
          <p className="table-sub-title">Competency & Certification Board</p>
        </div>
        <div className="header-actions">
          <div className="search-bar-wrapper">
            <input 
              type="text" 
              placeholder="Search trainee or topic..." 
              className="global-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchTrainingData} className="sync-btn">SYNC</button>
        </div>
      </div>

      <div className="table-outer-shell">
        <div className="scroll-container">
          <table className="management-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Admin</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '250px' }}>Trainee Name</th>
                <th style={{ width: '300px' }}>Training Topic</th>
                <th style={{ width: '200px' }}>Trainer</th>
                <th style={{ width: '120px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading-cell">UPDATING SKILL MATRIX...</td></tr>
              ) : filteredRecords.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className={expandedRow === item.id ? 'row-expanded-active' : ''}>
                    <td className="admin-cell">
                      <div className="admin-btns-row">
                        <button className="mini-btn edit" onClick={() => onEdit(item)}>✏️</button>
                        <button className="mini-btn delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.is_completed ? 'status-complete' : 'status-open'}`}>
                        {item.is_completed ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </td>
                    <td><span className="resp-name-tag">{item.trainee_name}</span></td>
                    <td>
                      <p className="text-bold">{item.training_topic}</p>
                      <p className="text-tiny">{item.training_aspect}</p>
                    </td>
                    <td className="text-bold">{item.trainer}</td>
                    <td>
                      <button className="info-toggle-btn" onClick={() => toggleRow(item.id)}>
                        {expandedRow === item.id ? 'CLOSE' : 'VIEW INFO'}
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAIL SECTION */}
                  {expandedRow === item.id && (
                    <tr className="expanded-detail-row">
                      <td colSpan="6">
                        <div className="detail-pane animate-in">
                          <div className="detail-grid">
                            <div className="detail-col">
                              <label>Methodology</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Teaching Method:</span> {item.training_method}</div>
                                <div className="ms-item"><span>Test Conducted:</span> {item.competency_test_type}</div>
                              </div>
                            </div>
                            
                            <div className="detail-col">
                              <label>Course Overview & Notes</label>
                              <p className="detail-text">{item.training_overview || 'No additional notes provided for this session.'}</p>
                            </div>

                            <div className="detail-col">
                              <label>Record Metadata</label>
                              <div className="milestone-list">
                                <div className="ms-item"><span>Date Logged:</span> {new Date(item.created_at).toLocaleDateString()}</div>
                                <div className="ms-item"><span>Record ID:</span> #{item.id.toString().slice(0, 8)}</div>
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