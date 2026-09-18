document.addEventListener("DOMContentLoaded", () => {
    // Se acessado por IP local no celular, usa o IP da máquina para a API
    const host = window.location.hostname && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && window.location.protocol !== "file:"
        ? window.location.hostname
        : "localhost";
    const API_BASE_URL = `http://${host}:8080`;

    const isEnglish = document.documentElement.lang === "en";

    // Inicialização dos novos recursos modernos
    initThemeToggle();
    initStarfield();
    initTypingEffect(isEnglish);
    initScrollProgressAndBackToTop();
    initLanguageSwitcher();
    initWelcomeToast(isEnglish);

    // Easter Egg no Console para desenvolvedores e recrutadores
    console.log(
        "%c🚀 Jonathan Alexandre | Portfólio",
        "color: #10b981; font-size: 15px; font-weight: bold; padding: 4px;"
    );
    console.log(
        `%c${isEnglish 
            ? "Thanks for inspecting my code! Feel free to check my GitHub." 
            : "Obrigado por inspecionar meu código! Fique à vontade para me mandar uma mensagem no WhatsApp."}`,
        "color: #94a3b8; font-size: 12px;"
    );

    // Busca projetos do backend apenas na versão em Português
    if (!isEnglish) {
        fetch(`${API_BASE_URL}/api/projetos`)
            .then(response => {
                if (!response.ok) throw new Error("Falha ao buscar projetos");
                return response.json();
            })
            .then(projetos => {
                const container = document.getElementById("projetos-container");
                if (!container || !Array.isArray(projetos) || projetos.length === 0) return;

                container.innerHTML = ""; // Limpa os projetos estáticos apenas se a API retornar dados

                projetos.forEach(projeto => {
                    const card = document.createElement("div");
                    card.classList.add("projeto-card");

                    card.innerHTML = `
                        <div class="projeto-header">
                            <i class="fa-solid fa-code projeto-icon"></i>
                            <span class="curso-badge">API</span>
                        </div>
                        <h3>${projeto.nome}</h3>
                        <p>${projeto.descricao}</p>
                        <div class="projeto-tags">
                            <span>${projeto.tecnologias}</span>
                        </div>
                        <div class="projeto-links">
                            <a href="https://github.com/Jhon2910" target="_blank" class="btn-projeto">
                                <i class="fa-brands fa-github"></i> Ver no GitHub
                            </a>
                        </div>
                    `;

                    container.appendChild(card);
                });
            })
            .catch(error => console.warn("Aviso ao carregar projetos da API (mantendo estáticos):", error));
    }

    // Formulário de contato com Toast Notifications
    const formContato = document.getElementById("form-contato");
    if (!formContato) return;

    formContato.addEventListener("submit", async function (event) {
        event.preventDefault();

        const btn = document.getElementById("btn-enviar");
        const originalText = btn ? btn.textContent : (isEnglish ? "Send Message" : "Enviar Mensagem");

        // Se ainda estiver com o placeholder padrão, avisa para configurar o Formspree
        if (formContato.action.includes("YOUR_FORM_ID")) {
            showToast(
                "warning",
                isEnglish ? "Attention" : "Atenção",
                isEnglish
                    ? "Please configure your Formspree ID in index_en.html (replace YOUR_FORM_ID) to start receiving messages!"
                    : "Por favor, configure o seu ID do Formspree no arquivo index.html (ou substitua YOUR_FORM_ID pelo seu código) para começar a receber mensagens no seu email!"
            );
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.textContent = isEnglish ? "Sending..." : "Enviando...";
        }

        const formData = new FormData(formContato);

        // Envia para o banco de dados do Spring Boot (se o servidor estiver rodando)
        const dadosMensagem = {
            nome: document.getElementById("nome")?.value || "",
            email: document.getElementById("email")?.value || "",
            assunto: document.getElementById("assunto")?.value || "",
            mensagem: document.getElementById("mensagem")?.value || ""
        };

        fetch(`${API_BASE_URL}/api/contatos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosMensagem)
        })
            .then(res => res.json())
            .then(data => console.log("Mensagem salva no banco de dados local:", data))
            .catch(err => console.warn("Servidor backend local offline (mensagem enviada via email):", err));

        try {
            const response = await fetch(formContato.action, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (response.ok) {
                showToast(
                    "success",
                    isEnglish ? "Message Sent!" : "Mensagem Enviada!",
                    isEnglish
                        ? "Thank you! Your message has been sent successfully."
                        : "Obrigado! Sua mensagem foi enviada com sucesso para o meu email."
                );
                formContato.reset();
            } else {
                const data = await response.json();
                if (data && data.errors) {
                    showToast(
                        "error",
                        isEnglish ? "Error" : "Erro",
                        data.errors.map(err => err.message).join(", ")
                    );
                } else {
                    showToast(
                        "error",
                        isEnglish ? "Error" : "Erro",
                        isEnglish
                            ? "Error sending message. Please try again."
                            : "Erro ao enviar mensagem. Tente novamente."
                    );
                }
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            showToast(
                "error",
                isEnglish ? "Connection Error" : "Erro de Conexão",
                isEnglish
                    ? "Connection error. Please try again later."
                    : "Erro ao conectar com o serviço de envio de mensagem. Tente novamente mais tarde."
            );
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    });
});

/* =======================================================
   1. ALTERNADOR DE TEMA (DARK / LIGHT MODE)
======================================================= */
function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return;

    const savedTheme = localStorage.getItem("theme") || localStorage.getItem("portfolio_theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeTheme = savedTheme ? savedTheme : (systemPrefersDark ? "dark" : "light");

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        localStorage.setItem("portfolio_theme", theme);

        const icon = toggleBtn.querySelector("i");
        if (icon) {
            if (theme === "dark") {
                icon.className = "fa-solid fa-sun";
            } else {
                icon.className = "fa-solid fa-moon";
            }
        }
    }

    applyTheme(activeTheme);

    toggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
    });
}

/* =======================================================
   2. EFEITO DE DIGITAÇÃO DINÂMICA (TYPING EFFECT)
======================================================= */
function initTypingEffect(isEnglish) {
    const typingElement = document.getElementById("typing-text");
    if (!typingElement) return;

    const phrases = isEnglish ? [
        "Information Systems Student",
        "Software Developer in Training",
        "Focus on Back-end & Java",
        "Databases & SQL Enthusiast",
        "Passionate about Technology & Code"
    ] : [
        "Estudante de Sistemas de Informação",
        "Desenvolvedor em Formação",
        "Foco em Back-end & Java",
        "Bancos de Dados & SQL",
        "Apaixonado por Tecnologia e Código"
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 35;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 75;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2200; // Pausa com a frase completa
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 400; // Pausa antes da próxima frase
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

/* =======================================================
   3. BARRA DE PROGRESSO & BOTÃO VOLTAR AO TOPO
======================================================= */
function initScrollProgressAndBackToTop() {
    const progressBar = document.getElementById("scroll-progress");
    const backToTopBtn = document.getElementById("back-to-top");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (progressBar && scrollHeight > 0) {
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }

        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.add("visible");
            } else {
                backToTopBtn.classList.remove("visible");
            }
        }
    }, { passive: true });

    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
}

/* =======================================================
   4. NOTIFICAÇÕES TOAST MODERNAS
======================================================= */
function showToast(type = "info", title = "", message = "", duration = 4500) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.classList.add("toast", `toast-${type}`);

    const icons = {
        success: "fa-solid fa-circle-check",
        error: "fa-solid fa-circle-xmark",
        warning: "fa-solid fa-triangle-exclamation",
        info: "fa-solid fa-circle-info"
    };

    toast.innerHTML = `
        <i class="toast-icon ${icons[type] || icons.info}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Fechar">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    const progress = toast.querySelector(".toast-progress");
    if (progress) {
        progress.style.transition = `width ${duration}ms linear`;
        requestAnimationFrame(() => {
            progress.style.width = "0%";
        });
    }

    let timeoutId;

    function removeToast() {
        clearTimeout(timeoutId);
        toast.classList.remove("show");
        toast.classList.add("hide");
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 350);
    }

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", removeToast);
    }

    timeoutId = setTimeout(removeToast, duration);
}

/* =======================================================
   5. SELETOR DE IDIOMA COM TRANSIÇÃO DESLIZANTE
======================================================= */
function initLanguageSwitcher() {
    const langSwitch = document.querySelector(".lang-switch");
    if (!langSwitch) return;

    const slider = langSwitch.querySelector(".lang-slider");
    const buttons = Array.from(langSwitch.querySelectorAll(".lang-btn"));
    let activeBtn = langSwitch.querySelector(".lang-btn.active") || buttons[0];

    function updateSliderPosition(targetBtn, animate = true) {
        if (!slider || !targetBtn) return;

        if (!animate) {
            slider.style.transition = "none";
        } else {
            slider.style.transition = "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
        }

        const left = targetBtn.offsetLeft;
        const top = targetBtn.offsetTop;
        const width = targetBtn.offsetWidth;
        const height = targetBtn.offsetHeight;

        slider.style.left = `${left}px`;
        slider.style.top = `${top}px`;
        slider.style.width = `${width}px`;
        slider.style.height = `${height}px`;

        if (!animate) {
            slider.offsetHeight; // Força reflow
            slider.style.transition = "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1), height 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
        }
    }

    const switchFrom = sessionStorage.getItem("lang_switch_from");
    if (switchFrom) {
        sessionStorage.removeItem("lang_switch_from");
        const prevBtn = buttons.find(b => b.getAttribute("data-lang") === switchFrom);
        if (prevBtn && prevBtn !== activeBtn) {
            updateSliderPosition(prevBtn, false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateSliderPosition(activeBtn, true);
                });
            });
        } else {
            updateSliderPosition(activeBtn, false);
        }
    } else {
        updateSliderPosition(activeBtn, false);
    }

    buttons.forEach(btn => {
        btn.addEventListener("click", function (e) {
            if (btn.classList.contains("active")) {
                e.preventDefault();
                return;
            }

            const href = btn.getAttribute("href");
            if (!href) return;

            e.preventDefault();

            const currentLang = activeBtn ? activeBtn.getAttribute("data-lang") : "";
            if (currentLang) {
                sessionStorage.setItem("lang_switch_from", currentLang);
            }

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeBtn = btn;

            updateSliderPosition(btn, true);

            setTimeout(() => {
                window.location.href = href;
            }, 320);
        });
    });

    window.addEventListener("resize", () => {
        const current = langSwitch.querySelector(".lang-btn.active");
        if (current) updateSliderPosition(current, false);
    });

    if (document.fonts) {
        document.fonts.ready.then(() => {
            const current = langSwitch.querySelector(".lang-btn.active");
            if (current) updateSliderPosition(current, false);
        });
    }
}

