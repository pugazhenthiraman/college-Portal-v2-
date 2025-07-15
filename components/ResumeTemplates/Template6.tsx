import React from 'react';

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter',
  portfolio: 'Portfolio',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

export default function Template6({
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
  const softSkills = student.softSkills || [];
  const workExperience = student.workExperience || [];
  const internships = student.internships || [];
  const projects = student.projects || [];
  const publications = student.publications || [];
  const events = student.events || [];
  const placements = student.placements || [];
  const social = student.socialProfiles || {};
  const languages: string[] = student.languages ? student.languages.split(',') : ['English'];
  const interests = student.interests || [];

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === "") return "/default-profile.png";
    if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
    return `/uploads/${photo}`;
  };

  // Map section keys to JSX
  const sectionMap: { [key: string]: React.ReactNode } = {
    summary: (
      general.summary && (
        <Section title="Summary" color={headerBgColor} key="summary">
          <ul className="list-disc list-inside text-sm text-gray-700 mb-6">
            {general.summary.split('\n').map((line: string, i: number) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </Section>
      )
    ),
    workExperience: (
      workExperience.length > 0 && (
        <Section title="Professional Experience" color={headerBgColor} key="workExperience">
          {workExperience.map((exp: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{exp.role}</div>
              <div className="italic text-xs">{exp.employer}</div>
              <ul className="list-disc list-inside text-sm mt-1">
                {exp.responsibilities?.split('\n').map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {exp.certificateName && (
                <span className="text-xs text-blue-600 cursor-pointer group relative ml-2">
                  <span className="underline">{exp.certificateName}</span>
                  {exp.certificateLink && (
                    <a
                      href={exp.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border px-2 py-1 text-xs text-blue-600 z-10"
                    >
                      {exp.certificateLink}
                    </a>
                  )}
                </span>
              )}
            </div>
          ))}
        </Section>
      )
    ),
    internships: (
      internships.length > 0 && (
        <Section title="Internships" color={headerBgColor} key="internships">
          {internships.map((intern: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{intern.role}</div>
              <div className="italic text-xs">{intern.company}</div>
              <div className="text-xs text-gray-500">{intern.location}</div>
              <ul className="list-disc list-inside text-sm mt-1">
                {intern.responsibilities?.split('\n').map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
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
        <Section title="Projects" color={headerBgColor} key="projects">
          {projects.map((proj: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{proj.title}</div>
              <ul className="list-disc list-inside text-sm">
                {proj.description?.split('\n').map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {proj.link && <a href={proj.link} className="text-blue-600 underline text-xs">{proj.link}</a>}
            </div>
          ))}
        </Section>
      )
    ),
    publications: (
      publications.length > 0 && (
        <Section title="Publications" color={headerBgColor} key="publications">
          {publications.map((pub: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{pub.title}</div>
              <div className="italic text-xs">{pub.publisher}</div>
              <ul className="list-disc list-inside text-sm">
                {pub.abstract?.split('\n').map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {pub.link && <a href={pub.link} className="text-blue-600 underline text-xs">{pub.link}</a>}
            </div>
          ))}
        </Section>
      )
    ),
    enhancementPrograms: (
      events.length > 0 && (
        <Section title="Enhancement Programs" color={headerBgColor} key="enhancementPrograms">
          {events.map((event: any, idx: number) => (
            <div key={idx} className="mb-3">
              <div className="font-semibold">{event.name}</div>
              <ul className="list-disc list-inside text-sm">
                {event.details?.split('\n').map((line: string, i: number) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <p className="text-xs text-gray-500">{event.location}</p>
              <p className="text-xs text-gray-500">{event.contribution}</p>
            </div>
          ))}
        </Section>
      )
    ),
    education: (
      <Section title="Education" color={headerBgColor} key="education">
        <div>
          <div className="font-semibold">{ugDetails.degreeName || 'Bachelor of Science in Business Administration'}</div>
          <p className="italic text-sm">{ugDetails.institution || 'Paris University'}</p>
          <p className="text-xs">{ugDetails.overallCGPA ? `CGPA: ${ugDetails.overallCGPA}` : ''} {ugDetails.overallPercentage ? `| ${ugDetails.overallPercentage}%` : ''}</p>
        </div>
      </Section>
    ),
    skills: (
      (technicalSkills.length > 0 || softSkills.length > 0) && (
        <Section title="Skills" color={headerBgColor} key="skills">
          <ul className="grid md:grid-cols-2 gap-2">
            {technicalSkills.map((s: any, idx: number) => (
              <li key={idx}>
                ✨ {s.courseName}
                {s.certificateName && (
                  <span className="ml-1 text-blue-600 cursor-pointer group relative">
                    <span className="underline">{s.certificateName}</span>
                    {s.certificateLink && (
                      <a
                        href={s.certificateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute left-0 top-full mt-1 hidden group-hover:block bg-white border px-2 py-1 text-xs text-blue-600 z-10"
                      >
                        {s.certificateLink}
                      </a>
                    )}
                  </span>
                )}
              </li>
            ))}
            {softSkills.map((s: any, idx: number) => (
              <li key={idx}>💡 {s}</li>
            ))}
          </ul>
        </Section>
      )
    ),
    languages: (
      languages.length > 0 && (
        <Section title="Languages" color={headerBgColor} key="languages">
          <ul className="grid grid-cols-2">
            {languages.map((lang: string, idx: number) => (
              <li key={idx}>{lang} ● ● ● ● ○</li>
            ))}
          </ul>
        </Section>
      )
    ),
  };

  return (
    <div className="bg-white max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden text-sm text-gray-800" style={{ fontFamily }}>
      <div className="p-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: headerTextColor }}>{general.candidate_first_name} {general.candidate_last_name}</h1>
          <p className="text-sm italic" style={{ color: headerTextColor }}>{general.current_degree}</p>
          <ul className="mt-2 space-y-1">
            <li>📍 {general.address}</li>
            <li>✉ {general.email}</li>
            <li>📞 {general.phoneNo}</li>
            {social.linkedin && <li>in {social.linkedin}</li>}
          </ul>
        </div>
        <img src={getPhotoUrl(general.photo)} className="w-24 h-24 object-cover rounded-full border-2" style={{ borderColor: headerBgColor }} alt="Profile" onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/default-profile.png';
        }} />
      </div>

      <div className="px-6 pb-6">
        {sectionOrder.map((key) => sectionMap[key])}
      </div>
    </div>
  );
}

function Section({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  return (
    <section className="mb-6">
      <h2 style={{ backgroundColor: color, padding: '0.5rem 0.75rem', fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{title}</h2>
      <div className="mt-2 px-1 text-gray-700">
        {children}
      </div>
    </section>
  );
}