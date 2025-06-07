import React from 'react';

interface SectionProps {
  title: string;
  headerBgColor: string;
  children: React.ReactNode;
}

interface Experience {
  role: string;
  employer: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string;
  certificateName?: string;
  certificateLink?: string;
}

interface Internship {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  certificateName?: string;
  certificateLink?: string;
}

interface Project {
  title: string;
  description: string;
  link?: string;
}

interface Skill {
  courseName: string;
  level: string;
  certificateName?: string;
  certificateLink?: string;
}

interface Publication {
  title: string;
  publisher: string;
  abstract?: string;
  link?: string;
}

interface Event {
  name: string;
  location?: string;
  details?: string;
  contribution?: string;
}

interface Placement {
  employer: string;
  designation: string;
  onCampus: boolean;
  ctc: string;
}

export default function TemplateATS({
  student,
  headerBgColor,
  headerTextColor,
  fontFamily,
}: {
  student: any;
  headerBgColor: string;
  headerTextColor: string;
  fontFamily: string;
}) {
  if (!student) return <div>No student data available.</div>;

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const workExperiences: Experience[] = student.workExperience || [];
  const internships: Internship[] = student.internships || [];
  const projects: Project[] = student.projects || [];
  const technicalSkills: Skill[] = student.technicalSkills || [];
  const publications: Publication[] = student.publications || [];
  const events: Event[] = student.events || [];
  const placements: Placement[] = student.placements || [];

  return (
    <div
      className="max-w-4xl mx-auto p-8 bg-white text-black"
      style={{
        fontFamily,
        fontSize: 'var(--resume-font-size)',
        lineHeight: 'var(--resume-line-height)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--section-spacing)',
      }}
    >
      <div className="text-center" style={{ backgroundColor: headerBgColor, color: headerTextColor, padding: '1rem' }}>
        <h1 className="font-bold uppercase text-2xl">
          {general.candidate_first_name} {general.candidate_last_name}
        </h1>
        <div className="text-sm mt-1">
          ✉ {general.email} | 📞 {general.phoneNo} | 🎓 {general.current_degree}
        </div>
      </div>

      <Section title="Professional Summary" headerBgColor={headerBgColor}>
        <p>{general.summary || 'Motivated and enthusiastic student eager to contribute to projects and teams.'}</p>
      </Section>

      <Section title="Education" headerBgColor={headerBgColor}>
        {ugDetails.overallCGPA ? (
          <ul>
            <li>CGPA: {ugDetails.overallCGPA}</li>
            <li>Percentage: {ugDetails.overallPercentage}%</li>
            <li>Semester: {ugDetails.semesterNo}</li>
            <li>PG: {ugDetails.isPG ? 'Yes' : 'No'}</li>
            {ugDetails.isPG && (
              <>
                <li>PG CGPA: {ugDetails.pgOverallCGPA}</li>
                <li>PG Percentage: {ugDetails.pgOverallPercentage}%</li>
              </>
            )}
          </ul>
        ) : (
          <p>UG details not available.</p>
        )}
      </Section>

      <Section title="Work Experience" headerBgColor={headerBgColor}>
        {workExperiences.length > 0 ? (
          workExperiences.map((exp, idx) => (
            <div key={idx}>
              <strong>{exp.role}</strong>, {exp.employer} ({exp.startDate?.slice(0, 10)} - {exp.endDate?.slice(0, 10) || 'Present'})
              <div>{exp.responsibilities}</div>
              {exp.certificateName && (
                <span className="ml-1 text-blue-600 cursor-pointer group relative">
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
          <p>No work experience listed.</p>
        )}
      </Section>

      <Section title="Internships" headerBgColor={headerBgColor}>
        {internships.length > 0 ? (
          internships.map((intern, idx) => (
            <div key={idx}>
              <strong>{intern.company}</strong> — {intern.role} ({intern.startDate?.slice(0, 10)} - {intern.endDate?.slice(0, 10)})
              <div>{intern.location}</div>
              {intern.certificateName && (
                <span className="ml-1 text-blue-600 cursor-pointer group relative">
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
          <p>No internships listed.</p>
        )}
      </Section>

      <Section title="Projects" headerBgColor={headerBgColor}>
        {projects.length > 0 ? (
          projects.map((proj, idx) => (
            <div key={idx}>
              <strong>{proj.title}</strong>
              <div>{proj.description}</div>
              {proj.link && (
                <div className="break-all text-blue-600">
                  <a href={proj.link} target="_blank" rel="noopener noreferrer">
                    {proj.link}
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No projects listed.</p>
        )}
      </Section>

      <Section title="Skills" headerBgColor={headerBgColor}>
        {technicalSkills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {technicalSkills.map((skill, idx) => (
              <li key={idx} className="border px-2 py-1 rounded flex items-center gap-1">
                {skill.courseName} ({skill.level})
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
              </li>
            ))}
          </ul>
        ) : (
          <p>No skills listed.</p>
        )}
      </Section>

      <Section title="Publications" headerBgColor={headerBgColor}>
        {publications.length > 0 ? (
          publications.map((pub, idx) => (
            <div key={idx}>
              <strong>{pub.title}</strong> — {pub.publisher}
              <div>{pub.abstract}</div>
              {pub.link && (
                <div className="break-all text-blue-600">
                  <a href={pub.link} target="_blank" rel="noopener noreferrer">
                    {pub.link}
                  </a>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No publications listed.</p>
        )}
      </Section>

      <Section title="Enhancement Programs" headerBgColor={headerBgColor}>
        {events.length > 0 ? (
          events.map((event, idx) => (
            <div key={idx}>
              <strong>{event.name}</strong> — {event.location}
              <div>{event.details}</div>
              <div>{event.contribution}</div>
            </div>
          ))
        ) : (
          <p>No enhancement programs listed.</p>
        )}
      </Section>

      <Section title="Placements" headerBgColor={headerBgColor}>
        {placements.length > 0 ? (
          placements.map((placement, idx) => (
            <div key={idx}>
              <strong>{placement.employer}</strong> — {placement.designation}
              <div>{placement.onCampus ? 'On Campus' : 'Off Campus'} | CTC: {placement.ctc}</div>
            </div>
          ))
        ) : (
          <p>No placements listed.</p>
        )}
      </Section>
    </div>
  );
}

function Section({ title, headerBgColor, children }: SectionProps) {
  return (
    <section className="mt-6">
      <h2 className="font-semibold uppercase border-b pb-1 mb-2" style={{ borderColor: headerBgColor }}>
        {title}
      </h2>
      {children}
    </section>
  );
}