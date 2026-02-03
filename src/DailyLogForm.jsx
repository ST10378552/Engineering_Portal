import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './DailyLog.css' 

export default function DailyLogForm({ initialData, onComplete }) {
  const [staffList, setStaffList] = useState([])
  const [deptList, setDeptList] = useState([])
  const [disciplineList, setDisciplineList] = useState([])
  const [loading, setLoading] = useState(false)

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
    breakdown_details: '',
    downtime_details: '',
    work_not_completed_details: '',
    planned_work_next_day: '',
    daily_5s_log: '',
    rework_details: '',
    preventative_tasks_count: 0,
    any_training_completed: false,
    any_rework_reported: false,
    all_work_day_completed: false,
    all_mr_closed: false,
    all_pr_generated: false,
    is_receipting_up_to_date: false,
    is_accruals_list_updated: false
  })

  useEffect(() => {
    if (initialData) setFormData(initialData)
  }, [initialData])

  useEffect(() => {
    async function fetchEnums() {
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
    let response = formData.id 
      ? await supabase.from('daily_logs').update(formData).eq('id', formData.id)
      : await supabase.from('daily_logs').insert([formData])
    
    if (response.error) {
      alert("Submission Error: " + response.error.message)
    } else {
      alert(formData.id ? "Daily Log Updated!" : "Daily Log Submitted!")
      if (onComplete) onComplete()
    }
    setLoading(false)
  }

  return (
    <div className="form-container animate-in fade-in duration-500">
      <form onSubmit={handleSubmit}>
        <div className="form-header log-header" style={{ background: formData.id ? '#9a3412' : '#0f172a' }}>
          <div className="header-flex">
            <div>
              <h2 className="main-title">{formData.id ? 'EDIT RECORD' : 'ENGINEERING DAILY LOG'}</h2>
              <p className="sub-title">STATIONARY OPS MODULE</p>
            </div>
            <div className="module-badge">{formData.id ? 'UPDATE' : 'STATIONARY'}</div>
          </div>
        </div>

        <div className="form-body">
          <div className="section-divider">
            <span className="section-number">01</span>
            <span className="section-title">Log Info</span>
          </div>

          <div className="input-grid-3">
            <div className="input-group">
              <label>Logged By</label>
              <select required className="custom-select" value={formData.log_by} onChange={(e) => setFormData({...formData, log_by: e.target.value})}>
                <option value="">Select Staff...</option>
                {staffList.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Department</label>
              <select required className="custom-select" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                <option value="">Select Dept...</option>
                {deptList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Discipline</label>
              <select required className="custom-select" value={formData.discipline} onChange={(e) => setFormData({...formData, discipline: e.target.value})}>
                <option value="">Select Discipline...</option>
                {disciplineList.map(disc => <option key={disc} value={disc}>{disc}</option>)}
              </select>
            </div>
          </div>

          <div className="section-divider">
            <span className="section-number">02</span>
            <span className="section-title">Safety & Performance Metrics</span>
          </div>

          <div className="input-grid-double">
            <div className="metrics-panel safety-panel">
              <h3 className="panel-title">🛡️ SAFETY & COMPLIANCE</h3>
              <div className="checkbox-stack">
                {[
                  { id: 'safety_incidents', label: 'SAFETY INCIDENTS?' },
                  { id: 'safety_opportunity_raised', label: 'SAFETY OPPORTUNITY RAISED?' },
                  { id: 'daily_5s_completed', label: 'DAILY 5S COMPLETED?' },
                  { id: 'all_permits_signed_off', label: 'PERMITS SIGNED OFF?' },
                  { id: 'any_training_completed', label: 'TRAINING COMPLETED?' }
                ].map(item => (
                  <label key={item.id} className={`checkbox-wrapper ${formData[item.id] ? 'completed' : ''}`}>
                    <input type="checkbox" checked={formData[item.id]} onChange={(e) => setFormData({...formData, [item.id]: e.target.checked})} />
                    <span className="checkbox-text">{item.label}</span>
                  </label>
                ))}
              </div>
              <div className="input-group mt-15">
                <label>SAFETY OPS COUNT</label>
                <input type="number" className="custom-input" value={formData.safety_ops_count} onChange={(e) => setFormData({...formData, safety_ops_count: e.target.value})} />
              </div>
            </div>

            <div className="metrics-panel performance-panel">
              <h3 className="panel-title">⚙️ PERFORMANCE METRICS</h3>
              <div className="metrics-grid">
                <div className="input-group">
                  <label>BREAKDOWN HOURS</label>
                  <input type="number" step="0.25" className="custom-input" value={formData.breakdown_hours} onChange={(e) => setFormData({...formData, breakdown_hours: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>DOWNTIME HOURS</label>
                  <input type="number" step="0.25" className="custom-input" value={formData.downtime_hours} onChange={(e) => setFormData({...formData, downtime_hours: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>PLANNED TASKS</label>
                  <input type="number" className="custom-input" value={formData.planned_tasks_count} onChange={(e) => setFormData({...formData, planned_tasks_count: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>REACTIVE TASKS</label>
                  <input type="number" className="custom-input" value={formData.reactive_tasks_count} onChange={(e) => setFormData({...formData, reactive_tasks_count: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>PREVENTATIVE TASKS</label>
                  <input type="number" className="custom-input" value={formData.preventative_tasks_count} onChange={(e) => setFormData({...formData, preventative_tasks_count: e.target.value})} />
                </div>
                <div className="checkbox-stack" style={{marginTop: 'auto'}}>
                   <label className={`checkbox-wrapper ${formData.any_rework_reported ? 'completed' : ''}`}>
                    <input type="checkbox" checked={formData.any_rework_reported} onChange={(e) => setFormData({...formData, any_rework_reported: e.target.checked})} />
                    <span className="checkbox-text">REWORK REPORTED?</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="section-divider">
            <span className="section-number">03</span>
            <span className="section-title">Admin & Compliance Checklist</span>
          </div>
          <div className="input-grid-4-special">
             {[
               { id: 'all_mr_closed', label: 'ALL MRs CLOSED' },
               { id: 'all_pr_generated', label: 'ALL PRs GENERATED' },
               { id: 'is_receipting_up_to_date', label: 'RECEIPTING UP TO DATE' },
               { id: 'is_accruals_list_updated', label: 'ACCRUALS LIST UPDATED' },
               { id: 'all_work_day_completed', label: 'ALL DAY WORK COMPLETED' }
             ].map(item => (
                <label key={item.id} className={`checkbox-wrapper compact ${formData[item.id] ? 'completed' : ''}`}>
                  <input type="checkbox" checked={formData[item.id]} onChange={(e) => setFormData({...formData, [item.id]: e.target.checked})} />
                  <span className="checkbox-text">{item.label}</span>
                </label>
             ))}
          </div>

          <div className="section-divider">
            <span className="section-number">04</span>
            <span className="section-title">Operational Narrative</span>
          </div>

          <div className="input-grid-double">
            <div className="input-group"><label>GENERAL LOG DETAILS</label><textarea className="custom-textarea" value={formData.daily_log_details} onChange={(e) => setFormData({...formData, daily_log_details: e.target.value})} /></div>
            <div className="input-group"><label>SAFETY INCIDENT DETAILS</label><textarea className="custom-textarea" value={formData.safety_incident_details} onChange={(e) => setFormData({...formData, safety_incident_details: e.target.value})} /></div>
            <div className="input-group"><label>BREAKDOWN DETAILS</label><textarea className="custom-textarea" value={formData.breakdown_details} onChange={(e) => setFormData({...formData, breakdown_details: e.target.value})} /></div>
            <div className="input-group"><label>DOWNTIME DETAILS</label><textarea className="custom-textarea" value={formData.downtime_details} onChange={(e) => setFormData({...formData, downtime_details: e.target.value})} /></div>
            <div className="input-group"><label>WORK NOT COMPLETED</label><textarea className="custom-textarea" value={formData.work_not_completed_details} onChange={(e) => setFormData({...formData, work_not_completed_details: e.target.value})} /></div>
            <div className="input-group"><label>PLANNED WORK NEXT DAY</label><textarea className="custom-textarea" value={formData.planned_work_next_day} onChange={(e) => setFormData({...formData, planned_work_next_day: e.target.value})} /></div>
            <div className="input-group"><label>DAILY 5S LOG</label><textarea className="custom-textarea" value={formData.daily_5s_log} onChange={(e) => setFormData({...formData, daily_5s_log: e.target.value})} /></div>
            <div className="input-group"><label>REWORK DETAILS</label><textarea className="custom-textarea" value={formData.rework_details} onChange={(e) => setFormData({...formData, rework_details: e.target.value})} /></div>
          </div>

          <button disabled={loading} className="log-btn">
            {loading ? 'SYNCING...' : formData.id ? 'UPDATE SYSTEM RECORD' : 'COMMIT LOG TO DATABASE'}
          </button>
        </div>
      </form>
    </div>
  )
}