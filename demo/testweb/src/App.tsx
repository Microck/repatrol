import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// --- Elegant Inline SVG Icons ---
const PlaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-2 2 5 5 2-2-1-3 3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z"/>
  </svg>
);
const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const RotateCcwIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);
const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 6.5 2a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
);
const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export default function App() {
  const [status, setStatus] = useState('HOME');
  const [upgrades, setUpgrades] = useState(0);
  const [crashReason, setCrashReason] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleStartBooking = () => setStatus('BOOKING');
  const handleReset = () => {
    setStatus('HOME');
    setUpgrades(0);
    setCrashReason(null);
  };
  const handleBack = () => {
    if (status === 'BOOKING') setStatus('HOME');
    else if (status === 'SUCCESS') setStatus('BOOKING');
  };

  const handleBoost = () => {
    setUpgrades(prev => prev + 1);
    setToastMessage('Premium Seat Upgrade Added');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFire = () => {
    if (upgrades >= 7) {
      // Simulate legacy gateway overflow
      setCrashReason(`Payment gateway overflow! Max upgrades exceeded. Received: ${upgrades}`);
    } else {
      setStatus('SUCCESS');
    }
  };

  if (crashReason) {
    // Force a fatal crash view that testing tools will catch
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-zinc-50 text-zinc-900 font-sans">
        <div id="stateLabel" className="hidden">CRASH</div>
        <h1 className="text-3xl font-semibold mb-2">Application Error</h1>
        <p className="text-zinc-500">A client-side exception has occurred.</p>
        <div className="mt-6 p-4 bg-white border border-zinc-200 rounded text-sm text-red-600 font-mono max-w-lg text-center shadow-sm">
          {crashReason}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-zinc-100 font-sans overflow-hidden relative selection:bg-amber-500/30 flex flex-col">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/30 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-amber-500">
            <PlaneIcon className="w-7 h-7" />
            <span className="text-2xl font-serif italic tracking-wide text-zinc-50">SkyBoost</span>
          </div>
          <nav className="hidden md:flex items-center gap-3 text-xs tracking-widest uppercase text-zinc-500 font-medium">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Home</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-zinc-200">Checkout</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-white/5 text-xs font-mono text-amber-500/80 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <div id="stateLabel">{status}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 p-[1px]">
            <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-amber-100" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start overflow-hidden">
        
        {/* Left Panel: Flight Details */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center space-y-6">
          <div className="p-10 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">
            <div className="flex justify-between items-start mb-16">
              <div>
                <p className="text-amber-500/80 text-xs uppercase tracking-widest font-medium mb-3">Outbound Flight</p>
                <h2 className="text-4xl font-serif text-zinc-100">New York <span className="text-zinc-600 font-sans text-2xl mx-3 italic">to</span> Tokyo</h2>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Flight SB-804</p>
                <p className="font-serif text-2xl text-amber-50">14h 20m</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between mb-16">
              {/* Flight Path Graphic */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-800 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-300 w-1/2"
                  initial={{ width: "0%" }}
                  animate={{ width: "50%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
              
              <div className="relative z-10 bg-zinc-950 p-5 rounded-2xl border border-white/5 shadow-xl">
                <p className="text-4xl font-serif mb-1 text-zinc-100">JFK</p>
                <p className="text-xs tracking-widest text-zinc-500 uppercase">08:30 AM</p>
              </div>
              
              <div className="relative z-10 bg-amber-500 p-3 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <PlaneIcon className="w-5 h-5 text-zinc-950" />
              </div>
              
              <div className="relative z-10 bg-zinc-950 p-5 rounded-2xl border border-white/5 shadow-xl text-right">
                <p className="text-4xl font-serif mb-1 text-zinc-100">HND</p>
                <p className="text-xs tracking-widest text-zinc-500 uppercase">10:50 PM <span className="text-[10px] text-amber-500 ml-1">+1</span></p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Passenger</p>
                <p className="font-medium text-zinc-200">Alex Chen</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Class</p>
                <p className="font-medium text-amber-400">Sky First</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Aircraft</p>
                <p className="font-medium text-zinc-200">Boeing 787-9</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Flow */}
        <div className="lg:col-span-5 h-full min-h-[500px]">
          <AnimatePresence mode="wait">
            {status === 'HOME' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-10 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/30 border border-white/5 backdrop-blur-xl text-center space-y-8 h-full flex flex-col justify-center shadow-2xl"
              >
                <div className="w-20 h-20 mx-auto bg-amber-900/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                  <ShieldCheckIcon className="w-8 h-8 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-serif mb-3 text-zinc-100">Ready for takeoff?</h3>
                  <p className="text-zinc-400 font-light leading-relaxed">Review your flight details and proceed to secure your booking.</p>
                </div>
                <div className="pt-6">
                  <button
                    id="startBtn"
                    onClick={handleStartBooking}
                    className="w-full py-4 px-6 bg-zinc-100 text-zinc-950 hover:bg-white font-semibold tracking-wide rounded-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Begin Booking
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'BOOKING' && (
              <motion.div 
                key="booking"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 rounded-3xl bg-zinc-900/60 border border-white/5 backdrop-blur-xl flex flex-col h-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-serif text-zinc-100">Upgrades & Payment</h3>
                  <div className="flex gap-2">
                    <button 
                      id="backBtn" 
                      onClick={handleBack}
                      className="p-2.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors border border-white/5"
                      title="Go Back"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <button 
                      id="resetBtn" 
                      onClick={handleReset}
                      className="p-2.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors border border-white/5"
                      title="Reset Session"
                    >
                      <RotateCcwIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 flex-grow">
                  {/* Seat Upgrades Section */}
                  <div className="p-6 rounded-2xl bg-[#0a0a0a]/50 border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="font-medium text-amber-500 flex items-center gap-2 tracking-wide">
                          <StarIcon className="w-4 h-4" />
                          Seat Upgrades
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Enhance your comfort</p>
                      </div>
                      <div className="text-2xl font-serif text-zinc-100 bg-zinc-900 border border-white/5 px-5 py-2 rounded-xl">
                        {upgrades}
                      </div>
                    </div>
                    
                    <button
                      id="boostBtn"
                      onClick={handleBoost}
                      className="w-full py-3.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-sm font-medium tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <StarIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Add Premium Seat Upgrade
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-zinc-400 text-sm">
                      <span>Base Fare</span>
                      <span className="font-medium text-zinc-300">$1,240.00</span>
                    </div>
                    <div className="flex justify-between text-zinc-400 text-sm">
                      <span>Taxes & Fees</span>
                      <span className="font-medium text-zinc-300">$185.50</span>
                    </div>
                    {upgrades > 0 && (
                      <div className="flex justify-between text-amber-500/90 text-sm">
                        <span>Upgrades ({upgrades}x)</span>
                        <span className="font-medium">${(upgrades * 150).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-6 border-t border-white/5">
                      <span className="text-zinc-300 uppercase tracking-widest text-xs">Total</span>
                      <span className="text-3xl font-serif text-zinc-100">${(1425.50 + upgrades * 150).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-auto">
                  <button
                    id="fireBtn"
                    onClick={handleFire}
                    className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-semibold tracking-wide rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Confirm Payment
                  </button>
                </div>
              </motion.div>
            )}

            {status === 'SUCCESS' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 rounded-3xl bg-zinc-900/60 border border-amber-500/20 backdrop-blur-xl text-center space-y-6 h-full flex flex-col items-center justify-center shadow-2xl"
              >
                <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2Icon className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-4xl font-serif text-zinc-100">Booking Confirmed</h3>
                <p className="text-zinc-400 font-light leading-relaxed">Your flight to Tokyo is secured. Have a wonderful trip.</p>
                <button
                  id="resetBtn"
                  onClick={handleReset}
                  className="mt-8 py-3 px-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium tracking-wide rounded-xl transition-colors border border-white/5"
                >
                  Book Another Flight
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 px-6 py-3.5 bg-zinc-900 border border-amber-500/30 text-amber-50 rounded-full shadow-2xl shadow-black/50 flex items-center gap-3 text-sm font-medium tracking-wide"
          >
            <StarIcon className="w-4 h-4 text-amber-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
