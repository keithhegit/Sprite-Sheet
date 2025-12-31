import React from 'react';

interface LoadingStepProps {
  uploadedImage: string;
  message?: string;
}

const LoadingStep: React.FC<LoadingStepProps> = ({ uploadedImage, message }) => {
  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-3xl">
       {/* Background Blurred Image */}
       <div 
         className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-110"
         style={{ backgroundImage: `url(${uploadedImage})` }}
       ></div>
       
       <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>

       <div className="relative z-10 flex flex-col items-center justify-center h-full">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-pulse">
               <div className="relative">
                 {/* Corners */}
                 <span className="absolute -top-3 -left-3 border-t-2 border-l-2 border-brand-accent w-4 h-4 rounded-tl-lg"></span>
                 <span className="absolute -top-3 -right-3 border-t-2 border-r-2 border-brand-accent w-4 h-4 rounded-tr-lg"></span>
                 <span className="absolute -bottom-3 -left-3 border-b-2 border-l-2 border-brand-accent w-4 h-4 rounded-bl-lg"></span>
                 <span className="absolute -bottom-3 -right-3 border-b-2 border-r-2 border-brand-accent w-4 h-4 rounded-br-lg"></span>
                 
                 {/* Inner icon (simple representation) */}
                 <div className="w-8 h-8 border-2 border-dashed border-gray-200 rounded-lg animate-spin duration-[3000ms]"></div>
               </div>
            </div>
            {/* Sparkle badge */}
            <div className="absolute -top-2 -right-2 bg-brand-accent text-white p-1.5 rounded-full shadow-md animate-bounce">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
         </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{message || '正在通过 AI 生成精灵图...'}</h3>
        <p className="text-gray-500 text-sm mb-8">大约需要 15-30 秒</p>

         <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-brand-accent animate-[loading_2s_ease-in-out_infinite] w-1/3 rounded-full shadow-[0_0_10px_rgba(255,122,0,0.5)]"></div>
         </div>
         
         <style>{`
           @keyframes loading {
             0% { transform: translateX(-100%); }
             50% { transform: translateX(100%); width: 50%; }
             100% { transform: translateX(300%); }
           }
         `}</style>
       </div>
    </div>
  );
};

export default LoadingStep;