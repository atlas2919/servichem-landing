// app.js
// - Diagnóstico rápido -> WhatsApp (con Nombre)
// - CTA Cotizar (Hero + Navbar) -> WhatsApp
// - Contacto -> Email (mailto)
// - GA4 events + toast UX

(function () {
  // =====================
  // CONFIG
  // =====================
  var WHATSAPP_PHONE = "593997825505";
  var CONTACT_EMAIL = "fabiann@serviaguasintegral.com";

  // =====================
  // HELPERS
  // =====================
  function $(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    var toast = $("toast");
    if (!toast) return;

    var textNode = toast.querySelector(".toast__text");
    if (textNode && message) textNode.textContent = message;

    toast.classList.add("toast--show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("toast--show");
    }, 2800);
  }

  function fireEvent(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
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

  function openEmail(subject, body) {
    var url =
      "mailto:" +
      CONTACT_EMAIL +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = url;
  }

  function setInvalid(el, invalid) {
    if (!el) return;
    el.classList.toggle("is-invalid", invalid);
  }

  // =====================
  // ELEMENTS
  // =====================
  var diagnosticoForm = $("diagnosticoForm");
  var diagNombre = $("diagNombre");
  var diagSistema = $("diagSistema");
  var diagCiudad = $("diagCiudad");

  var ctaHero = $("ctaCotizarHero");
  var ctaNav = $("ctaCotizarNav");

  var contactoForm = $("contactoForm");

  // =====================
  // CTA COTIZAR -> WHATSAPP
  // =====================
  function handleCotizar(source, e) {
    if (e) e.preventDefault();

    var msg =
      "Hola Servichem, quisiera una cotización.\n\n" +
      "Me interesa recibir asesoría para elegir la solución adecuada.\n" +
      "¿Me pueden ayudar?";

    fireEvent("cta_cotizar_click", { source });
    fireEvent("generate_lead", {
      source,
      method: "whatsapp",
      intent: "cotizar",
    });

    openWhatsApp(msg);
    showToast("Gracias, te contactaremos.");
  }

  if (ctaHero)
    ctaHero.addEventListener("click", (e) => handleCotizar("hero", e));
  if (ctaNav)
    ctaNav.addEventListener("click", (e) => handleCotizar("navbar", e));

  // =====================
  // DIAGNÓSTICO -> WHATSAPP (CON NOMBRE)
  // =====================
  if (diagnosticoForm) {
    diagnosticoForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = (diagnosticoForm.elements["nombre"].value || "").trim();
      var sistema = (diagnosticoForm.elements["sistema"].value || "").trim();
      var ciudad = (diagnosticoForm.elements["ciudad"].value || "").trim();

      var ok = true;

      setInvalid(diagNombre, !nombre);
      setInvalid(diagSistema, !sistema);
      setInvalid(diagCiudad, !ciudad);

      if (!nombre || !sistema || !ciudad) ok = false;

      if (!ok) {
        showToast("Revisa los campos marcados.");
        fireEvent("diagnostico_invalid", { reason: "validation" });
        return;
      }

      var mensaje =
        "Hola Servichem, quiero un diagnóstico técnico.\n\n" +
        "Nombre: " +
        nombre +
        "\n" +
        "Sistema: " +
        sistema +
        "\n" +
        "Ciudad: " +
        ciudad +
        "\n\n" +
        "¿Me pueden recomendar la solución adecuada y una cotización?";

      fireEvent("diagnostico_submit", {
        nombre,
        sistema,
        ciudad,
      });

      fireEvent("generate_lead", {
        source: "diagnostico",
        method: "whatsapp",
        intent: "diagnostico",
      });

      openWhatsApp(mensaje);

      diagnosticoForm.reset();
      setInvalid(diagNombre, false);
      setInvalid(diagSistema, false);
      setInvalid(diagCiudad, false);

      showToast("Gracias, te contactaremos.");
    });
  }

  // =====================
  // CONTACTO -> EMAIL
  // =====================
  if (contactoForm) {
    contactoForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = (contactoForm.elements["nombre"].value || "").trim();
      var email = (contactoForm.elements["email"].value || "").trim();
      var mensaje = (contactoForm.elements["mensaje"].value || "").trim();

      if (!nombre || !email || !mensaje) {
        showToast("Completa nombre, email y mensaje.");
        fireEvent("contacto_invalid", { reason: "validation" });
        return;
      }

      var subject = "Contacto desde web Servichem";
      var body = "Nombre: " + nombre + "\n \n" + "Mensaje:\n" + mensaje;

      fireEvent("contacto_submit", { method: "email" });
      fireEvent("generate_lead", {
        source: "contacto",
        method: "email",
        intent: "form",
      });

      openEmail(subject, body);
      contactoForm.reset();
      showToast("Listo, abre tu correo para enviar.");
    });
  }
})();
