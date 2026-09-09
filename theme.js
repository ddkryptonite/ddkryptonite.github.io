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