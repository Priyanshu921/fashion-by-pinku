import { type ReactNode, useEffect } from 'react';
import { ScrollFadeIn } from './ScrollFadeIn';

interface StaticPageProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const StaticPage = ({ title, subtitle, children }: StaticPageProps) => {
  useEffect(() => {
    document.title = `${title} | FASHION BY PINKU`;
  }, [title]);
  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-brand-black text-white">
      <ScrollFadeIn>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 border-b border-white/10 pb-12">
            <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-widest mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/50 font-mono tracking-widest text-sm uppercase">
                {subtitle}
              </p>
            )}
          </div>
          <div className="prose prose-invert prose-p:text-white/70 prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-widest max-w-none font-mono">
            {children}
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  );
};
