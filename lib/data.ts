export type College = {
  id: string;
  institutionName: string;
  email: string;
  affiliatedUniversity: string;
  recognitionStatus: string;
  institutionCode?: string; // Optional
  council: string;
  issuingCode: string;
  status: "pending" | "approved" | "rejected";
};

// Initial dummy data
export let colleges: College[] = [
  {
    id: "1",
    institutionName: "ABC College",
    email: "abc@example.com",
    affiliatedUniversity: "XYZ University",
    recognitionStatus: "Recognized",
    institutionCode: "12345",
    council: "UGC",
    issuingCode: "A1B2C3",
    status: "pending",
  },
  {
    id: "2",
    institutionName: "DEF Institute",
    email: "def@example.com",
    affiliatedUniversity: "ABC University",
    recognitionStatus: "Not Recognized",
    council: "AICTE",
    issuingCode: "X1Y2Z3",
    status: "pending",
  },
];

// Function to approve a college
export function approveCollege(id: string) {
  colleges = colleges.map((college) =>
    college.id === id ? { ...college, status: "approved" } : college
  );
}

// Function to reject a college
export function rejectCollege(id: string) {
  colleges = colleges.map((college) =>
    college.id === id ? { ...college, status: "rejected" } : college
  );
}

// Function to get pending colleges
export function getPendingColleges(): College[] {
  return colleges.filter((college) => college.status === "pending");
}

// Function to get approved colleges
export function getApprovedColleges(): College[] {
  return colleges.filter((college) => college.status === "approved");
}

// Function to get rejected colleges
export function getRejectedColleges(): College[] {
  return colleges.filter((college) => college.status === "rejected");
}
