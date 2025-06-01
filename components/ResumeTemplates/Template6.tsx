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
  color,
  student,
}: {
  color: string;
  student: any;
}) {
  if (!student) return <div className="text-center py-10 text-red-600">No student data available.</div>;

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const technicalSkills = student.technicalSkills || [];
  const softSkills = student.softSkills || [];
  const workExperience = student.workExperience || [];
  const internships = student.internships || [];
  const projects = student.projects || [];
  const certificates = student.certificates || [];
  const publications = student.publications || [];
  const events = student.events || [];
  const placements = student.placements || [];
  const social = student.socialProfiles || {};
  const languages = student.languages || 'English';

  // Helper to get the correct photo URL or fallback
  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === "") return "/default-profile.png";
    if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
    return `/uploads/${photo}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto space-y-6 border border-gray-200">
      {/* Header */}
      <div className="text-center space-y-2">
      <div
  className="w-24 h-24 rounded-full mx-auto bg-gray-300 overflow-hidden"
  style={{
    border: `3px solid ${color || "#222"}`,
    boxShadow: `0 0 0 4px #fff, 0 2px 8px rgba(0,0,0,0.08)`,
  }}
>
  <img
    src={getPhotoUrl(general.photo)}
    alt="Profile"
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = '/default-profile.png';
    }}
  />
</div>
        <h2 className="text-3xl font-bold text-gray-800">
          {general.candidate_first_name} {general.candidate_last_name}
        </h2>
        <p className="italic text-gray-600">{general.current_degree || 'Student'}</p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>📧 {general.email || 'N/A'}</p>
          <p>📍 {general.address || 'N/A'}</p>
          <p>📞 {general.phoneNo || 'N/A'}</p>
        </div>
      </div>

      {/* Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-1" style={{ color }}>📝 Summary</h3>
        <p className="text-sm text-gray-700">
          {general.summary || 'Motivated student eager to apply skills and grow in a dynamic environment.'}
        </p>
      </section>

      {/* Work Experience */}
      <section>
        <h3 className="text-lg font-semibold mb-1" style={{ color }}>💼 Work Experience</h3>
        <div className="space-y-2">
          {workExperience.length > 0 ? (
            workExperience.map((exp: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between font-semibold text-sm">
                  <span>{exp.role}, {exp.employer}</span>
                  <span className="text-gray-500">
                    {exp.startDate?.slice(0, 4)} - {exp.endDate?.slice(0, 4) || 'Present'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{exp.location || ''}</p>
                <p className="text-sm text-gray-700">{exp.responsibilities}</p>
                <p className="text-xs text-gray-500">CTC: {exp.ctc || 'N/A'}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No work experience listed.</p>
          )}
        </div>
      </section>

      {/* Education */}
      <section>
        <h3 className="text-lg font-semibold mb-1" style={{ color }}>🎓 Education</h3>
        {ugDetails.overallCGPA ? (
          <div>
            <p className="font-semibold text-sm">
              UG: {ugDetails.overallCGPA} CGPA / {ugDetails.overallPercentage}% — Semester {ugDetails.semesterNo}
            </p>
            <p className="text-xs text-gray-500">PG: {ugDetails.isPG ? 'Yes' : 'No'}</p>
            {ugDetails.isPG && (
              <p className="text-xs text-gray-500">PG CGPA: {ugDetails.pgOverallCGPA} — PG %: {ugDetails.pgOverallPercentage}%</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">UG details not available.</p>
        )}
      </section>

      {/* Internships */}
      {internships.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🧑‍💻 Internships</h3>
          {internships.map((intern: any, idx: number) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{intern.company} — {intern.role}</p>
              <p className="text-xs text-gray-500">{intern.startDate} - {intern.endDate}</p>
              <p className="text-xs text-gray-500">{intern.location}</p>
              <p className="text-sm text-gray-700">{intern.responsibilities}</p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>💡 Projects</h3>
          {projects.map((proj: any, idx: number) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{proj.title}</p>
              <p className="text-sm text-gray-700">{proj.description}</p>
              {proj.link && (
                <a href={proj.link} className="text-xs text-blue-600 underline break-all" target="_blank" rel="noopener noreferrer">
                  {proj.link}
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Two-Column: Skills + Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🛠 Technical Skills</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {technicalSkills.length > 0 ? (
              technicalSkills.map((skill: any, idx: number) => (
                <li key={idx}>{skill.courseName} ({skill.level})</li>
              ))
            ) : (
              <li>No technical skills listed.</li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🌍 Languages</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {languages.split(',').map((lang: string, idx: number) => (
              <li key={idx}>{lang.trim()}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Soft Skills */}
      {softSkills.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🤝 Soft Skills</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {softSkills.map((skill: string, idx: number) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Certificates */}
      <section>
        <h3 className="text-lg font-semibold mb-1" style={{ color }}>📜 Certificates</h3>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {certificates.length > 0 ? (
            certificates.map((cert: any, idx: number) => (
              <li key={idx}>{cert.name}</li>
            ))
          ) : (
            <li>No certificates listed.</li>
          )}
        </ul>
      </section>

      {/* Social Profiles */}
      <section>
        <h3 className="text-lg font-semibold mb-1" style={{ color }}>🌐 Social Profiles</h3>
        <ul className="text-sm text-gray-700 space-y-1 break-all">
          {Object.entries(SOCIAL_LABELS).map(([key, label]) =>
            social[key] ? (
              <li key={key}>
                <strong>{label}:</strong>{' '}
                <a href={social[key]} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                  {social[key]}
                </a>
              </li>
            ) : null
          )}
        </ul>
      </section>

      {/* Publications */}
      {publications.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>📚 Publications</h3>
          {publications.map((pub: any, idx: number) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{pub.title}</p>
              <p className="text-sm text-gray-700">{pub.abstract}</p>
              <p className="text-xs text-gray-500">{pub.publisher}</p>
            </div>
          ))}
        </section>
      )}

      {/* Enhancement Programs */}
      {events.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🏆 Enhancement Programs</h3>
          {events.map((event: any, idx: number) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{event.name}</p>
              <p className="text-sm text-gray-700">{event.details}</p>
              <p className="text-xs text-gray-500">{event.location}</p>
              <p className="text-xs text-gray-500">{event.contribution}</p>
            </div>
          ))}
        </section>
      )}

      {/* Placements */}
      {placements.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-1" style={{ color }}>🎯 Placements</h3>
          {placements.map((placement: any, idx: number) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{placement.employer}</p>
              <p className="text-sm text-gray-700">{placement.designation}</p>
              <p className="text-xs text-gray-500">{placement.onCampus ? 'On Campus' : 'Off Campus'}</p>
              <p className="text-xs text-gray-500">CTC: {placement.ctc}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}