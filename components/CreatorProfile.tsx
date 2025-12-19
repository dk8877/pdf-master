import React from 'react';
import { 
  X, GraduationCap, Mail, Github, Globe, Sparkles, Zap, Cpu, 
  MousePointer2, Rocket, ShieldCheck, Heart, Search, Layout, 
  Code2, RefreshCw, Download, Box, ArrowRight, ExternalLink
} from 'lucide-react';

interface CreatorWidgetProps {
  onOpen: () => void;
}

export const CreatorWidget: React.FC<CreatorWidgetProps> = ({ onOpen }) => {
  return (
    <button 
      onClick={onOpen}
      className="flex items-center gap-3 p-1 rounded-2xl bg-slate-100/50 hover:bg-white transition-all border border-transparent hover:border-white shadow-sm group"
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-105">
         <img 
           src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=150&h=150" 
           alt="Dilip Kumar"
           className="w-full h-full object-cover"
         />
      </div>
      <div className="pr-2 hidden lg:block text-left">
        <p className="text-[11px] font-bold text-slate-800 leading-tight">Dilip Kumar</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Product Engineer</p>
      </div>
    </button>
  );
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-8 glass-card rounded-[48px] shadow-2xl flex flex-col overflow-hidden border-white/60 animate-reveal">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/80 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-800 transition-all z-50 shadow-sm">
          <X size={20}/>
        </button>

        <div className="p-10 lg:p-16 overflow-y-auto max-h-[90vh]">
          {/* Eye-Tracking Optimized Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            
            {/* 1. IDENTITY CARD (Fixation Point 1 - Top Left) */}
            <div 
              className="md:col-span-12 lg:col-span-7 glass-card bg-white/40 rounded-[44px] p-10 lg:p-12 flex flex-col md:flex-row gap-10 items-center md:items-start transition-all hover:bg-white animate-reveal"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-[48px] p-2 bg-white shadow-2xl">
                  <div className="w-full h-full rounded-[40px] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=400&h=400" alt="Dilip Kumar" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white animate-pulse-soft">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-5xl lg:text-6xl font-bold text-slate-800 tracking-tighter mb-4">Dilip Kumar</h2>
                <h3 className="text-xl font-medium text-slate-500 mb-6 leading-tight">
                  Freelance App & Website Developer<br/>
                  <span className="text-indigo-600 font-bold">Product-Focused Engineer</span>
                </h3>
                <p className="text-slate-500 leading-relaxed text-base lg:text-lg font-medium opacity-80">
                  "I am deeply enthusiastic about coding, AI, and building modern applications that are clean, intuitive, and genuinely useful."
                </p>
              </div>
            </div>

            {/* 2. MASTERY & EXECUTION (Fixation Point 2 - Top Right) */}
            <div 
              className="md:col-span-12 lg:col-span-5 glass-card bg-slate-50/30 rounded-[44px] p-10 lg:p-12 animate-reveal"
              style={{ animationDelay: '0.2s' }}
            >
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <Cpu size={14} className="text-indigo-500" /> Capabilities
              </h3>
              <div className="space-y-6">
                <SkillLabel label="Frontend & App Development" level="Expert" />
                <SkillLabel label="UI/UX & Product Thinking" level="Senior" />
                <SkillLabel label="AI & Prompt Engineering" level="Advanced" />
                <SkillLabel label="Workflow Automation" level="Pro" />
                <SkillLabel label="User-Focused Dev" level="Expert" />
              </div>
            </div>

            {/* 3. FLAGSHIP PROJECT (Visual Anchor - Center) */}
            <div 
              className="md:col-span-12 glass-card bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-[48px] p-12 lg:p-16 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200/50 animate-reveal"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Box size={280} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
                    <Rocket size={12} /> Creator of PDF-Master
                  </div>
                  <h4 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">Proof of Quality</h4>
                  <p className="text-indigo-50 text-lg lg:text-xl font-medium leading-relaxed mb-8 opacity-90">
                    A premium document workstation built to solve real usability problems. Focus on clean UI decisions and smooth transitions.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {['React', 'PDF-Lib', 'Tailwind', 'Cosmic-UI'].map(tag => (
                      <span key={tag} className="px-4 py-1.5 bg-white/10 rounded-xl text-xs font-bold border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block w-px h-40 bg-white/20"></div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white/10 rounded-[32px] flex items-center justify-center mb-4 backdrop-blur-md group-hover:rotate-12 transition-transform">
                    <Layout size={40} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest">Case Study Pending</span>
                </div>
              </div>
            </div>

            {/* 4. FOUNDATION (Lower Left) */}
            <div 
              className="md:col-span-12 lg:col-span-4 glass-card bg-white/20 rounded-[44px] p-10 animate-reveal"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <GraduationCap size={16} className="text-indigo-500" /> Foundation
              </h3>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Tezpur University</h4>
                <p className="text-sm text-slate-500 font-medium">B.Tech · Civil Engineering</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-slate-400 uppercase">
                  <span>2024</span> <ArrowRight size={10} /> <span>2028</span>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100/50">
                <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                  "Engineering rigor meets product passion."
                </p>
              </div>
            </div>

            {/* 5. TRUST & VALUES (Mid Lower) */}
            <div 
              className="md:col-span-12 lg:col-span-4 glass-card bg-white/40 rounded-[44px] p-10 animate-reveal"
              style={{ animationDelay: '0.5s' }}
            >
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-500" /> Why Work with Me
              </h3>
              <ul className="space-y-6">
                <TrustItem icon={<Heart size={14}/>} title="Product Thinking" text="I build for the user, not just the code." />
                <TrustItem icon={<Zap size={14}/>} title="Execution Velocity" text="Clean code delivered at startup speed." />
                <TrustItem icon={<Globe size={14}/>} title="Reliable Partner" text="Clear communication & long-term mindset." />
              </ul>
            </div>

            {/* 6. CONVERSION CTA (Fixation Point 3 - Bottom Right) */}
            <div 
              className="md:col-span-12 lg:col-span-4 glass-card bg-indigo-500 rounded-[44px] p-10 text-white flex flex-col justify-between group transition-all hover:bg-indigo-600 animate-reveal shadow-xl shadow-indigo-100"
              style={{ animationDelay: '0.6s' }}
            >
              <div>
                <h3 className="text-[11px] font-black text-indigo-100 uppercase tracking-[0.3em] mb-4">Final Step</h3>
                <h4 className="text-2xl font-bold leading-tight tracking-tight mb-8">Ready to build something useful?</h4>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="mailto:jay940459@gmail.com" 
                  className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl"
                >
                  <Mail size={18} /> Collaborate
                </a>
                <div className="flex gap-4">
                   <a 
                    href="https://github.com/dk8877" 
                    target="_blank" 
                    className="flex-1 py-4 bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/20"
                  >
                    <Github size={18} /> GitHub
                  </a>
                  <button 
                    className="px-6 py-4 bg-white/10 rounded-2xl font-bold transition-all hover:bg-white/20"
                    title="Download Resume"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const SkillLabel: React.FC<{ label: string, level: string }> = ({ label, level }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 transition-all hover:pl-2">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded-lg">{level}</span>
  </div>
);

const TrustItem: React.FC<{ icon: React.ReactNode, title: string, text: string }> = ({ icon, title, text }) => (
  <div className="flex gap-4 group">
    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-sm">
      {icon}
    </div>
    <div>
      <h5 className="text-sm font-bold text-slate-800 leading-none mb-1">{title}</h5>
      <p className="text-xs text-slate-400 font-medium">{text}</p>
    </div>
  </div>
);
