
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Badge } from "./badge";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How do you handle data privacy and security?",
    answer: "We prioritize security above all. We primarily use private VPC-hosted models or enterprise-grade APIs with zero-retention policies."
  },
  {
    question: "How long until we see tangible ROI?",
    answer: "Our 'Strategy Audit' identifies wins that can be deployed in under 72 hours."
  },
  {
    question: "Do you build custom models or use existing ones?",
    answer: "We use a hybrid approach leveraging best-in-class foundational models combined with proprietary neural layers."
  }
];

export function FAQ() {
  return (
    <section className="py-24 lg:py-32 bg-slate-50/30 border-t border-slate-100">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex flex-col items-center text-center mb-12">
          <Badge variant="outline" className="mb-4">Common Inquiries</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 uppercase">Handling Complexity.</h2>
          <p className="text-slate-500 font-medium text-base">Technical process and security standards explained.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
               key={idx}
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
            >
              <AccordionItem 
                value={`item-${idx}`} 
                className="bg-white border border-slate-100 rounded-2xl px-6 transition-all hover:shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="text-left py-5 text-base font-bold text-slate-900 hover:no-underline uppercase tracking-tight">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-slate-500 font-medium leading-relaxed text-sm">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
