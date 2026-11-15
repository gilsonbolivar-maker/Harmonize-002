# Jimena Andrade — Harmonização Orofacial

Gestão da clínica de **Jimena Andrade** em Caetité — BA. A estrutura e o visual vieram do app Harmonize Clinical. Os dados da clínica (nome, texto, horário, endereço, WhatsApp, Instagram, serviços e foto) vieram do site público ClinicaMarcacao.

A foto da Jimena aparece inteira (`object-fit: contain`, sem corte e sem zoom).

## O que o site guarda

Pacientes, agenda, estoque, financeiro e mapas faciais ficam no `localStorage` do navegador. Não há banco neste repositório. Listas que a clínica não publicou começam vazias.

Serviços reais, com a duração informada:

| Área | Serviço | Minutos | Marcação pelo site |
| --- | --- | --- | --- |
| Estética | Avaliação estética | 30 | sim |
| Estética | Bioestimulador de colágeno | 60 | não |
| Estética | Harmonização facial | 120 | não |
| Estética | Preenchimento labial | 60 | não |
| Estética | Toxina botulínica (botox) | 45 | não |
| Odontologia | Avaliação odontológica | 30 | sim |
| Odontologia | Clareamento dental | 60 | não |
| Odontologia | Extração | 60 | não |
| Odontologia | Lentes de contato dental | 120 | não |
| Odontologia | Limpeza (profilaxia) | 45 | sim |
| Odontologia | Manutenção de aparelho | 30 | sim |
| Odontologia | Restauração | 60 | não |
| Odontologia | Tratamento de canal | 90 | não |

Preços, registro profissional, estoque e comissão não estavam publicados. A tela não inventa esses números.

Horário: segunda a sábado, 08:00 às 18:00, de 30 em 30 minutos. Remarcação pela internet só com 72 horas ou mais.

Contato: WhatsApp (77) 99800-0177, Instagram [@jimennandrade](https://instagram.com/jimennandrade), Avenida Santana, 328 — Caetité — BA.

## Rodar na máquina

Node.js 22.

```bash
npm install
npm run dev
```

O endereço local inclui a pasta do GitHub Pages: `http://localhost:3000/Harmonize-002/`.

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor Express + Vite |
| `npm run build:web` | Só o site estático, em `dist/` |
| `npm run build` | Site estático e o servidor (`dist/server.cjs`) |
| `npm start` | Sobe o build de produção |
| `npm run lint` | Checagem de tipos |

## Variáveis de ambiente

Copie `.env.example` para `.env` só se for usar o servidor. Nenhuma chave entra no Git.

| Variável | Obrigatória | Onde vale |
| --- | --- | --- |
| `GEMINI_API_KEY` | Não | Servidor (`npm start`) e função Netlify. Sem ela, o assistente diz que a IA não está configurada. |
| `GEMINI_MODEL` | Não | Modelo do Gemini. Padrão: `gemini-2.5-flash`. |
| `APP_URL` | Não | URL pública do servidor, se precisar de um link para si mesmo. |
| `VITE_BASE_PATH` | Não | Pasta do site. Padrão `/Harmonize-002/` (GitHub Pages). Use `/` num host na raiz do domínio. |

## GitHub Pages

O site é estático. O workflow `.github/workflows/pages.yml` publica `dist/` em:

https://gilsonbolivar-maker.github.io/Harmonize-002/

O dono do repositório precisa, uma vez:

1. Abrir **Settings → Pages**.
2. Em **Build and deployment**, escolher **Source: GitHub Actions** (não “Deploy from a branch”).
3. Deixar o GitHub Actions habilitado e aceitar o ambiente `github-pages`, se o GitHub pedir aprovação.
4. Fazer o merge deste trabalho em `main`. Cada push em `main` publica de novo.

O repositório precisa ser público, ou a conta precisa de GitHub Pages em repositório privado.

Agenda, prontuário, serviços, estoque e financeiro funcionam no Pages porque os dados ficam no navegador. O assistente de IA **não** funciona no Pages: ele precisa do processo Node (`npm start` ou um host com as funções em `netlify/functions`). Sem `GEMINI_API_KEY`, esse servidor também não gera texto.
