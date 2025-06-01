import React from 'react';
import Image from 'next/image';

export default function Template5({
  color,
  student,
}: {
  color: string;
  student: any;
}) {
  if (!student) return <div>No student data available.</div>;

  const general = student.general || {};
  const ugDetails = student.ugDetails || {};
  const socialProfiles = student.socialProfiles || {};
  const workExperiences = student.workExperience || [];
  const volunteerExperiences = student.volunteerExperiences || [];
  const organizations = student.organizations || [];
  const certificates = student.certificates || [];
  const interests = student.interests || [];
  const softSkills = student.softSkills || [];
  const languages = student.languages
    ? student.languages.split(',').map((lang: string) => lang.trim())
    : ['English'];

    const getPhotoUrl = (photo: string | undefined) => {
      if (!photo || photo.trim() === "") return "/default-profile.png";
      if (photo.startsWith("http") || photo.startsWith("/uploads/")) return photo;
      return `/uploads/${photo}`;
    };

  const photoUrl = getPhotoUrl(student.photo || general.photo);

  return (
    <div className="bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
      {/* Sidebar */}
      <div className="bg-gray-50 p-6 space-y-6 text-sm text-gray-700">
        {/* Photo + Basic Info */}
        <div className="flex flex-col items-center text-center space-y-2">
          {photoUrl && (
            <Image
              src={photoUrl}
              alt="Profile"
              width={100}
              height={100}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <h2 className="text-lg font-bold">
            {general.candidate_first_name} {general.candidate_last_name}
          </h2>
          <p className="text-sm" style={{ color }}>
            {general.current_degree || 'Student'}
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-1">
          <p>✉ {general.email}</p>
          <p>📞 {general.phoneNo}</p>
          <p>🎓 Batch: {general.batch}</p>
          <p>Roll No: {general.roll_reg_no}</p>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="font-semibold mb-2" style={{ color }}>
            Social Profiles
          </h3>
          <ul className="space-y-1 break-words">
            {Object.entries(socialProfiles).map(
              ([key, value]) =>
                value && (
                  <li key={key}>
                    {key}: <a href={value} className="text-blue-600" target="_blank">{value}</a>
                  </li>
                )
            )}
          </ul>
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-semibold mb-2" style={{ color }}>
            Soft Skills
          </h3>
          <ul className="list-disc list-inside">
            {softSkills.length > 0 ? (
              softSkills.map((skill: string, idx: number) => <li key={idx}>{skill}</li>)
            ) : (
              <li>Teamwork</li>
            )}
          </ul>
        </div>

        {/* Languages */}
        <div>
          <h3 className="font-semibold mb-2" style={{ color }}>
            Languages
          </h3>
          <ul className="list-disc list-inside">
            {languages.map((lang: string, idx: number) => (
              <li key={idx}>{lang}</li>
            ))}
          </ul>
        </div>

        {/* Interests */}
        <div>
          <h3 className="font-semibold mb-2" style={{ color }}>
            Interests
          </h3>
          <ul className="list-disc list-inside">
            {interests.length > 0 ? (
              interests.map((interest: string, idx: number) => <li key={idx}>{interest}</li>)
            ) : (
              <li>Technology</li>
            )}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2 p-6 space-y-6 text-sm text-gray-800">
        {/* Summary */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Summary
          </h3>
          <p>{general.summary || 'Motivated and enthusiastic undergraduate seeking opportunities to apply skills and grow.'}</p>
        </section>

        {/* Education */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Education
          </h3>
          {ugDetails ? (
            <p>
              Bachelor’s Degree: {ugDetails.overallCGPA} CGPA / {ugDetails.overallPercentage}% overall
            </p>
          ) : (
            <p>UG details not available.</p>
          )}
        </section>

        {/* Work Experience */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Work Experience
          </h3>
          {workExperiences.length > 0 ? (
            workExperiences.map((exp: any) => (
              <div key={exp.id} className="mb-2">
                <p className="font-semibold">
                  {exp.role}, {exp.employer}
                </p>
                <p className="text-xs text-gray-500">
                  {exp.startDate?.slice(0, 10)} - {exp.endDate?.slice(0, 10) || 'Present'}
                </p>
                <p>{exp.responsibilities}</p>
              </div>
            ))
          ) : (
            <p>No work experience listed.</p>
          )}
        </section>

        {/* Volunteer Experience */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Volunteer Experience
          </h3>
          {volunteerExperiences.length > 0 ? (
            volunteerExperiences.map((vol: any) => (
              <div key={vol.id} className="mb-2">
                <p className="font-semibold">
                  {vol.role} - {vol.organization}
                </p>
                <p className="text-xs text-gray-500">{vol.year}</p>
                <p>{vol.description}</p>
              </div>
            ))
          ) : (
            <p>No volunteer experience listed.</p>
          )}
        </section>

        {/* Organizations */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Organizations
          </h3>
          {organizations.length > 0 ? (
            organizations.map((org: any) => (
              <p key={org.id}>
                {org.name} ({org.years})
              </p>
            ))
          ) : (
            <p>No organizations listed.</p>
          )}
        </section>

        {/* Certificates */}
        <section>
          <h3 className="text-lg font-semibold mb-2" style={{ color }}>
            Certificates
          </h3>
          {certificates.length > 0 ? (
            certificates.map((cert: any) => (
              <p key={cert.id}>
                {cert.name} ({cert.year})
              </p>
            ))
          ) : (
            <p>No certificates listed.</p>
          )}
        </section>
      </div>
    </div>
  );
}
