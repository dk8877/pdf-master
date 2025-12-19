
import React from 'react';
import { 
  ShieldCheck, Lock, WifiOff, EyeOff, 
  ArrowLeft, Heart, CheckCircle2, CloudOff,
  ServerOff, Database, Fingerprint
} from 'lucide-react';

interface PrivacyScreenProps {
  onBack: () => void;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 animate-reveal">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={onBack} className="p-4 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all border border-white/60 dark:border-white/5 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tighter">Privacy Manifest</h2>
          <p className="text-slate-400 dark:text-slate-500 font-medium">Why your documents are safer here than anywhere else.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="glass-card rounded-[44px] p-12 bg-white/40 dark:bg-slate-800/20 border-white/80 dark:border-white/5 hover:-translate-y-2">
           <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-3xl flex items-center justify-center mb-10 shadow-sm">
             <WifiOff size={32} />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Offline by Design</h3>
           <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium opacity-80 mb-8">
             Unlike traditional PDF tools that upload your files to "the cloud" for processing, PDF Master runs entirely on your device. Your browser acts as a secure sandbox.
           </p>
           <ul className="space-y-4">
              <TrustCheck text="Zero server-side uploads" />
              <TrustCheck text="No temporary file storage" />
              <TrustCheck text="Works without internet connection" />
           </ul>
        </div>

        <div className="glass-card rounded-[44px] p-12 bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50 hover:-translate-y-2">
           <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-3xl flex items-center justify-center mb-10 shadow-sm">
             <EyeOff size={32} />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Human-Centric Policy</h3>
           <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium opacity-80 mb-8">
             We believe privacy is a feature, not a promise. We have removed all analytics, tracking pixels, and data mining scripts from the core engine.
           </p>
           <ul className="space-y-4">
              <TrustCheck text="No user tracking or analytics" />
              <TrustCheck text="No advertisements or data mining" />
              <TrustCheck text="Open access architecture" />
           </ul>
        </div>
      </div>

      <div className="glass-card rounded-[48px] p-16 bg-slate-900 text-white relative overflow-hidden group mb-20">
         <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <ShieldCheck size={400} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8">
               <Fingerprint size={12} /> Technical Guarantee
            </div>
            <h4 className="text-4xl font-bold mb-6 tracking-tight">WebAssembly Sandboxing</h4>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Our core engine is built using standard Web APIs and compiled logic that executes within your browser's RAM. When you close the tab, the memory is purged. No trace of your documents ever exists on any server, anywhere.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
               <TechStat icon={<ServerOff size={16}/>} label="No Backend" />
               <TechStat icon={<Database size={16}/>} label="No Database" />
               <TechStat icon={<CloudOff size={16}/>} label="No Cloud" />
            </div>
         </div>
      </div>

      <footer className="text-center pb-20">
         <p className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
           Built with <Heart size={12} className="text-rose-400 fill-rose-400" /> for the Privacy-First Web.
         </p>
      </footer>
    </div>
  );
};

const TrustCheck = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
    {text}
  </li>
);

const TechStat = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
    <div className="p-2 bg-white/5 rounded-lg text-white">
      {icon}
    </div>
    {label}
  </div>
);

export default PrivacyScreen;
