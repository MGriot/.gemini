(() => {
    "use strict";

    const i18n = {
        "en": {
            title: "Keepa is ready",
            sub: "Price history right on Amazon product pages.",
            steps: [
                "Open any Amazon product page.",
                "The Keepa price history box appears automatically below the product images.",
            ],
            tip1: "If an Amazon page was open during install, reload it to activate Keepa.",
            tip2: "On mobile/compact layouts the graph is a bit further down - scroll to see it.",
            tip3: "No need to click the toolbar icon - the Keepa box appears automatically.",
            supported: "Supported sites:",
            footer: "You can configure all options inside the Keepa box on any Amazon product page.",
            openAmazon: "Open Amazon"
        },
        "en-GB": {
            title: "Keepa is ready",
            sub: "Price history on Amazon product pages.",
            steps: [
                "Open any Amazon product page.",
                "The Keepa price history box appears automatically below the product images.",
            ],
            tip1: "If an Amazon page was open during install, reload it to activate Keepa.",
            tip2: "On mobile/compact layouts the graph shows further down - scroll to see it.",
            tip3: "No need to click the toolbar icon - the Keepa box appears automatically.",
            supported: "Supported sites:",
            footer: "Configure options inside the Keepa box on any product page.",
            openAmazon: "Open Amazon"
        },
        "de": {
            title: "Keepa ist bereit",
            sub: "Preishistorie direkt auf Amazon‑Produktseiten.",
            steps: [
                "Öffne eine beliebige Amazon‑Produktseite.",
                "Die Keepa‑Preisverlaufsbox erscheint automatisch unter den Produktbildern.",
            ],
            tip1: "War beim Installieren bereits eine Amazon‑Seite geöffnet? Lade sie neu.",
            tip2: "Auf Mobil‑Layouts erscheint der Graph etwas weiter unten - bitte kurz nach unten scrollen.",
            tip3: "Das Toolbar‑Symbol muss nicht verwendet werden.",
            supported: "Unterstützte Seiten:",
            footer: "Alle Optionen findest du in der Keepa‑Box auf jeder Produktseite.",
            openAmazon: "Amazon öffnen"
        },
        "fr": {
            title: "Keepa est prêt",
            sub: "Historique des prix sur les pages produits Amazon.",
            steps: [
                "Ouvrez n’importe quelle page produit Amazon.",
                "La boîte Keepa avec le graphique s’affiche automatiquement sous les images du produit.",
            ],
            tip1: "Si une page Amazon était ouverte lors de l’installation, rechargez‑la.",
            tip2: "Sur mobile / affichage compact, le graphique se trouve plus bas : faites défiler.",
            tip3: "Pas besoin d’utiliser l’icône : le graphique apparaît automatiquement.",
            supported: "Sites pris en charge:",
            footer: "Tous les réglages sont dans la boîte Keepa sur la page produit.",
            openAmazon: "Ouvrir Amazon"
        },
        "it": {
            title: "Keepa è pronto",
            sub: "Storico dei prezzi sulle pagine prodotto Amazon.",
            steps: [
                "Apri una qualsiasi pagina prodotto su Amazon.",
                "Il riquadro Keepa compare automaticamente sotto le immagini del prodotto.",
            ],
            tip1: "Se durante l’installazione avevi già una pagina Amazon aperta, ricaricala.",
            tip2: "Su mobile il grafico è un po’ più in basso: scorri per vederlo.",
            tip3: "Non è necessario cliccare l’icona: il riquadro appare da solo.",
            supported: "Siti supportati:",
            footer: "Tutte le opzioni sono nel riquadro Keepa sulla pagina prodotto.",
            openAmazon: "Apri Amazon"
        },
        "es": {
            title: "Keepa está listo",
            sub: "Historial de precios en las páginas de producto de Amazon.",
            steps: [
                "Abre cualquier página de producto en Amazon.",
                "La caja de Keepa aparece automáticamente debajo de las imágenes del producto.",
            ],
            tip1: "Si tenías una página de Amazon abierta al instalar, recárgala.",
            tip2: "En móvil o diseño compacto el gráfico está más abajo: desplázate para verlo.",
            tip3: "No hace falta pulsar el icono: la caja aparece sola.",
            supported: "Sitios compatibles:",
            footer: "Configura las opciones en la caja de Keepa de cualquier página de producto.",
            openAmazon: "Abrir Amazon"
        },
        "ja": {
            title: "Keepa の準備ができました",
            sub: "Amazon 商品ページに価格推移グラフを表示します。",
            steps: [
                "Amazon の商品ページを開くだけ。",
                "商品画像の下に Keepa の価格履歴ボックスが自動表示されます。",
            ],
            tip1: "インストール時に Amazon ページを開いていた場合は、ページを再読み込みしてください。",
            tip2: "モバイル表示ではグラフは少し下にあります。少しスクロールしてください。",
            tip3: "ツールバーアイコンの操作は不要です。",
            supported: "対応サイト：",
            footer: "設定は各商品ページの Keepa ボックス内で行えます。",
            openAmazon: "Amazonを開く"
        },
        "hi": {
            title: "Keepa तैयार है",
            sub: "Amazon प्रोडक्ट पेज पर कीमत इतिहास दिखता है।",
            steps: [
                "कोई भी Amazon प्रोडक्ट पेज खोलें।",
                "प्रोडक्ट इमेज के नीचे Keepa बॉक्स अपने‑आप दिखता है।",
            ],
            tip1: "इंस्टॉल के समय अगर कोई Amazon पेज खुला था, उसे रीलोड करें।",
            tip2: "मोबाइल लेआउट में ग्राफ थोड़ा नीचे रहता है-स्क्रॉल करें।",
            tip3: "टूलबार आइकन इस्तेमाल करने की आवश्यकता नहीं है।",
            supported: "समर्थित साइटें:",
            footer: "सेटिंग्स किसी भी प्रोडक्ट पेज पर Keepa बॉक्स में उपलब्ध हैं।",
            openAmazon: "Amazon खोलें"
        }
    };

    const chips = [".com",".co.uk",".de",".co.jp",".fr",".ca",".it",".es",".in",".mx"];

    function pickLang() {
        const raw = (navigator.language || "en").toLowerCase();
        if (raw.startsWith("de")) return "de";
        if (raw.startsWith("fr")) return "fr";
        if (raw.startsWith("it")) return "it";
        if (raw.startsWith("es")) return "es";
        if (raw.startsWith("ja")) return "ja";
        if (raw.startsWith("hi")) return "hi";
        if (raw.startsWith("en-gb")) return "en-GB";
        return "en";
    }

    function guessAmazonDomain(lang) {
        const l = lang.toLowerCase();
        if (l === "de") return "amazon.de";
        if (l === "fr") return "amazon.fr";
        if (l === "it") return "amazon.it";
        if (l === "es") {
            const r = (navigator.language || "").toLowerCase();
            return r.includes("mx") ? "amazon.com.mx" : "amazon.es";
        }
        if (l === "ja") return "amazon.co.jp";
        if (l === "en-gb") return "amazon.co.uk";
        const r = (navigator.language || "").toLowerCase();
        if (r.includes("ca")) return "amazon.ca";
        if (r.includes("in")) return "amazon.in";
        return "amazon.com";
    }

    function setTexts(t) {
        document.getElementById("t_title").textContent = t.title;
        document.getElementById("t_sub").textContent = t.sub;
        document.getElementById("t_supported_label").textContent = t.supported;
        document.getElementById("t_footer").textContent = t.footer;

        const steps = document.getElementById("steps");
        t.steps.forEach(s => {
            const li = document.createElement("li");
            li.innerHTML = '<svg class="check" viewBox="0 0 24 24"><path fill="#9be061" d="M9 16.2l-3.5-3.5-1.4 1.4L9 19 20.3 7.7l-1.4-1.4z"/></svg><div>'+s+'</div>';
            steps.appendChild(li);
        });

        document.getElementById("t_tip_1").textContent = t.tip1;
        document.getElementById("t_tip_2").textContent = t.tip2;
        document.getElementById("t_tip_3").textContent = t.tip3;

        const domains = document.getElementById("domains");
        chips.forEach(c => {
            const span = document.createElement("span"); span.className = "k-badge"; span.textContent = "amazon"+c;
            domains.appendChild(span);
        });

        const dom = guessAmazonDomain(pickLang());
        const a = document.getElementById("openAmazon");
        a.href = "https://" + dom + "/";
        a.textContent = t.openAmazon;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const lang = pickLang();
        const t = i18n[lang] || i18n.en;
        setTexts(t);

        // NEW: Expand/collapse "Supported sites" based on viewport
        const supportedDetails = document.getElementById("supportedDetails");
        if (supportedDetails) {
            const mql = window.matchMedia("(min-width: 760px)");
            const apply = () => {
                if (mql.matches) {
                    supportedDetails.setAttribute("open", ""); // expanded on desktop/tablet
                } else {
                    supportedDetails.removeAttribute("open");   // collapsed on mobile
                }
            };
            apply();
            // Use addEventListener if available, otherwise fallback for older engines
            if (mql.addEventListener) mql.addEventListener("change", apply);
            else mql.addListener(apply);
        }
    });

    // “Refresh open Amazon tabs” CTA
    const refreshBtn = document.getElementById("refreshTabs");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            refreshBtn.disabled = true;
            refreshBtn.textContent = "Refreshing…";
            chrome.runtime.sendMessage({ type: "refreshAmazonTabs", mode: "reload" }, () => {
                refreshBtn.textContent = "Refreshed!";
                setTimeout(() => {
                    // Turn it into a "Close this site" button
                    refreshBtn.disabled = false;
                    refreshBtn.textContent = "Close this site";
                    refreshBtn.classList.remove("cta--refresh");
                    refreshBtn.classList.add("cta--close");

                    refreshBtn.addEventListener("click", () => {
                        window.close(); // closes welcome.html tab
                    }, { once: true });
                }, 1200);
            });
        });
    }
})();
