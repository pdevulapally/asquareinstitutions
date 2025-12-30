"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, getDocs, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { checkAdminStatus } from "@/lib/auth";
import { generateInvoice, Student } from "@/lib/invoice";
import Link from "next/link";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentClass: string;
  subject: string;
  message: string;
  timestamp?: any;
  createdAt?: string;
}


interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  invoiceNumber: string;
  createdAt: string;
  status: "paid" | "pending";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"submissions" | "students">("submissions");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(true);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [deleteSubmissionId, setDeleteSubmissionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string>("");
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    student: Student | null;
    isPaid: boolean;
  } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isUpdatingPayment, setIsUpdatingPayment] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    studentClass: "",
    tuitionFee: "",
    amountPaid: "",
    paid: false,
  });

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // User is not admin, redirect to home
          router.push("/");
          return;
        }
        
        // Load data if admin
        loadSubmissions();
        loadStudents();
      } else {
        // Not logged in, redirect to login
        router.push("/login");
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadSubmissions = async () => {
    if (!db) {
      setSubmissionsLoading(false);
      return;
    }

    try {
      const submissionsQuery = query(
        collection(db, "contacts"),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(submissionsQuery);
      const submissionsData: ContactSubmission[] = [];
      
      querySnapshot.forEach((doc) => {
        submissionsData.push({
          id: doc.id,
          ...doc.data(),
        } as ContactSubmission);
      });
      
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteSubmissionId(id);
  };

  const handleDeleteCancel = () => {
    setDeleteSubmissionId(null);
    setIsDeleting(false);
    setDeleteConfirmation("");
  };

  const handleDeleteConfirm = async () => {
    if (!db || !deleteSubmissionId || deleteConfirmation.toLowerCase() !== "delete") {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "contacts", deleteSubmissionId));
      setSubmissions(submissions.filter((sub) => sub.id !== deleteSubmissionId));
      setDeleteSubmissionId(null);
      setDeleteConfirmation("");
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadStudents = async () => {
    if (!db) {
      setStudentsLoading(false);
      return;
    }

    try {
      const studentsQuery = query(
        collection(db, "students"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(studentsQuery);
      const studentsData: Student[] = [];
      
      querySnapshot.forEach((doc) => {
        studentsData.push({
          id: doc.id,
          ...doc.data(),
        } as Student);
      });
      
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCreateStudent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    try {
      const studentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        studentClass: formData.studentClass,
        tuitionFee: parseFloat(formData.tuitionFee) || 0,
        amountPaid: parseFloat(formData.amountPaid) || 0,
        paid: formData.paid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "students"), studentData);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        studentClass: "",
        tuitionFee: "",
        amountPaid: "",
        paid: false,
      });
      setShowCreateForm(false);
      loadStudents();
      alert("Student created successfully!");
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Failed to create student. Please try again.");
    }
  };

  const handleUpdatePayment = async (studentId: string, paid: boolean, amountPaid: number) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, "students", studentId), {
        paid,
        amountPaid,
        updatedAt: serverTimestamp(),
      });
      loadStudents();
      setPaymentModal(null);
      setPaymentAmount("");
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status. Please try again.");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handlePaymentModalSubmit = async () => {
    if (!paymentModal?.student) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsUpdatingPayment(true);
    await handleUpdatePayment(
      paymentModal.student.id,
      paymentModal.isPaid,
      amount
    );
  };

  const openPaymentModal = (student: Student, isPaid: boolean) => {
    setPaymentModal({ student, isPaid });
    setPaymentAmount(student.amountPaid.toString());
  };

  const handleGenerateInvoice = async (student: Student) => {
    try {
      await generateInvoice(student);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!db || !confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "students", id));
      setStudents(students.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
       {/* Navigation */}
       <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
         <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
           <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-3 md:gap-4">
             <Link href="/" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
               <div className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base sm:text-lg md:text-xl flex-shrink-0">
                 A²
               </div>
               <span className="font-serif text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground hidden sm:inline truncate">A² Institutions</span>
             </Link>
             <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
               <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[120px] lg:max-w-[180px] xl:max-w-none">{user.email}</span>
               <button
                 onClick={handleLogout}
                 className="rounded-lg bg-destructive px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-destructive-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
               >
                 Logout
               </button>
             </div>
           </div>
         </div>
       </nav>

      {/* Dashboard Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-4 sm:py-5 md:py-6 lg:py-8">
        <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 sm:mt-1.5 md:mt-2 text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground">
            Manage students and contact submissions
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-5 md:mb-6 border-b border-border overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
          <div className="flex gap-3 sm:gap-4 md:gap-6 min-w-max md:min-w-0">
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-3 sm:pb-3.5 md:pb-4 px-2 sm:px-2 md:px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "students"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`pb-3 sm:pb-3.5 md:pb-4 px-2 sm:px-2 md:px-1 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === "submissions"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Contact Submissions
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          {activeTab === "students" ? (
            <>
               <div className="rounded-lg sm:rounded-xl border border-border bg-card p-3.5 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between gap-2 sm:gap-2.5 md:gap-3">
                   <div className="min-w-0 flex-1">
                     <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{students.length}</div>
                     <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Total Students</div>
                   </div>
                   <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                     </svg>
                   </div>
                 </div>
               </div>
               <div className="rounded-lg sm:rounded-xl border border-border bg-card p-3.5 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between gap-2 sm:gap-2.5 md:gap-3">
                   <div className="min-w-0 flex-1">
                     <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                       {students.filter((s) => s.paid).length}
                     </div>
                     <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Paid</div>
                   </div>
                   <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                     <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                 </div>
               </div>
               <div className="rounded-lg sm:rounded-xl border border-border bg-card p-3.5 sm:p-4 md:p-5 lg:p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                 <div className="flex items-center justify-between gap-2 sm:gap-2.5 md:gap-3">
                   <div className="min-w-0 flex-1">
                     <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                       {students.filter((s) => !s.paid).length}
                     </div>
                     <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Pending Payment</div>
                   </div>
                   <div className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                     <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                 </div>
               </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-2xl font-bold text-primary">{submissions.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Submissions</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-2xl font-bold text-primary">
                  {submissions.filter((s) => {
                    const date = s.createdAt ? new Date(s.createdAt) : null;
                    return date && date.toDateString() === new Date().toDateString();
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Today</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="text-2xl font-bold text-primary">
                  {submissions.filter((s) => {
                    const date = s.createdAt ? new Date(s.createdAt) : null;
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date && date >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">This Week</div>
              </div>
            </>
          )}
        </div>

         {/* Students Management Section */}
         {activeTab === "students" && (
           <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8 w-full">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-3.5 md:gap-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6">
               <div className="w-full sm:w-auto min-w-0">
                 <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Student Management</h2>
                 <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Manage student records and payment tracking</p>
               </div>
               <button
                 onClick={() => {
                   setShowCreateForm(!showCreateForm);
                   setEditingStudent(null);
                   setFormData({
                     name: "",
                     email: "",
                     phone: "",
                     studentClass: "",
                     tuitionFee: "",
                     amountPaid: "",
                     paid: false,
                   });
                 }}
                 className="rounded-lg bg-primary px-3.5 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-center"
               >
                {showCreateForm ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Student
                  </>
                )}
              </button>
            </div>

             {/* Create Student Form */}
             {showCreateForm && (
               <div className="rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 shadow-lg w-full">
                 <div className="flex items-center gap-3 mb-4 sm:mb-5">
                   <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                   </div>
                   <div className="min-w-0">
                     <h3 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
                       {editingStudent ? "Edit Student" : "Create New Student"}
                     </h3>
                     <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Add student information and payment details</p>
                   </div>
                 </div>
                 <form onSubmit={handleCreateStudent} className="space-y-4 sm:space-y-5">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Student Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 sm:py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="Enter student name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 sm:py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="student@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 sm:py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Class *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <select
                          required
                          value={formData.studentClass}
                          onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 sm:py-3.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all appearance-none"
                        >
                          <option value="">Select Class</option>
                          <option value="Class 1-5">Class 1-5</option>
                          <option value="Class 6-9">Class 6-9</option>
                          <option value="Class 10">Class 10</option>
                          <option value="Class 11-12 MPC Engineering">Class 11-12 MPC Engineering</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Tuition Fee (₹) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-base">₹</span>
                        </div>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.tuitionFee}
                          onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-8 pr-4 py-3 sm:py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="5000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                        Amount Paid (₹)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground text-base">₹</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.amountPaid}
                          onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                          className="w-full rounded-lg border border-input bg-background pl-8 pr-4 py-3 sm:py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
                    <input
                      type="checkbox"
                      id="paid"
                      checked={formData.paid}
                      onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                      className="h-5 w-5 sm:h-6 sm:w-6 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="paid" className="text-sm sm:text-base font-medium text-foreground cursor-pointer">
                      Mark payment as completed
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto rounded-lg bg-primary px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editingStudent ? "Update Student" : "Create Student"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          studentClass: "",
                          tuitionFee: "",
                          amountPaid: "",
                          paid: false,
                        });
                      }}
                      className="w-full sm:w-auto rounded-lg border border-input bg-background px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

             {/* Students Table */}
             <div className="rounded-lg sm:rounded-xl border border-border bg-card shadow-lg w-full overflow-hidden">
               <div className="p-3.5 sm:p-4 md:p-5 lg:p-6 border-b border-border bg-muted/20">
                 <div className="flex items-center justify-between">
                   <div className="min-w-0">
                     <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">Students</h2>
                     <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{students.length} total students</p>
                   </div>
                 </div>
               </div>
              
              {studentsLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground font-medium">No students yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create your first student to get started</p>
                </div>
              ) : (
                 <>
                   {/* Desktop Table View */}
                   <div className="hidden lg:block overflow-x-auto w-full rounded-lg border border-border bg-card">
                     <table className="w-full">
                     <thead>
                       <tr className="bg-gradient-to-r from-primary/15 via-primary/8 to-primary/15 border-b-2 border-primary/30">
                         <th className="px-5 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                             </svg>
                             Student
                           </div>
                         </th>
                         <th className="px-5 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                             </svg>
                             Contact
                           </div>
                         </th>
                         <th className="px-5 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                             </svg>
                             Class
                           </div>
                         </th>
                         <th className="px-5 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             Payment
                           </div>
                         </th>
                         <th className="px-5 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             Status
                           </div>
                         </th>
                         <th className="px-5 py-3.5 text-right text-xs font-bold text-foreground uppercase tracking-wider">
                           <div className="flex items-center justify-end gap-2">
                             <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                             </svg>
                             Actions
                           </div>
                         </th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border/40">
                       {students.map((student, index) => {
                         const balance = student.tuitionFee - student.amountPaid;
                         return (
                           <tr key={student.id} className="hover:bg-muted/30 transition-colors duration-150">
                             <td className="px-5 py-4">
                               <div className="flex items-center gap-3">
                                 <div className="relative flex-shrink-0">
                                   <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                     <span className="text-primary font-bold text-base">
                                       {student.name.charAt(0).toUpperCase()}
                                     </span>
                                   </div>
                                   {student.paid && (
                                     <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                                       <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                       </svg>
                                     </div>
                                   )}
                                 </div>
                                 <div className="min-w-0">
                                   <div className="text-sm font-semibold text-foreground truncate">{student.name}</div>
                                   <div className="text-xs text-muted-foreground font-mono mt-0.5">ID: {student.id.slice(0, 8)}</div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-5 py-4">
                               <div className="space-y-1.5">
                                 <a href={`mailto:${student.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 hover:underline transition-colors">
                                   <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                   </svg>
                                   <span className="truncate max-w-[180px]">{student.email}</span>
                                 </a>
                                 <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                                   <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                   </svg>
                                   <span>{student.phone}</span>
                                 </a>
                               </div>
                             </td>
                             <td className="px-5 py-4">
                               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                                 <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                 </svg>
                                 <span className="text-xs font-semibold text-primary">{student.studentClass}</span>
                               </div>
                             </td>
                             <td className="px-5 py-4">
                               <div className="space-y-2.5 min-w-[160px]">
                                 <div className="flex items-center justify-between">
                                   <span className="text-xs text-muted-foreground">Total Fee</span>
                                   <span className="text-sm font-bold text-foreground">Rs. {student.tuitionFee.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                   <span className="text-xs text-muted-foreground">Paid</span>
                                   <span className="text-sm font-semibold text-green-600">Rs. {student.amountPaid.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="pt-2 border-t border-border/60">
                                   <div className="flex items-center justify-between">
                                     <span className="text-xs font-medium text-muted-foreground">Balance</span>
                                     <span className={`text-sm font-bold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                       Rs. {balance.toLocaleString('en-IN')}
                                     </span>
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-5 py-4">
                               <div className="flex flex-col gap-2.5">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-fit ${
                                   student.paid
                                     ? "bg-green-500/20 text-green-700 border border-green-500/30"
                                     : "bg-destructive/20 text-destructive border border-destructive/30"
                                 }`}>
                                   {student.paid ? (
                                     <>
                                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                       </svg>
                                       Paid
                                     </>
                                   ) : (
                                     <>
                                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                       </svg>
                                       Pending
                                     </>
                                   )}
                                 </span>
                                 <div className="flex items-center gap-2">
                                   <button
                                     onClick={() => openPaymentModal(student, true)}
                                     className="px-2.5 py-1.5 rounded-md bg-green-500/20 text-green-700 hover:bg-green-500/30 transition-colors border border-green-500/30 flex items-center justify-center"
                                     title="Mark as Paid"
                                   >
                                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                     </svg>
                                   </button>
                                   <button
                                     onClick={() => openPaymentModal(student, false)}
                                     className="px-2.5 py-1.5 rounded-md bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors border border-destructive/30 flex items-center justify-center"
                                     title="Mark as Not Paid"
                                   >
                                     <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                     </svg>
                                   </button>
                                 </div>
                               </div>
                             </td>
                             <td className="px-5 py-4 whitespace-nowrap text-right">
                               <div className="flex items-center justify-end gap-2">
                                 <button
                                   onClick={() => handleGenerateInvoice(student)}
                                   className="px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-primary/20"
                                   title="Generate Invoice"
                                 >
                                   <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                   </svg>
                                   Invoice
                                 </button>
                                 <button
                                   onClick={() => handleDeleteStudent(student.id)}
                                   className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors border border-destructive/20"
                                   title="Delete Student"
                                 >
                                   <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                   </svg>
                                 </button>
                               </div>
                             </td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                   </div>

                   {/* Mobile Card View */}
                   <div className="lg:hidden divide-y divide-border w-full">
                     {students.map((student) => (
                       <div key={student.id} className="p-3.5 sm:p-4 md:p-5 hover:bg-muted/10 transition-colors w-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold text-base">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-foreground">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.studentClass}</div>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            student.paid
                              ? "bg-accent/10 text-accent"
                              : "bg-destructive/10 text-destructive"
                          }`}>
                            {student.paid ? "Paid" : "Pending"}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <a href={`mailto:${student.email}`} className="text-primary hover:underline">
                              {student.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${student.phone}`} className="text-muted-foreground hover:text-primary">
                              {student.phone}
                            </a>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 p-3 rounded-lg bg-muted/30">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Tuition Fee</div>
                            <div className="text-sm font-semibold text-foreground">₹{student.tuitionFee.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Amount Paid</div>
                            <div className="text-sm font-semibold text-foreground">₹{student.amountPaid.toLocaleString()}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-muted-foreground mb-1">Balance</div>
                            <div className="text-sm font-semibold text-foreground">₹{(student.tuitionFee - student.amountPaid).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="space-y-2.5 sm:space-y-0 sm:flex sm:flex-row sm:gap-2.5">
                          {/* Payment Buttons Row */}
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:flex-none">
                            <button
                              onClick={() => openPaymentModal(student, true)}
                              className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-green-500/20 text-green-700 hover:bg-green-500/30 transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 dark:bg-green-500/30 dark:text-green-300"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Paid</span>
                            </button>
                            <button
                              onClick={() => openPaymentModal(student, false)}
                              className="px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Not Paid</span>
                            </button>
                          </div>
                          {/* Action Buttons Row */}
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2 sm:flex-none">
                            <button
                              onClick={() => handleGenerateInvoice(student)}
                              className="px-4 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md border-2 border-primary/20"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>Invoice</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="px-4 py-2.5 sm:py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Submissions Table */}
         {activeTab === "submissions" && (
         <div className="rounded-lg sm:rounded-xl border border-border bg-card shadow-sm w-full overflow-hidden">
           <div className="p-4 sm:p-5 md:p-6 border-b border-border bg-muted/20">
             <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Contact Submissions</h2>
             <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage and view all contact form submissions</p>
           </div>
           
           {submissionsLoading ? (
             <div className="p-8 sm:p-10 md:p-12 lg:p-16 text-center">
               <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
               <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground">Loading submissions...</p>
             </div>
           ) : submissions.length === 0 ? (
             <div className="p-8 sm:p-10 md:p-12 lg:p-16 text-center">
               <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
               </svg>
               <p className="text-sm sm:text-base text-muted-foreground">No submissions yet.</p>
               <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">Contact form submissions will appear here</p>
             </div>
           ) : (
             <div className="p-4 sm:p-5 md:p-6">
             <>
               {/* Desktop Table View */}
               <div className="hidden lg:block overflow-x-auto w-full">
                 <div className="inline-block min-w-full align-middle">
                   <table className="w-full">
                     <thead className="bg-muted/30 border-b-2 border-border">
                       <tr>
                         <th className="px-4 lg:px-6 xl:px-8 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-[30%]">
                           Customer
                         </th>
                         <th className="px-4 lg:px-6 xl:px-8 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-[25%]">
                           Service
                         </th>
                         <th className="px-4 lg:px-6 xl:px-8 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-[15%]">
                           Date
                         </th>
                         <th className="px-4 lg:px-6 xl:px-8 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-[12%]">
                           Status
                         </th>
                         <th className="px-4 lg:px-6 xl:px-8 py-4 text-right text-xs font-semibold text-foreground uppercase tracking-wider w-[18%]">
                           Actions
                         </th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border bg-card">
                       {submissions.map((submission) => (
                         <tr key={submission.id} className="hover:bg-muted/20 transition-colors">
                           <td className="px-4 lg:px-6 xl:px-8 py-4">
                             <div className="flex flex-col min-w-0">
                               <span className="text-sm font-medium text-foreground truncate">{submission.name}</span>
                               <a
                                 href={`mailto:${submission.email}`}
                                 className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 truncate"
                                 title={submission.email}
                               >
                                 {submission.email}
                               </a>
                             </div>
                           </td>
                           <td className="px-4 lg:px-6 xl:px-8 py-4">
                             <span className="text-sm text-foreground truncate block max-w-[200px]" title={submission.subject}>
                               {submission.subject}
                             </span>
                           </td>
                           <td className="px-4 lg:px-6 xl:px-8 py-4 whitespace-nowrap">
                             <span className="text-sm text-muted-foreground">
                               {submission.createdAt
                                 ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                     month: 'short',
                                     day: 'numeric',
                                     year: 'numeric'
                                   })
                                 : "N/A"}
                             </span>
                           </td>
                           <td className="px-4 lg:px-6 xl:px-8 py-4">
                             <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                               New
                             </span>
                           </td>
                           <td className="px-4 lg:px-6 xl:px-8 py-4 whitespace-nowrap text-right">
                             <button
                               onClick={() => setViewDetailsId(submission.id)}
                               className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-xs font-medium"
                             >
                               View Details
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>

               {/* Tablet View */}
               <div className="hidden md:block lg:hidden w-full">
                 <div className="space-y-3">
                   {submissions.map((submission) => (
                     <div key={submission.id} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/5 transition-colors">
                       <div className="grid grid-cols-12 gap-4 items-start">
                         {/* Customer - Takes more space */}
                         <div className="col-span-12 sm:col-span-6 lg:col-span-5">
                           <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer</div>
                           <div className="flex items-start gap-3">
                             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                               <span className="text-primary font-bold text-sm">
                                 {submission.name.charAt(0).toUpperCase()}
                               </span>
                             </div>
                             <div className="min-w-0 flex-1">
                               <div className="text-sm font-medium text-foreground truncate mb-1">
                                 {submission.name}
                               </div>
                               <a
                                 href={`mailto:${submission.email}`}
                                 className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                                 title={submission.email}
                               >
                                 {submission.email}
                               </a>
                             </div>
                           </div>
                         </div>

                         {/* Service */}
                         <div className="col-span-6 sm:col-span-3 lg:col-span-3">
                           <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Service</div>
                           <div className="text-sm text-foreground truncate" title={submission.subject}>
                             {submission.subject}
                           </div>
                         </div>

                         {/* Date */}
                         <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                           <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Date</div>
                           <div className="text-sm text-muted-foreground">
                             {submission.createdAt
                               ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                   month: 'short',
                                   day: 'numeric',
                                   year: 'numeric'
                                 })
                               : "N/A"}
                           </div>
                         </div>

                         {/* Status & Actions */}
                         <div className="col-span-12 sm:col-span-12 lg:col-span-2 flex items-end justify-between gap-3 pt-2">
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                             New
                           </span>
                           <button
                             onClick={() => setViewDetailsId(submission.id)}
                             className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-xs font-medium"
                           >
                             View Details
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Mobile Card View */}
               <div className="md:hidden space-y-3 w-full">
                 {submissions.map((submission) => (
                   <div key={submission.id} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/5 transition-colors shadow-sm">
                     {/* Header with Customer Info */}
                     <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-border/50">
                       <div className="flex items-start gap-3 min-w-0 flex-1">
                         <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                           <span className="text-primary font-bold text-base">
                             {submission.name.charAt(0).toUpperCase()}
                           </span>
                         </div>
                         <div className="min-w-0 flex-1">
                           <div className="text-sm font-semibold text-foreground truncate mb-1">
                             {submission.name}
                           </div>
                           <a
                             href={`mailto:${submission.email}`}
                             className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                             title={submission.email}
                           >
                             {submission.email}
                           </a>
                         </div>
                       </div>
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                         New
                       </span>
                     </div>

                     {/* Service and Date Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-3">
                       <div className="min-w-0">
                         <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Service</div>
                         <div className="text-sm text-foreground truncate" title={submission.subject}>
                           {submission.subject}
                         </div>
                       </div>
                       <div className="min-w-0">
                         <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Date</div>
                         <div className="text-sm text-muted-foreground">
                           {submission.createdAt
                             ? new Date(submission.createdAt).toLocaleDateString('en-US', {
                                 month: 'short',
                                 day: 'numeric',
                                 year: 'numeric'
                               })
                             : "N/A"}
                         </div>
                       </div>
                     </div>

                     {/* Action Button */}
                     <button
                       onClick={() => setViewDetailsId(submission.id)}
                       className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium"
                     >
                       View Details
                     </button>
                   </div>
                 ))}
               </div>
             </>
             </div>
           )}
         </div>
         )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteSubmissionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 md:p-6">
              {/* Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
                    Delete contact submission?
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    This action cannot be undone. This will permanently delete the contact submission from the system.
                  </p>
                </div>
              </div>

              {/* Submission Info */}
              {(() => {
                const submission = submissions.find(s => s.id === deleteSubmissionId);
                if (!submission) return null;
                return (
                  <div className="mb-4 sm:mb-5 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-0.5">From</div>
                        <div className="text-sm font-medium text-foreground">{submission.name}</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-0.5">Subject</div>
                        <div className="text-sm text-foreground">{submission.subject}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Confirmation Input */}
              <div className="mb-4 sm:mb-5">
                <label htmlFor="delete-confirmation" className="block text-sm font-medium text-foreground mb-2">
                  Type <span className="font-mono font-semibold text-destructive">delete</span> to confirm:
                </label>
                <input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && deleteConfirmation.toLowerCase() === "delete" && !isDeleting) {
                      handleDeleteConfirm();
                    }
                  }}
                  placeholder="Type 'delete' to confirm"
                  autoFocus
                  disabled={isDeleting}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm sm:text-base"
                />
                {deleteConfirmation && deleteConfirmation.toLowerCase() !== "delete" && (
                  <p className="mt-1.5 text-xs sm:text-sm text-destructive flex items-center gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    The confirmation text doesn't match
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || deleteConfirmation.toLowerCase() !== "delete"}
                  className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete submission</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsId && (() => {
        const submission = submissions.find(s => s.id === viewDetailsId);
        if (!submission) return null;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setViewDetailsId(null)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] rounded-xl border border-border bg-card shadow-xl flex flex-col">
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-border flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg">
                        {submission.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 truncate">
                        {submission.name}
                      </h3>
                      <a
                        href={`mailto:${submission.email}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
                        title={submission.email}
                      >
                        {submission.email}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDetailsId(null)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                    title="Close"
                  >
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                <div className="space-y-4">
                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</div>
                      <a
                        href={`tel:${submission.phone}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all"
                      >
                        {submission.phone}
                      </a>
                    </div>
                    {submission.studentClass && (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Class</div>
                        <div className="text-sm font-medium text-foreground">{submission.studentClass}</div>
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Date Submitted</div>
                      <div className="text-sm font-medium text-foreground">
                        {submission.createdAt
                          ? new Date(submission.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "N/A"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status</div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        New
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject</div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/20 border border-border">
                      <div className="text-sm sm:text-base font-medium text-foreground break-words">{submission.subject}</div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Message</div>
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/10 border border-border">
                      <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {submission.message}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-border flex-shrink-0">
                <div className="flex flex-row gap-2.5 sm:gap-3 justify-end items-center">
                  <a
                    href={`tel:${submission.phone}`}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call</span>
                  </a>
                  <a
                    href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject)}`}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Reply</span>
                  </a>
                  <button
                    onClick={() => {
                      setViewDetailsId(null);
                      handleDeleteClick(submission.id);
                    }}
                    className="px-4 py-2 rounded-lg bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-opacity text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payment Modal */}
      {paymentModal && paymentModal.student && (() => {
        const student = paymentModal.student;
        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Update Payment
                </h3>
                <button
                  onClick={() => {
                    setPaymentModal(null);
                    setPaymentAmount("");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Student Name</p>
                  <p className="text-base font-semibold text-foreground">{student.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tuition Fee</p>
                    <p className="text-base font-semibold text-foreground">Rs. {student.tuitionFee.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Amount Paid</p>
                    <p className="text-base font-semibold text-foreground">Rs. {student.amountPaid.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    Rs. {(student.tuitionFee - student.amountPaid).toLocaleString('en-IN')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount Paid (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={student.tuitionFee}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Enter amount paid"
                    autoFocus
                  />
                  {(student.tuitionFee - student.amountPaid) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const remainingBalance = student.tuitionFee - student.amountPaid;
                        const currentAmount = parseFloat(paymentAmount) || 0;
                        setPaymentAmount((currentAmount + remainingBalance).toString());
                      }}
                      className="mt-2 w-full text-xs sm:text-sm text-primary hover:text-primary/80 font-medium py-2 px-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Remaining Balance: Rs. {(student.tuitionFee - student.amountPaid).toLocaleString('en-IN')}</span>
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the total amount paid. Maximum: Rs. {student.tuitionFee.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="payment-status"
                    checked={paymentModal.isPaid}
                    onChange={(e) => setPaymentModal({ ...paymentModal, isPaid: e.target.checked })}
                    className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                  <label htmlFor="payment-status" className="text-sm font-medium text-foreground cursor-pointer">
                    Mark payment as {paymentModal.isPaid ? "completed" : "pending"}
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setPaymentModal(null);
                      setPaymentAmount("");
                    }}
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentModalSubmit}
                    disabled={isUpdatingPayment}
                    className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPayment ? "Updating..." : "Update Payment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
