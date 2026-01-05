// diagnostico.js
// - Envía Diagnóstico rápido a WhatsApp (mensaje dinámico)
// - Conecta CTAs (Hero + Navbar) al mismo WhatsApp
// - Dispara conversion events (GA4) si gtag está disponible
// - Muestra toast: "Gracias, te contactaremos"

(function () {
  // === CONFIG ===
  var WHATSAPP_PHONE = "593997825505"; // sin +, sin espacios

  // === Helpers ===
  function $(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    var toast = $("toast");
    if (!toast) return;

    var textNode = toast.querySelector(".toast__text");
    if (textNode && message) textNode.textContent = message;

    toast.classList.add("toast--show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      toast.classList.remove("toast--show");
    }, 2800);
  }

  function fireEvent(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function openWhatsApp(message) {
    var url =
      "https://wa.me/" +
      WHATSAPP_PHONE +
      "?text=" +
      encodeURIComponent(message);
    window.open(url, "_blank");
  }

  function setInvalid(el, invalid) {
    if (!el) return;
    if (invalid) el.classList.add("is-invalid");
    else el.classList.remove("is-invalid");
  }

  // === Elements ===
  var form = $("diagnosticoForm");
  var inputSistema = $("diagSistema");
  var inputCiudad = $("diagCiudad");

  var ctaHero = $("ctaCotizarHero");
  var ctaNav = $("ctaCotizarNav");

  // === CTA: Cotizar Hero + Navbar => WhatsApp ===
  function handleCotizarClick(source, e) {
    if (e) e.preventDefault();

    var msg =
      "Hola Servichem, quisiera una cotización.\n\n" +
      "Me interesa recibir asesoría para elegir la solución adecuada.\n" +
      "¿Me pueden ayudar?";

    fireEvent("cta_cotizar_click", { source: source });
    fireEvent("whatsapp_open", { source: source, intent: "cotizar" });

    openWhatsApp(msg);
    showToast("Gracias, te contactaremos.");
  }

  if (ctaHero) {
    ctaHero.addEventListener("click", function (e) {
      handleCotizarClick("hero", e);
    });
  }

  if (ctaNav) {
    ctaNav.addEventListener("click", function (e) {
      handleCotizarClick("navbar", e);
    });
  }

  // === Diagnóstico: submit => validar + WhatsApp + eventos + toast ===
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var sistema = (form.elements["sistema"].value || "").trim();
      var ciudad = (form.elements["ciudad"].value || "").trim();

      var ok = true;

      setInvalid(inputSistema, !sistema);
      setInvalid(inputCiudad, !ciudad);

      if (!sistema) ok = false;
      if (!ciudad) ok = false;

      if (!ok) {
        showToast("Revisa los campos marcados.");
        fireEvent("diagnostico_invalid", { reason: "validation" });
        return;
      }

      var mensaje =
        "Hola Servichem, quiero un diagnóstico técnico.\n\n" +
        "Sistema: " +
        sistema +
        "\n" +
        "Ciudad: " +
        ciudad +
        "\n\n" +
        "¿Me pueden recomendar la solución adecuada y una cotización?";

      fireEvent("diagnostico_submit", {
        sistema: sistema,
        ciudad: ciudad,
      });
      fireEvent("whatsapp_open", {
        source: "diagnostico",
        intent: "diagnostico",
      });

      openWhatsApp(mensaje);

      form.reset();
      setInvalid(inputSistema, false);
      setInvalid(inputCiudad, false);
      showToast("Gracias, te contactaremos.");
    });
  }
})();
