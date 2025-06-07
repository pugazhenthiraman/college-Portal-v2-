import React from 'react';

export default function Template3({
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

  // Map section keys to JSX
  const sectionMap: { [key: string]: React.ReactNode } = {
    general: (
      <div className="p-8 text-center" style={{ backgroundColor: headerBgColor, color: headerTextColor }} key="general">
        <h2 className="text-3xl font-bold mb-1">
          {general.candidate_first_name} {general.candidate_last_name}
        </h2>
        <p className="text-lg">{general.current_degree || 'Student'}</p>
        <div className="mt-2 text-sm">
          📞 {general.phoneNo || 'N/A'} | ✉️ {general.email || 'N/A'} | 🎓 {general.batch || 'N/A'} | Roll No: {general.roll_reg_no || 'N/A'}
        </div>
      </div>
    ),
    ugDetails: (
      <section className="p-4 rounded shadow" key="ugDetails">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Education
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
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
    internships: (
      <section className="p-4 rounded shadow" key="internships">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Internships
        </h3>
        {internships.length > 0 ? (
          internships.map((intern: any, idx: number) => (
            <div key={idx} className="mb-2">
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
      <section className="p-4 rounded shadow" key="projects">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Projects
        </h3>
        {projects.length > 0 ? (
          projects.map((proj: any, idx: number) => (
            <div key={idx} className="mb-2">
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
    skills: (
      <section className="p-4 rounded shadow" key="skills">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Skills
        </h3>
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
      <section className="p-4 rounded shadow" key="socialProfiles">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Social Profiles
        </h3>
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
    publications: (
      <section className="p-4 rounded shadow" key="publications">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Publications
        </h3>
        {publications.length > 0 ? (
          publications.map((pub: any, idx: number) => (
            <div key={idx} className="mb-2">
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
    enhancementPrograms: (
      <section className="p-4 rounded shadow" key="enhancementPrograms">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Enhancement Programs
        </h3>
        {events.length > 0 ? (
          events.map((event: any, idx: number) => (
            <div key={idx} className="mb-2">
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
      <section className="p-4 rounded shadow" key="workExperience">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Work Experience
        </h3>
        {workExperiences.length > 0 ? (
          workExperiences.map((exp: any, idx: number) => (
            <div key={idx} className="mb-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{exp.employer}</span>
                <span className="text-gray-500">{exp.startDate?.slice(0, 10)} - {exp.endDate?.slice(0, 10) || 'Present'}</span>
              </div>
              <p className="text-sm text-gray-700">{exp.role}</p>
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
    placements: (
      <section className="p-4 rounded shadow" key="placements">
        <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: headerBgColor }}>
          Placements
        </h3>
        {placements.length > 0 ? (
          placements.map((placement: any, idx: number) => (
            <div key={idx} className="mb-2">
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{ fontFamily }}>
      {sectionOrder.map((key) => sectionMap[key])}
    </div>
  );
}