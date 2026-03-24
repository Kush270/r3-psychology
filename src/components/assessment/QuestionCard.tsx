import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

interface RadioOption {
  value: string;
  label: string;
}

interface QuestionCardProps {
  questionNumber: number;
  text: string;
  type: "radio" | "textarea";
  options?: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function QuestionCard({ questionNumber, text, type, options, value, onChange }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * (questionNumber % 5) }}
      className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <p className="font-display text-base md:text-lg font-medium text-foreground mb-5 leading-relaxed">
        <span className="text-accent font-semibold mr-2">{questionNumber}.</span>
        {text}
      </p>

      {type === "radio" && options && (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
          {options.map((opt) => (
            <label
              key={opt.value}
              htmlFor={`q${questionNumber}-${opt.value}`}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                value === opt.value
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/40"
              }`}
            >
              <RadioGroupItem value={opt.value} id={`q${questionNumber}-${opt.value}`} className="mt-0.5 shrink-0" />
              <Label
                htmlFor={`q${questionNumber}-${opt.value}`}
                className="text-sm text-foreground/80 leading-relaxed cursor-pointer font-normal"
              >
                {opt.label}
              </Label>
            </label>
          ))}
        </RadioGroup>
      )}

      {type === "textarea" && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          maxLength={500}
          className="bg-background border-border focus:border-accent resize-none"
        />
      )}
    </motion.div>
  );
}
