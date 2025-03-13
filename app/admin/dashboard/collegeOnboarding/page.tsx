"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/Tabs";
import { Button } from "@/components/ui/button";
import { CollegeDetailsModal } from "@/components/approvals/collegeDetailsModel";
import { College } from "../../../type";

const Pagination = ({ currentPage, totalPages, onPageChange } : {currentPage: number, totalPages: number, onPageChange: any}) => {
  return (
   <div className="flex justify-center items-center space-x-4 mt-4">
  <Button
    className="px-3 py-2 text-xs rounded-md"
    disabled={currentPage === 1}
    onClick={() => onPageChange(currentPage - 1)}
  >
    Previous
  </Button>
  
  <span className="self-center text-sm">
    Page {currentPage} of {totalPages || 1}
  </span>
  
  <Button
    className="px-3 py-2 text-xs rounded-md"
    disabled={currentPage === totalPages}
    onClick={() => onPageChange(currentPage + 1)}
  >
    Next
  </Button>
</div>

  );
};

export default function SuperAdminDashboard() {
  const [pendingColleges, setPendingColleges] : any = useState<{ colleges: College[], totalPages: number } | null>(null);
  const [activeColleges, setActiveColleges] : any = useState<{ colleges: College[], totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // const [rejectRemark, setRejectRemark] = useState("");
  // const [showRejectInput, setShowRejectInput] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const limit = 10;

    const [activeTab, setActiveTab] = useState("pending"); // <-- New State



  const fetchColleges = async (status: string, page: number, setter: Function) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/colleges?status=${status}&limit=${limit}&page=${page}`);
      const data = await response.json();
      setter({ colleges: data.colleges || [], totalPages: data.totalPages || 1 });
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchColleges("PENDING", pendingPage, setPendingColleges);
    
  }, [ pendingPage]);

  useEffect(() => {
    
      fetchColleges("ACTIVE", activePage, setActiveColleges);
    
  }, [ activePage]);

  const handleApproval = async (id: Number, status: string, remark: string = "") => {
    setModalOpen(false);
    try {
      await fetch("/api/admin/approve-college", {
        method: 'PATCH',
        body: JSON.stringify({ collegeId: id, status, remark })
      });
      fetchColleges("PENDING", pendingPage, setPendingColleges);
      fetchColleges("ACTIVE", activePage, setActiveColleges);
    } catch (error) {
      console.error("Error handling approval:", error);
    }
  };


  return (
    <div className="p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">College Approval Management</h2>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Colleges</TabsTrigger>
          <TabsTrigger value="active">Active Colleges</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {(!pendingColleges || pendingColleges.colleges.length === 0) ? (
            <div className="text-center py-4 text-gray-500">No pending college approvals</div>
          ) : (
            <div className="space-y-4">
              {pendingColleges.colleges.map((college : any) => (
                <div key={college.id} className="flex justify-between p-4 bg-white shadow rounded-lg">
                  <div>
                    <h3 className="font-medium text-lg text-indigo-700">{college.name}</h3>
                    <p className="text-sm text-gray-500">{college.email}</p>
                  </div>
                  <div className="space-x-2 flex items-center">
                    <Button onClick={() => { setSelectedCollege(college); setModalOpen(true); }}>View Details</Button>
                    {/* <Button onClick={() => handleApproval(college.id, "ACTIVE")}>Approve</Button>
                    <Button onClick={() => { setSelectedCollege(college); setShowRejectInput(true); }}>Reject</Button> */}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination currentPage={pendingPage} totalPages={pendingColleges?.totalPages || 1} onPageChange={setPendingPage} />
        </TabsContent>

        <TabsContent value="active">
          {(!activeColleges || activeColleges.colleges.length === 0) ? (
            <div className="text-center py-4 text-gray-500">No active colleges</div>
          ) : (
            <div className="space-y-4">
              {activeColleges.colleges.map((college : any) => (
                <div key={college.id} className="flex justify-between p-4 bg-white shadow rounded-lg">
                  <div>
                    <h3 className="font-medium text-lg text-indigo-700">{college.name}</h3>
                    <p className="text-sm text-gray-500">{college.email}</p>
                  </div>
                  <div className="space-x-2 flex items-center">
                    <Button onClick={() => { setSelectedCollege(college); setModalOpen(true); }}>View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination currentPage={activePage} totalPages={activeColleges?.totalPages || 1} onPageChange={setActivePage} />
        </TabsContent>
      </Tabs>

      {selectedCollege && (
        // <CollegeDetailsModal 
        //   isOpen={modalOpen} 
        //   onClose={() => setModalOpen(false)} 
        //   college={selectedCollege} 
        //   onApprove={() => handleApproval(selectedCollege.id, "ACTIVE")} 
        //   onReject={() => handleApproval(selectedCollege.id, "REJECTED", rejectRemark)} 
        // />
        // Update the Modal call
<CollegeDetailsModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  college={selectedCollege}
  onApprove={() => handleApproval(selectedCollege.id, "ACTIVE")}
  onReject={(remark: string) => handleApproval(selectedCollege.id, "REJECTED", remark)}
/>

      )}
    </div>
  );
}
