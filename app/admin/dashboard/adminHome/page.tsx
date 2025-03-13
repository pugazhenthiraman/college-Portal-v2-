

export default function AdminHome() {


  

  
  return (
    <div className="p-6 mt-24"> {/* Added margin-top to prevent overlap with navbar */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Welcome to <span className="text-indigo-600">Admin Dashboard</span>
          </h2>
      
      {/* Grid for Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-100 text-blue-800 p-6 rounded-lg shadow-md text-center border border-blue-300">
          <h2 className="text-xl font-semibold">Total Colleges</h2>
          <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
        </div>
        
        <div className="bg-green-100 text-green-800 p-6 rounded-lg shadow-md text-center border border-green-300">
          <h2 className="text-xl font-semibold">Approved Colleges</h2>
          <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
        </div>
        
        <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg shadow-md text-center border border-yellow-300">
          <h2 className="text-xl font-semibold">Pending Approvals</h2>
          <p className="text-3xl font-bold">0</p> {/* Replace with real data */}
        </div>
      </div>
    </div>
  );
}

