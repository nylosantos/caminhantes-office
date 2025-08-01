import React from 'react';
import { Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // Usando cn para mesclar classes condicionalmente (opcional, mas recomendado)

// Definição do tipo para cada passo
export interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

// Props que o componente Stepper irá receber
interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  canAdvanceToStep: (stepId: number) => boolean;
}

// const Stepper: React.FC<StepperProps> = ({
//   steps,
//   currentStep,
//   onStepClick,
//   canAdvanceToStep,
// }) => {
//   return (
//     // O container agora permite que os itens quebrem a linha em telas pequenas
//     <div className="flex items-start justify-center md:justify-between flex-wrap gap-y-4 mb-8">
//       {steps.map((step, index) => {
//         const isCompleted = currentStep > step.id;
//         const isActive = currentStep === step.id;
//         const canAccess = canAdvanceToStep(step.id);

//         return (
//           // Cada passo é um item flexível
//           <div
//             key={step.id}
//             className="flex items-center"
//           >
//             {/* Ícone do Passo */}
//             <div className="flex flex-col items-center">
//               <button
//                 type="button"
//                 onClick={() => canAccess && onStepClick(step.id)}
//                 disabled={!canAccess}
//                 className={cn(
//                   'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
//                   {
//                     'bg-green-600 border-green-600 text-white': isCompleted,
//                     'bg-red-600 border-red-600 text-white': isActive,
//                     'border-gray-300 text-gray-500 hover:border-red-500':
//                       !isActive && !isCompleted && canAccess,
//                     'border-gray-200 text-gray-300 cursor-not-allowed':
//                       !canAccess,
//                     'cursor-pointer': canAccess,
//                   }
//                 )}
//               >
//                 {isCompleted ? (
//                   <Check className="w-5 h-5" />
//                 ) : (
//                   <step.icon className="w-5 h-5" />
//                 )}
//               </button>
//               {/* Título visível apenas no mobile para o passo ativo */}
//               <p
//                 className={cn(
//                   'md:hidden text-xs font-display-medium mt-2 text-center w-16 truncate',
//                   {
//                     'text-red-600': isActive,
//                     'text-green-600': isCompleted,
//                     'text-gray-500': !isActive && !isCompleted,
//                   }
//                 )}
//               >
//                 {step.title}
//               </p>
//             </div>

//             {/* Conector e Texto (visíveis apenas em telas maiores) */}
//             {index < steps.length - 1 && (
//               <div className="hidden md:flex items-center">
//                 {/* Linha Conectora */}
//                 <div
//                   className={cn('w-12 h-px mx-4', {
//                     'bg-green-600': isCompleted,
//                     'bg-gray-300': !isCompleted,
//                   })}
//                 />

//                 {/* Título e Descrição */}
//                 <div className="w-32">
//                   <p
//                     className={cn('text-sm font-display-medium', {
//                       'text-red-600': isActive,
//                       'text-green-600': isCompleted,
//                       'text-gray-500': !isActive && !isCompleted,
//                     })}
//                   >
//                     {step.title}
//                   </p>
//                   <p className="text-xs text-gray-500 font-display">
//                     {step.description}
//                   </p>
//                 </div>

//                 {/* Linha Conectora */}
//                 <div
//                   className={cn('w-12 h-px mx-4', {
//                     'bg-green-600': isCompleted,
//                     'bg-gray-300': !isCompleted,
//                   })}
//                 />
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// Versão alternativa e mais robusta para telas grandes, que se adapta melhor
const StepperResponsive: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  canAdvanceToStep,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const canAccess = canAdvanceToStep(step.id);

          return (
            <React.Fragment key={step.id}>
              {/* Ícone e Texto */}
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => canAccess && onStepClick(step.id)}
                  disabled={!canAccess}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all shrink-0',
                    {
                      'bg-green-600 border-green-600 text-white': isCompleted,
                      'bg-red-600 border-red-600 text-white': isActive,
                      'border-gray-300 text-gray-500 hover:border-red-500':
                        !isActive && !isCompleted && canAccess,
                      'border-gray-200 text-gray-300 cursor-not-allowed':
                        !canAccess,
                      'cursor-pointer': canAccess,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </button>
                <div className="mt-2">
                  <p
                    className={cn(
                      'hidden md:block text-xs md:text-sm font-display-medium w-20 md:w-auto truncate md:whitespace-normal',
                      {
                        'text-red-600': isActive,
                        'text-green-600': isCompleted,
                        'text-gray-500': !isActive && !isCompleted,
                      }
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="hidden md:block text-xs text-gray-500 font-display">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Linha Conectora */}
              {index < steps.length - 1 && (
                <div
                  className={cn('flex-1 h-px mx-2 md:mx-4', {
                    'bg-green-500': isCompleted,
                    'bg-gray-300': !isCompleted,
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepperResponsive;
