"use client";

import { useEffect, useRef } from "react";
import "jsgrid/dist/jsgrid.min.css";
import "jsgrid/dist/jsgrid-theme.min.css";
import jsGrid from "jsgrid";

export default function JsGridTable() {
  const gridRef = useRef(null);

  useEffect(() => {
    if (gridRef.current) {
      jsGrid.init(gridRef.current, {
        width: "100%",
        height: "400px",
        sorting: true,
        paging: true,
        editing: true,
        filtering: true, // ✅ Enables built-in search
        pageSize: 10,
        autoload: true,
        controller: {
          loadData: async () => {
            const response = await fetch("/api/college/upload-student");
            const data = await response.json();
            console.log("Fetched Data:", data.students); // Debugging
            return data.students.map((student: any) => ({
              name: student.name,
              email: student.user?.email || "N/A",
              password: student.user?.password || "N/A",
              department: student.departmentName,
              rollNo: student.rollNo,
              phoneNo: student.phoneNo,
            }));
          },
        },
        fields: [
          { name: "name", type: "text", title: "Name", width: 100 },
          { name: "email", type: "text", title: "Email", width: 150 },
          { name: "password", type: "text", title: "Password", width: 200 },
          { name: "department", type: "text", title: "Department", width: 100 },
          { name: "rollNo", type: "text", title: "Roll No", width: 80 },
          { name: "phoneNo", type: "text", title: "Phone", width: 120 },
          { type: "control" }, // ✅ Adds edit & delete buttons
        ],
      });
    }
  }, []);

  return <div ref={gridRef}></div>;
}
