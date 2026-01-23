import { useState } from 'react'
import DailyLogForm from './DailyLogForm'
import TrainingForm from './TrainingForm'
import ActionTrackerForm from './ActionTrackerForm'
import ActionListView from './ActionListView'
import DailyLogListView from './DailyLogListView' // Ensure this is imported
import './App.css' 

function App() {
  const [activeTab, setActiveTab] = useState('logs')
  
  // Separate states for editing different types of data
  const [editActionData, setEditActionData] = useState(null)
  const [editLogData, setEditLogData] = useState(null)

  const navItems = [
    { id: 'logs', label: 'Daily Operations', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'view_logs', label: 'Operations Board', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'actions', label: 'Log New Action', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'view_actions', label: 'Action Registry', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'training', label: 'Skill Matrix', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' }
  ]

  // Handlers for switching to edit mode
  const handleEditAction = (record) => {
    setEditActionData(record);
    setActiveTab('actions');
  }

  const handleEditLog = (record) => {
    setEditLogData(record);
    setActiveTab('logs');
  }

  const handleTabChange = (tabId) => {
    // Clear editing states if manually navigating away from the forms
    if (tabId !== 'actions') setEditActionData(null);
    if (tabId !== 'logs') setEditLogData(null);
    setActiveTab(tabId);
  }

  const getHeaderInfo = () => {
    switch(activeTab) {
      case 'logs': return { title: editLogData ? 'Update Daily Log' : 'Daily Operations', desc: editLogData ? `Editing Log ID: ${editLogData.id}` : 'Manage and track site activities' };
      case 'view_logs': return { title: 'Operations Board', desc: 'Review historical daily log entries' };
      case 'actions': return { title: editActionData ? 'Update Action Record' : 'Log Maintenance', desc: editActionData ? `Editing Action ID: ${editActionData.id}` : 'Create new engineering tasks' };
      case 'view_actions': return { title: 'Action Registry', desc: 'Global maintenance task status' };
      case 'training': return { title: 'Skill Matrix', desc: 'Personnel competency records' };
      default: return { title: 'Dashboard', desc: 'Welcome to ENG-PORTAL' };
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">E</div>
          <div className="logo-text">
            <h1>ENG-PORTAL</h1>
            <p>Enterprise v1.0</p>
          </div>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <p>Logged in as</p>
            <div className="user-info">
              <div className="user-avatar">DN</div>
              <span style={{color: 'white', fontSize: '0.85rem', fontWeight: 700}}>Devesh & Partner</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="top-header">
          <div className="header-title">
            <h2>{getHeaderInfo().title}</h2>
            <p>{getHeaderInfo().desc}</p>
          </div>
          <div className="header-status">
            <div className="live-badge">
              <div className="pulse"></div>
              Live Connection
            </div>
          </div>
        </header>

        <main className="content-scroll">
          {/* DAILY LOGS: FORM & LIST */}
          {activeTab === 'logs' && (
            <DailyLogForm 
              initialData={editLogData} 
              onComplete={() => { setEditLogData(null); setActiveTab('view_logs'); }} 
            />
          )}
          {activeTab === 'view_logs' && (
            <DailyLogListView onEdit={handleEditLog} />
          )}

          {/* ACTIONS: FORM & LIST */}
          {activeTab === 'actions' && (
            <ActionTrackerForm 
              initialData={editActionData} 
              onComplete={() => { setEditActionData(null); setActiveTab('view_actions'); }} 
            />
          )}
          {activeTab === 'view_actions' && (
            <ActionListView onEdit={handleEditAction} />
          )}
          
          {activeTab === 'training' && <TrainingForm />}
        </main>
      </div>
    </div>
  )
}

export default App;