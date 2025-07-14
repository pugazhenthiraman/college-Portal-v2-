'use client';

import React, { useState, useEffect } from 'react';
import * as html2pdf from 'html2pdf.js';
import { Toaster, toast } from 'react-hot-toast';
import ColorPalette from '../../../components/ColorPalette';
import FontSelector from '../../../components/FontSelector';
import SectionReorder from '../../../components/SectionReorder';

import Template1 from '../../../components/ResumeTemplates/Template1';
import Template2 from '../../../components/ResumeTemplates/Template2';
import Template3 from '../../../components/ResumeTemplates/Template3';
import Template4 from '../../../components/ResumeTemplates/Template4';
import Template5 from '../../../components/ResumeTemplates/Template5';
import Template6 from '../../../components/ResumeTemplates/Template6';
import ResumeAISuggestions from '../../../components/ResumeAISuggestions'; // <-- Import the AI Suggestions component

const templates = [
  { name: 'Modern', component: Template1, color: '#2563eb' },
  { name: 'Classic', component: Template2, color: '#059669' },
  { name: 'Creative', component: Template3, color: '#f59e42' },
  { name: 'ATS Model', component: Template4, color: '#a21caf' },
  { name: 'Student Spotlight', component: Template5, color: '#e11d48' },
  { name: 'Elegant Leaf', component: Template6, color: '#16a34a' },
];

const defaultSectionOrder = [
  'general',
  'ugDetails',
  'internships',
  'projects',
  'skills',
  'socialProfiles',
  'publications',
  'enhancementPrograms',
  'workExperience',
  'placements',
];

const sectionLabels = {
  general: 'General Info',
  ugDetails: 'UG Details',
  internships: 'Internships',
  projects: 'Projects',
  skills: 'Skills',
  socialProfiles: 'Social Profiles',
  publications: 'Publications',
  enhancementPrograms: 'Enhancement Programs',
  workExperience: 'Work Experience',
  placements: 'Placements',
};

