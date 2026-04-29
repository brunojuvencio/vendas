# Google Ads Analysis

Projeto com scripts para coletar dados de campanhas, consolidar metricas e gerar relatorios para a campanha MBA Gestao em Vendas T9.

## Requisitos

- Node.js 18 ou superior
- Credenciais configuradas em `.env`
- `pptxgenjs` para gerar o PowerPoint

## Configuracao

Crie um arquivo `.env` baseado em `.env.example` e preencha as credenciais necessarias.

```bash
cp .env.example .env
npm install pptxgenjs
```

## Scripts

```bash
node fetch_vendas_t9.mjs
node fetch_meta_criativos.mjs
node fetch_ploomes_vendas.mjs
node fetch_linkedin_vendas.mjs
node gerar_secao_criativos.mjs
node gerar_pptx_vendas_t9.mjs
```

## Observacao

O arquivo `.env` contem tokens e nao deve ser enviado para o GitHub.
