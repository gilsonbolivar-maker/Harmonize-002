export const AI_SERVER_MESSAGE =
  'O assistente de IA não roda neste site estático. Ele só responde com o servidor ligado (npm start) e a variável GEMINI_API_KEY. Sem a chave, nenhum parecer é inventado.';

export async function postAi(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; message: string }> {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: Record<string, unknown> | null = null;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = null;
    }
    if (!res.ok || !data || data.success === false) {
      const message = typeof data?.message === 'string'
        ? data.message
        : typeof data?.error === 'string'
          ? data.error
          : AI_SERVER_MESSAGE;
      return { ok: false, message };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, message: AI_SERVER_MESSAGE };
  }
}
