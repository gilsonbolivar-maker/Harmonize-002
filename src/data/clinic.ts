import type { ProcedureCatalogItem, Professional } from '../types';

/**
 * Dados reais da clínica, copiados do repositório público ClinicaMarcacao
 * (config.js e a tabela clinica_servicos). O que não está aqui não é exibido.
 */
export const CLINIC = {
  name: 'Jimena Andrade',
  subtitle: 'Harmonização Orofacial',
  about:
    'Contra os efeitos do tempo. A favor da sua beleza. Botox, preenchimentos e bioestimuladores de colágeno. Dúvidas e agendamentos pelo WhatsApp ou aqui pelo site.',
  whatsapp: '77998000177',
  whatsappDisplay: '(77) 99800-0177',
  address: 'Avenida Santana, 328',
  city: 'Caetité — BA',
  instagram: 'jimennandrade',
  opens: '08:00',
  closes: '18:00',
  slotMinutes: 30,
  daysLabel: 'Segunda-feira a sábado',
  hoursLabel: 'Segunda-feira a sábado, das 08:00 às 18:00',
  rescheduleHours: 72,
  photoJpg: 'jimena-andrade.jpg',
  photoWebp: 'jimena-andrade.webp',
} as const;

export function whatsappHref(
  text = 'Olá! Vim pelo site e gostaria de tirar uma dúvida.',
): string {
  return `https://wa.me/55${CLINIC.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function instagramHref(): string {
  return `https://instagram.com/${CLINIC.instagram}`;
}

export const initialProfessionals: Professional[] = [
  {
    id: 'jimena-andrade',
    name: CLINIC.name,
    role: CLINIC.subtitle,
    phone: CLINIC.whatsappDisplay,
    email: '',
    avatarUrl: CLINIC.photoJpg,
    color: '#1E40AF',
  },
];

type ServiceSeed = {
  id: number;
  nome: string;
  area: 'Estética' | 'Odontologia';
  duracao_min: number;
  online: boolean;
};

/** Lista ativa em clinica_servicos (nome, área, duração e se marca pelo site). */
const SERVICES: ServiceSeed[] = [
  { id: 9, nome: 'Avaliação estética', area: 'Estética', duracao_min: 30, online: true },
  { id: 13, nome: 'Bioestimulador de colágeno', area: 'Estética', duracao_min: 60, online: false },
  { id: 12, nome: 'Harmonização facial', area: 'Estética', duracao_min: 120, online: false },
  { id: 11, nome: 'Preenchimento labial', area: 'Estética', duracao_min: 60, online: false },
  { id: 10, nome: 'Toxina botulínica (botox)', area: 'Estética', duracao_min: 45, online: false },
  { id: 1, nome: 'Avaliação odontológica', area: 'Odontologia', duracao_min: 30, online: true },
  { id: 6, nome: 'Clareamento dental', area: 'Odontologia', duracao_min: 60, online: false },
  { id: 5, nome: 'Extração', area: 'Odontologia', duracao_min: 60, online: false },
  { id: 8, nome: 'Lentes de contato dental', area: 'Odontologia', duracao_min: 120, online: false },
  { id: 2, nome: 'Limpeza (profilaxia)', area: 'Odontologia', duracao_min: 45, online: true },
  { id: 7, nome: 'Manutenção de aparelho', area: 'Odontologia', duracao_min: 30, online: true },
  { id: 3, nome: 'Restauração', area: 'Odontologia', duracao_min: 60, online: false },
  { id: 4, nome: 'Tratamento de canal', area: 'Odontologia', duracao_min: 90, online: false },
];

function categoryOf(service: ServiceSeed): ProcedureCatalogItem['category'] {
  if (service.area === 'Odontologia') return 'odontologia';
  const name = service.nome.toLowerCase();
  if (name.includes('toxina') || name.includes('botox')) return 'botox';
  if (name.includes('bioestimulador')) return 'bioestimuladores';
  return 'harmonizacao';
}

export const initialProcedures: ProcedureCatalogItem[] = SERVICES.map((service) => ({
  id: `serv-${service.id}`,
  name: service.nome,
  category: categoryOf(service),
  area: service.area,
  bookableOnline: service.online,
  defaultPrice: 0,
  costPrice: 0,
  durationMinutes: service.duracao_min,
  recommendedRetouchDays: 0,
  description: service.online
    ? `${service.area}. O paciente pode marcar este horário pelo site.`
    : service.area,
  defaultDoseUnit: 'sessao',
  defaultDoseAmount: 0,
  suggestedProducts: [],
}));
