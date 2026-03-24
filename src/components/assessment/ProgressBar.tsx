import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-3">
      {/* Step labels */}
      <div className="flex justify-between items-center">
        {stepLabels.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-medium transition-colors duration-300 ${
              i <= currentStep ? "text-accent" : "text-muted-foreground/50"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Counter */}
      <p className="text-xs text-muted-foreground text-right">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}
