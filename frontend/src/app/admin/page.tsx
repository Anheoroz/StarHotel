import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AdminPanel } from "@/components/admin-panel";
import { getCuenta } from "@/lib/session";

export default async function AdminPage() {
  const cuenta = await getCuenta();
  if (!cuenta) redirect("/acceso");
  if (cuenta.rol !== "administrador")
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-2xl font-bold">Acceso restringido</h1>
          <p className="mt-3">Esta sección requiere el rol de administrador.</p>
          <Link
            className="mt-4 inline-block text-brand underline"
            href="/cuenta"
          >
            Ir a mi cuenta
          </Link>
        </main>
      </>
    );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <AdminPanel cuentaId={cuenta.id} />
      </main>
    </>
  );
}
