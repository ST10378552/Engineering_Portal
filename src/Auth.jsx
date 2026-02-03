import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Auth.css'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            surname: surname,
          },
        },
      })
      if (error) alert(error.message)
      else alert('Account created! Please log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) alert(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-in fade-in zoom-in duration-500">
        <div className="auth-header">
          <div className="auth-logo">E</div>
          <h2 className="auth-main-title">
            {isRegistering ? 'System Registration' : 'Enterprise Login'}
          </h2>
          <p className="auth-sub-title">ENG-PORTAL v1.0 | Management System</p>
        </div>
        
        <form onSubmit={handleAuth} className="auth-form">
          {isRegistering && (
            <div className="auth-input-row">
              <div className="input-group">
                <label>First Name</label>
                <input className="custom-input" type="text" placeholder="Devesh" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="input-group">
                <label>Surname</label>
                <input className="custom-input" type="text" placeholder="Naidoo" value={surname} onChange={(e) => setSurname(e.target.value)} required />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Work Email</label>
            <input className="custom-input" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="input-group" style={{marginTop: '20px'}}>
            <label>Secure Password</label>
            <input className="custom-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button disabled={loading} className="auth-submit-btn">
            {loading ? (
              <span className="spinner"></span>
            ) : (
              isRegistering ? 'CREATE ACCESS ACCOUNT' : 'SECURE SYSTEM SIGN-IN'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegistering ? 'Already registered?' : 'Need system access?'}
            <button className="toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Login here' : 'Request Account'}
            </button>
          </p>
          <div className="legal-notice">
            Authorized Personnel Only. Connection is Encrypted.
          </div>
        </div>
      </div>
    </div>
  )
}