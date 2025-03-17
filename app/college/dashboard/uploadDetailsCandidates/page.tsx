// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// export default function UploadDetailsCandidatesPage() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [fileName, setFileName] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Handle File Selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFileName(file.name);
//       setSelectedFile(file);
//     }
//   };

//   // ✅ Send File to Backend API
//   const handleUpload = async () => {
//     if (!selectedFile) {
//       showPopup("❌ Please select a file before uploading.", true);
//       return;
//     }

//     if (confirm(`Are you sure you want to upload ${fileName}?`)) {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("studentsExcelData", selectedFile);

//       try {
//         const response = await fetch("/api/college/upload-student", {
//           method: "POST",
//           body: formData,
//         });

//         const data = await response.json();

//         if (response.ok) {
//           showPopup("✅ File uploaded successfully!");
//         } else {
//           showPopup(`❌ Upload failed: ${data.error}`, true);
//         }
//       } catch (error) {
//         console.error(error);
//         showPopup("❌ Error uploading file. Please try again.", true);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // Remove Selected File
//   const removeFile = () => {
//     if (confirm("Are you sure you want to remove the uploaded file?")) {
//       setFileName("");
//       setSelectedFile(null);
//       showPopup("✅ File removed successfully!");
//     }
//   };

//   // Show Pop-up Notifications
//   const showPopup = (message: string, error: boolean = false) => {
//     const popup = document.createElement("div");
//     popup.innerText = message;
//     popup.className = `fixed bottom-4 right-4 ${
//       error ? "bg-red-500" : "bg-green-500"
//     } text-white p-4 rounded shadow-lg`;
//     document.body.appendChild(popup);
//     setTimeout(() => document.body.removeChild(popup), 3000);
//   };

//   return (
//     <div className="pt-28 px-6 max-w-4xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-3xl font-bold"><span className="text-indigo-600 ">Upload Your </span>Excel</h2>
//         <a
//           href="/collegePortalExcel/collegePortal-test1.xlsx"
//           download="college-template.xlsx"
//           onClick={() => showPopup("📥 Template download started!")}
//         >
//           <Button>Download Excel Template</Button>
//         </a>
//       </div>

//       <div className="bg-gray-50 p-6 rounded-xl shadow-md">
//         <label htmlFor="file-upload" className="block mb-2 font-medium">
//           Upload Excel File
//         </label>
//         <input
//           id="file-upload"
//           type="file"
//           accept=".xls,.xlsx"
//           onChange={handleFileChange}
//           className="w-full mb-4 p-2 border rounded-md bg-gray-100 cursor-pointer"
//           title="Choose an Excel file to upload"
//           placeholder="Choose an Excel file"
//         />

//         {fileName && (
//           <div className="flex justify-between bg-white p-2 rounded-md shadow-sm mb-4">
//             <span className="font-medium">📂 Selected File: {fileName}</span>
//             <Button variant="destructive" onClick={removeFile}>
//               Remove
//             </Button>
//           </div>
//         )}

//         <Button onClick={handleUpload} disabled={loading}>
//           {loading ? "Uploading..." : "Upload"}
//         </Button>
//       </div>

//       <div className="mt-8 text-sm text-gray-600">
//         <h4 className="font-semibold">Instructions:</h4>
//         <ol className="list-decimal list-inside space-y-1 mt-2">
//           <li>Download the Excel template.</li>
//           <li>Fill in the Excel sheet as per the provided columns only.</li>
//           <li>
//             Ensure columns are named exactly:
//             <b>  name , email ,password ,departmentId	, rollno ,	personalEmail ,	DOB	phoneNo , nationality ,	countryCode	, departmentName
// ....</b>
//           </li>
//           <li>Upload the completed Excel file above.</li>
//         </ol>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Download } from "lucide-react";

export default function UploadDetailsCandidatesPage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Sorting States
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleSearch(search); // Apply search on data load
  }, [data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/college/upload-student");
      const result = await response.json();
      console.log("Fetched Data:", result.students);
      setData(result.students || []);
      setFilteredData(result.students || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    const filtered = data.filter((row) =>
      Object.values(row).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after search
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("❌ Please select a file before uploading.");
      return;
    }

    if (confirm(`Are you sure you want to upload ${fileName}?`)) {
      setLoading(true);
      const formData = new FormData();
      formData.append("studentsExcelData", selectedFile);

      try {
        const response = await fetch("/api/college/upload-student", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          alert("✅ File uploaded successfully!");
          fetchData();
        } else {
          alert("❌ Upload failed.");
        }
      } catch (error) {
        console.error(error);
        alert("❌ Error uploading file. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "password", label: "Password" },
    { key: "rollNo", label: "Roll No" },
    { key: "personalEmail", label: "Personal Email" },
    { key: "DOB", label: "DOB" },
    { key: "phoneNo", label: "Phone No" },
    { key: "nationality", label: "Nationality" },
    { key: "countryCode", label: "Country Code" },
    { key: "departmentName", label: "Department Name" },
  ];

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    const sortedData = [...filteredData].sort((a, b) => {
      const valueA = a[column] || "";
      const valueB = b[column] || "";
      return newDirection === "asc"
        ? valueA.toString().localeCompare(valueB.toString())
        : valueB.toString().localeCompare(valueA.toString());
    });

    setFilteredData(sortedData);
  };

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="pt-28 px-6 max-w-6xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader className="animate-spin h-16 w-16 text-indigo-600" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">📁 <span className="text-indigo-600">Uploade Students</span> Informations</h2>

            <div className="flex space-x-2">
              <a href="/collegePortalExcel/collegePortal-test1.xlsx" download="college-template.xlsx">
     <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md transition-all duration-300 transform hover:scale-105">
  <Download className="h-5 w-5" />
  Download Template
</Button>
 </a>
              <Input
                type="text"
                placeholder="🔍 Search students..."
                className="w-56 h-10 px-4 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 transition-all mt-3"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl shadow-md mb-6">
               <label htmlFor="file-upload" className="block mb-2 font-medium text-gray-700">
              Upload Excel File 📂
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="w-full mb-4 p-2 border rounded-md bg-gray-100 cursor-pointer"
            />
            {fileName && (
              <div className="flex justify-between bg-white p-2 rounded-md shadow-sm mb-4">
                <span className="font-medium">📂 Selected File: {fileName}</span>
                <Button variant="destructive" onClick={() => { setFileName(""); setSelectedFile(null); }}>Remove</Button>
              </div>
            )}
             <Button className="py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">
              {loading ? "Uploading..." : "📤 Upload"}
            </Button>
          </div>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border p-4">
            <div className="overflow-x-auto max-h-96">
              
              <table className="min-w-full border rounded-md">
                <thead className="bg-indigo-100 sticky top-0">
                  <tr>
                    {columns.map(({ key, label }) => (
                      <th
                        key={key}
                        className="p-3 border text-left font-semibold cursor-pointer"
                        onClick={() => handleSort(key)}
                      >
                        {label} {sortColumn === key ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, index) => (
                    <tr key={index} className="odd:bg-gray-50 even:bg-white border">
                      {columns.map(({ key }) => (
                        <td key={key} className="p-3 border">
                          {key === "email" || key === "password"
                            ? row.user?.[key] || "N/A"
                            : row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between mt-4">
              <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                Prev
              </Button>
              <span>Page {currentPage}</span>
              <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastRow >= filteredData.length}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
