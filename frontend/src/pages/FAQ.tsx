import { StaticPage } from '../components/StaticPage';

const faqs = [
  {
    question: 'How long does shipping take?',
    answer: 'Orders are typically processed within 1-2 business days. Standard shipping takes 3-5 business days within the domestic region. International shipping can take up to 14 business days.'
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Yes, we ship globally. Shipping costs and delivery times will vary depending on the destination.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 14-day return window for unworn and unwashed items with tags still attached. Custom or personalized items are final sale.'
  },
  {
    question: 'How do I care for my garments?',
    answer: 'Due to the premium materials we use, we strongly recommend dry cleaning all tailored pieces. For casual wear, machine wash cold on a gentle cycle and lay flat to dry.'
  }
];

export const FAQ = () => {
  return (
    <StaticPage title="FAQ" subtitle="Frequently Asked Questions">
      <div className="space-y-12">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-white/10 pb-8">
            <h3 className="text-xl text-white font-serif tracking-widest mb-4 uppercase">{faq.question}</h3>
            <p className="text-white/60 leading-relaxed font-mono">{faq.answer}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
};
