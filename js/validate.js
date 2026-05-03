// lab 3 — клієнтська валідація форм
// 1) blur на полях логіну / пароля → перевірка формату
// 2) submit → порівняння з hardcoded credentials, динамічне повідомлення без reload
// також: blur-валідація на формі додавання рослини (herbarium.html)

(function () {
    'use strict';

    // ===== hardcoded credentials =====
    const VALID_USERS = [
        { username: 'admin', password: 'plant1234' },
        { username: 'user', password: 'green2026' }
    ];

    // ===== utils =====
    function showFieldError(input, message) {
        const errorEl = document.querySelector('[data-error-for="' + input.id + '"]');
        if (errorEl) {
            errorEl.textContent = message;
        }
        input.classList.toggle('invalid', Boolean(message));
        input.classList.toggle('valid', !message && input.value.length > 0);
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function setFormMessage(el, text, kind) {
        if (!el) return;
        el.textContent = text;
        el.className = 'form-message ' + (kind || '');
    }

    // ===== validators =====
    function validateUsername(value) {
        const v = value.trim();
        if (v.length === 0) return 'логін не може бути порожнім';
        if (v.length < 3) return 'мінімум 3 символи';
        if (v.length > 20) return 'максимум 20 символів';
        if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'тільки латиниця, цифри, підкреслення';
        return '';
    }

    function validatePassword(value) {
        if (value.length === 0) return 'пароль не може бути порожнім';
        if (value.length < 6) return 'мінімум 6 символів';
        return '';
    }

    function validateNicknameField(value) {
        const v = value.trim();
        if (v.length === 0) return 'введіть назву рослини';
        if (v.length < 2) return 'мінімум 2 символи';
        if (v.length > 30) return 'максимум 30 символів';
        return '';
    }

    // ===== login form =====
    function initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        const username = form.querySelector('#username');
        const password = form.querySelector('#password');
        const message = document.getElementById('formMessage');

        // подія 1: blur — перевірка формату при втраті фокусу
        username.addEventListener('blur', function () {
            showFieldError(username, validateUsername(username.value));
        });

        password.addEventListener('blur', function () {
            showFieldError(password, validatePassword(password.value));
        });

        // очищення помилки під час набору
        username.addEventListener('input', function () {
            if (username.classList.contains('invalid')) {
                showFieldError(username, validateUsername(username.value));
            }
        });
        password.addEventListener('input', function () {
            if (password.classList.contains('invalid')) {
                showFieldError(password, validatePassword(password.value));
            }
        });

        // подія 2: submit — порівняння з hardcoded
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const userErr = validateUsername(username.value);
            const passErr = validatePassword(password.value);
            showFieldError(username, userErr);
            showFieldError(password, passErr);

            if (userErr || passErr) {
                setFormMessage(message, 'виправ помилки у формі', 'error');
                return;
            }

            const matched = VALID_USERS.find(function (u) {
                return u.username === username.value.trim() && u.password === password.value;
            });

            if (matched) {
                setFormMessage(message, 'вітаємо, ' + matched.username + '! вхід успішний.', 'success');
                form.reset();
                username.classList.remove('valid');
                password.classList.remove('valid');
            } else {
                setFormMessage(message, 'невірний логін або пароль', 'error');
            }
        });
    }

    // ===== herbarium form (другий приклад blur-валідації на іншій сторінці) =====
    function initHerbariumForm() {
        const form = document.querySelector('.plant-form');
        if (!form) return;

        const nickname = form.querySelector('input[name="nickname"]');
        const species = form.querySelector('select[name="species"]');

        if (nickname) {
            // прокидаємо id для showFieldError
            nickname.id = nickname.id || 'nickname';
            // створюємо контейнер під помилку якщо немає
            if (!form.querySelector('[data-error-for="' + nickname.id + '"]')) {
                const span = document.createElement('span');
                span.className = 'field-error';
                span.setAttribute('data-error-for', nickname.id);
                nickname.insertAdjacentElement('afterend', span);
            }

            nickname.addEventListener('blur', function () {
                showFieldError(nickname, validateNicknameField(nickname.value));
            });
        }

        if (species) {
            species.id = species.id || 'species';
            if (!form.querySelector('[data-error-for="' + species.id + '"]')) {
                const span = document.createElement('span');
                span.className = 'field-error';
                span.setAttribute('data-error-for', species.id);
                species.insertAdjacentElement('afterend', span);
            }

            species.addEventListener('blur', function () {
                const err = species.value ? '' : 'оберіть вид рослини';
                showFieldError(species, err);
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            let hasError = false;
            if (nickname) {
                const err = validateNicknameField(nickname.value);
                showFieldError(nickname, err);
                if (err) hasError = true;
            }
            if (species && !species.value) {
                showFieldError(species, 'оберіть вид рослини');
                hasError = true;
            }

            // повідомлення в кінці форми
            let msg = form.querySelector('.form-message');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'form-message';
                msg.setAttribute('role', 'status');
                msg.setAttribute('aria-live', 'polite');
                form.appendChild(msg);
            }

            if (hasError) {
                setFormMessage(msg, 'виправ помилки у формі', 'error');
            } else {
                setFormMessage(msg, 'рослину додано до гербарію!', 'success');
                form.reset();
            }
        });
    }

    // ===== bootstrap =====
    document.addEventListener('DOMContentLoaded', function () {
        initLoginForm();
        initHerbariumForm();
    });
})();
