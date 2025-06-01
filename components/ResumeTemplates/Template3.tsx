import React from 'react';

export default function Template3({ color, student }: { color: string; student: any }) {
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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-8 text-center" style={{ backgroundColor: color, color: '#fff' }}>
        <h2 className="text-3xl font-bold mb-1">
          {general.candidate_first_name} {general.candidate_last_name}
        </h2>
        <p className="text-lg">{general.current_degree || 'Student'}</p>
        <div className="mt-2 text-sm">
          📞 {general.phoneNo || 'N/A'} | ✉️ {general.email || 'N/A'} | 🎓 {general.batch || 'N/A'} | Roll No: {general.roll_reg_no || 'N/A'}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Left column */}
        <div className="space-y-4 md:col-span-1">
          {/* Profile / Summary */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
              Profile
            </h3>
            <p className="text-sm text-gray-700">
              {general.summary || 'Motivated and enthusiastic student eager to contribute to projects and teams.'}
            </p>
          </section>

          {/* Skills */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {technicalSkills.length > 0 ? (
                technicalSkills.map((skill: any, idx: number) => (
                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {skill.courseName} ({skill.level})
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No skills listed</span>
              )}
            </div>
          </section>

          {/* Social Profiles */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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
        </div>

        {/* Right column */}
        <div className="space-y-4 md:col-span-2">
          {/* Education */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
              Education
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              {ugDetails.overallCGPA ? (
                <>
                  <li><span className="font-medium">CGPA:</span> {ugDetails.overallCGPA}</li>
                  <li><span className="font-medium">Percentage:</span> {ugDetails.overallPercentage}%</li>
                  <li><span className="font-medium">Semester:</span> {ugDetails.semesterNo}</li>
                  <li><span className="font-medium">PG:</span> {ugDetails.isPG ? 'Yes' : 'No'}</li>
                </>
              ) : (
                <li>UG details not available</li>
              )}
            </ul>
          </section>

          {/* Work Experience */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No work experience listed.</p>
            )}
          </section>

          {/* Internships */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
              Internships
            </h3>
            {internships.length > 0 ? (
              internships.map((intern: any, idx: number) => (
                <div key={idx} className="mb-2">
                  <span className="font-semibold">{intern.company}</span> — {intern.role}
                  <p className="text-xs text-gray-500">{intern.startDate?.slice(0, 10)} - {intern.endDate?.slice(0, 10)}</p>
                  <p className="text-xs text-gray-500">{intern.location}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No internships listed.</p>
            )}
          </section>

          {/* Projects */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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

          {/* Publications */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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

          {/* Enhancement Programs */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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

          {/* Placements */}
          <section className="p-4 rounded shadow">
            <h3 className="font-semibold mb-2 border-b-2 pb-1" style={{ borderColor: color }}>
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
        </div>
      </div>
    </div>
  );
}
