import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

export default function AccesoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <AuthForm />
      </main>
    </>
  );
}
