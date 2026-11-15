import { GoogleGenAI } from "@google/genai";

/**
 * Lógica das rotas de IA, independente de framework.
 *
 * O mesmo código atende o servidor Express (`npm start`) e as Netlify
 * Functions, para os dois ambientes não divergirem em prompt ou fallback.
 *
 * Sem `GEMINI_API_KEY` a rota recusa o pedido. Não há texto clínico de exemplo:
 * a clínica de Jimena Andrade não publicou protocolos para preencher no lugar.
 */

/** Modelo usado nas rotas de IA. Configurável para não precisar editar código. */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/** Resposta de uma rota: corpo JSON + status HTTP. */
export interface AiResult {
  status: number;
  body: Record<string, unknown>;
}

function missingKey(): AiResult {
  return {
    status: 503,
    body: {
      success: false,
      needsKey: true,
      message:
        "A IA não está configurada. Defina GEMINI_API_KEY no servidor. Nenhum texto de exemplo é gerado no lugar.",
    },
  };
}

function failure(error: unknown, fallbackMessage: string): AiResult {
  const message = error instanceof Error ? error.message : fallbackMessage;
  return { status: 500, body: { success: false, error: message || fallbackMessage } };
}

export async function protocolSuggestion(payload: any): Promise<AiResult> {
  const concerns = Array.isArray(payload?.concerns) ? payload.concerns.join(", ") : payload?.concerns;
  const prior = Array.isArray(payload?.priorTreatments) ? payload.priorTreatments.filter(Boolean).join(", ") : payload?.priorTreatments;
  const patientData = payload?.patientData ?? {
    name: payload?.patientName,
    age: payload?.patientAge,
    gender: payload?.gender,
    clinicalNotes: prior,
  };
  const complaints = payload?.complaints ?? concerns;
  const desiredBudget = payload?.desiredBudget ?? payload?.budgetPreference;

  try {
    const ai = getAI();

    if (!ai) return missingKey();

    const prompt = `Você é o apoio clínico da clínica Jimena Andrade (Harmonização Orofacial e Odontologia, Caetité — BA).
Gere um protocolo clínico profissional e seguro apenas com o que foi informado. Se um dado não veio, escreva "não informado" — não invente idade, sexo, queixa, dose ou preço.
Serviços reais da clínica: Avaliação estética, Bioestimulador de colágeno, Harmonização facial, Preenchimento labial, Toxina botulínica (botox), Avaliação odontológica, Clareamento dental, Extração, Lentes de contato dental, Limpeza (profilaxia), Manutenção de aparelho, Restauração, Tratamento de canal.
- Paciente: ${patientData?.name || "não informado"}, Idade: ${patientData?.age || "não informada"}, Sexo: ${patientData?.gender || "não informado"}
- Queixas principais e desejos: ${complaints || "não informadas"}
- Abordagem pedida: ${desiredBudget || "não informada"}
- Histórico clínico relevante: ${patientData?.clinicalNotes || "não informado"}

Retorne APENAS um JSON estrito no seguinte formato:
{
  "title": "Nome profissional do protocolo",
  "summary": "Resumo do raciocínio clínico em 2-3 frases",
  "stages": [
    {
      "phase": "Nome da Etapa (Ex: Etapa 1 - Terço Superior)",
      "procedure": "Procedimento (Ex: Toxina Botulínica, Preenchimento Malar, etc)",
      "details": "Detalhes técnicos (unidades, ml, cânula/agulha, plano anatômico)",
      "expectedResult": "Resultado estético esperado",
      "returnDays": 15
    }
  ],
  "homeCare": [
    "Recomendação de cuidados em casa 1",
    "Recomendação 2",
    "Recomendação 3"
  ],
  "notes": "Avisos clínicos e contraindicações específicas"
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const plan = JSON.parse(response.text || "{}");
    return { status: 200, body: { success: true, plan } };
  } catch (err) {
    console.error("AI Protocol Error:", err);
    return failure(err, "Erro ao gerar protocolo de IA");
  }
}

export async function postCare(payload: any): Promise<AiResult> {
  const { patientName, procedures, applicationDate } = payload ?? {};

  try {
    const ai = getAI();

    if (!ai) return missingKey();

    const prompt = `Você escreve pela clínica Jimena Andrade (Harmonização Orofacial, Caetité — BA).
Escreva uma mensagem acolhedora e profissional em Português do Brasil para WhatsApp. Não invente prazo de retoque, preço ou serviço que não esteja na lista.
- Nome do Paciente: ${patientName || "não informado"}
- Procedimentos realizados: ${Array.isArray(procedures) ? procedures.join(", ") : (procedures || "não informados")}
- Data de realização: ${applicationDate || "não informada"}
- Observações da equipe: ${payload?.specificNotes || "não informadas"}

A mensagem deve conter:
- Tom acolhedor e seguro
- Regras imediatas de pós-procedimento (ex: tempo sem deitar para botox, sem esforço físico, sem massagem, sem sol)
- Sinais normais esperados (edema leve, hematoma pontual) vs quando avisar a clínica
- Não invente data de retorno nem prazo de retoque se a equipe não informou
- Formatação bonita com bullet points e emojis adequados para WhatsApp.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt
    });

    return { status: 200, body: { success: true, message: response.text } };
  } catch (err) {
    console.error("AI Post Care Error:", err);
    return failure(err, "Erro ao gerar orientações");
  }
}

export async function anamnesisRisk(payload: any): Promise<AiResult> {
  const { anamnesis, intendedProcedures } = payload ?? {};

  try {
    const ai = getAI();

    if (!ai) return missingKey();

    const prompt = `Você é um auditor médico especialista em segurança do paciente em procedimentos estéticos injetáveis (Toxina Botulínica, Ácido Hialurônico, Bioestimuladores, Fios PDO).
Analise os dados da Anamnese:
${JSON.stringify(anamnesis, null, 2)}
Procedimentos planejados: ${JSON.stringify(intendedProcedures, null, 2)}

Avalie riscos de reações adversas, contraindicações absolutas e relativas, e retorne APENAS um JSON no formato:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "summary": "Resumo clínico de segurança em 2 frases",
  "alerts": [
    "Alerta clínico 1",
    "Alerta clínico 2"
  ],
  "precautions": [
    "Conduta preventiva recomendada 1",
    "Conduta 2"
  ],
  "eligibleForTreatment": true | false
}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return { status: 200, body: { success: true, ...parsed } };
  } catch (err) {
    console.error("AI Anamnesis Risk Error:", err);
    return failure(err, "Erro na análise de anamnese");
  }
}

/** Rotas expostas em /api/ai/*, na mesma ordem usada pelo front. */
export const AI_ROUTES = {
  "protocol-suggestion": protocolSuggestion,
  "post-care": postCare,
  "anamnesis-risk": anamnesisRisk,
} as const;

export type AiRoute = keyof typeof AI_ROUTES;

export function isAiRoute(value: string): value is AiRoute {
  return Object.prototype.hasOwnProperty.call(AI_ROUTES, value);
}
