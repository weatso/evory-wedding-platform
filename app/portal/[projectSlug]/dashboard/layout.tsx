import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import PortalNavbar from "./_components/PortalNavbar";

export default async function PortalDashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ projectSlug: string }>
}) {
    const resolvedParams = await params;
    const { projectSlug } = resolvedParams;

    // Proteksi Jalur: Cek Cookie
    const cookieStore = await cookies();
    const isAuth = cookieStore.get(`portal_auth_${projectSlug}`);

    if (!isAuth || isAuth.value !== "true") {
        redirect(`/portal/${projectSlug}/login`);
    }

    const project = await prisma.project.findUnique({
        where: { slug: projectSlug },
        select: { title: true, clientName: true, eventMetadata: true }
    });

    if (!project) redirect(`/portal/${projectSlug}/login`);

    return (
        <div className="min-h-screen bg-[#F9F8F4]">
            <PortalNavbar project={project} projectSlug={projectSlug} />
            <main className="max-w-5xl mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
