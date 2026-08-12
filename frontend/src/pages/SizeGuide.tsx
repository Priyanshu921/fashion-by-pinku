import { StaticPage } from '../components/StaticPage';

export const SizeGuide = () => {
  return (
    <StaticPage title="Size Guide" subtitle="Find Your Perfect Fit">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl text-brand-pink mb-4">How to Measure</h2>
          <p>
            For the most accurate fit, we recommend taking your measurements over lightweight clothing.
            Use a soft measuring tape and keep it snug but not tight against your body.
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-white/70">
            <li><strong className="text-white">Bust:</strong> Measure around the fullest part of your chest, keeping the tape parallel to the floor.</li>
            <li><strong className="text-white">Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</li>
            <li><strong className="text-white">Hips:</strong> Measure around the fullest part of your hips, approximately 8 inches below your waist.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">Women's Clothing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 pr-6 text-brand-pink font-serif tracking-wider">Size</th>
                  <th className="py-3 pr-6 text-brand-pink font-serif tracking-wider">Bust (in)</th>
                  <th className="py-3 pr-6 text-brand-pink font-serif tracking-wider">Waist (in)</th>
                  <th className="py-3 pr-6 text-brand-pink font-serif tracking-wider">Hips (in)</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-6 text-white">XS</td>
                  <td className="py-3 pr-6">30–32</td>
                  <td className="py-3 pr-6">23–25</td>
                  <td className="py-3 pr-6">33–35</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-6 text-white">S</td>
                  <td className="py-3 pr-6">32–34</td>
                  <td className="py-3 pr-6">25–27</td>
                  <td className="py-3 pr-6">35–37</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-6 text-white">M</td>
                  <td className="py-3 pr-6">34–36</td>
                  <td className="py-3 pr-6">27–29</td>
                  <td className="py-3 pr-6">37–39</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-6 text-white">L</td>
                  <td className="py-3 pr-6">36–38</td>
                  <td className="py-3 pr-6">29–31</td>
                  <td className="py-3 pr-6">39–41</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 pr-6 text-white">XL</td>
                  <td className="py-3 pr-6">38–40</td>
                  <td className="py-3 pr-6">31–33</td>
                  <td className="py-3 pr-6">41–43</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 text-white">XXL</td>
                  <td className="py-3 pr-6">40–42</td>
                  <td className="py-3 pr-6">33–35</td>
                  <td className="py-3 pr-6">43–45</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-brand-pink mb-4 mt-12">Still Unsure?</h2>
          <p>
            If you're between sizes, we recommend sizing up for a relaxed, comfortable fit.
            For a more tailored look, go with the smaller size. Our concierge team is always available to help you find the perfect fit — 
            don't hesitate to reach out via our Contact page.
          </p>
        </section>
      </div>
    </StaticPage>
  );
};
