// BRASSDORFER AUFTRITTE
// -----------------------------------------------------------------------------
// Hier werden alle Termine zentral gepflegt.
// Startseite und Events-Seite lesen diese Datei automatisch ein.
//
// So ergänzt ihr einen Termin:
// {
//   status: "kommend",              // "kommend" oder "vergangen"
//   datum: "2026-07-03",            // Format: JJJJ-MM-TT
//   titel: "Waldfest ...",
//   ort: "AT-5112 ...",
//   info: "Optionaler Zusatztext",
//   link: "https://..."             // optional; wird nur bei kommenden Terminen angezeigt
// }
//
// Wichtig:
// - Für vergangene Termine einfach status auf "vergangen" setzen.
// - Bei vergangenen Terminen wird bewusst kein Weblink angezeigt.
// - Die Reihenfolge wird automatisch nach Datum sortiert:
//   kommende Termine aufsteigend, vergangene Termine absteigend.
// -----------------------------------------------------------------------------

window.BRASSDORFER_AUFTRITTE = [
  {
    status: "vergangen",
    datum: "2026-04-12",
    titel: "Hochburg-Acher Wiesenfest",
    ort: "AT-5122 Hochburg-Ach, Oberösterreich",
    info: ""
  },
  {
    status: "vergangen",
    datum: "2026-06-12",
    titel: "Musikfest Moosdorf",
    ort: "AT-5141 Moosdorf, Oberösterreich",
    info: ""
  },
  {
    status: "kommend",
    datum: "2026-07-03",
    titel: "Waldfest Lamprechtshausen",
    ort: "AT-5112 Lamprechtshausen, SalzburgXX",
    info: ""
  },
  {
    status: "kommend",
    datum: "2026-09-06",
    titel: "Kornmandlfest Lochen",
    ort: "AT-5221 Lochen am See, Oberösterreich",
    info: ""
  },
  {
    status: "kommend",
    datum: "2026-09-11",
    titel: "FF-Fest Hochburg-Ach",
    ort: "AT-5122 Hochburg-Ach, Oberösterreich",
    info: ""
  }
];

(function(){
  const MONTH_SHORT = ["Jan","Feb","März","Apr","Mai","Juni","Juli","Aug","Sep","Okt","Nov","Dez"];

  function escapeHtml(value){
    return String(value || "").replace(/[&<>"]/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[ch];
    });
  }

  function parseDate(value){
    const parts = String(value || "").split("-").map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  }

  function normalizeEvent(event){
    const status = String(event.status || "kommend").toLowerCase();
    return {
      status: status === "vergangen" ? "vergangen" : "kommend",
      datum: event.datum || "",
      titel: event.titel || "",
      ort: event.ort || "",
      info: event.info || "",
      link: event.link || "",
      _date: parseDate(event.datum)
    };
  }

  function getEvents(status){
    const wanted = status === "vergangen" ? "vergangen" : "kommend";
    return (window.BRASSDORFER_AUFTRITTE || [])
      .map(normalizeEvent)
      .filter(function(event){ return event.status === wanted; })
      .sort(function(a,b){
        return wanted === "vergangen" ? b._date - a._date : a._date - b._date;
      });
  }

  function eventHtml(event, index, status){
    const day = String(event._date.getDate()).padStart(2,"0");
    const month = MONTH_SHORT[event._date.getMonth()] || "";
    const isUpcoming = status !== "vergangen";
    const isNext = isUpcoming && index === 0;
    const rows = [];

    if (isNext) {
      rows.push('<div class="row"><span class="next-label">Nächster Auftritt</span></div>');
    }

    if (event.ort) {
      rows.push(`<div class="row"><span><b>Ort:</b> ${escapeHtml(event.ort)}</span></div>`);
    }

    if (event.info) {
      rows.push(`<div class="row"><span>${escapeHtml(event.info)}</span></div>`);
    }

    // Links werden nur bei kommenden Terminen angezeigt.
    if (isUpcoming && event.link) {
      rows.push(`<div class="row"><a href="${escapeHtml(event.link)}" target="_blank" rel="noopener">Zur Veranstaltung</a></div>`);
    }

    const classes = [
      "ev",
      isNext ? "next" : "",
      status === "vergangen" ? "past" : ""
    ].filter(Boolean).join(" ");

    const hint = status === "vergangen" ? '<span class="hint">Bereits gespielt</span>' : "";
    const body = `<div class="ev-body">${rows.join("") || '<div class="row"><span>Weitere Infos folgen.</span></div>'}</div>`;

    return `<details data-date="${escapeHtml(event.datum)}" class="${classes}">
      <summary>
        <span class="ev-date"><span class="d">${day}</span><span class="m">${month}</span></span>
        <span class="ev-title"><h3>${escapeHtml(event.titel)}</h3>${hint}</span>
        <span class="chev" aria-hidden="true">Mehr Infos</span>
      </summary>
      ${body}
    </details>`;
  }

  function renderEventContainer(container){
    const status = container.dataset.eventsStatus === "vergangen" ? "vergangen" : "kommend";
    const limit = container.dataset.eventsLimit ? Number(container.dataset.eventsLimit) : Infinity;
    const events = getEvents(status).slice(0, limit);

    if (!events.length) {
      container.innerHTML = status === "vergangen"
        ? '<p class="lead">Aktuell sind keine vergangenen Auftritte eingetragen.</p>'
        : '<p class="lead">Aktuell sind keine kommenden Auftritte eingetragen.</p>';
      return;
    }

    container.innerHTML = events.map(function(event, index){
      return eventHtml(event, index, status);
    }).join("");
  }

  function renderEvents(){
    document.querySelectorAll("[data-events-list]").forEach(renderEventContainer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderEvents);
  } else {
    renderEvents();
  }

  window.BrassdorferEvents = {
    render: renderEvents,
    getEvents: getEvents
  };
})();
