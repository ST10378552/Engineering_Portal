import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './Training.css' // Import individual modular CSS

export default function TrainingForm() {
  const [lists, setLists] = useState({ staff: [], aspects: [], methods: [], tests: [] })
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    trainee_name: '',
    trainer: '',
    training_topic: '',
    training_aspect: '',
    training_method: '',
    competency_test_type: '',
    is_completed: false,
    training_overview: ''
  })

  useEffect(() => {
    async function fetchTrainingEnums() {
      const { data: staff } = await supabase.rpc('get_enum_values', { enum_name: 'staff_name' })
      const { data: aspects } = await supabase.rpc('get_enum_values', { enum_name: 'training_aspect_type' })
      const { data: methods } = await supabase.rpc('get_enum_values', { enum_name: 'training_method_type' })
      const { data: tests } = await supabase.rpc('get_enum_values', { enum_name: 'test_type' })
      
      setLists({ 
        staff: staff || [], 
        aspects: aspects || [], 
        methods: methods || [], 
        tests: tests || [] 
      })
    }
    fetchTrainingEnums()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('training').insert([formData])
    if (error) alert(error.message)
    else {
      alert("Training Record Saved Successfully!")
      setFormData({ ...formData, training_topic: '', training_overview: '', is_completed: false })
    }
    setLoading(false)
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-header training-header">
          <div className="header-flex">
            <div>
              <h2 className="main-title">Personnel Skill Matrix</h2>
              <p className="sub-title">Competency & Certification Tracking</p>
            </div>
            <div className="module-badge">TRAINING MOD</div>
          </div>
        </div>

        <div className="form-body">
          {/* Section 1: Personnel */}
          <div className="section-divider">
            <span className="section-number">01</span>
            <span className="section-title">Stakeholders</span>
          </div>

          <div className="input-grid-double">
            <div className="input-group">
              <label>Trainee Name</label>
              <select 
                required 
                className="custom-select"
                value={formData.trainee_name}
                onChange={(e) => setFormData({...formData, trainee_name: e.target.value})}
              >
                <option value="">Select Trainee...</option>
                {lists.staff.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Trainer / Supervisor</label>
              <select 
                required 
                className="custom-select"
                value={formData.trainer}
                onChange={(e) => setFormData({...formData, trainer: e.target.value})}
              >
                <option value="">Select Trainer...</option>
                {lists.staff.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          {/* Section 2: Subject Matter */}
          <div className="section-divider">
            <span className="section-number">02</span>
            <span className="section-title">Course Details</span>
          </div>

          <div className="input-grid-double">
            <div className="input-group">
              <label>Training Topic</label>
              <input 
                type="text" 
                className="custom-input"
                placeholder="e.g. Forklift Operation Level 1"
                value={formData.training_topic}
                onChange={(e) => setFormData({...formData, training_topic: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Training Category (Aspect)</label>
              <select 
                className="custom-select"
                value={formData.training_aspect}
                onChange={(e) => setFormData({...formData, training_aspect: e.target.value})}
              >
                <option value="">Select Category...</option>
                {lists.aspects.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Section 3: Assessment */}
          <div className="section-divider">
            <span className="section-number">03</span>
            <span className="section-title">Methodology & Status</span>
          </div>

          <div className="input-grid">
            <div className="input-group">
              <label>Method</label>
              <select 
                className="custom-select"
                value={formData.training_method}
                onChange={(e) => setFormData({...formData, training_method: e.target.value})}
              >
                <option value="">Select Method...</option>
                {lists.methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Test Type</label>
              <select 
                className="custom-select"
                value={formData.competency_test_type}
                onChange={(e) => setFormData({...formData, competency_test_type: e.target.value})}
              >
                <option value="">Select Test...</option>
                {lists.tests.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="checkbox-field">
              <label className={`checkbox-wrapper ${formData.is_completed ? 'completed' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={formData.is_completed}
                  onChange={(e) => setFormData({...formData, is_completed: e.target.checked})}
                />
                <span className="checkbox-text">Training Completed?</span>
              </label>
            </div>
          </div>

          <div className="input-group full-width" style={{marginTop: '1.5rem'}}>
            <label>Training Overview / Notes</label>
            <textarea 
              rows="4" 
              className="custom-textarea"
              placeholder="Enter key learning points or certification details..."
              value={formData.training_overview}
              onChange={(e) => setFormData({...formData, training_overview: e.target.value})}
            />
          </div>

          <button disabled={loading} className="submit-btn-large training-btn">
            {loading ? 'SYNCING RECORD...' : 'CONFIRM TRAINING ENTRY'}
          </button>
        </div>
      </form>
    </div>
  )
}