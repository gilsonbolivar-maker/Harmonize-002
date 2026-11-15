import React, { useState } from 'react';
import { Patient, ProcedureCatalogItem } from '../types';
import {
  Sparkles, MessageSquare, Copy, Shield, FileText, Send,
  Check, RefreshCw, AlertCircle, HeartHandshake, UserCheck, CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { copyTextToClipboard } from '../utils/clipboard';
import { CLINIC } from '../data/clinic';
import { AI_SERVER_MESSAGE, postAi } from '../utils/aiClient';

interface AiAssistantModuleProps {
  patients: Patient[];
  procedures: ProcedureCatalogItem[];
}

export const AiAssistantModule: React.FC<AiAssistantModuleProps> = ({
  patients,
  procedures
}) => {
  const [activeTool, setActiveTool] = useState<'pos_cuidado' | 'protocolo'>('pos_cuidado');

  // Post Care State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
  const [specificNotes, setSpecificNotes] = useState<string>('');
  const [loadingPostCare, setLoadingPostCare] = useState(false);
  const [postCareResult, setPostCareResult] = useState<any>(null);
  const [copiedPostCare, setCopiedPostCare] = useState(false);

  // Protocol Generator State
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [patientConcerns, setPatientConcerns] = useState<string>('');
  const [patientBudgetPreference, setPatientBudgetPreference] = useState<string>('');
  const [loadingProtocol, setLoadingProtocol] = useState(false);
  const [protocolResult, setProtocolResult] = useState<any>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleGeneratePostCare = async () => {
    setLoadingPostCare(true);
    setPostCareResult(null);

    try {
      const result = await postAi('/api/ai/post-care', {
        patientName: selectedPatient?.name || '',
        procedures: selectedProcedures,
        specificNotes
      });
      if (!result.ok) {
        setAiNotice(result.message || AI_SERVER_MESSAGE);
        return;
      }
      setAiNotice(null);
      setPostCareResult(result.data);
      confetti({ particleCount: 30 });
    } catch (err) {
      console.error(err);
      setAiNotice(AI_SERVER_MESSAGE);
    } finally {
      setLoadingPostCare(false);
    }
  };

  const handleGenerateProtocol = async () => {
    setLoadingProtocol(true);
    setProtocolResult(null);

    try {
      const result = await postAi('/api/ai/protocol-suggestion', {
        patientAge: patientAge === '' ? undefined : Number(patientAge),
        gender: patientGender || undefined,
        concerns: patientConcerns.split(',').map(s => s.trim()).filter(Boolean),
        priorTreatments: [],
        budgetPreference: patientBudgetPreference
      });
      if (!result.ok) {
        setAiNotice(result.message || AI_SERVER_MESSAGE);
        return;
      }
      setAiNotice(null);
      const data = result.data;
      setProtocolResult((data.plan as Record<string, unknown> | undefined) ?? data);
      confetti({ particleCount: 35 });
    } catch (err) {
      console.error(err);
      setAiNotice(AI_SERVER_MESSAGE);
    } finally {
      setLoadingProtocol(false);
    }
  };

  const generatePostCareMessage = (): string => {
    if (!selectedPatient || !postCareResult) return '';
    if (typeof postCareResult.message === 'string' && postCareResult.message.trim()) {
      return postCareResult.message;
    }
    const avoid = postCareResult.guidelines?.immediateRestrictions?.map((r: string) => `• ${r}`).join('\n');
    const care = postCareResult.guidelines?.skincareAndIce?.map((r: string) => `• ${r}`).join('\n');
    return `Orientações pós-procedimento — ${CLINIC.name}\n\nOlá, ${selectedPatient.name}.\n\n${avoid ? `O que evitar:\n${avoid}\n\n` : ''}${care ? `Cuidados:\n${care}\n\n` : ''}Dúvidas pelo WhatsApp da clínica.`;
  };

  const handleCopyPostCare = async () => {
    const text = generatePostCareMessage();
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedPostCare(true);
      confetti({ particleCount: 25, spread: 45 });
      setTimeout(() => setCopiedPostCare(false), 3000);
    }
  };

  const sendPostCareWhatsApp = () => {
    if (!selectedPatient || !postCareResult) return;
    const cleanPhone = selectedPatient.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(generatePostCareMessage());
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div id="ai-assistant-module-container" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#112233] text-white p-7 rounded-3xl shadow-sm border border-[#CBD5E1]/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#64748B] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              Assistente da clínica
            </div>
            <h3 className="font-serif italic text-2xl text-white">
              Assistente de Protocolos & Pós-Procedimento
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-light max-w-xl">
              {AI_SERVER_MESSAGE}
            </p>
            {aiNotice && (
              <p className="text-xs text-amber-200 mt-2 max-w-xl" role="status">{aiNotice}</p>
            )}
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTool('pos_cuidado')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTool === 'pos_cuidado'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Pós-Procedimento & WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setActiveTool('protocolo')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                activeTool === 'protocolo'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-white'
              }`}
            >
              Planejamento de Protocolo
            </button>
          </div>
        </div>
      </div>

      {/* TOOL 1: Post Care Generator */}
      {activeTool === 'pos_cuidado' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form (Left) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#CBD5E1] shadow-xs space-y-4 text-xs">
            <h4 className="font-serif italic text-base text-[#0F172A] border-b border-[#CBD5E1] pb-3">
              Configurar Guia de Pós-Atendimento
            </h4>

            <div>
              <label className="block font-medium text-[#1E293B] mb-1.5">Paciente *</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] font-medium outline-none focus:border-[#2563EB]"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1E293B] mb-1.5">Procedimentos Realizados</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-3 bg-[#F8FAFC] rounded-2xl border border-[#CBD5E1]">
                {procedures.map((proc) => proc.name).map(procName => {
                  const isChecked = selectedProcedures.includes(procName);
                  return (
                    <label key={procName} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedProcedures(selectedProcedures.filter(p => p !== procName));
                          } else {
                            setSelectedProcedures([...selectedProcedures, procName]);
                          }
                        }}
                        className="rounded text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5"
                      />
                      <span className="text-[#0F172A] text-[11px] font-medium">{procName}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#1E293B] mb-1.5">Observações Específicas / Sintomas</label>
              <textarea
                rows={2}
                value={specificNotes}
                onChange={(e) => setSpecificNotes(e.target.value)}
                placeholder="Ex: Hematoma leve no lábio inferior, usar pomada..."
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="button"
              onClick={handleGeneratePostCare}
              disabled={loadingPostCare || selectedProcedures.length === 0}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-full transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loadingPostCare ? 'Gerando com IA...' : 'Gerar Orientações Personalizadas'}
            </button>
          </div>

          {/* AI Result Card (Right) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#CBD5E1] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1]">
              <h4 className="font-serif italic text-base text-[#0F172A] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2563EB]" />
                Guia Gerado para {selectedPatient?.name || 'o Paciente'}
              </h4>

              {postCareResult && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPostCare}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                      copiedPostCare
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                    }`}
                  >
                    {copiedPostCare ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPostCare ? 'Copiado!' : 'Copiar Texto'}
                  </button>

                  <button
                    type="button"
                    onClick={sendPostCareWhatsApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-full transition-colors shadow-xs active:scale-98"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Enviar WhatsApp
                  </button>
                </div>
              )}
            </div>

            {loadingPostCare ? (
              <div className="py-20 text-center text-[#64748B] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                <p className="font-medium text-[#334155] text-xs">
                  A IA está compilando as recomendações clínicas e restrições horárias...
                </p>
              </div>
            ) : postCareResult ? (
              <div className="space-y-4 text-xs">
                {typeof postCareResult.message === 'string' && (
                  <pre className="whitespace-pre-wrap font-sans text-[#334155] leading-relaxed">{postCareResult.message}</pre>
                )}
                {/* Immediate Restrictions */}
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                  <h5 className="font-semibold text-rose-950 flex items-center gap-1.5">
                    🚫 Restrições Imediatas (Primeiras 4h a 48h):
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-rose-900">
                    {postCareResult.guidelines?.immediateRestrictions?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* What to do & Skincare */}
                <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl space-y-2">
                  <h5 className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    ✅ Cuidados Recomendados & Skincare:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-[#334155]">
                    {postCareResult.guidelines?.skincareAndIce?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Alarm Signs / Red Flags */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <h5 className="font-semibold text-amber-950 flex items-center gap-1.5">
                    ⚠️ Sinais de Alerta (Contatar a Clínica Imediatamente):
                  </h5>
                  <p className="text-amber-900 leading-relaxed">
                    {postCareResult.guidelines?.warningSigns || postCareResult.message || 'A resposta não trouxe sinais de alerta.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-[#2563EB] font-serif italic text-sm">
                Selecione os procedimentos e clique em "Gerar Orientações" para criar o texto customizado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOOL 2: Protocol Planner */}
      {activeTool === 'protocolo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Protocol Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#CBD5E1] shadow-xs space-y-4 text-xs">
            <h4 className="font-serif italic text-base text-[#0F172A] border-b border-[#CBD5E1] pb-3">
              Parâmetros Clínicos do Paciente
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#1E293B] mb-1.5">Idade</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] font-semibold outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#1E293B] mb-1.5">Gênero</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] outline-none focus:border-[#2563EB]"
                >
                  <option value="">Não informado</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-[#1E293B] mb-1.5">Queixas e Áreas de Insatisfação</label>
              <textarea
                rows={3}
                value={patientConcerns}
                onChange={(e) => setPatientConcerns(e.target.value)}
                placeholder="Ex: Rugas na testa, flacidez malar, contorno de mandíbula indefinido..."
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1E293B] mb-1.5">Abordagem de Tratamento</label>
              <select
                value={patientBudgetPreference}
                onChange={(e) => setPatientBudgetPreference(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl text-[#0F172A] outline-none font-medium focus:border-[#2563EB]"
              >
                <option value="">Não informada</option>
                <option value="completo_full_face">Harmonização facial</option>
                <option value="moderado">Tratamento pontual</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerateProtocol}
              disabled={loadingProtocol}
              className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-full transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loadingProtocol ? 'Planejando Protocolo...' : 'Sugerir Protocolo Personalizado'}
            </button>
          </div>

          {/* Protocol Output */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#CBD5E1] shadow-xs space-y-4">
            <h4 className="font-serif italic text-base text-[#0F172A] pb-3 border-b border-[#CBD5E1]">
              Protocolo Sequencial Sugerido pela IA
            </h4>

            {loadingProtocol ? (
              <div className="py-20 text-center text-[#64748B] space-y-3">
                <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
                <p className="font-medium text-[#334155] text-xs">
                  Calculando cronograma de sessões e combinações ideais de injetáveis...
                </p>
              </div>
            ) : protocolResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-5 bg-[#112233] text-white rounded-2xl">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-[0.2em] block">
                    Visão Geral do Planejamento
                  </span>
                  <p className="font-medium text-sm mt-1">{protocolResult.summary || 'Protocolo de Harmonização Integrada em Etapas'}</p>
                </div>

                {/* Stages List */}
                <div className="space-y-3">
                  {protocolResult.stages?.map((stage: any, i: number) => (
                    <div key={i} className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-serif italic text-base font-bold text-[#0F172A] min-w-0 flex-1">
                          {stage.stageTitle || `Etapa ${i + 1}: ${stage.procedure}`}
                        </span>
                        <span className="text-[10px] font-medium text-[#2563EB] bg-[#F1F5F9] px-3 py-1 rounded-full border border-[#CBD5E1] shrink-0">
                          {stage.timeframe || 'Sessão 1'}
                        </span>
                      </div>
                      <p className="text-[#334155] mt-1 leading-relaxed">{stage.description}</p>
                      {stage.recommendedProducts && (
                        <p className="text-[11px] text-[#64748B] pt-1">
                          Insumos Sugeridos: <strong className="text-[#1E293B]">{stage.recommendedProducts.join(', ')}</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-[#2563EB] font-serif italic text-sm">
                Defina os parâmetros clínicos e clique no botão para gerar o plano em etapas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
