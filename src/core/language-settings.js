import { readSetting, writeSetting } from "./storage.js";
export const supportLanguages = ["he", "en"];
export const supportLanguage = (value) => supportLanguages.includes(value) ? value : "he";
export function readLanguageSettings() {
  return {
    instructions: supportLanguage(readSetting("bwa-instruction-language")),
    narrator: supportLanguage(readSetting("bwa-narrator-language")),
  };
}
export function saveLanguageSetting(kind, value) {
  if (!["instructions", "narrator"].includes(kind) || !supportLanguages.includes(value)) throw new RangeError("Unsupported guidance language");
  writeSetting(kind === "instructions" ? "bwa-instruction-language" : "bwa-narrator-language", value);
  return value;
}
export const settingsCopy = {
 he: { learning: "השפה שלומדים", instructions: "שפת ההוראות", narrator: "שפת הקריינות", choose: "מה נלמד היום?", note: "ההוראות והקריינות נבחרות בנפרד. מילים וצלילים תמיד מושמעים בשפה שלומדים.", initialSound: "בחר את כל התמונות ששמן מתחיל באות או בצליל הזה.", offline: "הורדת המילים והקריינות למשחק ללא אינטרנט", voice: "קריינות מוקלטת", names: { es:"ספרדית", ru:"רוסית", he:"עברית", en:"אנגלית", zh:"סינית", ja:"יפנית", ar:"ערבית", tr:"טורקית" } },
 en: { learning: "Learning language", instructions: "Instruction language", narrator: "Narrator language", choose: "What shall we learn today?", note: "Choose instructions and narration separately. Words and sounds always play in the language being learned.", initialSound: "Choose every picture whose name starts with this letter or sound.", offline: "Download learning words and narration for offline play", voice: "Recorded narration", names: { es:"Spanish", ru:"Russian", he:"Hebrew", en:"English", zh:"Chinese", ja:"Japanese", ar:"Arabic", tr:"Turkish" } },
};
