import React from 'react';
import Image from 'next/image';

const LEFT_KEYS = [
  'summary',
  'ugDetails',
  'skills',
  'socialProfiles',
  'languages',
  'enhancementPrograms',
];
const RIGHT_KEYS = [
  'workExperience',
  'internships',
  'projects',
  'publications',
  'placements',
];

export default function Template2({
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

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const workExperiences = student.workExperience || [];
  const internships = student.internships || [];
  const projects = student.projects || [];
  const technicalSkills = student.technicalSkills || [];
  const socialProfiles = student.socialProfiles || {};
  const publications = student.publications || [];
  const events = student.events || [];
  const placements = student.placements || [];
  const languages: string[] = student.languages ? student.languages.split(',') : ['English'];

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === '') return '/default-profile.png';
    if (photo.startsWith('http') || photo.startsWith('/uploads/')) return photo;
    return `/uploads/${photo}`;
  };

  // Section JSX map
  const sectionMap: { [key: string]: React.ReactNode } = {
    summary: (
      <section key="summary">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Summary</h3>
        <p className="text-gray-700">
          {general.summary || 'Motivated and enthusiastic student eager to contribute to projects and teams.'}
        </p>
      </section>
    ),
    ugDetails: (
      <section key="ugDetails">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Education</h3>
        <ul className="text-sm text-gray-700">
          {ugDetails.overallCGPA ? (
            <>
              <li><span className="font-medium">CGPA:</span> {ugDetails.overallCGPA}</li>
              <li><span className="font-medium">Percentage:</span> {ugDetails.overallPercentage}%</li>
              <li><span className="font-medium">Semester:</span> {ugDetails.semesterNo}</li>
              <li><span className="font-medium">PG:</span> {ugDetails.isPG ? 'Yes' : 'No'}</li>
              {ugDetails.isPG && (
                <>
                  <li><span className="font-medium">PG CGPA:</span> {ugDetails.pgOverallCGPA}</li>
                  <li><span className="font-medium">PG Percentage:</span> {ugDetails.pgOverallPercentage}%</li>
                </>
              )}
            </>
          ) : (
            <li>UG details not available</li>
          )}
        </ul>
      </section>
    ),
    skills: (
      <section key="skills">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Skills</h3>
        <div className="flex flex-wrap gap-2">
          {technicalSkills.length > 0 ? (
            technicalSkills.map((skill: any, idx: number) => (
              <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                {skill.courseName} {skill.level && `(${skill.level})`}
                {skill.certificateName && (
                  <span className="ml-1 text-blue-600 cursor-pointer group relative">
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
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No skills listed</span>
          )}
        </div>
      </section>
    ),
    socialProfiles: (
      <section key="socialProfiles">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Social Profiles</h3>
        <ul className="text-sm text-gray-700 break-all">
          {Object.entries(socialProfiles).length > 0 ? (
            Object.entries(socialProfiles).map(([key, value]) =>
              value ? (
                <li key={key}>
                  <span className="font-medium">{key}:</span>{' '}
                  <a href={String(value)} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {String(value)}
                  </a>
                </li>
              ) : null
            )
          ) : (
            <li>No social profiles</li>
          )}
        </ul>
      </section>
    ),
    languages: (
      <section key="languages">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Languages</h3>
        <ul className="text-sm text-gray-700">
          {languages.map((lang, idx) => (
            <li key={idx}>{lang}</li>
          ))}
        </ul>
      </section>
    ),
    enhancementPrograms: (
      <section key="enhancementPrograms">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Enhancement Programs</h3>
        {events.length > 0 ? (
          events.map((event: any, idx: number) => (
            <div key={idx}>
              <span className="font-semibold">{event.name}</span>
              <p className="text-xs text-gray-500">{event.details}</p>
              <p className="text-xs text-gray-500">{event.location}</p>
              <p className="text-xs text-gray-500">{event.contribution}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No enhancement programs listed.</p>
        )}
      </section>
    ),
    workExperience: (
      <section key="workExperience">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Work Experience</h3>
        {workExperiences.length > 0 ? (
          workExperiences.map((exp: any, idx: number) => (
            <div key={idx}>
              <div className="flex justify-between">
                <span className="font-semibold">{exp.employer}</span>
                <span className="text-sm text-gray-500">
                  {exp.startDate?.slice(0, 10)} - {exp.endDate?.slice(0, 10) || 'Present'}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{exp.role}</p>
              <p className="text-xs text-gray-500">{exp.responsibilities}</p>
              <p className="text-xs text-gray-500">CTC: {exp.ctc}</p>
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
          ))
        ) : (
          <p className="text-sm text-gray-500">No work experience listed.</p>
        )}
      </section>
    ),
    internships: (
      <section key="internships">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Internships</h3>
        {internships.length > 0 ? (
          internships.map((intern: any, idx: number) => (
            <div key={idx}>
              <span className="font-semibold">{intern.company}</span> — {intern.role}
              <p className="text-xs text-gray-500">{intern.startDate?.slice(0, 10)} - {intern.endDate?.slice(0, 10)}</p>
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
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Projects</h3>
        {projects.length > 0 ? (
          projects.map((proj: any, idx: number) => (
            <div key={idx}>
              <span className="font-semibold">{proj.title}</span>
              <p className="text-xs text-gray-500">{proj.description}</p>
              {proj.link && (
                <a href={proj.link} target="_blank" className="text-blue-600 text-xs break-all">
                  {proj.link}
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No projects listed.</p>
        )}
      </section>
    ),
    publications: (
      <section key="publications">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Publications</h3>
        {publications.length > 0 ? (
          publications.map((pub: any, idx: number) => (
            <div key={idx}>
              <span className="font-semibold">{pub.title}</span>
              <p className="text-xs text-gray-500">{pub.abstract}</p>
              <p className="text-xs text-gray-500">{pub.publisher}</p>
              {pub.link && (
                <a href={pub.link} target="_blank" className="text-blue-600 text-xs break-all">
                  {pub.link}
                </a>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No publications listed.</p>
        )}
      </section>
    ),
    placements: (
      <section key="placements">
        <h3 className="text-lg font-semibold mb-1" style={{ color: headerBgColor }}>Placements</h3>
        {placements.length > 0 ? (
          placements.map((placement: any, idx: number) => (
            <div key={idx}>
              <span className="font-semibold">{placement.employer}</span>
              <p className="text-xs text-gray-500">{placement.designation}</p>
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

  // Filter sectionOrder for left and right columns
  const leftSections = sectionOrder.filter((key) => LEFT_KEYS.includes(key));
  const rightSections = sectionOrder.filter((key) => RIGHT_KEYS.includes(key));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{ fontFamily }}>
      {/* Header */}
      <div className="p-6" style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src={getPhotoUrl(general.photo)}
            alt="Profile"
            width={96}
            height={96}
            className="rounded-full object-cover border-4 border-white shadow"
          />
          <h2 className="text-2xl font-bold">
            {general.candidate_first_name} {general.candidate_last_name}
          </h2>
          <p>{general.current_degree || 'Student'}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm justify-center">
            <span>📞 {general.phoneNo || 'N/A'}</span>
            <span>✉️ {general.email || 'N/A'}</span>
            <span>🏠 {general.address || 'N/A'}</span>
            <span>🎓 {general.batch || 'N/A'}</span>
            <span>Roll No: {general.roll_reg_no || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Left Column */}
        <div className="space-y-6">
          {leftSections.map((key) => sectionMap[key])}
        </div>
        {/* Right Column */}
        <div className="space-y-6">
          {rightSections.map((key) => sectionMap[key])}
        </div>
      </div>
    </div>
  );
}