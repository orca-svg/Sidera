import React, { useState } from 'react';
import { X, MousePointer2, Move, ZoomIn, Command, Keyboard, Star, Info, Navigation, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export function HelpModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('nav'); // 'nav' | 'legend' | 'keys'

  const tabs = [
    { id: 'nav', label: 'Navigation', icon: Navigation },
    { id: 'legend', label: 'Legend', icon: Info },
    { id: 'keys', label: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        // Use 'glass-panel' utility from index.css for consistent look
        className="w-full max-w-2xl glass-panel rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20 text-accent">
              <Info size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Explorer's Guide</h2>
              <p className="text-sm text-gray-400">Manual for Sidera System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-6 pt-4 gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "pb-3 text-sm font-medium flex items-center gap-2 transition-all relative",
                activeTab === tab.id ? "text-accent" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_var(--color-accent)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'nav' && (
              <motion.div
                key="nav"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >

                <Section title="Camera Controls" icon={MousePointer2}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ControlCard
                      icon={<MousePointer2 size={24} className="animate-bounce-slow" />}
                      label="Rotate"
                      desc="Left Click + Drag"
                    />
                    <ControlCard
                      icon={<Move size={24} />}
                      label="Pan / Move"
                      desc="Right Click + Drag"
                    />
                    <ControlCard
                      icon={<ZoomIn size={24} />}
                      label="Zoom"
                      desc="Mouse Wheel Scroll"
                    />
                    <ControlCard
                      icon={<ArrowUpRight size={24} />}
                      label="Focus Node"
                      desc="Click on any Star"
                    />
                  </div>
                </Section>
              </motion.div>
            )}

            {activeTab === 'legend' && (
              <motion.div
                key="legend"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Section title="Star Types" icon={Star}>
                  <div className="space-y-4">
                    <LegendItem
                      color="bg-accent"
                      shadow="shadow-accent/50"
                      title="Alpha Node (Main Topic)"
                      desc="Key insights and major conversation turns. These are your primary landmarks."
                    />
                    <LegendItem
                      color="bg-cyan-400"
                      shadow="shadow-cyan-500/50"
                      title="Beta Node (Detail)"
                      desc="Supporting details, follow-up questions, and general chat history."
                    />
                    <LegendItem
                      color="bg-gray-400"
                      shadow="shadow-gray-500/50"
                      title="Satellite (Trivial)"
                      desc="Brief acknowledgments or minor interactions."
                    />
                  </div>
                </Section>

                <Section title="Connections" icon={ShareIcon}>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Flow Line</h4>
                      <p className="text-xs text-gray-400">Shows the chronological progression of the conversation.</p>
                    </div>
                  </div>
                </Section>
              </motion.div>
            )}

            {activeTab === 'keys' && (
              <motion.div
                key="keys"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <ShortcutKey k="ESC" desc="Return to Chat Mode from Constellation" />
                <ShortcutKey k="Enter" desc="Send Message" />
                <ShortcutKey k="Shift + Enter" desc="New Line in Input" />
                {/* Future shortcuts can be added here */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Start Exploring
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Reuseable Components

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Icon size={16} /> {title}
      </h3>
      {children}
    </div>
  )
}

function ControlCard({ icon, label, desc }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 transition-colors">
      <div className="p-3 bg-black/50 rounded-lg text-accent border border-white/10">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{label}</h4>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  )
}

function LegendItem({ color, shadow, title, desc }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className={`w-4 h-4 rounded-full ${color} ${shadow} shadow-[0_0_15px] border border-white/20 shrink-0`} />
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  )
}

function ShortcutKey({ k, desc }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
      <span className="text-sm text-gray-300">{desc}</span>
      <kbd className="px-3 py-1.5 bg-black/50 border border-white/20 rounded-lg text-xs font-mono text-accent font-bold min-w-[3rem] text-center shadow-lg">
        {k}
      </kbd>
    </div>
  )
}

// Icon helper
function ShareIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}
