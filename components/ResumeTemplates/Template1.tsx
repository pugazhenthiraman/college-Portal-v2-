import React from 'react';

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter',
  portfolio: 'Portfolio',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

const SIDEBAR_KEYS = ['general', 'skills', 'socialProfiles', 'ugDetails'];
const MAIN_KEYS = [
  'summary',
  'internships',
  'projects',
  'workExperience',
  'publications',
  'enhancementPrograms',
  'placements',
];

export default function Template1({
  student,
  headerBgColor,
  headerTextColor,
  fontFamily,
  sectionOrder = [],
}: {
  student: any;
  headerBgColor: string;
  headerTextColor: string;
  fontFamily: string;
  sectionOrder?: string[];
}) {
  if (!student) return <div>No student data available.</div>;

  const social = student.socialProfiles || {};
  const general = student.general || {};

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === '') return '/default-profile.png';
    if (photo.startsWith('http') || photo.startsWith('/uploads/')) return photo;
    return `/uploads/${photo}`;
  };

  // Section JSX map
  const sectionMap: { [key: string]: React.ReactNode } = {
    general: (
      <div key="general">
        <div className="flex justify-center mb-4">
          <img
            src={getPhotoUrl(general.photo)}
            alt="Student Photo"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/default-profile.png';
            }}
          />
        </div>
        <h2 className="text-xl font-bold text-center">
          {general.candidate_first_name} {general.candidate_last_name}
        </h2>
        <p className="text-sm text-center">{general.current_degree}</p>
        <p className="text-sm text-center">{general.email}</p>
        <p className="text-sm text-center">{general.phoneNo}</p>
        <p className="text-sm text-center">{general.roll_reg_no}</p>
        <p className="text-sm text-center">{general.batch}</p>
        <p className="text-sm text-center">{general.address}</p>
      </div>
    ),
    skills: (
      <div key="skills">
        <h3 className="font-semibold mb-1">Skills</h3>
        <ul className="flex flex-wrap gap-2 text-sm">
          {student.technicalSkills?.length > 0 ? (
            student.technicalSkills.map((skill: any, idx: number) => (
              <li key={idx} className="bg-white border px-2 py-1 rounded text-black flex items-center gap-1">
                {skill.courseName}{' '}
                {skill.level && (
                  <span className="text-xs text-gray-400">({skill.level})</span>
                )}
                {skill.certificateName && (
                  <span className="ml-1 text-xs text-blue-600 cursor-pointer group relative">
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
            ))
          ) : (
            <li>No skills listed</li>
          )}
        </ul>
      </div>
    ),
    socialProfiles: (
      <div key="socialProfiles">
        <h3 className="font-semibold mb-1">Social Profiles</h3>
        <div className="max-h-32 overflow-y-auto text-sm space-y-1 pr-2">
          {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
            social[key] ? (
              <div key={key}>
                <strong>{label}:</strong>{' '}
                <a
                  href={social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 break-words"
                >
                  {social[key]}
                </a>
              </div>
            ) : null
          )}
        </div>
      </div>
    ),
    ugDetails: (
      <div key="ugDetails">
        <h3 className="font-semibold mb-1">Education</h3>
        {student.ugDetails ? (
          <div className="text-sm">
            <div>CGPA: {student.ugDetails.overallCGPA}</div>
            <div>Percentage: {student.ugDetails.overallPercentage}%</div>
            <div>Semester: {student.ugDetails.semesterNo}</div>
            <div>PG: {student.ugDetails.isPG ? 'Yes' : 'No'}</div>
            {student.ugDetails.isPG && (
              <>
                <div>PG CGPA: {student.ugDetails.pgOverallCGPA}</div>
                <div>PG Percentage: {student.ugDetails.pgOverallPercentage}%</div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">UG details not available</p>
        )}
      </div>
    ),
    summary: (
      <section key="summary">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>
          Summary
        </h3>
        <p className="text-gray-700">
          {general.summary || 'Motivated student passionate about growth and contribution.'}
        </p>
      </section>
    ),
    internships: (
      <section key="internships">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Internships</h3>
        {student.internships?.length > 0 ? (
          student.internships.map((intern: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{intern.company}</p>
              <p className="text-sm text-gray-700">{intern.role}</p>
              <p className="text-xs text-gray-500">{intern.startDate} - {intern.endDate}</p>
              <p className="text-xs text-gray-500">{intern.location}</p>
              <p className="text-xs text-gray-500">{intern.responsibilities}</p>
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
          ))
        ) : (
          <p className="text-sm text-gray-500">No internships listed.</p>
        )}
      </section>
    ),
    projects: (
      <section key="projects">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Projects</h3>
        {student.projects?.length > 0 ? (
          student.projects.map((proj: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{proj.title}</p>
              <p className="text-sm text-gray-700">{proj.description}</p>
              {proj.link && (
                <a href={proj.link} className="text-xs text-blue-600 underline" target="_blank" rel="noopener noreferrer">{proj.link}</a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No projects listed.</p>
        )}
      </section>
    ),
    workExperience: (
      <section key="workExperience">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Work Experience</h3>
        {student.workExperience?.length > 0 ? (
          student.workExperience.map((work: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{work.employer}</p>
              <p className="text-sm text-gray-700">{work.role}</p>
              <p className="text-xs text-gray-500">{work.startDate} - {work.endDate}</p>
              <p className="text-xs text-gray-500">{work.responsibilities}</p>
              <p className="text-xs text-gray-500">CTC: {work.ctc}</p>
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
          ))
        ) : (
          <p className="text-sm text-gray-500">No work experience listed.</p>
        )}
      </section>
    ),
    publications: (
      <section key="publications">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Publications</h3>
        {student.publications?.length > 0 ? (
          student.publications.map((pub: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{pub.title}</p>
              <p className="text-sm text-gray-700">{pub.abstract}</p>
              <p className="text-xs text-gray-500">{pub.publisher}</p>
              {pub.link && (
                <a href={pub.link} className="text-xs text-blue-600 underline" target="_blank" rel="noopener noreferrer">{pub.link}</a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No publications listed.</p>
        )}
      </section>
    ),
    enhancementPrograms: (
      <section key="enhancementPrograms">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Enhancement Programs</h3>
        {student.events?.length > 0 ? (
          student.events.map((event: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-gray-700">{event.details}</p>
              <p className="text-xs text-gray-500">{event.location}</p>
              <p className="text-xs text-gray-500">{event.contribution}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No enhancement programs listed.</p>
        )}
      </section>
    ),
    placements: (
      <section key="placements">
        <h3 className="text-lg font-bold mb-1" style={{ color: headerBgColor }}>Placements</h3>
        {student.placements?.length > 0 ? (
          student.placements.map((placement: any, idx: number) => (
            <div key={idx}>
              <p className="font-semibold">{placement.employer}</p>
              <p className="text-sm text-gray-700">{placement.designation}</p>
              <p className="text-xs text-gray-500">{placement.onCampus ? 'On Campus' : 'Off Campus'}</p>
              <p className="text-xs text-gray-500">CTC: {placement.ctc}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No placements listed.</p>
        )}
      </section>
    ),
  };

  // Filter sectionOrder for sidebar and main content
  const sidebarSections = sectionOrder.filter((key) => SIDEBAR_KEYS.includes(key));
  const mainSections = sectionOrder.filter((key) => MAIN_KEYS.includes(key));

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow overflow-hidden" style={{ fontFamily }}>
      {/* Sidebar */}
      <div className="md:w-1/3 p-6 space-y-4" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
        {sidebarSections.map((key) => sectionMap[key])}
      </div>
      {/* Main Content */}
      <div className="md:w-2/3 p-6 space-y-6">
        {mainSections.map((key) => sectionMap[key])}
      </div>
    </div>
  );
}