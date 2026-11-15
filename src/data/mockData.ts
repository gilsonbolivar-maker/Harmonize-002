import type {
  Appointment,
  FaceMapPoint,
  FinancialTransaction,
  InventoryItem,
  Patient,
} from '../types';
import { initialProcedures, initialProfessionals } from './clinic';

export { initialProcedures, initialProfessionals };

/**
 * A clínica não publicou pacientes, agenda, estoque, financeiro nem mapas.
 * As listas começam vazias para a equipe preencher. Nada aqui é inventado.
 */
export const initialPatients: Patient[] = [];
export const initialAppointments: Appointment[] = [];
export const initialInventory: InventoryItem[] = [];
export const initialTransactions: FinancialTransaction[] = [];
export const initialFaceMapPoints: Record<string, FaceMapPoint[]> = {};

export const INITIAL_PATIENTS = initialPatients;
export const INITIAL_PROCEDURES = initialProcedures;
export const INITIAL_INVENTORY = initialInventory;
export const INITIAL_APPOINTMENTS = initialAppointments;
export const INITIAL_PROFESSIONALS = initialProfessionals;
export const INITIAL_TRANSACTIONS = initialTransactions;
export const SAMPLE_FACE_MAP_POINTS = initialFaceMapPoints;
