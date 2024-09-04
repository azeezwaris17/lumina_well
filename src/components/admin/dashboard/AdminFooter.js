// src/components/admin/dashboard/UserFooter.js
const AdminFooter = () => {
  return (
    <footer className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto text-center">
        © {new Date().getFullYear()} RentARide. All rights reserved.
      </div>
    </footer>
  );
};

export default AdminFooter;
