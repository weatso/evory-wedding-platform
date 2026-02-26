"use client";

// PERBAIKAN: Import nama fungsi yang BENAR sesuai dengan actions.ts Anda
import { createTemplate, createCategory, deleteTemplate, deleteCategory } from "@/app/(dashboard)/admin/templates/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Template {
    id: string;
    name: string;
    desc: string;
    previewText: string;
    bgColor: string;
    textColor: string | null;
}

interface Category {
    id: string;
    title: string;
    description: string | null;
    items: Template[];
}

export default function TemplateList({ initialCategories }: { initialCategories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const router = useRouter();

    const [isAddingCat, setIsAddingCat] = useState(false);
    const [newCatTitle, setNewCatTitle] = useState("");
    const [newCatDesc, setNewCatDesc] = useState("");

    const [addingTemplateTo, setAddingTemplateTo] = useState<string | null>(null);
    const [newTpl, setNewTpl] = useState({ name: "", desc: "", previewText: "", bgColor: "", textColor: "" });

    // --- ACTIONS ---

    const handleCreateCategory = async () => {
        if (!newCatTitle) return toast.error("Title required");

        // PERBAIKAN: Backend meminta FormData, bukan Object mentah
        const formData = new FormData();
        formData.append("name", newCatTitle);
        formData.append("description", newCatDesc);

        const res = await createCategory(formData);
        if (res.success) {
            toast.success("Category created");
            setIsAddingCat(false);
            setNewCatTitle("");
            setNewCatDesc("");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const confirm = window.confirm("Delete this category and ALL its templates?");
        if (!confirm) return;

        const res = await deleteCategory(id);
        if (res.success) {
            toast.success("Category deleted");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const handleCreateTemplate = async (categoryId: string) => {
        if (!newTpl.name) return toast.error("Name is required");

        // PERBAIKAN: Merakit FormData dengan field yang diwajibkan oleh Zod Schema Anda di actions.ts
        const formData = new FormData();
        formData.append("name", newTpl.name);
        formData.append("categoryId", categoryId);
        formData.append("description", newTpl.desc);
        
        // Buat slug otomatis
        const slug = newTpl.name.toLowerCase().replace(/\s+/g, '-') + "-" + Date.now().toString().slice(-4);
        formData.append("slug", slug);
        
        // Zod Anda di actions.ts mewajibkan "thumbnail". Karena di UI ini belum ada uploadernya,
        // kita berikan placeholder agar tidak ditolak database. Anda bisa mengeditnya nanti di Dashboard Edit Template.
        formData.append("thumbnail", "https://via.placeholder.com/300x400?text=No+Thumbnail");

        const res = await createTemplate(formData);
        if (res.success) {
            toast.success("Template created");
            setAddingTemplateTo(null);
            setNewTpl({ name: "", desc: "", previewText: "", bgColor: "", textColor: "" });
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!window.confirm("Delete template?")) return;
        const res = await deleteTemplate(id);
        if (res.success) {
            toast.success("Template deleted");
            router.refresh();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Active Categories</h2>
                <Button onClick={() => setIsAddingCat(true)}><Plus size={16} className="mr-2" /> Add Category</Button>
            </div>

            {isAddingCat && (
                <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 space-y-4">
                        <Input placeholder="Category Title (e.g. Traditional Series)" value={newCatTitle} onChange={e => setNewCatTitle(e.target.value)} />
                        <Textarea placeholder="Description..." value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateCategory} size="sm"><Save size={16} className="mr-2" /> Save Category</Button>
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingCat(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6">
                {initialCategories.map((cat) => (
                    <Card key={cat.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 flex flex-row items-center justify-between py-4">
                            <div>
                                <CardTitle className="text-lg">{cat.title}</CardTitle>
                                {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                            </div>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteCategory(cat.id)}>
                                <Trash2 size={16} />
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cat.items.map(item => (
                                        <div key={item.id} className="border rounded-lg p-4 relative group hover:border-primary transition-colors">
                                            <div className={`w-full h-24 rounded mb-3 flex items-center justify-center ${item.bgColor} border border-black/10`}>
                                                <span className={`text-2xl font-bold font-serif ${item.textColor || 'text-white'}`}>
                                                    {item.previewText}
                                                </span>
                                            </div>
                                            <h4 className="font-bold">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>

                                            <button
                                                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteTemplate(item.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setAddingTemplateTo(cat.id)}
                                        className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:bg-slate-50 min-h-[200px]"
                                    >
                                        <Plus size={24} className="mb-2" />
                                        <span>Add Template</span>
                                    </button>
                                </div>

                                {addingTemplateTo === cat.id && (
                                    <div className="mt-4 p-4 border rounded bg-slate-50 animate-in slide-in-from-top-2">
                                        <h4 className="font-semibold mb-3">New Template for {cat.title}</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <Input placeholder="Template Name" value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} />
                                            <Input placeholder="Preview Text (e.g. JVN)" maxLength={3} value={newTpl.previewText} onChange={e => setNewTpl({ ...newTpl, previewText: e.target.value })} />
                                            <Input placeholder="Background Color (e.g. bg-[#000])" value={newTpl.bgColor} onChange={e => setNewTpl({ ...newTpl, bgColor: e.target.value })} />
                                            <Input placeholder="Text Color (e.g. text-white)" value={newTpl.textColor} onChange={e => setNewTpl({ ...newTpl, textColor: e.target.value })} />
                                            <Textarea className="col-span-2" placeholder="Description" value={newTpl.desc} onChange={e => setNewTpl({ ...newTpl, desc: e.target.value })} />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleCreateTemplate(cat.id)}>Save Template</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setAddingTemplateTo(null)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}