import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  created_at: string;
}

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const SectionHeading = ({ number, title }: { number: string; title: string }) => (
  <motion.h2
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="text-2xl md:text-3xl font-display font-bold text-primary mt-12 mb-4"
  >
    {number}. {title}
  </motion.h2>
);

const ComparisonTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto my-6">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="bg-primary text-primary-foreground p-3 text-left font-semibold border border-border">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/50"}>
            {row.map((cell, j) => (
              <td key={j} className={`p-3 border border-border ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Blog = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ name: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_slug", "evolutionary-foundations")
      .order("created_at", { ascending: false });
    if (data) setComments(data);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.content.trim()) {
      toast.error("Please write a comment before submitting.");
      return;
    }
    if (commentForm.content.length > 2000) {
      toast.error("Comment must be under 2000 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("blog_comments").insert({
      author_name: commentForm.name.trim() || null,
      content: commentForm.content.trim(),
      post_slug: "evolutionary-foundations",
    });
    if (error) {
      toast.error("Failed to submit comment.");
    } else {
      toast.success("Comment posted!");
      setCommentForm({ name: "", content: "" });
      fetchComments();
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 text-accent mb-4">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Research Article</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary leading-tight mb-4">
          Evolutionary Foundations of Human Psychology: A Thematic Reassessment
        </h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive exploration of how evolutionary theory reshapes our understanding of the human mind, dysfunction, and therapeutic practice.
        </p>
      </motion.div>

      <Separator className="my-8" />

      {/* Section 1 */}
      <SectionHeading number="1" title='The Theoretical Transition: From the "Blank Slate" to Evolved Architecture' />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          In the view of the theoretical information architect, the human mind is the ultimate antientropic exception. The "First Law of Psychology" is, in fact, the Second Law of Thermodynamics: in a universe trending toward disorder and entropy, natural selection is the only physical process capable of building and maintaining high-order functional organization. The Standard Social Science Model (SSSM) fails to account for this reality, erroneously assuming a "Blank Slate" architecture—a content-free, general-purpose learning device that is infinitely malleable.
        </p>
        <p>
          Evolutionary Psychology (EP) rejects the SSSM's view of a passive mind. Instead, it posits a "factory-equipped" architecture composed of specialized, antientropic structures. These mechanisms were sculpted over deep time to solve the specific, recurring adaptive problems of our ancestors, providing the "explanatory adequacy" that traditional models lack.
        </p>
      </motion.div>

      <ComparisonTable
        headers={["Dimension", "Standard Social Science Model (SSSM)", "Evolutionary Psychology (EP)"]}
        rows={[
          ["Central Assumption", 'The mind is a "Blank Slate" or general-purpose learning device.', "The mind is an evolved, antientropic system of functional specializations."],
          ["Role of Environment", "The sole architect of mental content and organizational logic.", "The trigger for evolved programs; provides inputs for specialized processing."],
          ["Cognitive Structure", "Content-independent, equipotential, and domain-general.", "Content-dependent, domain-specific, and functionally specialized."],
          ["View of Culture", "An autonomous force that writes scripts onto the passive mind.", "A product of the universal, species-typical evolved architecture of the mind."],
        ]}
      />

      {/* Section 2 */}
      <SectionHeading number="2" title="Neurobiology and Brain Function: The Computational Logic of the Mind" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          The brain is a physical computational system designed by natural selection to extract information from the environment and use it to regulate behavior and physiology. As outlined by John Tooby and Leda Cosmides, the foundational logic of this system rests on five premises:
        </p>
        <div className="space-y-4 pl-4 border-l-2 border-accent/40">
          {[
            ["C-1: The Brain as a Physical Computer", 'The brain\'s circuitry was "engineered" to process information and solve adaptive problems. It is a biological machine where function defines the arrangement of parts.'],
            ["C-2: Behavioral Output via Programs", "All behavior is the output of evolved programs. Understanding human action requires mapping the specific circuit logic and the informational inputs that activate it."],
            ["C-3: Ancestral Design", "Our neural programs were sculpted by the selection pressures of the Pleistocene. They reflect the functional demands of the cross-generationally enduring structure of the hunter-gatherer world."],
            ["C-4: Potential Mismatch", 'Because complex adaptations take thousands of generations to build, our "stone age" circuits may generate outputs that are maladaptive in modern, industrially novel environments.'],
            ["C-5: Functional Specialization (Modularity)", "The mind is not a single processor but a collection of specialized subroutines. Just as the liver detoxifies and the heart pumps, different neural circuits handle incommensurate problems like language, mate choice, or predator avoidance."],
          ].map(([title, desc]) => (
            <div key={title}>
              <p className="font-semibold text-foreground">{title}</p>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 3 */}
      <SectionHeading number="3" title="Understanding Dysfunction: Trauma and the Mechanism of Recalibration" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          In an evolutionary framework, emotions are not mere "feelings" but superordinate programs—the Operating System (OS) of the mind. They coordinate the activities of many sub-programs (perception, attention, memory, and physiology) to meet the demands of specific situations. Trauma acts as a high-stakes informational input that triggers an "amygdala-mediated recalibration." This is an evolved response where the OS reconfigures all sub-routines to prioritize survival, safety, and future avoidance of the threat. PTSD, therefore, is not a random breakdown but a lasting, functional recalibration of these systems in response to cues of extreme ancestral-type danger.
        </p>
        <Card className="bg-muted/30 border-accent/20">
          <CardContent className="p-6">
            <p className="font-display font-semibold text-foreground mb-2">Biological Function vs. Dysfunction</p>
            <p className="text-sm">
              <strong>Biological function</strong> is defined by the specific effects for which a mechanism was designed by natural selection because those effects contributed to the fitness of ancestors. <strong>Biological dysfunction</strong> occurs when an internal mechanism fails to perform its natural function—that is, the function for which it was designed by the evolutionary process—within the environment for which it was intended.
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">— Jerome Wakefield</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 4 */}
      <SectionHeading number="4" title="Psychotherapeutic Implications: The Logic of Reverse Engineering" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Reverse engineering is the primary methodology for uncovering the hidden logic of the human psyche. By analyzing a complex psychological trait as an engineered solution, clinicians can identify the "ancestral adaptive problem" it was designed to solve, moving past symptoms to the underlying "special design."
        </p>
        <p className="font-semibold text-foreground">The Reverse Engineering Workflow for Psychological Analysis:</p>
        <ol className="list-decimal list-inside space-y-3 pl-2">
          <li><strong>Identify an Ancestral Adaptive Problem:</strong> Isolate a specific reproductive or survival challenge (e.g., inbreeding avoidance, cheater detection, or kin-directed altruism).</li>
          <li><strong>Conduct a Task Analysis:</strong> Determine the computational requirements—what information would a program need to process to solve this problem effectively?</li>
          <li><strong>Formulate Functional Hypotheses:</strong> Propose the structure of the specialized programs and the internal regulatory variables (e.g., kinship indices) required for the solution.</li>
          <li><strong>Test for "Special Design":</strong> Experimentally verify if the mechanism operates with the precision, reliability, and economy expected of a specialized tool.</li>
          <li><strong>Identify Mechanism Coordination:</strong> Map how the superordinate program (emotion) entrains other sub-routines like memory retrieval or physiological arousal.</li>
        </ol>
      </motion.div>

      {/* Section 5 */}
      <SectionHeading number="5" title="Mindfulness and Wisdom Traditions: Ecological Rationality and Design Evidence" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          Traditional psychology often views the mind as a "laundry list" of laboratory curiosities and cognitive errors. Evolutionary psychology provides "explanatory adequacy" by showing that these phenomena are often the result of Ecological Rationality. Our "fast-and-frugal" heuristics are not irrational biases but "Wisdom of the Ages"—evolved rules of thumb optimized for the information structures of ancestral environments.
        </p>
        <p>
          For example, the blank slate model cannot explain "Snake Avoidance"; a child does not "learn" the danger of a neutral stimulus from scratch. Rather, humans possess "innate ideas" or privileged hypotheses that allow the mind to instantly categorize "snakes" as objects of fear, whereas they might ignore modern, statistically more dangerous stimuli like cars or electrical outlets.
        </p>
      </motion.div>

      <ComparisonTable
        headers={["Concept", "Ecological Rationality", "Unbounded Rationality"]}
        rows={[
          ["Decision Basis", "Derived from ancestral cues and absolute frequencies.", "Derived from content-free, formal logical optimization."],
          ["Information Load", "Operates with limited information and high efficiency.", "Requires perfect information and infinite time."],
          ["Explanatory Depth", 'Validates evolved "wisdom" through functional design.', 'Dismisses heuristics as "laundry list" errors or curiosities.'],
          ["Real-World Utility", "Highly effective in recurring, specific task environments.", "Often paralyzed by combinatorial explosion in the real world."],
        ]}
      />

      {/* Section 6 */}
      <SectionHeading number="6" title="Social and Existential Context: The EEA and the Psychic Unity of Humankind" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed">
        <p>
          The Environment of Evolutionary Adaptedness (EEA) is the statistical composite of selection pressures that forged our species. Because complex adaptations require the coordinated fit of thousands of genes, sexual recombination acts as a critical constraint: it would "break apart" any design that was not universal. To ensure functional compatibility, humans must share a "universal make and model"—just as a mechanic cannot fix a Jaguar engine with Toyota parts. This "Jaguar vs. Toyota" logic necessitates the Psychic Unity of Humankind, where the core computational architecture of the mind is universal across all populations.
        </p>
        <p className="font-semibold text-foreground">The Social Environment of the Hunter-Gatherer:</p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li><strong>Small, Nomadic Grouping:</strong> Living in bands of 20 to 100 people, necessitating intense social monitoring.</li>
          <li><strong>Kin-Based Bands:</strong> Social life was dominated by extended family, selecting for sophisticated kin-detection mechanisms.</li>
          <li><strong>Sexual Division of Labor:</strong> Differentiated foraging and parental investment strategies created distinct selection pressures for each sex.</li>
          <li><strong>Cooperative Risk-Pooling:</strong> Survival depended on reciprocal food sharing (especially high-variance resources like meat) and aggressive coalitions.</li>
          <li><strong>Low Fecundity / High Investment:</strong> A life history of long-lived, slow-reproducing individuals necessitated deep investment in few offspring.</li>
        </ul>
      </motion.div>

      {/* Section 7 */}
      <SectionHeading number="7" title="Conclusion: The Integration of Psychological Disciplines" />
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4 text-muted-foreground leading-relaxed mb-12">
        <p>
          Evolutionary psychology serves not as a mere sub-discipline, but as the metatheoretical foundation necessary to unify the disparate and often contradictory branches of the psychological sciences. By parsing the mind according to its evolved functional specializations, this paradigm replaces the traditional "laundry list" of unrelated phenomena with a coherent map of universal human nature. This integration marks the final transition for psychology into the unified causal framework of the natural sciences, fulfilling the Darwinian prophecy of a discipline based on a new, evolutionary foundation.
        </p>
      </motion.div>

      <Separator className="my-8" />

      {/* Comments Section */}
      <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-accent" />
          <h2 className="text-2xl font-display font-bold text-primary">Comments</h2>
          <span className="text-sm text-muted-foreground">({comments.length})</span>
        </div>

        <form onSubmit={handleSubmitComment} className="space-y-4 mb-8">
          <Input
            placeholder="Name (optional)"
            value={commentForm.name}
            onChange={(e) => setCommentForm((f) => ({ ...f, name: e.target.value }))}
            maxLength={100}
            className="max-w-xs"
          />
          <Textarea
            placeholder="Share your thoughts..."
            value={commentForm.content}
            onChange={(e) => setCommentForm((f) => ({ ...f, content: e.target.value }))}
            maxLength={2000}
            rows={4}
          />
          <Button type="submit" disabled={submitting} className="gap-2">
            <Send className="h-4 w-4" />
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-muted-foreground text-sm italic">No comments yet. Be the first to share your thoughts!</p>
          )}
          {comments.map((comment) => (
            <Card key={comment.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-sm">
                    {comment.author_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Blog;
