import { StaticPage } from '../components/StaticPage';

export const Privacy = () => {
  return (
    <StaticPage title="Privacy Policy" subtitle="How we handle your data">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl text-brand-pink mb-4">Introduction</h2>
          <p>
            Fashion By Pinku respects your privacy and is committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website 
            and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
            <li><strong>Financial Data</strong> includes bank account and payment card details (processed securely via our payment providers).</li>
            <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2 text-white/60">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. delivering your order).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal obligation.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>
      </div>
    </StaticPage>
  );
};
