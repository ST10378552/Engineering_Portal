import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './DailyLog.css' // Import individual modular CSS

export default function DailyLogForm({ initialData, onComplete }) {
  // 1. Dropdown Lists (Enums)
  const [staffList, setStaffList] = useState([])
  const [deptList, setDeptList] = useState([])
  const [disciplineList, setDisciplineList] = useState([])
  const [loading, setLoading] = useState(false)

  // 2. Form State (All DB Columns)
  const [formData, setFormData] = useState({
    log_by: '',
    department: '',
    discipline: '',
    log_type: 'Daily Engineering Log',
    safety_incidents: false,
    safety_opportunity_raised: false,
    daily_5s_completed: false,
    all_permits_signed_off: false,
    breakdown_hours: 0,
    downtime_hours: 0,
    safety_ops_count: 0,
    planned_tasks_count: 0,
    reactive_tasks_count: 0,
    daily_log_details: '',
    safety_incident_details: '',
    breakdown_details: ''
  })

  // NEW: Effect to populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    async function fetchEnums() {
      // Pulling exact type names from your database schema
      const { data: staff } = await supabase.rpc('get_enum_values', { enum_name: 'staff_name' })
      const { data: depts } = await supabase.rpc('get_enum_values', { enum_name: 'dept_name' })
      const { data: discs } = await supabase.rpc('get_enum_values', { enum_name: 'discipline_type' })
      
      if (staff) setStaffList(staff)
      if (depts) setDeptList(depts)
      if (discs) setDisciplineList(discs)
    }
    fetchEnums()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    let response;

    // Check if we are updating or inserting
    if (formData.id) {
      response = await supabase
        .from('daily_logs')
        .update(formData)
        .eq('id', formData.id)
    } else {
      response = await supabase
        .from('daily_logs')
        .insert([formData])
    }
    
    const { error } = response;

    if (error) {
      alert("Submission Error: " + error.message)
    } else {
      alert(formData.id ? "Daily Log Updated Successfully!" : "Daily Log Submitted Successfully!")
      
      if (onComplete) {
        onComplete(); // Call this to return to list view after edit
      } else {
        // Reset specific narrative fields after success if not redirecting
        setFormData({ 
          log_by: '',
          department: '',
          discipline: '',
          log_type: 'Daily Engineering Log',
          safety_incidents: false,
          safety_opportunity_raised: false,
          daily_5s_completed: false,
          all_permits_signed_off: false,
          breakdown_hours: 0,
          downtime_hours: 0,
          safety_ops_count: 0,
          planned_tasks_count: 0,
          reactive_tasks_count: 0,
          daily_log_details: '',
          safety_incident_details: '',
          breakdown_details: ''
        })
      }
    }
    setLoading(false)
  }

  return (
    <div className="form-container animate-in fade-in duration-500">
      <form onSubmit={handleSubmit}>
        {/* Header Section - Color changes if editing */}
        <div className="form-header log-header" style={{ background: formData.id ? '#b45309' : '#1e3a8a' }}>
          <div className="header-flex">
            <div>
              <h2 className="main-title">{formData.id ? 'Edit Daily Log' : 'Engineering Daily Log'}</h2>
              <p className="sub-title">Operational Tracking System</p>
            </div>
            <div className="module-badge log-badge">{formData.id ? 'UPDATE MODE' : 'OPS MODULE'}</div>
          </div>
        </div>

        <div className="form-body">
          {/* SECTION 1: METADATA */}
          <div className="section-divider">
            <span className="section-number">01</span>
            <span className="section-title">Assignment Information</span>
          </div>

          <div className="input-grid-3">
            <div className="input-group">
              <label>Logged By</label>
              <select 
                required
                className="custom-select"
                value={formData.log_by}
                onChange={(e) => setFormData({...formData, log_by: e.target.value})}
              >
                <option value="">Select Staff...</option>
                {staffList.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Department</label>
              <select 
                required
                className="custom-select"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Dept...</option>
                {deptList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Discipline</label>
              <select 
                required
                className="custom-select"
                value={formData.discipline}
                onChange={(e) => setFormData({...formData, discipline: e.target.value})}
              >
                <option value="">Select Discipline...</option>
                {disciplineList.map(disc => <option key={disc} value={disc}>{disc}</option>)}
              </select>
            </div>
          </div>

          {/* SECTION 2: SAFETY & PERFORMANCE */}
          <div className="section-divider">
            <span className="section-number">02</span>
            <span className="section-title">Safety & Maintenance Metrics</span>
          </div>

          <div className="input-grid-double">
            {/* Safety Panel */}
            <div className="metrics-panel safety-panel">
              <h3 className="panel-title">🛡️ Safety & Compliance</h3>
              <div className="checkbox-stack">
                {[
                  { id: 'safety_incidents', label: 'Safety Incidents?' },
                  { id: 'safety_opportunity_raised', label: 'Safety Opportunity Raised?' },
                  { id: 'daily_5s_completed', label: 'Daily 5S Completed?' },
                  { id: 'all_permits_signed_off', label: 'Permits Signed Off?' }
                ].map(item => (
                  <label key={item.id} className={`checkbox-wrapper ${formData[item.id] ? 'completed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData[item.id]}
                      onChange={(e) => setFormData({...formData, [item.id]: e.target.checked})}
                    />
                    <span className="checkbox-text">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Maintenance Metrics Panel */}
            <div className="metrics-panel performance-panel">
              <h3 className="panel-title">⚙️ Performance Metrics</h3>
              <div className="metrics-grid">
                <div className="input-group">
                  <label>Breakdown Hours</label>
                  <input 
                    type="number" step="0.25" 
                    className="custom-input" 
                    value={formData.breakdown_hours}
                    onChange={(e) => setFormData({...formData, breakdown_hours: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Downtime Hours</label>
                  <input 
                    type="number" step="0.25" 
                    className="custom-input" 
                    value={formData.downtime_hours}
                    onChange={(e) => setFormData({...formData, downtime_hours: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Planned Tasks</label>
                  <input 
                    type="number" 
                    className="custom-input" 
                    value={formData.planned_tasks_count}
                    onChange={(e) => setFormData({...formData, planned_tasks_count: e.target.value})} 
                  />
                </div>
                <div className="input-group">
                  <label>Reactive Tasks</label>
                  <input 
                    type="number" 
                    className="custom-input" 
                    value={formData.reactive_tasks_count}
                    onChange={(e) => setFormData({...formData, reactive_tasks_count: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: NARRATIVE */}
          <div className="section-divider">
            <span className="section-number">03</span>
            <span className="section-title">Operational Narrative</span>
          </div>

          <div className="input-group full-width">
            <label>General Log Details</label>
            <textarea 
              rows="4"
              className="custom-textarea"
              placeholder="Provide details of breakdowns, work completed, or delays..."
              value={formData.daily_log_details}
              onChange={(e) => setFormData({...formData, daily_log_details: e.target.value})}
            />
          </div>

          <div className="flex gap-4">
            <button disabled={loading} className="submit-btn-large log-btn" style={{ background: formData.id ? '#b45309' : '#059669' }}>
              {loading ? 'PROCESSING...' : formData.id ? '💾 UPDATE LOG ENTRY' : '🚀 FINALIZE & COMMIT DAILY LOG'}
            </button>
            {formData.id && (
              <button 
                type="button" 
                onClick={onComplete} 
                className="submit-btn-large" 
                style={{ background: '#64748b', marginTop: '2.5rem' }}
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}