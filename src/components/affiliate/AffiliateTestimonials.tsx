"use client";
export interface Testimonial {
  name: string;
  location?: string;
  text: string;
  textEn?: string;
  rating: number;
  service?: string;
  image?: string;
  date?: string;
}
interface AffiliateTestimonialsProps {
  testimonials: Testimonial[];
  language?: 'es' | 'en';
  variant?: 'default' | 'dark';
}
export function AffiliateTestimonials({
  testimonials,
  language = 'es',
  variant = 'default'
}: AffiliateTestimonialsProps) {
  const getText = (es: string, en?: string) =>
    language === 'en' && en ? en : es;
  const bgColor = variant === 'dark'
    ? 'bg-gradient-to-br from-gray-900 to-gray-800'
    : 'bg-white';
  const cardBg = variant === 'dark' ? 'bg-white' : 'bg-white';
  const headingColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  return (
    <section className={`py-16 md:py-24 ${bgColor}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className={`text-4xl md:text-5xl font-black ${headingColor} mb-6`}>
            {getText('LO QUE DICEN NUESTROS CLIENTES', 'WHAT OUR CLIENTS SAY')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-red-400 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`${cardBg} rounded-2xl p-6 md:p-8 shadow-xl hover:-translate-y-1 transition-transform duration-300 animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg md:text-xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed italic text-sm md:text-base">
                {`"${getText(testimonial.text, testimonial.textEn)}"`}
              </p>
              <div className="border-t pt-4">
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                {testimonial.location && (
                  <div className="text-gray-500 text-sm">{testimonial.location}</div>
                )}
                {testimonial.service && (
                  <div className="text-blue-600 text-sm font-medium mt-1">
                    {testimonial.service}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
