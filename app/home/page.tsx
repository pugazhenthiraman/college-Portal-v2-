"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleAdminClick = () => {
    router.push('/auth/login');
  };

  const handleCollegeClick = () => {
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
        <article className="text-wrap">
      <h1 className="text-7xl font-extrabold text-indigo-600 text-center mb-6">Welcome to <br></br>Education Master</h1>
      <div className="flex gap-4">
        <p className='p-2 text-center'>Welcome to the College Portal System, a centralized platform for managing multiple college details and student records 
            efficiently.<br></br> Our system ensures secure storage of student biodata, enabling quick and reliable verification for future use. 
            With seamless data management, <br></br>colleges can easily handle admissions, student histories, and academic records without hassle. 
            Built with strong security and scalability, the portal guarantees safe and structured data storage. <br></br>The user-friendly interface simplifies 
            navigation for colleges, students, and administrators, making academic management more efficient and accessible.</p> <br></br>
            </div>
           </article>
           <div className="flex gap-10 mt-10">
        <button
          className="px-5 py-2 text-lg text-white bg-violet-600 rounded hover:bg-violet-700 transition-colors "
          onClick={handleAdminClick}
        >
          Admin
        </button>
        <button
          className="px-5 py-2 text-lg text-white bg-violet-600 rounded hover:bg-violet-700 transition-colors"
          onClick={handleCollegeClick}
        >
          College
        </button>
        </div>
      </div>
   
  );
};

export default HomePage;