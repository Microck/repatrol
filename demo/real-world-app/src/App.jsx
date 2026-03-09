import { useState, useEffect } from 'react'
import './index.css'

function CrashComponent({ reason }) {
  useEffect(() => {
    setTimeout(() => {
      throw new Error(`SkyBoost Booking Crash: ${reason}`);
    }, 0);
  }, [reason]);

  return (
    <header>
      <h1>SkyBoost Travel</h1>
      <div style={{ display: 'inline-block', padding: '0.5em 1em', background: '#333', borderRadius: '4px', border: '1px solid #555' }} id="stateLabel">
        CRASH
      </div>
    </header>
  );
}

function App() {
  const [status, setStatus] = useState('HOME')
  const [upgrades, setUpgrades] = useState(0)
  const [logs, setLogs] = useState(['System initialized.'])
  const [crashReason, setCrashReason] = useState(null)

  const log = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  if (crashReason) {
    return <CrashComponent reason={crashReason} />
  }

  const handleStart = () => {
    setStatus('BOOKING')
    setUpgrades(0)
    log('Started booking flow.')
  }

  const handleBack = () => {
    setStatus('HOME')
    log('Returned to home.')
  }

  const handleReset = () => {
    setStatus('HOME')
    setUpgrades(0)
    setLogs(['System reset.'])
  }

  const handleBoost = () => {
    if (status !== 'BOOKING') {
      log('Cannot add upgrades outside of booking flow.')
      return
    }
    setUpgrades(u => u + 1)
    log(`Added premium seat upgrade. Total: ${upgrades + 1}`)
  }

  const handleFire = () => {
    if (status !== 'BOOKING') {
      log('Cannot confirm payment outside of booking flow.')
      return
    }
    log(`Confirming payment with ${upgrades} upgrades...`)
    
    // The Bug: The legacy payment gateway only supports up to 6 upgrades.
    if (upgrades >= 7) {
      log('CRITICAL ERROR: Gateway overflow!')
      // Force a React render crash to simulate a catastrophic UI failure
      setCrashReason(`Payment gateway overflow! Max upgrades exceeded. Received: ${upgrades}`)
    } else {
      log('Payment successful!')
      setStatus('HOME')
      setUpgrades(0)
    }
  }

  return (
    <>
      <header>
        <h1>SkyBoost Travel</h1>
        <p>Book your next adventure seamlessly.</p>
        <div style={{ display: 'inline-block', padding: '0.5em 1em', background: '#333', borderRadius: '4px', border: '1px solid #555' }} id="stateLabel">
          {status}
        </div>
      </header>

      <div className="card">
        <h2>{status === 'HOME' ? 'Welcome to SkyBoost' : 'Complete Your Booking'}</h2>
        
        {status === 'HOME' && <p>Start your booking process below.</p>}
        {status === 'BOOKING' && <p>You have selected {upgrades} seat upgrades.</p>}

        <div className="actions">
          <button id="startBtn" className="primary" onClick={handleStart}>Begin Booking</button>
          <button id="resetBtn" onClick={handleReset}>Clear Session</button>
          <button id="backBtn" onClick={handleBack}>Go Back</button>
        </div>

        <div className="booking-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
          <p style={{ fontSize: '0.9em', color: '#888' }}>Booking Controls</p>
          <button id="boostBtn" onClick={handleBoost}>Add Seat Upgrade</button>
          <button id="fireBtn" className="danger" onClick={handleFire}>Confirm Payment</button>
        </div>

        <div className="log" id="log">
          {logs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App
