// app/api/cron/alertas/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/src/lib/firebase/admin";
import { manejar, UnauthorizedError } from "@/src/lib/errors";
import { alertasService } from "@/src/services/alertas.service";

/**
 * Cron endpoint that evaluates all user alerts.
 * It expects a bearer token matching `process.env.CRON_SECRET` for security.
 * The service iterates over all users (here we mock with a placeholder list).
 */
export const GET = manejar(async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    throw new UnauthorizedError("Cron secret inválido o no suministrado");
  }

  // Fetch all user IDs from Firebase Auth. This may paginate, so we collect them all.
  const auth = getAdminAuth();
  const uids: string[] = [];
  let nextPageToken: string | undefined = undefined;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    result.users.forEach(u => uids.push(u.uid));
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  // Evaluate alerts for each user and aggregate results.
  const resultados = [] as any[];
  for (const uid of uids) {
    const res = await alertasService.evaluarAlertasUsuario(uid);
    resultados.push({ uid, alertas: res });
  }


  return NextResponse.json({
    success: true,
    mensaje: "Alertas evaluadas mediante tarea programada",
    resultados,
  });
});

export const POST = GET;
