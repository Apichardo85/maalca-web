"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import WhatsAppIntegration from "@/components/ui/WhatsAppIntegration";

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
  city: string;
  country: string;
  whatsapp?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface AffiliateContactSectionProps {
  contactInfo: ContactInfo;
  language?: 'es' | 'en';
  showForm?: boolean;
  variant?: 'default' | 'medical' | 'barber' | 'design';
}

export function AffiliateContactSection({
  contactInfo,
  language = 'es',
  showForm = true,
  variant = 'default'
}: AffiliateContactSectionProps) {
  const getText = (es: string, en: string) => language === 'en' ? en : es;

  const variantColors = {
    default: { primary: 'blue-600', hover: 'blue-700' },
    medical: { primary: 'green-600', hover: 'green-700' },
    barber: { primary: 'red-600', hover: 'red-700' },
    design: { primary: 'purple-600', hover: 'purple-700' }
  };

  const colors = variantColors[variant];

  return (
    <section id="contacto" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            {getText('CONTACTO', 'CONTACT')}
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r from-${colors.primary} to-${colors.hover} mx-auto mb-6`}></div>
          <p className="text-xl text-gray-600">
            {getText('Estamos aquí para ti', 'We\'re here for you')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Location */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r from-${colors.primary} to-${colors.hover} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
                📍
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getText('Ubicación', 'Location')}
                </h3>
                <p className="text-gray-600">
                  {contactInfo.address && <>{contactInfo.address}<br /></>}
                  {contactInfo.city}, {contactInfo.country}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r from-${colors.primary} to-${colors.hover} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
                📞
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {getText('Teléfono', 'Phone')}
                </h3>
                <p className="text-gray-600">
                  <a href={`tel:${contactInfo.phone}`} className={`hover:text-${colors.primary}`}>
                    {contactInfo.phone}
                  </a>
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r from-${colors.primary} to-${colors.hover} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
                📧
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Email
                </h3>
                <p className="text-gray-600">
                  <a href={`mailto:${contactInfo.email}`} className={`hover:text-${colors.primary}`}>
                    {contactInfo.email}
                  </a>
                </p>
              </div>
            </div>

            {/* Hours */}
            {contactInfo.hours && (
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 bg-gradient-to-r from-${colors.primary} to-${colors.hover} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
                  ⏰
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {getText('Horarios', 'Hours')}
                  </h3>
                  <div className="text-gray-600 space-y-1 text-sm">
                    {contactInfo.hours.monday && <p>{getText('Lunes - Viernes:', 'Monday - Friday:')} {contactInfo.hours.monday}</p>}
                    {contactInfo.hours.saturday && <p>{getText('Sábado:', 'Saturday:')} {contactInfo.hours.saturday}</p>}
                    {contactInfo.hours.sunday && <p>{getText('Domingo:', 'Sunday:')} {contactInfo.hours.sunday}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Social Media */}
            {contactInfo.socialMedia && (
              <div className="pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {getText('Síguenos', 'Follow Us')}
                </h3>
                <div className="flex gap-4">
                  {contactInfo.socialMedia.instagram && (
                    <a
                      href={contactInfo.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center text-white text-xl transition-colors`}
                    >
                      📷
                    </a>
                  )}
                  {contactInfo.socialMedia.facebook && (
                    <a
                      href={contactInfo.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xl transition-colors`}
                    >
                      📘
                    </a>
                  )}
                  {contactInfo.socialMedia.linkedin && (
                    <a
                      href={contactInfo.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center text-white text-xl transition-colors`}
                    >
                      💼
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* WhatsApp Integration */}
            {contactInfo.whatsapp && (
              <div className="pt-4">
                <WhatsAppIntegration
                  phoneNumber={contactInfo.whatsapp}
                  defaultMessage={getText(
                    `Hola ${contactInfo.name}, me gustaría obtener más información.`,
                    `Hello ${contactInfo.name}, I would like to get more information.`
                  )}
                  businessName={contactInfo.name}
                />
              </div>
            )}
          </motion.div>

          {/* Contact Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={getText('Nombre completo', 'Full name')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder={getText('Teléfono', 'Phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <textarea
                  placeholder={getText('Mensaje', 'Message')}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className={`w-full bg-${colors.primary} hover:bg-${colors.hover} text-white font-bold py-4 text-lg`}
                >
                  {getText('Enviar Mensaje', 'Send Message')}
                </Button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
