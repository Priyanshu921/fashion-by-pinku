import { StaticPage } from '../components/StaticPage';

export const Shipping = () => {
  return (
    <StaticPage title="Shipping & Returns" subtitle="Delivery and Exchange Policies">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl text-brand-pink mb-4">Shipping Policy</h2>
          <p>
            At Fashion By Pinku, we strive to deliver your premium garments with the utmost care and speed.
            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. 
            You will receive another notification when your order has shipped.
          </p>
          <p className="mt-4">
            For domestic orders, standard shipping typically takes 3 to 5 business days. 
            Expedited shipping options are available at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">International Shipping</h2>
          <p>
            We offer international shipping to most countries. Delivery times vary by destination but typically range from 7 to 14 business days.
            Please note that your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country.
            Fashion By Pinku is not responsible for these charges if they are applied.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">Return Policy</h2>
          <p>
            We accept returns up to 14 days after delivery, if the item is unused, unworn, and in its original condition with all tags attached.
            We will refund the full order amount minus the shipping costs for the return.
          </p>
          <p className="mt-4">
            Custom or personalized garments are created specifically for you and are strictly final sale.
          </p>
          <p className="mt-4">
            In the event that your order arrives damaged in any way, please email us as soon as possible with your order number and a photo of the item's condition. 
            We address these on a case-by-case basis but will try our best to work towards a satisfactory solution.
          </p>
        </section>
      </div>
    </StaticPage>
  );
};
