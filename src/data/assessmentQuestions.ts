export interface ScoredQuestion {
  id: string;
  text: string;
  options: { value: "A" | "B" | "C"; label: string }[];
}

export interface MultiChoiceQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

export interface OpenQuestion {
  id: string;
  text: string;
}

export const scoredQuestions: ScoredQuestion[] = [
  {
    id: "q1",
    text: "Are you aware that as of December 1, 2025, Victorian employers have a positive statutory duty to identify and manage psychosocial hazards with the same rigour as physical safety?",
    options: [
      { value: "A", label: "Yes, we have a documented psychosocial risk management framework in place." },
      { value: "B", label: "We have a general \"wellness\" policy but no specific psychosocial risk register." },
      { value: "C", label: "No, we were unaware of this specific regulatory commencement." },
    ],
  },
  {
    id: "q2",
    text: "In the last 12 months, has your production experienced \"warning signs\" such as unexplained absenteeism, high crew turnover, or informal complaints about \"on-set culture\"?",
    options: [
      { value: "A", label: "No, these metrics are stable and monitored." },
      { value: "B", label: "We have seen spikes during \"crunch\" periods but haven't investigated the root causes." },
      { value: "C", label: "Yes, we have frequent turnover and absenteeism that we typically attribute to \"industry pressure\"." },
    ],
  },
  {
    id: "q3",
    text: "Does your production routinely require sustained high workloads, such as \"12-hour+ shoot days\" or \"back-to-back night shifts\" without a formal fatigue risk management plan?",
    options: [
      { value: "A", label: "No, all schedules include mandated recovery times and are assessed for fatigue risks." },
      { value: "B", label: "We follow standard union guidelines but don't perform individual task-demand audits." },
      { value: "C", label: "Yes, long hours and tight deadlines are the \"standard\" and are not assessed as hazards." },
    ],
  },
  {
    id: "q4",
    text: "How clearly are roles, decision rights, and reporting lines defined on your call sheets and in practice?",
    options: [
      { value: "A", label: "Roles are explicitly defined; there is zero ambiguity regarding authority and accountability." },
      { value: "B", label: "Crew generally know their jobs, but \"grey zones\" often lead to conflicting instructions under pressure." },
      { value: "C", label: "Role confusion is common, and crew members often report receiving conflicting directions from different leadership layers." },
    ],
  },
  {
    id: "q5",
    text: "When schedule changes or script revisions occur last-minute, what is your primary method for managing the resulting crew stress?",
    options: [
      { value: "A", label: "We conduct a \"Change Impact Assessment\" and adjust resourcing or deadlines accordingly." },
      { value: "B", label: "We tell the crew to \"be resilient\" and provide access to an Employee Assistance Program (EAP)." },
      { value: "C", label: "We expect the crew to \"get on with it\" without adjusting resourcing or workload." },
    ],
  },
  {
    id: "q6",
    text: "Does your production leadership team (Directors, PMs, HODs) receive specific training on identifying early signs of psychological harm and \"Moral Injury\"?",
    options: [
      { value: "A", label: "Yes, all HODs are trained in the Biopsychosocial-Spiritual (BPSS) framework and supportive communication." },
      { value: "B", label: "They have received general leadership training but nothing specific to psychosocial risk." },
      { value: "C", label: "No, we rely on HODs to manage their own teams based on their personal experience." },
    ],
  },
  {
    id: "q7",
    text: "If a crew member reports an incident of \"on-set incivility\" or bullying, do you have a documented system that triggers an automatic review of your work design controls?",
    options: [
      { value: "A", label: "Yes, every report of hazard or injury triggers a mandatory review of risk controls." },
      { value: "B", label: "We investigate the individuals involved but don't typically review our systemic work design." },
      { value: "C", label: "We handle these as \"interpersonal personality clashes\" rather than systemic safety failures." },
    ],
  },
  {
    id: "q8",
    text: "Does your production involve exposure to traumatic content, distressing scenes, or high-risk stunts without a documented \"Trauma-Informed Practice\" protocol?",
    options: [
      { value: "A", label: "No, we have automated filters for traumatic footage and regular \"wellbeing check-ins\" for affected crew." },
      { value: "B", label: "We provide a \"realistic job preview\" but have no formal monitoring for cumulative trauma." },
      { value: "C", label: "Crew are expected to manage the emotional demands of the content as \"part of the job\"." },
    ],
  },
  {
    id: "q9",
    text: "Can you produce a \"succinct chronology of documentary evidence\" showing that you have consulted with crew and HSRs on psychosocial hazards?",
    options: [
      { value: "A", label: "Yes, we have minutes from safety committee meetings and documented consultation records." },
      { value: "B", label: "We talk to crew informally, but we have very few written records of these discussions." },
      { value: "C", label: "No, consultation is not currently a documented part of our risk identification process." },
    ],
  },
  {
    id: "q10",
    text: "What is the \"predominant\" control measure you use to manage psychological health on set?",
    options: [
      { value: "A", label: "Work Redesign: Adjusting rosters, automating admin, and clarifying role authority." },
      { value: "B", label: "Administrative/Wellness: Providing EAP, fruit boxes, and mindfulness seminars." },
      { value: "C", label: "None: We do not currently have specific controls for psychological health." },
    ],
  },
];