/* =======================================================
   6. TOAST DISCRETO DE BOAS-VINDAS POR HORÁRIO
======================================================= */
function initWelcomeToast(isEnglish) {
    // Exibe apenas 1 vez por sessão para não ser repetitivo ou invasivo
    if (sessionStorage.getItem("welcome_toast_shown")) return;
    sessionStorage.setItem("welcome_toast_shown", "true");

    const hour = new Date().getHours();
    let greeting = "";

    if (isEnglish) {
        if (hour >= 5 && hour < 12) {
            greeting = "Good morning! ☀️";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon! 🌤️";
        } else {
            greeting = "Good evening! 🌙";
        }

        setTimeout(() => {
            showToast(
                "info",
                `${greeting} Welcome!`,
                "Thanks for visiting my portfolio. Feel free to explore my projects!",
                5000
            );
        }, 800);
    } else {
        if (hour >= 5 && hour < 12) {
            greeting = "Bom dia! ☀️";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Boa tarde! 🌤️";
        } else {
            greeting = "Boa noite! 🌙";
        }

        setTimeout(() => {
            showToast(
                "info",
                `${greeting} Seja bem-vindo(a)!`,
                "Obrigado por visitar meu portfólio. Fique à vontade para explorar meus projetos e experiências.",
                5000
            );
        }, 800);
    }
}

/* =======================================================
   7. ESTRELAS CINTILANTES SUTIS (BACKGROUND STARS)
======================================================= */
function initStarfield() {
    const starsContainer = document.getElementById("stars-container");
    if (!starsContainer) return;

    const count = window.innerWidth < 768 ? 45 : 85;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
        const star = document.createElement("div");
        star.classList.add("star");

        const rand = Math.random();
        let size = 1.5;
        if (rand > 0.88) {
            size = 3;
        } else if (rand > 0.6) {
            size = 2;
        }

        const x = (Math.random() * 100).toFixed(2);
        const y = (Math.random() * 100).toFixed(2);
        const duration = (3 + Math.random() * 4).toFixed(2);
        const delay = (Math.random() * 5).toFixed(2);
        const maxOpacity = (0.25 + Math.random() * 0.55).toFixed(2);

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty("--max-opacity", maxOpacity);
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        if (i % 7 === 0) {
            star.classList.add("star-emerald");
        }

        fragment.appendChild(star);
    }

    starsContainer.innerHTML = "";
    starsContainer.appendChild(fragment);
}

