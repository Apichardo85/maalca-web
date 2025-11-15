"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/buttons";
import { ProjectImage } from "@/components/ui/ProjectImage";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleEn?: string;
  bio: string;
  bioEn?: string;
  experience?: string;
  image?: string;
  icon?: string;
  available?: boolean;
  specialties?: string[];
}

interface AffiliateTeamGridProps {
  members: TeamMember[];
  title?: string;
  titleEn?: string;
  language?: 'es' | 'en';
  onBookWithMember?: (memberId: string) => void;
  variant?: 'default' | 'medical' | 'barber' | 'design';
}

export function AffiliateTeamGrid({
  members,
  title,
  titleEn,
  language = 'es',
  onBookWithMember,
  variant = 'default'
}: AffiliateTeamGridProps) {
  const getText = (es: string, en?: string) =>
    language === 'en' && en ? en : es;

  const variantColors = {
    default: { primary: 'blue-600', secondary: 'blue-700', bg: 'from-blue-50 to-purple-50' },
    medical: { primary: 'green-600', secondary: 'green-700', bg: 'from-green-50 to-blue-50' },
    barber: { primary: 'red-600', secondary: 'red-700', bg: 'from-blue-50 to-red-50' },
    design: { primary: 'purple-600', secondary: 'purple-700', bg: 'from-purple-50 to-pink-50' }
  };

  const colors = variantColors[variant];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            {title
              ? getText(title, titleEn)
              : getText('NUESTRO EQUIPO', 'OUR TEAM')}
          </h2>
          <div className={`w-24 h-1 bg-gradient-to-r from-${colors.primary} to-${colors.secondary} mx-auto mb-6`}></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getText(
              'Profesionales comprometidos con la excelencia',
              'Professionals committed to excellence'
            )}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="text-center"
            >
              <div className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-6 md:p-8 shadow-xl h-full flex flex-col`}>
                {/* Image/Icon */}
                {member.image ? (
                  <ProjectImage
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full mb-6 object-cover border-4 border-white shadow-lg"
                  />
                ) : member.icon ? (
                  <div className={`w-32 h-32 mx-auto bg-gradient-to-br from-${colors.primary} to-${colors.secondary} rounded-full flex items-center justify-center mb-6 text-6xl`}>
                    {member.icon}
                  </div>
                ) : (
                  <div className={`w-32 h-32 mx-auto bg-gradient-to-br from-${colors.primary} to-${colors.secondary} rounded-full flex items-center justify-center mb-6 text-white text-4xl font-bold`}>
                    {member.name.charAt(0)}
                  </div>
                )}

                {/* Name & Role */}
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className={`text-lg font-bold text-${colors.primary} mb-2`}>
                  {getText(member.role, member.roleEn)}
                </p>

                {/* Experience */}
                {member.experience && (
                  <p className={`text-${colors.secondary} font-medium mb-4`}>
                    {member.experience}
                  </p>
                )}

                {/* Bio */}
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  {getText(member.bio, member.bioEn)}
                </p>

                {/* Specialties */}
                {member.specialties && member.specialties.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-gray-200"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {member.available !== undefined && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <div className={`w-3 h-3 rounded-full ${member.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-600">
                      {getText(
                        member.available ? 'Disponible' : 'No Disponible',
                        member.available ? 'Available' : 'Unavailable'
                      )}
                    </span>
                  </div>
                )}

                {/* Book Button */}
                {onBookWithMember && (
                  <Button
                    variant="primary"
                    onClick={() => onBookWithMember(member.id)}
                    disabled={member.available === false}
                    className={`${
                      member.available !== false
                        ? `bg-gradient-to-r from-${colors.primary} to-${colors.secondary} hover:from-${colors.secondary} hover:to-${colors.primary}`
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white font-bold px-8 py-3`}
                  >
                    {getText(
                      member.available !== false
                        ? `Reservar con ${member.name}`
                        : 'No Disponible',
                      member.available !== false
                        ? `Book with ${member.name}`
                        : 'Not Available'
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
