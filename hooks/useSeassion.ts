// hooks/useSeassion.ts
import { useState, useEffect } from "react";

export function useSession() {
  const [session, setSession] = useState<{
    collegeType: "ENGINEERING" | "ARTS" | "MEDICAL";
    collegeId: number;
  } | null>(null);

  useEffect(() => {
    // Simulate fetching session data. Replace with your auth logic.
    setTimeout(() => {
      setSession({ collegeType: "ENGINEERING", collegeId: 1 });
    }, 100);
  }, []);

  return { data: session };
}


// import { useState, useEffect } from "react";

// export function useSession() {
//   const [session, setSession] = useState<{
//     collegeType: "ENGINEERING" | "ARTS" | "MEDICAL";
//     collegeId: number;
//   } | null>(null);

//   useEffect(() => {
//     // Simulate fetching session data. Replace this with your actual auth logic.
//     const fetchSession = async () => {
//       try {
//         // Replace this with an actual API call or authentication logic
//         const response = await fetch("/api/session"); // Example API endpoint
//         const data = await response.json();
//         setSession(data); // Assuming the API returns { collegeType, collegeId }
//       } catch (error) {
//         console.error("Failed to fetch session data:", error);
//       }
//     };

//     fetchSession();
//   }, []);

//   return { data: session };
// }