"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "../../components/ui/button";
import { College } from "../../app/type";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  college: College;
  onApprove?: () => void;
  onReject?: (remark: string) => void;
};

export function CollegeDetailsModal({ isOpen, onClose, college, onApprove, onReject }: Props) {
  const [rejectRemark, setRejectRemark] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const confirmModal = () => {
          if (window.confirm("Are you sure you want to Approve this college?")) {
      onApprove?.();
    } else {
      console.log("Cancelled deletion");
      return;
    }  
  
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="College Details">
      <div className="p-4 flex flex-col justify-between h-full">
       <div className="p-4 bg-white rounded-xl shadow-md">
  <h3 className="text-lg font-semibold text-indigo-700 mb-4">
    {college.name}
  </h3>

  <div className="grid grid-cols-[180px_auto] gap-y-2 text-gray-600">


    <span className="font-medium">Name:</span>
    <span>{college.name}</span>


    <span className="font-medium">Affiliated University:</span>
    <span>{college.affiliatedUniversity}</span>

    <span className="font-medium">Deemed University:</span>
    <span>{college.deemedUniversity}</span>

    <span className="font-medium">Recognition Status:</span>
    <span>{college.recognitionStatus}</span>

    <span className="font-medium">Institution Code:</span>
    <span>{college.instituteCode || "N/A"}</span>

    <span className="font-medium">Council Issuing Code:</span>
    <span>{college.councilIssuingCode}</span>
  </div>
</div>


        

        {showRejectInput ? (
          <div className="mt-4">
            <label className="block text-gray-700 font-medium">Reason for Rejection:</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg mt-2"
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="Enter rejection reason..."
            ></textarea>
            <div className="flex justify-center space-x-3 mt-4">
              <Button
                onClick={() => setShowRejectInput(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (rejectRemark.trim()) {
                    onReject?.(rejectRemark);
                    setShowRejectInput(false);
                    setRejectRemark("");
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center space-x-3 mt-6 border-t pt-4">
            {onApprove && (
              <Button onClick={confirmModal} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Approve
              </Button>
            )}
            {onReject && (
              <Button onClick={() => setShowRejectInput(true)} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
                Reject
              </Button>
            )}
            <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
