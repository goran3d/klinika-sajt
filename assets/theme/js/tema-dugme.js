document.addEventListener("DOMContentLoaded", function () {

  const toggle = document.getElementById("themeToggle");
  const theme = document.getElementById("theme-ljubicasta-svetla");
  const favicon = document.getElementById("favicon");
  const cssPromena = document.getElementById("css-ljubicasti");

  // 👉 JASNA logika (bez konfuzije)
  let currentTheme = localStorage.getItem("theme") || "ljubicasta";

  function applyTheme() {

    if (currentTheme === "zelena") {
      theme.href = "assets/mobirise/css/mbr-additional-zelena.css";
      favicon.href = "assets/images/favicon-eye-green.svg";
      cssPromena.href = "assets/theme/css/style-zelena.css";
      toggle.checked = true;
    } else {
      theme.href = "assets/mobirise/css/mbr-additional-ljubicasta-svetlija.css";
      favicon.href = "assets/images/favicon-eye-violet.svg";
      cssPromena.href = "assets/theme/css/style.css";
      toggle.checked = false;
    }

  }

  applyTheme();

  toggle.addEventListener("change", function () {
    currentTheme = toggle.checked ? "zelena" : "ljubicasta";
    localStorage.setItem("theme", currentTheme);
    applyTheme();
  });

});