export const profileQuestions: MultiChoiceQuestion[] = [
  {
    id: "q11",
    text: "Which best describes your current situation?",
    options: [
      { value: "A", label: "I'm in the first 5 years of my career" },
      { value: "B", label: "I'm a Manager" },
      { value: "C", label: "I'm a Senior Leader" },
      { value: "D", label: "I'm an Executive" },
    ],
  },
  {
    id: "q12",
    text: "Which describes your desired outcome that you would like to achieve in the next 90 days?",
    options: [
      { value: "A", label: "I want to reduce absenteeism" },
      { value: "B", label: "I want to increase performance of my team" },
      { value: "C", label: "I want to reduce the organisation insurance premium" },
    ],
  },
  {
    id: "q13",
    text: "What is the obstacle that you think is stopping you or what have you tried that hasn't worked in the past?",
    options: [
      { value: "A", label: "Not doing anything" },
    ],
  },
  {
    id: "q14",
    text: "Which solution do you think would suit you best?",
    options: [
      { value: "A", label: "Education and training" },
      { value: "B", label: "One to one coaching" },
      { value: "C", label: "I want software" },
      { value: "D", label: "I want someone to do it all for me" },
    ],
  },
];

export const openQuestion: OpenQuestion = {
  id: "q15",
  text: "Is there anything else you think we need to know about?",
};

export type Interpretation = "defensible_maturity" | "governance_gap" | "high_statutory_risk";

export interface AssessmentResult {
  total_a: number;
  total_b: number;
  total_c: number;
  interpretation: Interpretation;
}

export function calculateResult(scored: Record<string, string>): AssessmentResult {
  let total_a = 0, total_b = 0, total_c = 0;
  Object.values(scored).forEach((v) => {
    if (v === "A") total_a++;
    else if (v === "B") total_b++;
    else if (v === "C") total_c++;
  });

  let interpretation: Interpretation;
  if (total_c >= total_a && total_c >= total_b) {
    interpretation = "high_statutory_risk";
  } else if (total_b >= total_a) {
    interpretation = "governance_gap";
  } else {
    interpretation = "defensible_maturity";
  }

  return { total_a, total_b, total_c, interpretation };
}

export const interpretationData: Record<Interpretation, {
  title: string;
  description: string;
  level: number; // 0-100 for gauge
  color: string;
}> = {
  defensible_maturity: {
    title: "Defensible Maturity",
    description: "Your production shows high defensible maturity. You are likely compliant with the 2025 Regulations, but you should continue annual monitoring to maintain this status.",
    level: 85,
    color: "hsl(160, 45%, 40%)",
  },
  governance_gap: {
    title: "Governance Gap",
    description: "You have a governance gap. While you have wellness initiatives, you are vulnerable to statutory liability because you are not addressing risks at the \"Work-as-Done\" systemic level. A psychosocial risk assessment is strongly recommended to build a defensible safety architecture.",
    level: 50,
    color: "hsl(35, 95%, 50%)",
  },
  high_statutory_risk: {
    title: "High Statutory Risk",
    description: "Your production is at high statutory risk. You are relying on individual crew \"coping\" (Level 3 controls) for systemic hazards, which is now a breach of the hierarchy of control mandates. Failure to act could result in criminal prosecution and significant fines (up to $17M+ in recent Victorian precedents). A formal psychosocial risk assessment is immediately required.",
    level: 15,
    color: "hsl(0, 84%, 60%)",
  },
};
