/**
 * Olimpíadas da Carla — backend (Google Apps Script)
 *
 * Recebe os nomes enviados pelo site e grava cada um em uma linha
 * da planilha. NÃO devolve a lista — só escreve. A planilha continua
 * privada na sua conta do Google.
 *
 * Veja o README.md para o passo a passo de instalação.
 */

// ⚠️ Troque por um token aleatório. Precisa ser IGUAL ao TOKEN do config.js
const SECRET = "troque-este-token-por-um-aleatorio";

// Nome da aba onde os nomes serão gravados (criada automaticamente)
const SHEET_NAME = "Confirmações";

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // evita gravações simultâneas

    const data = JSON.parse(e.postData.contents);

    // 1) Token confere?
    if (data.token !== SECRET) {
      return json({ ok: false, error: "unauthorized" });
    }

    // 2) Honeypot preenchido = bot. Finge sucesso e ignora.
    if (data.website) {
      return json({ ok: true, name: "" });
    }

    // 3) Valida o nome
    const name = String(data.name || "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 80) {
      return json({ ok: false, error: "invalid_name" });
    }

    // 4) Grava
    const sheet = getSheet();
    sheet.appendRow([new Date(), name]);

    return json({ ok: true, name: name });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Útil só para testar no navegador se o deploy está no ar.
function doGet() {
  return json({ ok: true, message: "Olimpíadas da Carla — backend no ar 🏅" });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Data/Hora", "Nome"]);
    sheet.getRange("A1:B1").setFontWeight("bold");
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
