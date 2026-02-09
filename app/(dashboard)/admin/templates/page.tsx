import TemplateList from "@/components/admin/TemplateList";
import { getTemplateCategories } from "./actions";

export default async function TemplateManagerPage() {
    const result = await getTemplateCategories();
    const categories = result.success ? result.data : [];

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Template System</h1>
                <p className="text-muted-foreground">Manage wedding invitation styles and templates.</p>
            </div>

            <TemplateList initialCategories={categories || []} />
        </div>
    );
}