import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import AdminSidebar from "../components/AdminSidebar"
import Footer from "../components/Footer"

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

{/* below is the layout where sidebar gets compressed when moving from any to pending verification */}
      {/* <div className="flex flex-grow">
        <AdminSidebar />
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div> */}

{/* below is the layout where sidebar doesn't gets compressed when moving from any to pending verification */}
      {/* <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">
       <AdminSidebar />
       <main className="flex-1 p-6 overflow-x-auto">

        <Outlet />
       </main>
      </div> */}

{/* below is the layout with no compressable problem and the main/outlet is also scrollable (good) */}

      <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
       <AdminSidebar />
       <main className="flex-1 p-6 overflow-x-auto">

        <Outlet />
       </main>
      </div>

      <Footer />
    </div>
  )
}

export default AdminLayout
