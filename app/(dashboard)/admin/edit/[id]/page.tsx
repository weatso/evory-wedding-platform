import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import EditInvitationForm from "./edit-form"; 

// Props params di Next.js terbaru adalah Promise, jadi perlu di-await
export default async function EditInvitationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  // 1. Security Check: Hanya Admin yang boleh masuk
  if (session?.user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 2. Ambil Data Undangan berdasarkan ID di URL
  const invitation = await prisma.invitation.findUnique({
    where: { id: params.id },
  });

  // 3. Jika ID ngawur/tidak ditemukan -> 404
  if (!invitation) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold mb-2 text-slate-800">Edit Proyek Undangan</h1>
        <p className="text-slate-500 mb-8 text-sm">
           Ubah data mempelai, slug URL, atau lokasi acara.
        </p>
        
        {/* Render Client Component (Form) dan oper datanya */}
        <EditInvitationForm invitation={invitation} />
        
      </div>
    </div>
  );
}