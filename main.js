document.addEventListener("DOMContentLoaded", () => {
    const isEnglish = document.documentElement.lang === "en";

    const host = window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && window.location.protocol !== "file:"
        ? window.location.hostname
        : "localhost";
    const API_BASE_URL = `http://${host}:8080`;

    initTheme();
    initTypingAnimation();
    initScrollReveal();
    initNavbarActiveLink();
    initSmoothScroll();
    initParallax();
    initContactForm(API_BASE_URL, isEnglish);
    initProjectCards(API_BASE_URL);
});

function initTypingAnimation() {
    const element = document.querySelector("[data-typewriter]");
    if (!element) return;

    const text = element.textContent.trim();
    element.setAttribute("aria-label", text);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.textContent = "";
    element.classList.add("is-typing");

    let index = 0;
    const typeNextCharacter = () => {
        if (index >= text.length) {
            element.classList.remove("is-typing");
            return;
        }

        element.textContent += text[index];
        index += 1;
        window.setTimeout(typeNextCharacter, 45);
    };

    window.setTimeout(typeNextCharacter, 250);
}

/* =======================================================
   THEME MANAGEMENT
======================================================= */
function initTheme() {
    const themeBtn = document.getElementById("theme-toggle");

    const savedTheme = localStorage.getItem("theme") || localStorage.getItem("portfolio_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeTheme = savedTheme ? savedTheme : (systemPrefersDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", activeTheme);
    localStorage.setItem("theme", activeTheme);
    localStorage.setItem("portfolio_theme", activeTheme);
    updateThemeIcon(activeTheme === "dark");

    if (!themeBtn) return;

    themeBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        localStorage.setItem("portfolio_theme", newTheme);
        updateThemeIcon(newTheme === "dark");
    });
}

function updateThemeIcon(isDark) {
    const themeBtn = document.getElementById("theme-toggle");
    if (!themeBtn) return;

    const isEnglish = document.documentElement.lang === "en";

    // CSS handles showing/hiding icons via .icon-dark/.icon-light classes
    // Just update the button title/aria-label
    themeBtn.title = isDark
        ? (isEnglish ? "Switch to light mode" : "Mudar para modo claro")
        : (isEnglish ? "Switch to dark mode" : "Mudar para modo escuro");
    themeBtn.setAttribute("aria-label", themeBtn.title);
}

