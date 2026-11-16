import { alertasRepository, Alerta } from "../repositories/alertas.repository";
import { tasasService } from "./tasas.service";

export interface AlertaEvaluada extends Alerta {
  tasaActual: number;
  cumpleCondicion: boolean;
}

export class AlertasService {
  async listarAlertas(uid: string): Promise<Alerta[]> {
    return alertasRepository.listar(uid);
  }

  async crearAlerta(
    uid: string,
    datos: {
      base: string;
      destino: string;
      condicion: "mayor" | "menor";
      valor: number;
      activa?: boolean;
    }
  ): Promise<Alerta> {
    return alertasRepository.crear(uid, {
      ...datos,
      activa: datos.activa ?? true,
    });
  }

  async actualizarAlerta(
    uid: string,
    id: string,
    cambios: Partial<Pick<Alerta, "condicion" | "valor" | "activa">>
  ): Promise<Alerta> {
    return alertasRepository.actualizar(uid, id, cambios);
  }

  async eliminarAlerta(uid: string, id: string): Promise<void> {
    return alertasRepository.eliminar(uid, id);
  }

  /**
   * Evalúa las alertas activas de un usuario contra las tasas actuales
   * (Criterio de aceptación 4: Dada una alerta, se evalúa cuando se abre la app o corre el cron)
   */
  async evaluarAlertasUsuario(uid: string): Promise<AlertaEvaluada[]> {
    const alertas = await this.listarAlertas(uid);
    const resultado: AlertaEvaluada[] = [];

    for (const alerta of alertas) {
      if (!alerta.activa) {
        resultado.push({
          ...alerta,
          tasaActual: 0,
          cumpleCondicion: false,
        });
        continue;
      }

      const { tasa } = await tasasService.obtenerTasaPar(alerta.base, alerta.destino);
      const cumple =
        alerta.condicion === "mayor" ? tasa > alerta.valor : tasa < alerta.valor;

      if (cumple && !alerta.disparada) {
        // Marcar como disparada
        await alertasRepository.actualizar(uid, alerta.id, {
          disparada: true,
          ultimaEvaluacion: new Date().toISOString(),
        });
      }

      resultado.push({
        ...alerta,
        tasaActual: tasa,
        cumpleCondicion: cumple,
      });
    }

    return resultado;
  }
}

export const alertasService = new AlertasService();