export default function ResumePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [headerBgColor, setHeaderBgColor] = useState('#FFFFFF');
  const [headerTextColor, setHeaderTextColor] = useState('#333333');
  const [headerTitleColor, setHeaderTitleColor] = useState('#15157f');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState('14px');
  const [lineHeight, setLineHeight] = useState('1.6');
  const [sectionSpacing, setSectionSpacing] = useState('16px');
  const [sectionOrder, setSectionOrder] = useState(defaultSectionOrder);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customizeTab, setCustomizeTab] = useState('color');

  const TemplateComponent = templates[selectedTemplate].component;

  useEffect(() => {
    const savedHeaderBg = localStorage.getItem('resumeHeaderBgColor');
    const savedHeaderText = localStorage.getItem('resumeHeaderTextColor');
    const savedHeaderTitle = localStorage.getItem('resumeHeaderTitleColor');
    const savedFont = localStorage.getItem('resumeFontFamily');
    const savedTemplate = localStorage.getItem('selectedTemplate');
    const savedFontSize = localStorage.getItem('resumeFontSize');
    const savedLineHeight = localStorage.getItem('resumeLineHeight');
    const savedSectionSpacing = localStorage.getItem('resumeSectionSpacing');
    const savedSectionOrder = localStorage.getItem('resumeSectionOrder');

    if (savedHeaderBg) setHeaderBgColor(savedHeaderBg);
    if (savedHeaderText) setHeaderTextColor(savedHeaderText);
    if (savedHeaderTitle) setHeaderTitleColor(savedHeaderTitle);
    if (savedFont) setFontFamily(savedFont);
    if (savedTemplate) setSelectedTemplate(Number(savedTemplate));
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedLineHeight) setLineHeight(savedLineHeight);
    if (savedSectionSpacing) setSectionSpacing(savedSectionSpacing);
    if (savedSectionOrder) setSectionOrder(JSON.parse(savedSectionOrder));

    async function fetchStudent() {
      try {
        const res = await fetch('/api/students/resume');
        const json = await res.json();
        if (res.ok) setStudentData(json);
        else console.error('Error fetching student:', json.error);
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
      .then(() => toast.success('📅 PDF downloaded!'))
      .catch(() => toast.error('❌ Failed to generate PDF.'));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('resumeHeaderBgColor', headerBgColor);
    localStorage.setItem('resumeHeaderTextColor', headerTextColor);
    localStorage.setItem('resumeHeaderTitleColor', headerTitleColor);
    localStorage.setItem('resumeFontFamily', fontFamily);
    localStorage.setItem('selectedTemplate', selectedTemplate.toString());
    localStorage.setItem('resumeFontSize', fontSize);
    localStorage.setItem('resumeLineHeight', lineHeight);
    localStorage.setItem('resumeSectionSpacing', sectionSpacing);
    localStorage.setItem('resumeSectionOrder', JSON.stringify(sectionOrder));
    toast.success('📂 Settings saved!');
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/resume?template=${selectedTemplate}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('🔗 Share link copied to clipboard!');
  };

  // Helper to extract plain text from studentData for AI suggestions
  function getResumeText(data: any): string {
    if (!data) return '';
    // You can customize this to extract and format the most important fields
    let text = '';
    if (data.general) {
      text += `Name: ${data.general.name || ''}\nEmail: ${data.general.email || ''}\n`;
      text += `Summary: ${data.general.summary || ''}\n\n`;
    }
    if (data.ugDetails) {
      text += `UG Details: ${JSON.stringify(data.ugDetails)}\n\n`;
    }
    if (data.internships) {
      text += `Internships: ${JSON.stringify(data.internships)}\n\n`;
    }
    if (data.projects) {
      text += `Projects: ${JSON.stringify(data.projects)}\n\n`;
    }
    if (data.skills) {
      text += `Skills: ${JSON.stringify(data.skills)}\n\n`;
    }
    if (data.workExperience) {
      text += `Work Experience: ${JSON.stringify(data.workExperience)}\n\n`;
    }
    // Add more fields as needed
    return text;
  }

  if (loading) return <div className="text-center py-10">Loading resume data...</div>;
  if (!studentData) return <div className="text-center py-10 text-red-600">Failed to load student data.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-10 px-4 font-sans">
      <Toaster position="bottom-right" reverseOrder={false} />

      <style>{`
        #resume-preview section {
          margin-bottom: ${sectionSpacing};
        }
      `}</style>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        {/* Resume Preview Area (scrollable) */}
        <div className="overflow-y-auto max-h-[calc(100vh-80px)] pr-2">
          <h1 className="text-3xl font-bold mb-4 text-center">Resume Builder</h1>
          
          {/* Template Selection UI */}
          <div className="flex gap-3 justify-center mb-6 flex-wrap">
            {templates.map((tpl, idx) => (
              <button
                key={tpl.name}
                className={`px-4 py-2 rounded font-medium border transition-colors duration-200 ${
                  selectedTemplate === idx
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                }`}
                style={{ borderColor: tpl.color }}
                onClick={() => setSelectedTemplate(idx)}
              >
                {tpl.name}
              </button>
            ))}
          </div>

          <h2 className="text-center mb-6 text-gray-600">
            Currently Selected: <span className="font-semibold">{templates[selectedTemplate].name}</span>
          </h2>

          {/* AI Suggestions Component */}
          <ResumeAISuggestions resumeText={getResumeText(studentData)} />

          <div
            id="resume-preview"
            className="border rounded-xl shadow-lg p-6 transition-opacity duration-300 ease-in-out"
            style={{ fontFamily, fontSize, lineHeight, backgroundColor: '#ffffff', color: '#000000' }}
          >
            <TemplateComponent
              student={studentData}
              sectionOrder={sectionOrder}
              headerBgColor={headerBgColor}
              headerTextColor={headerTextColor}
              headerTitleColor={headerTitleColor}
              fontFamily={fontFamily}
            />
          </div>
        </div>

        {/* Customization Panel (sticky/static) */}
        <div className="hidden lg:block">
          <div className="sticky top-10">
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
              <h3 className="text-lg font-semibold text-center">🛠 Customize</h3>
              <div className="flex justify-center gap-2 flex-wrap">
                <button onClick={() => setCustomizeTab('color')} className={`px-3 py-1 rounded text-sm font-medium ${customizeTab === 'color' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>🎨 Color</button>
                <button onClick={() => setCustomizeTab('font')} className={`px-3 py-1 rounded text-sm font-medium ${customizeTab === 'font' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>🅰️ Font</button>
                <button onClick={() => setCustomizeTab('spacing')} className={`px-3 py-1 rounded text-sm font-medium ${customizeTab === 'spacing' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>📏 Spacing</button>
                <button onClick={() => setCustomizeTab('order')} className={`px-3 py-1 rounded text-sm font-medium ${customizeTab === 'order' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>📋 Section Order</button>
              </div>

              {customizeTab === 'color' && (
                <div>
                  <ColorPalette
                    currentHeaderBgColor={headerBgColor}
                    currentHeaderTextColor={headerTextColor}
                    currentHeaderTitleColor={headerTitleColor}
                    setHeaderBgColor={setHeaderBgColor}
                    setHeaderTextColor={setHeaderTextColor}
                    setHeaderTitleColor={setHeaderTitleColor}
                  />
                </div>
              )}

              {customizeTab === 'font' && (
                <FontSelector font={fontFamily} setFont={setFontFamily} />
              )}

              {customizeTab === 'spacing' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-center">Font Size</label>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={parseInt(fontSize)}
                      onChange={(e) => setFontSize(`${e.target.value}px`)}
                      className="w-full"
                    />
                    <div className="text-center text-xs mt-1">{fontSize}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-center">Line Height</label>
                    <input
                      type="range"
                      min="1"
                      max="2"
                      step="0.1"
                      value={parseFloat(lineHeight)}
                      onChange={(e) => setLineHeight(e.target.value)}
                      className="w-full"
                    />
                    <div className="text-center text-xs mt-1">{lineHeight}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-center">Section Spacing</label>
                    <input
                      type="range"
                      min="8"
                      max="40"
                      value={parseInt(sectionSpacing)}
                      onChange={(e) => setSectionSpacing(`${e.target.value}px`)}
                      className="w-full"
                    />
                    <div className="text-center text-xs mt-1">{sectionSpacing}</div>
                  </div>
                </>
              )}

              {customizeTab === 'order' && (
                <SectionReorder
                  sectionOrder={sectionOrder}
                  setSectionOrder={setSectionOrder}
                  sectionLabels={sectionLabels}
                  locked={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
        <button
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
          onClick={handleDownloadPDF}
        >
          📅 Download PDF
        </button>
        <button
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
          onClick={handleSaveSettings}
        >
          📂 Save Settings
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