/* =======================================================
   SCROLL REVEAL (IntersectionObserver)
======================================================= */
function initScrollReveal() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        // Show all elements immediately
        document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .timeline-item").forEach(el => {
            el.classList.add("visible");
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -50px 0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                // Unobserve after animation to save performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add reveal classes to elements
    const revealElements = document.querySelectorAll(
        "section > .section-header, " +
        ".project-card, " +
        ".timeline-item, " +
        ".skill-category, " +
        ".education-card, " +
        ".contact-form-wrapper, " +
        ".contact-card"
    );

    revealElements.forEach((el, index) => {
        // Alternate left/right for variety
        if (el.classList.contains("timeline-item")) {
            // Timeline items handled separately
        } else if (index % 2 === 0) {
            el.classList.add("reveal-left");
        } else {
            el.classList.add("reveal-right");
        }
    });

    // Observe all reveal elements
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach(el => {
        observer.observe(el);
    });

    // Timeline items - special handling
    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 100}ms`;
        observer.observe(item);
    });
}

/* =======================================================
   NAVBAR ACTIVE LINK ON SCROLL
======================================================= */
function initNavbarActiveLink() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".nav-link[href^='#']");

    if (!sections.length || !navLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}

/* =======================================================
   SMOOTH SCROLL ENHANCEMENT
======================================================= */
function initSmoothScroll() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                // Update URL without jumping
                history.pushState(null, "", targetId);
            }
        });
    });
}

/* =======================================================
   PARALLAX EFFECT (Hero Orbs)
======================================================= */
function initParallax() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const orbs = document.querySelectorAll(".hero-orb");
    if (!orbs.length) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;

        orbs.forEach((orb, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = scrollY * speed;
            orb.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    }

    function requestParallax() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener("scroll", requestParallax, { passive: true });
}

/* =======================================================
   CONTACT FORM
======================================================= */
function initContactForm(apiBaseUrl, isEnglish) {
    const form = document.getElementById("form-contato");
    if (!form) return;

    const btn = document.getElementById("btn-enviar");
    const feedback = document.getElementById("form-feedback");
    const originalText = btn ? btn.querySelector(".btn-text")?.textContent : (isEnglish ? "Send Message" : "Enviar Mensagem");

    // Form validation
    const validators = {
        nome: (value) => value.trim().length >= 2 ? "" : (isEnglish ? "Name must be at least 2 characters" : "Nome deve ter pelo menos 2 caracteres"),
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : (isEnglish ? "Please enter a valid email" : "Por favor, insira um e-mail válido"),
        assunto: (value) => value.trim().length >= 5 ? "" : (isEnglish ? "Subject must be at least 5 characters" : "Assunto deve ter pelo menos 5 caracteres"),
        mensagem: (value) => value.trim().length >= 10 ? "" : (isEnglish ? "Message must be at least 10 characters" : "Mensagem deve ter pelo menos 10 caracteres")
    };

    // Real-time validation
    Object.keys(validators).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const errorEl = document.getElementById(`${fieldName}-error`);

        if (field) {
            field.addEventListener("blur", () => {
                const error = validators[fieldName](field.value);
                if (error) {
                    field.classList.add("error");
                    if (errorEl) errorEl.textContent = error;
                } else {
                    field.classList.remove("error");
                    if (errorEl) errorEl.textContent = "";
                }
            });

            field.addEventListener("input", () => {
                if (field.classList.contains("error")) {
                    const error = validators[fieldName](field.value);
                    if (!error) {
                        field.classList.remove("error");
                        if (errorEl) errorEl.textContent = "";
                    }
                }
            });
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validate all fields
        let hasErrors = false;
        Object.keys(validators).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const errorEl = document.getElementById(`${fieldName}-error`);
            if (field) {
                const error = validators[fieldName](field.value);
                if (error) {
                    field.classList.add("error");
                    if (errorEl) errorEl.textContent = error;
                    hasErrors = true;
                }
            }
        });

        if (hasErrors) {
            // Focus first error field
            const firstError = form.querySelector(".error");
            if (firstError) firstError.focus();
            return;
        }

        if (btn) {
            btn.disabled = true;
        }

        if (feedback) {
            feedback.className = "form-feedback";
            feedback.textContent = "";
        }

        const payload = {
            nome: document.getElementById("nome")?.value || "",
            email: document.getElementById("email")?.value || "",
            assunto: document.getElementById("assunto")?.value || "",
            mensagem: document.getElementById("mensagem")?.value || ""
        };

        // Send to backend (non-blocking)
        fetch(`${apiBaseUrl}/api/contatos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(() => {});

        // Send via Formspree
        const formData = new FormData(form);

        try {
            const res = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" }
            });

            if (res.ok) {
                form.reset();
                if (feedback) {
                    feedback.className = "form-feedback success";
                    feedback.textContent = isEnglish
                        ? "Message sent successfully! I'll get back to you soon."
                        : "Mensagem enviada com sucesso! Responderei em breve.";
                }
            } else {
                throw new Error("Erro no envio");
            }
        } catch (err) {
            if (feedback) {
                feedback.className = "form-feedback error";
                feedback.textContent = isEnglish
                    ? "Error sending message. Please send an email to jonathanalexandre2910@gmail.com directly."
                    : "Erro ao enviar mensagem. Por favor, envie diretamente para jonathanalexandre2910@gmail.com.";
            }
        } finally {
            if (btn) {
                btn.disabled = false;
            }
        }
    });
}

