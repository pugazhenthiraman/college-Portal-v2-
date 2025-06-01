import React from 'react';

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter',
  portfolio: 'Portfolio',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
};

export default function Template1({
  color,
  student,
}: {
  color: string;
  student: any;
}) {
  if (!student) return <div>No student data available.</div>;

  const social = student.socialProfiles || {};
  const general = student.general || {};

  // Helper to resolve image path or fallback
  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo || photo.trim() === "") return "/default-profile.png";
    if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
    return `/uploads/${photo}`;
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow overflow-hidden">
      {/* Sidebar */}
      <div className="md:w-1/3 bg-gray-100 p-6 space-y-4">
        {/* Student Photo */}
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

        <h2 className="text-xl font-bold text-center" style={{ color }}>
          {general.candidate_first_name} {general.candidate_last_name}
        </h2>
        <p className="text-gray-600 text-center">{general.current_degree}</p>
        <p className="text-sm text-gray-500 text-center">{general.email}</p>
        <p className="text-sm text-gray-500 text-center">{general.phoneNo}</p>
        <p className="text-sm text-gray-500 text-center">{general.roll_reg_no}</p>
        <p className="text-sm text-gray-500 text-center">{general.batch}</p>
        <p className="text-sm text-gray-500 text-center">{general.address}</p>

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-1" style={{ color }}>
            Skills
          </h3>
          <ul className="flex flex-wrap gap-2 text-sm">
            {student.technicalSkills?.length > 0 ? (
              student.technicalSkills.map((skill: any, idx: number) => (
                <li
                  key={idx}
                  className="bg-white border px-2 py-1 rounded"
                >
                  {skill.courseName}{' '}
                  {skill.level && (
                    <span className="text-xs text-gray-400">
                      ({skill.level})
                    </span>
                  )}
                  {skill.certificateName && (
                    <span className="ml-1 text-xs text-blue-600">
                      [{skill.certificateName}]
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li>No skills listed</li>
            )}
          </ul>
        </div>

        {/* Social Profiles */}
        <div>
          <h3 className="font-semibold mb-1" style={{ color }}>
            Social Profiles
          </h3>
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

        {/* Education */}
        <div>
          <h3 className="font-semibold mb-1" style={{ color }}>
            Education
          </h3>
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
      </div>

      {/* Main Content */}
      <div className="md:w-2/3 p-6 space-y-6">
        {/* Summary */}
        <div>
          <h3 className="text-lg font-bold mb-1" style={{ color }}>
            Summary
          </h3>
          <p className="text-gray-700">
            {general.summary ||
              'Motivated student passionate about growth and contribution.'}
          </p>
        </div>

        {/* Internships */}
        {student.internships?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Internships
            </h3>
            {student.internships.map((intern: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{intern.company}</p>
                <p className="text-sm text-gray-700">{intern.role}</p>
                <p className="text-xs text-gray-500">
                  {intern.startDate} - {intern.endDate}
                </p>
                <p className="text-xs text-gray-500">{intern.location}</p>
                <p className="text-xs text-gray-500">
                  {intern.responsibilities}
                </p>
                {intern.certificateName && (
                  <p className="text-xs text-blue-600">
                    Certificate: {intern.certificateName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {student.projects?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Projects
            </h3>
            {student.projects.map((proj: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{proj.title}</p>
                <p className="text-sm text-gray-700">{proj.description}</p>
                {proj.link && (
                  <a
                    href={proj.link}
                    className="text-xs text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {proj.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {student.workExperience?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Work Experience
            </h3>
            {student.workExperience.map((work: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{work.employer}</p>
                <p className="text-sm text-gray-700">{work.role}</p>
                <p className="text-xs text-gray-500">
                  {work.startDate} - {work.endDate}
                </p>
                <p className="text-xs text-gray-500">
                  {work.responsibilities}
                </p>
                <p className="text-xs text-gray-500">CTC: {work.ctc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Publications */}
        {student.publications?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Publications
            </h3>
            {student.publications.map((pub: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{pub.title}</p>
                <p className="text-sm text-gray-700">{pub.abstract}</p>
                <p className="text-xs text-gray-500">{pub.publisher}</p>
                {pub.link && (
                  <a
                    href={pub.link}
                    className="text-xs text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pub.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Enhancement Programs */}
        {student.events?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Enhancement Programs
            </h3>
            {student.events.map((event: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{event.name}</p>
                <p className="text-sm text-gray-700">{event.details}</p>
                <p className="text-xs text-gray-500">{event.location}</p>
                <p className="text-xs text-gray-500">{event.contribution}</p>
              </div>
            ))}
          </div>
        )}

        {/* Placements */}
        {student.placements?.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color }}>
              Placements
            </h3>
            {student.placements.map((placement: any, idx: number) => (
              <div key={idx} className="mb-2">
                <p className="font-semibold">{placement.employer}</p>
                <p className="text-sm text-gray-700">{placement.designation}</p>
                <p className="text-xs text-gray-500">
                  {placement.onCampus ? 'On Campus' : 'Off Campus'}
                </p>
                <p className="text-xs text-gray-500">
                  CTC: {placement.ctc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
