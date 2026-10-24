import React from 'react';
import { BookOpen, Briefcase, Trophy, GraduationCap, Wrench, Award } from 'lucide-react';

const categoryConfig = {
  course: { label: 'Course', icon: BookOpen, className: 'badge-course' },
  internship: { label: 'Internship', icon: Briefcase, className: 'badge-internship' },
  hackathon: { label: 'Hackathon', icon: Trophy, className: 'badge-hackathon' },
  academic: { label: 'Academic', icon: GraduationCap, className: 'badge-academic' },
  workshop: { label: 'Workshop', icon: Wrench, className: 'badge-workshop' },
  other: { label: 'Credential', icon: Award, className: 'badge-other' }
};

export const CategoryBadge = ({ category = 'course' }) => {
  const normKey = (category || 'course').toLowerCase();
  const config = categoryConfig[normKey] || categoryConfig.other;
  const IconComponent = config.icon;

  return (
    <span className={`badge ${config.className}`}>
      <IconComponent size={12} />
      <span>{config.label}</span>
    </span>
  );
};
