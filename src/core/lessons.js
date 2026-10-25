import { dailyTopics, dailyTopicLabels, dailyExpressions } from "./daily.js";
import { concepts, word } from "./content.js";
import { copy } from "./i18n.js";

const keys = ["appName","tagline","words","phrases","letters","helper","noHelper","home","sayIt","heard","showMeaning","wordChoice","buildWord","gestureChoose","gesturePrompt","allTopics","animals","food","homeThings","nature","travel","playThings","backspace","hint","tapLearn","gestureNote","reducedMotion"];
const rows = {
  fil: ["Mga Salita kasama si Bar","Maliliit na salita, malalaking tuklas.","Mga salitang may larawan","Makipag-usap kay Bar","Hardin ng mga titik","Tulong sa","Walang salin","Bahay","Makinig, pagkatapos ay subukang sabihin ang salita.","Nasabi ko na!","Ipakita ang kahulugan","Aling salita ang katugma ng larawan?","Ayusin ang mga bahagi para mabuo ang salita.","Mga kilos ni Bar","Makinig at piliin ang ginagawa ni Bar.","Lahat ng larawan","Mga hayop","Pagkain at inumin","Sa bahay","Sa labas","Sa paglalakbay","Laro at damit","Ibalik","Ipakita ang pahiwatig","Pindutin ang larawan para marinig ang pangalan nito.","Gayahin ang mga pang-araw-araw na kilos ni Bar at sabihin ang mga salita. Walang mikropono o pagmamarka sa pagbigkas.","Banayad na galaw"],
  en: ["Words with Bar","Little words. Big discoveries.","Picture words","Talk with Bar","Letter garden","Help in","No translation","Home","Listen, then try saying the word.","I said it!","Show meaning","Which word matches this picture?","Put the pieces in order to make the word.","Bar’s gestures","Listen and choose what Bar is doing.","All pictures","Animals","Food and drinks","At home","Outside","On the move","Play and wear","Undo","Show a hint","Tap a picture to hear its name.","Copy Bar’s everyday gestures and say the words. No microphone or speech scoring.","Gentle motion"],
  es: ["Palabras con Bar","Pequeñas palabras, grandes descubrimientos.","Palabras en imágenes","Habla con Bar","Jardín de letras","Ayuda en","Sin traducción","Inicio","Escucha y luego intenta decir la palabra.","¡Ya lo dije!","Mostrar el significado","¿Qué palabra corresponde a esta imagen?","Ordena las piezas para formar la palabra.","Los gestos de Bar","Escucha y elige lo que hace Bar.","Todas las imágenes","Animales","Comida y bebidas","En casa","Al aire libre","De viaje","Juegos y ropa","Deshacer","Mostrar una pista","Toca una imagen para escuchar su nombre.","Imita los gestos cotidianos de Bar y di las palabras. Sin micrófono ni evaluación del habla.","Movimiento suave"],
  ru: ["Слова с Баром","Маленькие слова, большие открытия.","Слова в картинках","Говорим с Баром","Сад букв","Подсказки на языке","Без перевода","Домой","Послушай и попробуй произнести слово.","Я сказал!","Показать перевод","Какое слово подходит к картинке?","Собери слово из частей.","Жесты Бара","Послушай и выбери, что делает Бар.","Все картинки","Животные","Еда и напитки","Дома","На улице","В пути","Игры и одежда","Отменить","Показать подсказку","Нажми на картинку, чтобы услышать слово.","Повторяй обычные жесты Бара и произноси слова. Без микрофона и оценки произношения.","Спокойное движение"],
  he: ["מִלִּים עִם בַּר","מילים קטנות, גילויים גדולים.","מילים בתמונות","מדברים עם בר","גן האותיות","עזרה בשפה","ללא תרגום","הביתה","הקשב ונסה לומר את המילה.","אמרתי!","הצג פירוש","איזו מילה מתאימה לתמונה?","סדר את החלקים כדי ליצור את המילה.","המחוות של בר","הקשב ובחר מה בר עושה.","כל התמונות","בעלי חיים","אוכל ושתייה","בבית","בחוץ","בדרך","משחקים ובגדים","בטל","הצג רמז","לחץ על תמונה כדי לשמוע את שמה.","חקה את המחוות היומיומיות של בר ואמור את המילים. ללא מיקרופון או ציון לדיבור.","תנועה עדינה"],
  zh: ["和巴尔学词语","小小词语，大大发现。","看图学词","和巴尔说话","字母花园","提示语言","不显示翻译","主页","听一听，再试着说出这个词。","我说好了！","显示意思","哪个词和图片相配？","把字块排好，组成词语。","巴尔的动作","听一听，选出巴尔正在做的动作。","所有图片","动物","食物和饮料","在家里","户外","出行","玩具和衣服","撤销","显示提示","点图片，听听它的名字。","模仿巴尔的日常动作，说出词语。不使用麦克风，也不给发音打分。","轻柔动画"],
  ja: ["バルとことば","ちいさな ことば、おおきな はっけん。","えで ことば","バルと はなそう","もじの にわ","ヒントの ことば","ほんやく なし","ホーム","きいてから、ことばを いってみよう。","いえたよ！","いみを みる","この えは どの ことばかな？","もじを ならべて ことばを つくろう。","バルの しぐさ","きいて、バルの しぐさを えらぼう。","すべての え","どうぶつ","たべものと のみもの","おうち","そと","のりもの","あそびと ふく","もどす","ヒントを みる","えを おすと なまえが きけるよ。","バルの ふだんの しぐさを まねして、ことばを いおう。マイクや はつおんの さいてんは ないよ。","やさしい うごき"],
  ar: ["كلمات مع بار","كلمات صغيرة واكتشافات كبيرة.","كلمات بالصور","تحدث مع بار","حديقة الحروف","المساعدة بلغة","دون ترجمة","الرئيسية","استمع ثم حاول أن تقول الكلمة.","قلت الكلمة!","عرض المعنى","أي كلمة تناسب هذه الصورة؟","رتب الأجزاء لتكوين الكلمة.","إيماءات بار","استمع واختر ما يفعله بار.","كل الصور","الحيوانات","الطعام والشراب","في البيت","في الخارج","في الطريق","اللعب والملابس","تراجع","عرض تلميح","اضغط على صورة لتسمع اسمها.","قلد إيماءات بار اليومية وقل الكلمات. دون ميكروفون أو تقييم للنطق.","حركة هادئة"],
  tr: ["Bar ile Kelimeler","Küçük kelimeler, büyük keşifler.","Resimli kelimeler","Bar ile konuş","Harf bahçesi","Yardım dili","Çeviri yok","Ana sayfa","Dinle, sonra kelimeyi söylemeyi dene.","Söyledim!","Anlamını göster","Bu resme hangi kelime uyuyor?","Parçaları sırala ve kelimeyi oluştur.","Bar’ın hareketleri","Dinle ve Bar’ın yaptığı hareketi seç.","Bütün resimler","Hayvanlar","Yiyecek ve içecekler","Evde","Dışarıda","Yolda","Oyun ve giysiler","Geri al","İpucu göster","Adını duymak için resme dokun.","Bar’ın günlük hareketlerini taklit et ve kelimeleri söyle. Mikrofon veya telaffuz puanı yok.","Yumuşak hareket"],
};
export const lessonCopy = Object.fromEntries(Object.entries(rows).map(([locale, values]) => [locale, Object.fromEntries(keys.map((key, i) => [key, values[i]]))]));
for (const [locale, ui] of Object.entries(lessonCopy)) {
  Object.assign(ui,dailyTopicLabels[locale]);
  copy[locale].appName = ui.appName;
  Object.assign(copy[locale].gameNames, { wordCards: ui.words, wordChoice: ui.wordChoice, buildWord: ui.buildWord, gestureChoose: ui.gestureChoose });
}
export const lessonText = (locale, key) => lessonCopy[locale][key];
const phraseIds = ["hello","goodbye","yes","no","listen","look","wellDone","thankYou","please"];
const phraseRows = {
 fil:["Kumusta!","Paalam!","Oo!","Hindi!","Makinig!","Tingnan!","Magaling!","Salamat!","Pakiusap!"],
 en:["Hello!","Goodbye!","Yes!","No!","Listen!","Look!","Well done!","Thank you!","Please!"],
 es:["¡Hola!","¡Adiós!","¡Sí!","¡No!","¡Escucha!","¡Mira!","¡Muy bien!","¡Gracias!","¡Por favor!"],
 ru:["Привет!","Пока!","Да!","Нет!","Послушай!","Посмотри!","Молодец!","Спасибо!","Пожалуйста!"],
 he:["שָׁלוֹם!","לְהִתְרָאוֹת!","כֵּן!","לֹא!","הַקְשֵׁב!","הַבֵּט!","כָּל הַכָּבוֹד!","תּוֹדָה!","בְּבַקָּשָׁה!"],
 zh:["你好！","再见！","是的！","不是！","听一听！","看一看！","真棒！","谢谢！","请！"],
 ja:["こんにちは！","さようなら！","はい！","いいえ！","きいて！","みて！","よくできたね！","ありがとう！","おねがいします！"],
 ar:["مَرْحَبًا!","إِلَى اللِّقَاء!","نَعَمْ!","لَا!","اِسْتَمِعْ!","اُنْظُرْ!","أَحْسَنْتَ!","شُكْرًا!","مِنْ فَضْلِكَ!"],
 tr:["Merhaba!","Hoşça kal!","Evet!","Hayır!","Dinle!","Bak!","Aferin!","Teşekkür ederim!","Lütfen!"],
};
export const phrases = phraseIds.map((id, index) => ({ id, gesture: id === "goodbye" ? "hello" : id, words: Object.fromEntries(Object.entries(phraseRows).map(([locale, values]) => [locale, values[index]])) }));
phrases.push(...dailyExpressions);
export const topics = {
 ...dailyTopics,
 animals: "dog cat cow duck fish rabbit bear lion elephant giraffe monkey horse sheep pig mouse frog turtle butterfly bee snail bird rooster penguin",
 food: "juice sausage banana milk chocolate candy cake apple pear orange lemon strawberry grapes watermelon carrot tomato cucumber bread cheese egg icecream pizza",
 homeThings: "house window clock book key chair bed cup spoon brush pencil scissors",
 nature: "sun tree flower star moon cloud rainbow snowman leaf mushroom shell",
 travel: "car bus train plane boat bicycle rocket",
 playThings: "balloon ball shoe umbrella hat shirt sock mitten drum guitar kite",
};
export function topicWords(topic = "allTopics") {
  if (topic === "allTopics") return concepts;
  return (topics[topic] || "").split(" ").map((id) => concepts.find((item) => item.id === id)).filter(Boolean);
}
export const meaning = (item, locale) => locale ? word(item, locale).display : "";

export const appleInstallHelp = {
 en: "On iPhone or iPad, open this page in Safari, tap Share, then Add to Home Screen.",
 es: "En iPhone o iPad, abre esta página en Safari, toca Compartir y luego Añadir a la pantalla de inicio.",
 ru: "На iPhone или iPad откройте эту страницу в Safari, нажмите «Поделиться», затем «На экран Домой».",
 he: "באייפון או באייפד פתחו את הדף ב-Safari, לחצו על שיתוף ואז על הוספה למסך הבית.",
 zh: "在 iPhone 或 iPad 上，用 Safari 打开此页面，点“分享”，再点“添加到主屏幕”。",
 ja: "iPhoneやiPadではSafariでこのページを開き、共有から「ホーム画面に追加」を選んでね。",
 ar: "على آيفون أو آيباد افتح هذه الصفحة في سفاري، ثم اضغط مشاركة وإضافة إلى الشاشة الرئيسية.",
 tr: "iPhone veya iPad’de bu sayfayı Safari’de açın, Paylaş’a ve ardından Ana Ekrana Ekle’ye dokunun.",
};
