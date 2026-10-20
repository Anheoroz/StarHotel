import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CuentaForm } from "@/components/cuenta-form";

export default function EntrarPage() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-5 py-16">
          <CuentaForm modo="sesion" />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
