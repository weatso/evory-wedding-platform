"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginToPortal } from "../../actions";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginForm({ projectSlug }: { projectSlug: string }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        startTransition(async () => {
            const result = await loginToPortal(projectSlug, formData);
            if (result?.error) {
                toast.error(result.error);
            }
            // Jika sukses, redirect akan di-handle oleh server action
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Input 
                    name="pin" 
                    type="password" 
                    placeholder="••••••" 
                    required 
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    className="h-14 text-center text-3xl tracking-[1em] font-mono rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#07303F] focus-visible:ring-offset-2"
                />
            </div>
            <Button 
                type="submit" 
                disabled={isPending} 
                className="w-full h-14 rounded-xl bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
                {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span className="mr-2">Buka Portal</span> <ArrowRight className="w-5 h-5" /></>}
            </Button>
        </form>
    );
}
