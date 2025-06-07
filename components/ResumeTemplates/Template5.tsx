'use client';

import React from 'react';

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter',
  portfolio: 'Portfolio',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

const SIDEBAR_KEYS = ['general', 'skills', 'socialProfiles', 'ugDetails', 'languages'];
const MAIN_KEYS = [
  'summary',
  'internships',
  'projects',
  'workExperience',
  'publications',
  'enhancementPrograms',
  'placements',
];

export default function Template5({
  headerBgColor,
  headerTextColor,
  fontFamily,
  student,
  sectionOrder = [],
}: {
  headerBgColor: string;
  headerTextColor: string;
  fontFamily: string;
  student: any;
  sectionOrder?: string[];
}) {
  if (!student) return <div className="text-center py-10 text-red-600">No student data available.</div>;

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const technicalSkills = student.technicalSkills || [];
  const workExperience = student.workExperience || [];
  const internships = student.internships || [];
  const projects = student.projects || [];
  const publications = student.publications || [];
  const events = student.events || [];
  const placements = student.placements || [];
  const social = student.socialProfiles || {};
  const languages: string[] = student.languages ? student.languages.split(',') : ['English'];

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === "") return "/default-profile.png";
    if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
    return `/uploads/${photo}`;
  };

  // Sidebar section map
  const sidebarMap: { [key: string]: React.ReactNode } = {
    general: (
      <div key="general" className="flex flex-col items-center space-y-4">
        <img
          src={getPhotoUrl(general.photo)}
          alt="Profile"
          className="w-24 h-24 object-cover rounded-full border-2"
          style={{ borderColor: headerTextColor }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/default-profile.png';
          }}
        />
        <div className="text-center">
          <h1 className="text-xl font-bold">{general.candidate_first_name} {general.candidate_last_name}</h1>
          <p className="text-sm italic">{general.current_degree}</p>
          <p className="text-xs">{general.email}</p>
          <p className="text-xs">{general.phoneNo}</p>
          <p className="text-xs">{general.roll_reg_no}</p>
          <p className="text-xs">{general.batch}</p>
          <p className="text-xs">{general.address}</p>
        </div>
      </div>
    ),
    skills: (
      <div key="skills" className="mt-6">
        <h3 className="font-semibold mb-2">Technical Skills</h3>
        <ul className="space-y-1 text-sm">
          {technicalSkills.length > 0 ? technicalSkills.map((skill: any, idx: number) => (
            <li key={idx}>
              {skill.courseName}
              {skill.level && <span className="text-xs text-gray-300"> ({skill.level})</span>}
              {skill.certificateName && (
                <span className="ml-1 text-blue-200 cursor-pointer group relative">
                  <span className="underline">{skill.certificateName}</span>
                  {skill.certificateLink && (
                    <a
                      href={skill.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border px-2 py-1 text-xs text-blue-600 z-10"
                    >
                      {skill.certificateLink}
                    </a>
                  )}
                </span>
              )}
            </li>
          )) : <li>No skills listed</li>}
        </ul>
      </div>
    ),
    socialProfiles: (
      <div key="socialProfiles" className="mt-6">
        <h3 className="font-semibold mb-2">Social Profiles</h3>
        <ul className="space-y-1 text-sm">
          {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
            social[key] ? (
              <li key={key}>
                <strong>{label}:</strong>{' '}
                <a href={social[key]} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline break-words">
                  {social[key]}
                </a>
              </li>
            ) : null
          )}
        </ul>
      </div>
    ),
    ugDetails: (
      <div key="ugDetails" className="mt-6">
        <h3 className="font-semibold mb-2">Education</h3>
        <div className="text-sm">
          <div>CGPA: {ugDetails.overallCGPA}</div>
          <div>Percentage: {ugDetails.overallPercentage}%</div>
          <div>Semester: {ugDetails.semesterNo}</div>
          <div>PG: {ugDetails.isPG ? 'Yes' : 'No'}</div>
          {ugDetails.isPG && (
            <>
              <div>PG CGPA: {ugDetails.pgOverallCGPA}</div>
              <div>PG Percentage: {ugDetails.pgOverallPercentage}%</div>
            </>
          )}
        </div>
      </div>
    ),
    languages: (
      <div key="languages" className="mt-6">
        <h3 className="font-semibold mb-2">Languages</h3>
        <ul className="space-y-1">
          {languages.map((lang, idx) => <li key={idx}>{lang}</li>)}
        </ul>
      </div>
    ),
  };

  // Main content section map
  const sectionMap: { [key: string]: React.ReactNode } = {
    summary: (
      <Section title="Summary" color={headerTextColor} key="summary">
        <p className="text-gray-700">{general.summary || 'Motivated student passionate about growth and contribution.'}</p>
      </Section>
    ),
    internships: (
      internships.length > 0 && (
        <Section title="Internships" color={headerTextColor} key="internships">
          {internships.map((intern: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{intern.company}</div>
              <div className="text-sm">{intern.role}</div>
              <div className="text-xs text-gray-500">{intern.startDate} - {intern.endDate}</div>
              <div className="text-xs text-gray-500">{intern.location}</div>
              <div className="text-xs text-gray-500">{intern.responsibilities}</div>
              {intern.certificateName && (
                <span className="text-xs text-blue-600 cursor-pointer group relative ml-2">
                  <span className="underline">{intern.certificateName}</span>
                  {intern.certificateLink && (
                    <a
                      href={intern.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border px-2 py-1 text-xs text-blue-600 z-10"
                    >
                      {intern.certificateLink}
                    </a>
                  )}
                </span>
              )}
            </div>
          ))}
        </Section>
      )
    ),
    projects: (
      projects.length > 0 && (
        <Section title="Projects" color={headerTextColor} key="projects">
          {projects.map((proj: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{proj.title}</div>
              <div className="text-sm">{proj.description}</div>
              {proj.link && (
                <a href={proj.link} className="text-xs text-blue-600 underline" target="_blank" rel="noopener noreferrer">{proj.link}</a>
              )}
            </div>
          ))}
        </Section>
      )
    ),
    workExperience: (
      workExperience.length > 0 && (
        <Section title="Work Experience" color={headerTextColor} key="workExperience">
          {workExperience.map((work: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{work.employer}</div>
              <div className="text-sm">{work.role}</div>
              <div className="text-xs text-gray-500">{work.startDate} - {work.endDate}</div>
              <div className="text-xs text-gray-500">{work.responsibilities}</div>
              <div className="text-xs text-gray-500">CTC: {work.ctc}</div>
              {work.certificateName && (
                <span className="text-xs text-blue-600 cursor-pointer group relative ml-2">
                  <span className="underline">{work.certificateName}</span>
                  {work.certificateLink && (
                    <a
                      href={work.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border px-2 py-1 text-xs text-blue-600 z-10"
                    >
                      {work.certificateLink}
                    </a>
                  )}
                </span>
              )}
            </div>
          ))}
        </Section>
      )
    ),
    publications: (
      publications.length > 0 && (
        <Section title="Publications" color={headerTextColor} key="publications">
          {publications.map((pub: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{pub.title}</div>
              <div className="text-sm">{pub.abstract}</div>
              <div className="text-xs text-gray-500">{pub.publisher}</div>
              {pub.link && (
                <a href={pub.link} className="text-xs text-blue-600 underline" target="_blank" rel="noopener noreferrer">{pub.link}</a>
              )}
            </div>
          ))}
        </Section>
      )
    ),
    enhancementPrograms: (
      events.length > 0 && (
        <Section title="Enhancement Programs" color={headerTextColor} key="enhancementPrograms">
          {events.map((event: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{event.name}</div>
              <div className="text-sm">{event.details}</div>
              <div className="text-xs text-gray-500">{event.location}</div>
              <div className="text-xs text-gray-500">{event.contribution}</div>
            </div>
          ))}
        </Section>
      )
    ),
    placements: (
      placements.length > 0 && (
        <Section title="Placements" color={headerTextColor} key="placements">
          {placements.map((placement: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{placement.employer}</div>
              <div className="text-sm">{placement.designation}</div>
              <div className="text-xs text-gray-500">{placement.onCampus ? 'On Campus' : 'Off Campus'}</div>
              <div className="text-xs text-gray-500">CTC: {placement.ctc}</div>
            </div>
          ))}
        </Section>
      )
    ),
  };

  // Filter sectionOrder for sidebar and main content
  const sidebarSections = sectionOrder.filter((key) => SIDEBAR_KEYS.includes(key));
  const mainSections = sectionOrder.filter((key) => MAIN_KEYS.includes(key));

  return (
    <div className="grid grid-cols-3 max-w-6xl mx-auto shadow-lg rounded overflow-hidden" style={{ fontFamily }}>
      {/* Sidebar */}
      <div className="bg-gray-800 text-white p-6 col-span-1" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
        {sidebarSections.map((key) => sidebarMap[key])}
      </div>
      {/* Main Content */}
      <div className="col-span-2 p-6 space-y-6">
        {mainSections.map((key) => sectionMap[key])}
      </div>
    </div>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <section className="mb-6">
      <h2 style={{ color, fontWeight: 700, fontSize: '1rem', textTransform: 'uppercase', borderBottom: `2px solid ${color}`, paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>{title}</h2>
      <div className="text-gray-700 text-sm">
        {children}
      </div>
    </section>
  );
}