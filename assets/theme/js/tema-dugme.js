document.addEventListener("DOMContentLoaded", function () {

  const toggle = document.getElementById("themeToggle");
  const theme = document.getElementById("theme-ljubicasta-svetla");
  const favicon = document.getElementById("favicon");
  const cssPromena = document.getElementById("css-ljubicasti");
  const root = document.documentElement;

  if (!toggle || !theme || !favicon || !cssPromena) {
    return;
  }

  // 👉 JASNA logika (bez konfuzije)
  let currentTheme = localStorage.getItem("theme") || "ljubicasta";

  function applyTheme() {

    if (currentTheme === "zelena") {
      root.setAttribute("data-theme", "zelena");
      theme.href = "assets/mobirise/css/mbr-additional-zelena.css";
      favicon.href = "assets/images/favicon-eye-green.svg";
      cssPromena.href = "assets/theme/css/style-zelena.css";
      toggle.checked = true;
    } else {
      root.setAttribute("data-theme", "ljubicasta");
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
