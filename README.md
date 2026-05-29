# 🏅 Olimpíadas da Carla

Site de confirmação de presença para o aniversário da Ana Clara. As pessoas
escrevem o nome, clicam em **Confirmar presença**, e aparece um gatinho fofo. 🐾
Cada nome é gravado numa planilha do Google que só **você** consegue ver.

## Como funciona (e por que é seguro)

```
Navegador da pessoa  ──POST (nome)──►  Apps Script (/exec)  ──►  Planilha Google (privada)
```

- O site só conhece a **URL de escrita** do Apps Script. Essa URL só sabe
  **adicionar uma linha** — ela nunca lê nem devolve a planilha.
- O link real da planilha **nunca** aparece no site, então ninguém consegue
  bisbilhotar quem confirmou.
- Pior cenário possível: alguém descobre a URL e manda nomes falsos. Mesmo
  assim, é só apagar a linha. Ninguém vê a lista. Proteções extras já inclusas:
  token secreto, validação de nome e honeypot anti-bot.

---

## Passo a passo (uma vez só, ~10 min)

### 1. Crie a planilha
1. Acesse <https://sheets.google.com> e crie uma planilha em branco.
2. Dê um nome, ex.: **Olimpíadas da Carla — Confirmações**.

### 2. Abra o editor de script
1. Na planilha, vá em **Extensões → Apps Script**.
2. Apague o conteúdo padrão e cole **todo** o conteúdo de
   [`apps-script/Code.gs`](apps-script/Code.gs).

### 3. Defina um token secreto
1. No `Code.gs`, troque o valor de `SECRET` por uma frase aleatória sua,
   ex.: `"carla-2026-xJ9k2mPq"`.
2. Guarde esse mesmo valor — você vai colá-lo no site no passo 5.

### 4. Publique como Web App
1. No editor, clique em **Implantar → Nova implantação**.
2. Em "Selecionar tipo" (ícone de engrenagem), escolha **App da Web**.
3. Configure:
   - **Executar como:** Eu (sua conta)
   - **Quem pode acessar:** **Qualquer pessoa**
4. Clique **Implantar**, autorize o acesso quando pedir (é normal o aviso de
   "app não verificado" → *Avançado* → *Acessar (não seguro)*; é o seu próprio script).
5. Copie a **URL do app da Web** (termina em `/exec`).

### 5. Configure o site
Abra [`config.js`](config.js) e preencha os dois valores:

```js
window.OLIMPIADAS_CONFIG = {
  ENDPOINT_URL: "https://script.google.com/macros/s/XXXXX/exec", // do passo 4
  TOKEN: "carla-2026-xJ9k2mPq",                                  // igual ao SECRET
};
```

### 6. Teste localmente
Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Abra <http://localhost:8000>, confirme um nome de teste e veja se a linha
aparece na sua planilha. ✅ (Depois é só apagar a linha de teste.)

### 7. Publique o site (grátis)
Escolha uma das opções — todas servem arquivos estáticos de graça:

- **Netlify Drop:** arraste a pasta para <https://app.netlify.com/drop>. Pronto.
- **GitHub Pages:** suba a pasta num repositório e ative Pages nas settings.
- **Vercel:** `npx vercel` na pasta.

Mande o link para os convidados. 🎉

---

## Como ver quem confirmou

É só abrir a sua planilha do Google. Cada confirmação é uma linha com
**data/hora** e **nome**. Nada de painel, login ou link secreto.

## Trocar o gatinho

As imagens vêm do [cataas.com](https://cataas.com) (um gato aleatório a cada
confirmação). Se quiser uma foto fixa, edite a função `freshCatUrl()` em
[`script.js`](script.js) e devolva a URL da imagem que você quiser.

## Arquivos

| Arquivo               | O quê                                            |
|-----------------------|--------------------------------------------------|
| `index.html`          | Estrutura da página                              |
| `styles.css`          | Visual (tema olímpico fofo)                      |
| `script.js`           | Form, envio e o gatinho                          |
| `config.js`           | **Você edita:** URL do Apps Script + token       |
| `apps-script/Code.gs` | Backend que grava na planilha                    |
