(function () {
  var storageKey = "portfolio-theme";
  var storedTheme = localStorage.getItem(storageKey);
  var theme = storedTheme === "light" ? "light" : "dark";

  document.documentElement.dataset.theme = theme;

  function updateControls() {
    var isDark = document.documentElement.dataset.theme === "dark";
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.setAttribute("aria-pressed", String(isDark));
      button.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('a[href="projectvisuals.html"]').forEach(function (link) {
      link.remove();
    });
    document.querySelectorAll(".section").forEach(function (section) {
      if (section.textContent.indexOf("Want to explore the visuals?") !== -1) {
        section.remove();
      }
    });

    var workGrid = document.querySelector("#work .work-grid");
    if (workGrid) {
      var groups = [
        ["Dashboards", ["11", "25", "17", "12", "31", "27", "21", "22", "5", "19"]],
        ["Machine learning", ["16", "1", "2", "6"]],
        ["Cloud data engineering", ["23"]],
        ["Applied AI", ["7"]],
        ["Data Analysis", ["15", "14"]],
        ["Data Storytelling", ["24", "28", "29", "18"]]
      ];
      var cards = Array.from(workGrid.querySelectorAll(".project-card"));
      var sections = document.createElement("div");
      sections.className = "work-sections";
      var sectionNav = document.createElement("nav");
      sectionNav.className = "work-section-nav";
      sectionNav.setAttribute("aria-label", "Selected work categories");
      var projectArea = document.createElement("div");
      projectArea.className = "selected-projects";
      var projectGrid = document.createElement("div");
      projectGrid.className = "work-grid";
      projectArea.appendChild(projectGrid);
      var groupedCards = [];

      groups.forEach(function (group, index) {
        var section = document.createElement("div");
        section.className = "work-section";
        section.id = "work-section-" + index;
        var sectionLabel = document.createElement("span");
        sectionLabel.textContent = group[0];
        section.appendChild(sectionLabel);
        var sectionCards = [];

        cards.forEach(function (card) {
          var pill = card.querySelector(".pill");
          var number = pill ? pill.textContent.replace(/[^0-9]/g, "") : "";
          if (group[1].indexOf(number.replace(/^0+/, "")) !== -1) {
            sectionCards.push(card);
          }
        });

        sections.appendChild(section);
        groupedCards.push(sectionCards);

        var navButton = document.createElement("button");
        navButton.type = "button";
        navButton.textContent = group[0];
        navButton.setAttribute("aria-controls", section.id);
        navButton.addEventListener("click", function () {
          section.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          showProjects(index);
        });
        sectionNav.appendChild(navButton);
      });

      function showProjects(index) {
        projectGrid.replaceChildren();
        groupedCards[index].forEach(function (card) {
          projectGrid.appendChild(card);
        });
        projectArea.setAttribute("aria-label", groups[index][0] + " projects");
        bindProjectCards();
      }

      var workFrame = document.createElement("div");
      workFrame.className = "work-frame";
      workFrame.appendChild(sections);
      workFrame.appendChild(sectionNav);
      workFrame.appendChild(projectArea);
      workGrid.replaceWith(workFrame);

      var navButtons = Array.from(sectionNav.querySelectorAll("button"));
      showProjects(0);
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var activeIndex = sections.contains(entry.target) ? Array.from(sections.children).indexOf(entry.target) : -1;
            navButtons.forEach(function (button, buttonIndex) {
              var isActive = buttonIndex === activeIndex;
              button.classList.toggle("is-active", isActive);
              button.setAttribute("aria-current", isActive ? "true" : "false");
            });
            sections.querySelectorAll(".work-section").forEach(function (section, sectionIndex) {
              section.classList.toggle("is-active", sectionIndex === activeIndex);
            });
            if (activeIndex !== -1) {
              showProjects(activeIndex);
            }
          }
        });
      }, { root: sections, threshold: 0.6 });

      sections.querySelectorAll(".work-section").forEach(function (section) {
        sectionObserver.observe(section);
      });
    }

    // Function to bind click handlers to all project cards
    function bindProjectCards() {
      document.querySelectorAll(".project-card").forEach(function (card) {
        if (card.dataset.clickBound === "true") {
          return;
        }
        var link = card.querySelector(".arrow");
        if (link) {
          card.style.cursor = "pointer";
          card.dataset.clickBound = "true";
          card.addEventListener("click", function (event) {
            if (event.target.closest("a, button")) {
              return;
            }
            window.location.href = link.href;
          });
        }
      });
    }

    // Initial bind
    bindProjectCards();

    // Simple lightbox for project detail pages - Properly contained
    var detailImages = document.querySelectorAll(".detail-image img, .detail-content img");
    if (detailImages.length > 0) {
      var lightbox = document.createElement("div");
      lightbox.className = "project-lightbox";
      lightbox.setAttribute("aria-hidden", "true");
      lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded image">
          <button class="lightbox-close" type="button" aria-label="Close expanded image">×</button>
          <div class="lightbox-content">
            <img class="lightbox-image" src="" alt="Expanded image">
          </div>
          <div class="lightbox-info"></div>
        </div>
      `;
      document.body.appendChild(lightbox);

      var lightboxImage = lightbox.querySelector(".lightbox-image");
      var lightboxInfo = lightbox.querySelector(".lightbox-info");
      
      function closeLightbox() {
        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImage.src = "";
        lightboxImage.style.opacity = "0";
        lightboxInfo.textContent = "";
        document.body.style.overflow = "";
      }
      
      function openLightbox(img) {
        lightboxImage.style.opacity = "0";
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt || "Expanded image";
        
        var fileName = img.src.split('/').pop() || '';
        var fileExt = fileName.split('.').pop() || '';
        if (fileExt) {
          lightboxInfo.textContent = fileName;
        } else {
          lightboxInfo.textContent = '';
        }
        
        lightboxImage.onload = function() {
          lightboxImage.style.opacity = "1";
        };
        
        if (lightboxImage.complete) {
          lightboxImage.style.opacity = "1";
        }
        
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }

      detailImages.forEach(function (img) {
        img.style.cursor = "pointer";
        img.addEventListener("click", function (event) {
          event.stopPropagation();
          openLightbox(img);
        });
      });

      lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
      lightbox.querySelector(".lightbox-backdrop").addEventListener("click", closeLightbox);
      
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
          closeLightbox();
        }
      });
      
      window.addEventListener("resize", function() {
        if (lightbox.classList.contains("is-open")) {
          lightboxImage.style.maxWidth = "100%";
          lightboxImage.style.maxHeight = "100%";
        }
      });
    }

    updateControls();
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        var nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem(storageKey, nextTheme);
        updateControls();
      });
    });
  });
})();
// Interactive data model / ERD
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("erd-canvas");
    var svg = document.getElementById("erd-svg");
    var reset = document.getElementById("erd-reset");
    if (!canvas || !svg) return;

    var relationships = [
      ["fact_sales.date_key", "dim_date.date_key"],
      ["fact_sales.product_key", "dim_product.product_key"],
      ["fact_sales.location_key", "dim_location.location_key"],
      ["fact_sales.supervisor_key", "dim_supervisor.supervisor_key"]
    ];

    function fieldEl(name) { return canvas.querySelector('[data-field="' + name + '"]'); }
    function tableEl(name) { return canvas.querySelector('[data-table="' + name + '"]'); }

    function relatedFor(field) {
      var result = [];
      relationships.forEach(function (pair) {
        if (pair[0] === field) result.push(pair[1]);
        if (pair[1] === field) result.push(pair[0]);
      });
      return result;
    }

    function linePoint(el, side) {
      var r = el.getBoundingClientRect();
      var c = canvas.getBoundingClientRect();
      var x = r.left - c.left + r.width / 2;
      var y = r.top - c.top + r.height / 2;
      if (side === "left") x = r.left - c.left;
      if (side === "right") x = r.right - c.left;
      if (side === "top") y = r.top - c.top;
      if (side === "bottom") y = r.bottom - c.top;
      return {x:x, y:y};
    }

    function drawLines() {
      svg.innerHTML = "";
      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      relationships.forEach(function (pair, index) {
        var source = fieldEl(pair[0]);
        var target = fieldEl(pair[1]);
        if (!source || !target) return;
        var sr = source.getBoundingClientRect();
        var tr = target.getBoundingClientRect();
        var cr = canvas.getBoundingClientRect();
        var sx = sr.left + sr.width / 2 - cr.left;
        var sy = sr.top + sr.height / 2 - cr.top;
        var tx = tr.left + tr.width / 2 - cr.left;
        var ty = tr.top + tr.height / 2 - cr.top;
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var midX = (sx + tx) / 2;
        var d = "M " + sx + " " + sy + " C " + midX + " " + sy + ", " + midX + " " + ty + ", " + tx + " " + ty;
        path.setAttribute("d", d);
        path.setAttribute("class", "erd-line");
        path.dataset.relationship = String(index);
        svg.appendChild(path);
      });
    }

    function resetView() {
      canvas.querySelectorAll(".erd-card,.erd-field,.erd-line").forEach(function (el) {
        el.classList.remove("is-active", "is-muted");
      });
    }

    function highlightField(field) {
      var connected = relatedFor(field);
      canvas.querySelectorAll(".erd-card,.erd-field").forEach(function (el) {
        el.classList.remove("is-active", "is-muted");
      });
      canvas.querySelectorAll(".erd-line").forEach(function (el) {
        el.classList.add("is-muted");
        el.classList.remove("is-active");
      });
      fieldEl(field).classList.add("is-active");
      connected.forEach(function (name) {
        var el = fieldEl(name);
        if (el) el.classList.add("is-active");
      });
      canvas.querySelectorAll(".erd-card").forEach(function (card) {
        var table = card.dataset.table;
        if (table === field.split(".")[0] || connected.some(function (name) { return name.split(".")[0] === table; })) card.classList.add("is-active");
        else card.classList.add("is-muted");
      });
      relationships.forEach(function (pair, index) {
        if (pair[0] === field || pair[1] === field) {
          var line = svg.querySelector('[data-relationship="' + index + '"]');
          if (line) { line.classList.remove("is-muted"); line.classList.add("is-active"); }
        }
      });
    }

    function highlightTable(table) {
      var activeFields = [];
      relationships.forEach(function (pair) {
        if (pair[0].split(".")[0] === table) activeFields.push(pair[0], pair[1]);
        if (pair[1].split(".")[0] === table) activeFields.push(pair[1], pair[0]);
      });
      canvas.querySelectorAll(".erd-card,.erd-field").forEach(function (el) {
        el.classList.remove("is-active", "is-muted");
      });
      canvas.querySelectorAll(".erd-line").forEach(function (el) {
        el.classList.add("is-muted");
        el.classList.remove("is-active");
      });
      canvas.querySelector('[data-table="' + table + '"]').classList.add("is-active");
      activeFields.forEach(function (name) { var el = fieldEl(name); if (el) el.classList.add("is-active"); });
      canvas.querySelectorAll(".erd-card").forEach(function (card) {
        if (card.dataset.table !== table && !activeFields.some(function (name) { return name.split(".")[0] === card.dataset.table; })) card.classList.add("is-muted");
        else card.classList.add("is-active");
      });
      relationships.forEach(function (pair, index) {
        if (pair[0].split(".")[0] === table || pair[1].split(".")[0] === table) {
          var line = svg.querySelector('[data-relationship="' + index + '"]');
          if (line) { line.classList.remove("is-muted"); line.classList.add("is-active"); }
        }
      });
    }

    canvas.querySelectorAll(".erd-field").forEach(function (button) {
      button.addEventListener("click", function () { highlightField(button.dataset.field); });
    });
    canvas.querySelectorAll(".erd-card-header").forEach(function (header) {
      header.addEventListener("click", function () { highlightTable(header.closest(".erd-card").dataset.table); });
      header.style.cursor = "pointer";
    });
    if (reset) reset.addEventListener("click", resetView);
    window.addEventListener("resize", drawLines);
    setTimeout(drawLines, 50);
  });
})();
