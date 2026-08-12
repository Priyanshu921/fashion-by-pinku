  import { StaticPage } from '../components/StaticPage';

export const Terms = () => {
  return (
    <StaticPage title="Terms of Service" subtitle="Rules and guidelines for our services">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl text-brand-pink mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing our website, you agree to be bound by these Terms of Service and to use our site in accordance with these terms, 
            our Privacy Policy, and any additional terms and conditions that may apply to specific sections of the site or to products 
            and services available through the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">2. Intellectual Property</h2>
          <p>
            The site and all of its original content are the sole property of Fashion By Pinku and are, as such, fully protected by the appropriate international copyright and other intellectual property rights laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">3. Products and Pricing</h2>
          <p>
            All products are subject to availability, and we cannot guarantee that items will be in stock. 
            We reserve the right to discontinue any products at any time for any reason. 
            Prices for all products are subject to change.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">4. User Accounts</h2>
          <p>
            As a user of this website, you may be asked to register with us and provide private information. 
            You are responsible for ensuring the accuracy of this information, and you are responsible for maintaining the safety and security of your identifying information. 
            You are also responsible for all activities that occur under your account or password.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the applicable jurisdiction, 
            and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>
      </div>
    </StaticPage>
  );
};
