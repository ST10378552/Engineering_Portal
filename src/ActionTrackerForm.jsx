import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './Action.css'

export default function ActionTrackerForm({ initialData, onComplete }) {
  const [enums, setEnums] = useState({ 
    staff: [], priority: [], status: [], area: [], 
    equipment: [], depts: [], disciplines: [], contractors: [], aspects: [], sources: [] 
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    date_raised: new Date().toISOString().split('T')[0],
    raised_by: '',
    source: '', 
    department: '',
    responsibility: '',
    discipline: '',
    aspect: '', 
    plant_area: '',
    main_equipment: '',
    issue: '', 
    action_details: '', 
    next_steps: '', 
    constraints: '', 
    comments: '', // This column will now be populated
    priority: '',
    status: 'Open',
    progress_report: '', 
    training_and_awareness: '', 
    action_start_date: '',
    action_completion_date: '',
    learning_points: '',
    attachment_url: '',
    training_comp_date: '',
    target_date: ''
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    async function fetchAllEnums() {
      const { data: staff } = await supabase.rpc('get_enum_values', { enum_name: 'staff_name' })
      const { data: prio } = await supabase.rpc('get_enum_values', { enum_name: 'priority_level' })
      const { data: stat } = await supabase.rpc('get_enum_values', { enum_name: 'action_status' })
      const { data: area } = await supabase.rpc('get_enum_values', { enum_name: 'plant_area_type' })
      const { data: equip } = await supabase.rpc('get_enum_values', { enum_name: 'equipment_type' })
      const { data: depts } = await supabase.rpc('get_enum_values', { enum_name: 'dept_name' })
      const { data: discs } = await supabase.rpc('get_enum_values', { enum_name: 'discipline_type' })
      const { data: contr } = await supabase.rpc('get_enum_values', { enum_name: 'contractor_name' })
      const { data: asp } = await supabase.rpc('get_enum_values', { enum_name: 'aspect_type' })
      const { data: src } = await supabase.rpc('get_enum_values', { enum_name: 'source_type' })
      
      setEnums({ 
        staff: staff || [], priority: prio || [], status: stat || [], area: area || [], 
        equipment: equip || [], depts: depts || [], disciplines: discs || [], 
        contractors: contr || [], aspects: asp || [], sources: src || []
      })
    }
    fetchAllEnums()
  }, [])

  // HANDLER FOR FILE UPLOAD
  const handleFileUpload = async (e) => {
    try {
      setUploading(true)
      const file = e.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `actions/${fileName}`

      // Upload to 'attachments' bucket
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      setFormData({ ...formData, attachment_url: publicUrl })
      alert("File uploaded successfully!")
    } catch (error) {
      alert("Error uploading file: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    let response;
    if (formData.id) {
      response = await supabase.from('actions').update(formData).eq('id', formData.id)
    } else {
      response = await supabase.from('actions').insert([formData])
    }

    const { error } = response;
    if (error) {
      alert("Submission Error: " + error.message)
    } else {
      alert(formData.id ? "Action Updated Successfully!" : "Comprehensive Action Logged Successfully!")
      if (onComplete) onComplete();
      else {
        setFormData({
          date_raised: new Date().toISOString().split('T')[0],
          raised_by: '', source: '', department: '', responsibility: '', discipline: '',
          aspect: '', plant_area: '', main_equipment: '', issue: '', action_details: '',
          next_steps: '', constraints: '', comments: '', priority: '', status: 'Open',
          progress_report: '', training_and_awareness: '', action_start_date: '',
          action_completion_date: '', learning_points: '', attachment_url: '',
          training_comp_date: '', target_date: ''
        })
      }
    }
    setLoading(false)
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-header" style={{ background: formData.id ? '#b45309' : '#0f172a' }}>
          <div className="header-flex">
            <div>
              <h2 className="main-title">{formData.id ? 'Edit Action Record' : 'Maintenance Control Board'}</h2>
              <p className="sub-title">Engineering Lifecycle Tracking</p>
            </div>
            <div className="db-status">
              <span className="dot"></span> {formData.id ? 'UPDATE MODE' : 'Live Database Active'}
            </div>
          </div>
        </div>

        <div className="form-body">
          {/* SECTION 1: Origin */}
          <div className="section-divider">
            <span className="section-number">01</span>
            <span className="section-title">Origin & Ownership</span>
          </div>
          
          <div className="input-grid-5">
            <div className="input-group">
              <label>Raised By</label>
              <select className="custom-select" required value={formData.raised_by} onChange={(e)=>setFormData({...formData, raised_by: e.target.value})}>
                <option value="">Select Staff...</option>
                {enums.staff.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Source</label>
              <select className="custom-select" required value={formData.source} onChange={(e)=>setFormData({...formData, source: e.target.value})}>
                <option value="">Select Source...</option>
                {enums.sources.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Department</label>
              <select className="custom-select" required value={formData.department} onChange={(e)=>setFormData({...formData, department: e.target.value})}>
                <option value="">Select Dept...</option>
                {enums.depts.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Responsibility</label>
              <select className="custom-select" required value={formData.responsibility} onChange={(e)=>setFormData({...formData, responsibility: e.target.value})}>
                <option value="">Assigned To...</option>
                {enums.staff.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label className="label-blue">Contractor / Vendor</label>
              <select className="custom-select select-blue" value={formData.contractor} onChange={(e)=>setFormData({...formData, contractor: e.target.value})}>
                <option value="">Internal Only</option>
                {enums.contractors.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          {/* SECTION 2: Asset */}
          <div className="section-divider">
            <span className="section-number">02</span>
            <span className="section-title">Asset & Discipline</span>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label>Discipline</label>
              <select className="custom-select" required value={formData.discipline} onChange={(e)=>setFormData({...formData, discipline: e.target.value})}>
                <option value="">Select Discipline...</option>
                {enums.disciplines.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Aspect</label>
              <select className="custom-select" required value={formData.aspect} onChange={(e)=>setFormData({...formData, aspect: e.target.value})}>
                <option value="">Select Aspect...</option>
                {enums.aspects.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Plant Area</label>
              <select className="custom-select" required value={formData.plant_area} onChange={(e)=>setFormData({...formData, plant_area: e.target.value})}>
                <option value="">Select Area...</option>
                {enums.area.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
            </div>
            <div className="input-group">
              <label>Main Equipment</label>
              <select className="custom-select" required value={formData.main_equipment} onChange={(e)=>setFormData({...formData, main_equipment: e.target.value})}>
                <option value="">Select Equipment...</option>
                {enums.equipment.map((eq) => (<option key={eq} value={eq}>{eq}</option>))}
              </select>
            </div>
          </div>

          {/* SECTION 3: Documentation & Narrative */}
          <div className="section-divider">
            <span className="section-number">03</span>
            <span className="section-title">Technical Narrative & Documentation</span>
          </div>

          <div className="text-area-stack">
            <div className="input-group full-width">
              <label>Issue (State the Problem)</label>
              <textarea className="custom-textarea" required rows="2" placeholder="Define the problem..." value={formData.issue} onChange={(e)=>setFormData({...formData, issue: e.target.value})}></textarea>
            </div>
            
            <div className="input-grid-double">
              <div className="input-group">
                <label>Action Steps to Take</label>
                <textarea className="custom-textarea" rows="2" placeholder="Step-by-step procedure..." value={formData.action_details} onChange={(e)=>setFormData({...formData, action_details: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Learning Points</label>
                <textarea className="custom-textarea" rows="2" placeholder="Key takeaways from this action..." value={formData.learning_points} onChange={(e)=>setFormData({...formData, learning_points: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Progress Report</label>
                <textarea className="custom-textarea" rows="2" placeholder="Current status updates..." value={formData.progress_report} onChange={(e)=>setFormData({...formData, progress_report: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Training and Awareness</label>
                <textarea className="custom-textarea" rows="2" placeholder="Required personnel training..." value={formData.training_and_awareness} onChange={(e)=>setFormData({...formData, training_and_awareness: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Next Steps</label>
                <textarea className="custom-textarea" rows="2" placeholder="Immediate future actions..." value={formData.next_steps} onChange={(e)=>setFormData({...formData, next_steps: e.target.value})}></textarea>
              </div>
              <div className="input-group">
                <label>Constraints</label>
                <textarea className="custom-textarea" rows="2" placeholder="Blocking issues/hold-ups..." value={formData.constraints} onChange={(e)=>setFormData({...formData, constraints: e.target.value})}></textarea>
              </div>
              {/* ADDED COMMENTS FIELD */}
              <div className="input-group full-width">
                <label>Comments</label>
                <textarea className="custom-textarea" rows="2" placeholder="General additional comments..." value={formData.comments} onChange={(e)=>setFormData({...formData, comments: e.target.value})}></textarea>
              </div>
            </div>

            {/* UPDATED ATTACHMENT SECTION */}
            <div className="input-grid-double" style={{marginTop: '1rem'}}>
              <div className="input-group">
                <label>External Attachment Link (URL)</label>
                <input type="text" className="custom-input" placeholder="Paste link here..." value={formData.attachment_url} onChange={(e)=>setFormData({...formData, attachment_url: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Upload From Device</label>
                <input type="file" className="custom-input" onChange={handleFileUpload} disabled={uploading} />
                {uploading && <span style={{fontSize: '10px', color: '#2563eb'}}>Uploading file...</span>}
              </div>
            </div>
          </div>

          {/* SECTION 4: Timeline & Priority */}
          <div className="section-divider">
            <span className="section-number">04</span>
            <span className="section-title">Milestones & Priority</span>
          </div>

          <div className="timeline-section">
            <div className="input-grid-5">
              <div className="input-group">
                <label>Priority</label>
                <select className="custom-select priority-red" required value={formData.priority} onChange={(e)=>setFormData({...formData, priority: e.target.value})}>
                  <option value="">Select Priority...</option>
                  {enums.priority.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div className="input-group">
                <label>Status</label>
                <select className="custom-select status-blue" required value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                  {enums.status.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="input-group">
                <label>Target Date</label>
                <input type="date" className="custom-input" value={formData.target_date} onChange={(e)=>setFormData({...formData, target_date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Start Date</label>
                <input type="date" className="custom-input" value={formData.action_start_date} onChange={(e)=>setFormData({...formData, action_start_date: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Completion Date</label>
                <input type="date" className="custom-input" value={formData.action_completion_date} onChange={(e)=>setFormData({...formData, action_completion_date: e.target.value})} />
              </div>
            </div>
            
            <div className="input-group" style={{marginTop: '1.5rem', maxWidth: '300px'}}>
              <label>Training Comp. Date</label>
              <input type="date" className="custom-input" value={formData.training_comp_date} onChange={(e)=>setFormData({...formData, training_comp_date: e.target.value})} />
            </div>
          </div>

          <div className="flex gap-4">
            <button disabled={loading} className="submit-btn-large" style={{ background: formData.id ? '#b45309' : '#0f172a' }}>
              {loading ? 'PROCESSING...' : formData.id ? 'SAVE CHANGES' : 'COMMIT FULL ACTION DATA'}
            </button>
            {formData.id && (
              <button type="button" onClick={onComplete} className="submit-btn-large" style={{ background: '#64748b' }}>CANCEL</button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}