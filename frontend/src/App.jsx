import React from 'react'
import LogInteractionScreen from './components/LogInteractionScreen'
import ToolsPanel from './components/ToolsPanel'

function App() {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#f0f4f8',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <LogInteractionScreen />
      <div style={{ marginTop: 16 }}>
        <ToolsPanel />
      </div>
    </div>
  )
}

export default App