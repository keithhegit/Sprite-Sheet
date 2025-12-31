import React from 'react';
import { Check } from 'lucide-react';
import { AppStep } from '../types';
import { STEPS } from '../constants';

interface StepperProps {
  currentStep: AppStep;
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center w-full mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isLast = index === STEPS.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted ? 'bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/20' : ''}
                  ${isCurrent ? 'bg-white border-brand-accent text-brand-accent' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-100 border-gray-100 text-gray-400' : ''}
                `}
              >
                {isCompleted ? (
                  <Check size={20} strokeWidth={3} />
                ) : isCurrent ? (
                  <div className="w-3 h-3 bg-brand-accent rounded-full animate-ping" />
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                )}
              </div>
              <span 
                className={`
                  mt-2 text-xs font-medium uppercase tracking-wide
                  ${isCurrent || isCompleted ? 'text-gray-800' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
            
            {!isLast && (
              <div className="w-24 h-[3px] -mt-6 mx-2 bg-gray-100 relative rounded-full overflow-hidden">
                 <div 
                   className="absolute top-0 left-0 h-full bg-brand-accent transition-all duration-500"
                   style={{ width: isCompleted ? '100%' : '0%' }}
                 />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;