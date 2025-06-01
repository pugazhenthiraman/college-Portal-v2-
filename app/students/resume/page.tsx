'use client';
import React, { useState, useEffect } from 'react';
import * as html2pdf from 'html2pdf.js';
import { Toaster, toast } from 'react-hot-toast';
import ColorPalette from '../../../components/ColorPalette';
import Template1 from '../../../components/ResumeTemplates/Template1';
import Template2 from '../../../components/ResumeTemplates/Template2';
import Template3 from '../../../components/ResumeTemplates/Template3';
import Template4 from '../../../components/ResumeTemplates/Template4';
import Template5 from '../../../components/ResumeTemplates/Template5';
import Template6 from '../../../components/ResumeTemplates/Template6';

const templates = [
  { name: 'Modern', component: Template1 },
  { name: 'Classic', component: Template2 },
  { name: 'Creative', component: Template3 },
  { name: 'ATS Model', component: Template4 },
  { name: 'Student Spotlight', component: Template5 },
  { name: 'Elegant Leaf', component: Template6 },
];

// Define unique color classes for each box
const templateColors = [
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100',
];

export default function ResumePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [headColor, setHeadColor] = useState('#2563eb');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const TemplateComponent = templates[selectedTemplate].component;

  useEffect(() => {
    const savedHead = localStorage.getItem('resumeHeadColor');
    if (savedHead) setHeadColor(savedHead);

    async function fetchStudent() {
      try {
        // Use the new resume API endpoint for mapped data
        const res = await fetch('/api/students/resume');
        const json = await res.json();
        if (res.ok) {
          setStudentData(json);
        } else {
          console.error('Error fetching student:', json.error);
        }
      } catch (err) {
        console.error('Failed to fetch student:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, []);

  const handleDownloadPDF = () => {
    const resumeElement = document.getElementById('resume-preview');
    if (!resumeElement) {
      toast.error('Could not find resume preview.');
      return;
    }

    html2pdf()
      .from(resumeElement)
      .set({ margin: 0.5, filename: 'resume.pdf', html2canvas: { scale: 2 } })
      .save()
      .then(() => toast.success('📥 PDF downloaded!'))
      .catch(() => toast.error('❌ Failed to generate PDF.'));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('resumeHeadColor', headColor);
    localStorage.setItem('selectedTemplate', selectedTemplate.toString());
    toast.success('💾 Settings saved!');
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/resume?template=${selectedTemplate}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('🔗 Share link copied to clipboard!');
  };

  if (loading) {
    return <div className="text-center py-10">Loading resume data...</div>;
  }

  if (!studentData) {
    return (
      <div className="text-center py-10 text-red-600">
        Failed to load student data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 font-sans">
      {/* Toaster for notifications */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        {/* Main Content */}
        <div>
          <h1 className="text-3xl font-bold mb-4 text-center">Resume Builder</h1>
          <h2 className="text-center mb-6 text-gray-600">
            Currently Selected: <span className="font-semibold">{templates[selectedTemplate].name}</span>
          </h2>

          {/* Template Selector with unique colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 mb-8">
            {templates.map((tpl, idx) => (
              <button
                key={tpl.name}
                className={`border px-4 py-3 rounded-lg font-medium text-center transition transform hover:scale-105 ${
                  selectedTemplate === idx
                    ? 'bg-blue-600 text-white'
                    : `${templateColors[idx % templateColors.length]} hover:brightness-95`
                }`}
                onClick={() => setSelectedTemplate(idx)}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          {/* Resume Preview Area */}
          <div
            id="resume-preview"
            className="border rounded-xl bg-white shadow-lg p-6 transition-opacity duration-300 ease-in-out"
          >
            <TemplateComponent color={headColor} student={studentData} />
          </div>
        </div>

        {/* Right Panel */}
        <div className="sticky top-10 space-y-6">
          <details open className="bg-white p-4 rounded-xl shadow space-y-4">
            <summary className="cursor-pointer font-semibold text-center">
              🎨 Customize Colors
            </summary>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1 text-center">
                Head Color
              </label>
              <ColorPalette color={headColor} setColor={setHeadColor} size="sm" />
            </div>
          </details>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
        <button
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          onClick={handleDownloadPDF}
        >
          📥 Download PDF
        </button>
        <button
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
          onClick={handleSaveSettings}
        >
          💾 Save Settings
        </button>
        <button
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
          onClick={handleShareLink}
        >
          🔗 Copy Share Link
        </button>
      </div>
    </div>
  );
}