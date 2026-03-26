# ⚡ TechOfertas

Site de eletrônicos em promoção com integração à API do Mercado Livre e links de afiliado automáticos.

---

## 🚀 Como colocar no ar (Vercel)

### Passo 1 — Crie sua conta de afiliado no Mercado Livre
1. Acesse: https://www.mercadolivre.com.br/afiliados
2. Clique em **"Quero ser afiliado"** e crie sua conta
3. Aguarde a aprovação (geralmente 1–2 dias úteis)
4. Após aprovado, acesse seu painel e copie seu **Affiliate ID**

### Passo 2 — Configure seu ID de afiliado no código
Abra o arquivo `app.js` e altere a linha:
```js
AFFILIATE_ID: "SEU_AFFILIATE_ID",
```
Substitua `SEU_AFFILIATE_ID` pelo seu ID real. Exemplo:
```js
AFFILIATE_ID: "techofertas2025",
```

### Passo 3 — Suba para o GitHub
1. Crie um repositório no GitHub (pode ser privado)
2. Faça upload dos arquivos: `index.html`, `style.css`, `app.js`, `vercel.json`
3. Ou use o Git no terminal:
```bash
git init
git add .
git commit -m "primeiro deploy"
git remote add origin https://github.com/SEU_USUARIO/techofertas.git
git push -u origin main
```

### Passo 4 — Deploy na Vercel
1. Acesse: https://vercel.com e faça login com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione seu repositório `techofertas`
4. Clique em **Deploy** — pronto! 🎉

A Vercel gera um link como `techofertas.vercel.app` automaticamente.

---

## 💰 Como funciona o afiliado

Cada produto no site tem um link assim:
```
https://produto.mercadolivre.com.br/...?matt_tool=afiliados&matt_word=SEU_ID
```

Quando alguém clica e compra qualquer produto (não precisa ser exatamente aquele), você ganha comissão de **3% a 12%** dependendo da categoria.

O pagamento é feito mensalmente direto na sua conta do Mercado Livre.

---

## 🔧 Personalizações rápidas

| O que mudar | Onde |
|---|---|
| Nome do site | `index.html` → linha com `TechOfertas` |
| Cor de destaque | `style.css` → variável `--accent` |
| Categorias do menu | `index.html` → botões `.chip` |
| Quantidade de produtos | `app.js` → `RESULTS_PER_PAGE` |

---

## 📁 Estrutura do projeto

```
techofertas/
├── index.html    → estrutura da página
├── style.css     → visual / tema
├── app.js        → lógica + API + afiliado
└── vercel.json   → configuração de deploy
```

---

## ❓ Dúvidas frequentes

**O site funciona sem o Affiliate ID?**  
Sim! Os produtos aparecem normalmente, mas sem tracking de afiliado. Você não ganhará comissão até configurar o ID.

**A API do Mercado Livre é paga?**  
Não! A busca pública é totalmente gratuita e não exige cadastro.

**Posso mudar o nome do site?**  
Sim, basta trocar todas as ocorrências de `TechOfertas` nos arquivos.
