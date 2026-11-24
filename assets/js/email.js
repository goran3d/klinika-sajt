(function () {
  /**
   * Decode an XOR-obfuscated byte array using a seed key.
   */
  function decode(bytes, seed) {
    var out = "";
    for (var i = 0; i < bytes.length; i++) {
      out += String.fromCharCode(bytes[i] ^ ((seed + i * 7) & 0xff));
    }
    return out;
  }

  /**
   * Render a click-to-reveal button that decodes and mounts the email link on user click.
   */
  function initEmailObfuscation() {
    var mailScheme = [126, 123, 72, 68, 91, 89, 7];
    var mailAddr = [66, 95, 67, 75, 55, 12, 39, 119, 2, 7, 2, 88, 16, 225];

    var slots = Array.from(document.querySelectorAll(".email"));

    function revealAll(focusTarget) {
      var email = decode(mailAddr, 41);
      var scheme = decode(mailScheme, 19);

      slots.forEach(function (el) {
        var link = document.createElement("a");
        link.href = scheme + email;
        link.textContent = email;

        el.textContent = "";
        el.appendChild(link);

        if (el === focusTarget) {
          link.focus();
        }
      });
    }

    slots.forEach(function (el) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Prikaži email";
      btn.setAttribute("aria-label", "Prikaži email adresu");
      btn.className = "contact-reveal-btn";

      btn.addEventListener("click", function () {
        revealAll(el);
      });

      el.textContent = "";
      el.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEmailObfuscation);
  } else {
    initEmailObfuscation();
  }
})();
