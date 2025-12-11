import React from 'react';
import { User, Github, Linkedin, X, Cpu, Sparkles, GraduationCap, Briefcase, Mail, CheckCircle } from 'lucide-react';

interface CreatorWidgetProps {
  onOpen: () => void;
}

export const CreatorWidget: React.FC<CreatorWidgetProps> = ({ onOpen }) => {
  return (
    <div 
      onClick={onOpen}
      className="mt-6 pt-6 border-t border-white/5 cursor-pointer group"
    >
      <div className="relative p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all duration-300 overflow-hidden">
        {/* Scanline Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-fuchsia-500 p-[2px] shadow-[0_0_15px_rgba(34,211,238,0.5)]">
             <div className="w-full h-full rounded-full bg-[#0f0c29] flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-white" />
             </div>
          </div>
          <div>
             <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Created by Architect</h4>
             <p className="text-[10px] text-slate-400 uppercase tracking-wider">View Full Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       {/* Backdrop */}
       <div 
         className="absolute inset-0 bg-[#0f0c29]/95 backdrop-blur-xl animate-fade-in"
         onClick={onClose}
       />
       
       {/* Main Container */}
       <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#1a163a]/90 border border-cyan-500/30 rounded-3xl shadow-[0_0_100px_rgba(34,211,238,0.15)] animate-fade-in-up flex flex-col md:flex-row">
          
          {/* Decorative Lines */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-fuchsia-500/50 rounded-br-3xl pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors border border-white/10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Column: Identity & Core Info */}
          <div className="w-full md:w-1/3 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center text-center relative overflow-hidden">
             {/* Background Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-cyan-500/10 blur-[80px] pointer-events-none" />

             {/* Animated Avatar */}
             <div className="relative w-48 h-48 mb-8">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 border-2 border-fuchsia-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse]" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-600 p-[3px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                   <div className="w-full h-full rounded-full bg-[#0f0c29] flex items-center justify-center overflow-hidden">
                      <User className="w-20 h-20 text-white" />
                   </div>
                </div>
             </div>

             <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Cosmic Architect</h2>
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles className="w-3 h-3" /> Full Stack Engineer
             </div>

             <p className="text-slate-300 mb-8 leading-relaxed text-sm">
               Architecting digital experiences that transcend the ordinary. Specializing in high-performance web applications, intuitive UI/UX, and robust backend systems.
             </p>

             {/* Social Actions */}
             <div className="w-full space-y-3">
                <a 
                   href="https://github.com/dk8877"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-3 bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-400/10 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition-all group"
                >
                   <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
                   <span>GitHub Profile</span>
                </a>
                <button className="w-full py-3 bg-white/5 border border-white/10 hover:border-blue-400/50 hover:bg-blue-400/10 rounded-xl text-white font-medium flex items-center justify-center gap-3 transition-all group">
                   <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white" />
                   <span>LinkedIn Network</span>
                </button>
                <div className="w-full">
                    <a 
                       href="mailto:jay940459@gmail.com"
                       className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
                    >
                       <Mail className="w-5 h-5" />
                       <span>Contact Me</span>
                    </a>
                    <p className="text-center mt-2 text-xs text-slate-500 font-mono select-all hover:text-cyan-400 transition-colors cursor-pointer">jay940459@gmail.com</p>
                </div>
             </div>
          </div>

          {/* Right Column: Data Banks */}
          <div className="w-full md:w-2/3 p-8 md:p-12 bg-[#0f0c29]/30">
             
             {/* Section: Academic */}
             <div className="mb-10">
                <h3 className="flex items-center gap-3 text-lg font-bold text-fuchsia-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                    <GraduationCap className="w-5 h-5" /> Academic Qualification
                </h3>
                <div className="space-y-4">
                    <div className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 transition-all hover:bg-white/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-white font-bold text-lg">Master of Computer Science</h4>
                                <p className="text-slate-400 text-sm">Tech University of the Cosmos</p>
                            </div>
                            <span className="px-3 py-1 rounded bg-fuchsia-500/10 text-fuchsia-300 text-xs font-mono">2020 - 2022</span>
                        </div>
                        <p className="mt-2 text-slate-500 text-sm">Specialized in Artificial Intelligence and Advanced Web Technologies.</p>
                    </div>
                    <div className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-fuchsia-500/30 transition-all hover:bg-white/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-white font-bold text-lg">Bachelor of Engineering</h4>
                                <p className="text-slate-400 text-sm">Institute of Future Systems</p>
                            </div>
                            <span className="px-3 py-1 rounded bg-fuchsia-500/10 text-fuchsia-300 text-xs font-mono">2016 - 2020</span>
                        </div>
                    </div>
                </div>
             </div>

             {/* Section: Tech Arsenal */}
             <div className="mb-10">
                <h3 className="flex items-center gap-3 text-lg font-bold text-cyan-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                    <Cpu className="w-5 h-5" /> Tech Arsenal
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { name: "React", level: "Expert" },
                        { name: "TypeScript", level: "Expert" },
                        { name: "Node.js", level: "Advanced" },
                        { name: "Tailwind", level: "Expert" },
                        { name: "Next.js", level: "Advanced" },
                        { name: "PostgreSQL", level: "Intermediate" },
                        { name: "AWS", level: "Intermediate" },
                        { name: "UI/UX", level: "Advanced" },
                    ].map((skill, i) => (
                        <div key={i} className="p-3 rounded-lg bg-[#0f0c29] border border-white/10 flex flex-col items-center justify-center text-center hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-colors cursor-default">
                            <span className="text-white font-bold text-sm">{skill.name}</span>
                            <span className="text-[10px] text-cyan-500/70 uppercase tracking-wide mt-1">{skill.level}</span>
                        </div>
                    ))}
                </div>
             </div>

             {/* Section: Services / About */}
             <div>
                <h3 className="flex items-center gap-3 text-lg font-bold text-amber-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                    <Briefcase className="w-5 h-5" /> Expertise
                </h3>
                <p className="text-slate-300 text-sm leading-7 mb-6">
                    Available for freelance projects and full-time opportunities. I help businesses build scalable, user-centric digital products. From concept to deployment, I ensure every pixel is perfect and every line of code is optimized.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-200 text-sm">
                        <CheckCircle className="w-4 h-4 text-amber-500" /> Web Application Development
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-200 text-sm">
                        <CheckCircle className="w-4 h-4 text-amber-500" /> UI/UX Design System Architecture
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-200 text-sm">
                        <CheckCircle className="w-4 h-4 text-amber-500" /> Performance Optimization
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-amber-200 text-sm">
                        <CheckCircle className="w-4 h-4 text-amber-500" /> Technical Consultation
                    </div>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};