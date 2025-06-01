import React from 'react';

export default function TemplateATS({
  color,
  student,
}: {
  color: string;
  student: any;
}) {
  if (!student) return <div>No student data available.</div>;

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const workExperiences = student.workExperience || [];
  const internships = student.internships || [];
  const projects = student.projects || [];
  const technicalSkills = student.technicalSkills || [];
  const publications = student.publications || [];
  const events = student.events || [];
  const placements = student.placements || [];
  const socialProfiles = student.socialProfiles || {};

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans text-sm leading-relaxed">
      {/* Name and Contact */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">
          {general.candidate_first_name} {general.candidate_last_name}
        </h1>
        <div className="mt-1">
          ✉ {general.email} | 📞 {general.phoneNo} | 🎓 {general.current_degree}
        </div>
      </div>

      {/* Section: Professional Summary */}
      <Section title="Professional Summary" color={color}>
        <p>{general.summary || 'Motivated and enthusiastic student eager to contribute to projects and teams.'}</p>
      </Section>

      {/* Section: Education */}
      <Section title="Education" color={color}>
        {ugDetails.overallCGPA ? (
          <ul>
            <li>CGPA: {ugDetails.overallCGPA}</li>
            <li>Percentage: {ugDetails.overallPercentage}%</li>
            <li>Semester: {ugDetails.semesterNo}</li>
            <li>PG: {ugDetails.isPG ? 'Yes' : 'No'}</li>
          </ul>
        ) : (
          <p>UG details not available.</p>
        )}
      </Section>

      {/* Section: Work Experience */}
      <Section title="Work Experience" color={color}>
        {workExperiences.length > 0 ? (
          workExperiences.map((exp, idx) => (
            <div key={idx} className="mb-2">
              <strong>{exp.role}</strong>, {exp.employer} ({exp.startDate?.slice(0, 10)} - {exp.endDate?.slice(0, 10) || 'Present'})
              <div>{exp.responsibilities}</div>
            </div>
          ))
        ) : (
          <p>No work experience listed.</p>
        )}
      </Section>

      {/* Section: Internships */}
      <Section title="Internships" color={color}>
        {internships.length > 0 ? (
          internships.map((intern, idx) => (
            <div key={idx} className="mb-2">
              <strong>{intern.company}</strong> — {intern.role} ({intern.startDate?.slice(0, 10)} - {intern.endDate?.slice(0, 10)})
              <div>{intern.location}</div>
            </div>
          ))
        ) : (
          <p>No internships listed.</p>
        )}
      </Section>

      {/* Section: Projects */}
      <Section title="Projects" color={color}>
        {projects.length > 0 ? (
          projects.map((proj, idx) => (
            <div key={idx} className="mb-2">
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

      {/* Section: Technical Skills */}
      <Section title="Skills" color={color}>
        {technicalSkills.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {technicalSkills.map((skill, idx) => (
              <li key={idx} className="border px-2 py-1 rounded">
                {skill.courseName} ({skill.level})
              </li>
            ))}
          </ul>
        ) : (
          <p>No skills listed.</p>
        )}
      </Section>

      {/* Section: Publications */}
      <Section title="Publications" color={color}>
        {publications.length > 0 ? (
          publications.map((pub, idx) => (
            <div key={idx} className="mb-2">
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

      {/* Section: Enhancement Programs */}
      <Section title="Enhancement Programs" color={color}>
        {events.length > 0 ? (
          events.map((event, idx) => (
            <div key={idx} className="mb-2">
              <strong>{event.name}</strong> — {event.location}
              <div>{event.details}</div>
              <div>{event.contribution}</div>
            </div>
          ))
        ) : (
          <p>No enhancement programs listed.</p>
        )}
      </Section>

      {/* Section: Placements */}
      <Section title="Placements" color={color}>
        {placements.length > 0 ? (
          placements.map((placement, idx) => (
            <div key={idx} className="mb-2">
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

// Reusable section component
function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2
        className="font-semibold uppercase border-b pb-1 mb-2 text-sm"
        style={{ borderColor: color }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