/* =======================================================
   PROJECT CARDS (Dynamic Loading)
======================================================= */
function initProjectCards(apiBaseUrl) {
    const container = document.getElementById("projetos-grid");
    if (!container) return;

    const isEnglish = document.documentElement.lang === "en";

    // Fallback static projects
    const fallbackProjects = [
        {
            nome: "GameHub — Portal Web",
            descricao: isEnglish
                ? "Academic project for the Web I course, built without external frameworks. It features a game catalog, category filters, individual pages, dynamic navigation, and a responsive layout."
                : "Projeto acadêmico da disciplina de Web I, desenvolvido sem frameworks externos, com catálogo de jogos, filtros por categoria, páginas individuais, navegação dinâmica e layout responsivo.",
            tecnologias: "HTML, CSS, JavaScript",
            link: "https://github.com/Jhon2910/html-css-Javascript/tree/main/Projetos/gamehub"
        },
        {
            nome: isEnglish ? "Client-Server Matchmaking System" : "Sistema de Matchmaking Cliente-Servidor",
            descricao: isEnglish
                ? "Academic networking project using TCP sockets for client-server communication, player queue management, and match creation based on the required number of participants."
                : "Projeto acadêmico da disciplina de Redes, com comunicação cliente-servidor por sockets TCP, gerenciamento de filas de jogadores e criação de partidas conforme a quantidade necessária de participantes.",
            tecnologias: isEnglish
                ? "Python, TCP sockets, Client-server"
                : "Python, Sockets TCP, Cliente-servidor"
        }
    ];

    function renderProjects(projects) {
        container.innerHTML = "";

        projects.forEach((projeto, index) => {
            const article = document.createElement("article");
            article.className = "project-card";
            article.style.animationDelay = `${index * 100}ms`;
            article.classList.add("animate-fade-in-up");

            const technologies = projeto.tecnologias.split(",").map(t => t.trim());

            const projectTitle = projeto.link
                ? `<a href="${escapeHtml(projeto.link)}" target="_blank" rel="noopener noreferrer" class="project-title">${escapeHtml(projeto.nome)} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
                : `<h3 class="project-title">${escapeHtml(projeto.nome)}</h3>`;

            article.innerHTML = `
                <div class="project-card-header">
                    ${projectTitle}
                </div>
                <p class="project-desc">${escapeHtml(projeto.descricao)}</p>
                <div class="project-tags">
                    ${technologies.map(tech => `<span class="tag">${escapeHtml(tech)}</span>`).join("")}
                </div>
            `;

            container.appendChild(article);
        });
    }

    // Show skeletons while loading
    function showSkeletons(count = fallbackProjects.length) {
        container.innerHTML = "";
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement("article");
            skeleton.className = "project-card skeleton";
            skeleton.innerHTML = `
                <div class="skeleton-title"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text"></div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                    <div class="skeleton-tag"></div>
                </div>
            `;
            container.appendChild(skeleton);
        }
    }

    // Try to fetch from backend
    showSkeletons();

    fetch(`${apiBaseUrl}/api/projetos`)
        .then(res => {
            if (!res.ok) throw new Error("Erro na requisição");
            return res.json();
        })
        .then(projetos => {
            if (Array.isArray(projetos) && projetos.length > 0) {
                // Transform backend data to match frontend structure
                const transformed = projetos.map(p => ({
                    nome: p.nome,
                    descricao: p.descricao,
                    tecnologias: p.tecnologias,
                    link: `https://github.com/Jhon2910`
                }));
                renderProjects(transformed);
            } else {
                renderProjects(fallbackProjects);
            }
        })
        .catch(() => {
            renderProjects(fallbackProjects);
        });
}

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/* =======================================================
   UTILITY: Debounce
======================================================= */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* =======================================================
   PERFORMANCE: Lazy Load Images
======================================================= */
if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute("data-src");
                }
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: "50px" });

    document.querySelectorAll("img[data-src]").forEach(img => {
        imageObserver.observe(img);
    });
}

/* =======================================================
   ACCESSIBILITY: Skip Link
======================================================= */
// Add skip link for keyboard navigation
document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !document.querySelector(".skip-link")) {
        const skipLink = document.createElement("a");
        skipLink.href = "#main-content";
        skipLink.className = "skip-link sr-only focus-visible";
        skipLink.textContent = "Pular para o conteúdo principal";
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
});

/* =======================================================
   CONSOLE EASTER EGG
======================================================= */
console.log(`
%c👋 Olá, desenvolvedor!
%cObrigado por visitar meu portfólio.
%cGitHub: https://github.com/Jhon2910
%cLinkedIn: https://linkedin.com/in/jonathan-rodrigues-06a1b7442
`, "font-size: 20px; font-weight: bold; color: #22c55e;", "font-size: 14px; color: #a1a1aa;", "font-size: 12px; color: #71717a;", "font-size: 12px; color: #71717a;");