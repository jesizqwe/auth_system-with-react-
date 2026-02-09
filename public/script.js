const App = {
    currentUser: null,

    init() {
        this.checkSession()
        this.bindEvents()
        
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('verified') === 'true') {
            this.showSuccess('Email успешно подтвержден! Теперь войдите.')
            window.history.replaceState({}, document.title, "index.html")
        }
    },

    checkSession() {
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser)
            window.location.href = '/dashboard.html';
        } else {
            this.showLogin()
        }
    },

    async login(email, password) {
        const res = await fetch(`/api/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        return data
    },

    async register(name, email, password) {
        const res = await fetch(`/api/user`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password})
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        return data
    },

    showLogin() { this.switchView('view-login') },
    showRegister() { this.switchView('view-register') },

    async logout() {
        try {
            await fetch(`/api/logout`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: this.currentUser.id })
            })
        } catch (e) {
            console.error(e)
        } finally {
            this.currentUser = null
            localStorage.removeItem('currentUser')
            document.getElementById('nav-auth-controls').classList.add('d-none')
            this.showLogin()
            this.showInfo('Вы вышли из системы.')
        }
    },

    bindEvents() {
        document.getElementById('link-to-register').onclick = () => this.showRegister()
        document.getElementById('link-to-login').onclick = () => this.showLogin()
        document.getElementById('btn-logout').onclick = () => this.logout()

        document.getElementById('form-login').onsubmit = async (e) => {
            e.preventDefault()
            try {
                const email = document.getElementById('login-email').value
                const pass = document.getElementById('login-password').value
                this.currentUser = await this.login(email, pass)
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
                window.location.href = '/dashboard.html';
            } catch(err) { this.showError(err.message) }
        }

        document.getElementById('form-register').onsubmit = async (e) => {
            e.preventDefault()
            const btn = e.target.querySelector('button[type="submit"]')
            const originalText = btn.innerText
            try {
                btn.disabled = true
                btn.innerText = 'Отправка...'
                const name = document.getElementById('reg-name').value
                const email = document.getElementById('reg-email').value
                const pass = document.getElementById('reg-password').value

                await this.register(name, email, pass)
                this.showSuccess('Регистрация успешна! Проверьте почту.')
                this.showLogin()
            } catch(err) {
                this.showError(err.message)
            } finally {
                btn.disabled = false
                btn.innerText = originalText
            }
        }
    },

    showSuccess(msg) { this.toast('Успешно', msg, 'text-bg-success') },
    showError(msg) { this.toast('Ошибка', msg, 'text-bg-danger') },
    showInfo(msg) { this.toast('Информация', msg, 'text-bg-primary') },
    
    toast(title, msg, bgClass) {
        const container = document.getElementById('toast-container')
        const el = document.createElement('div')
        el.className = `toast align-items-center ${bgClass} border-0 show`
        el.innerHTML = `
            <div class="d-flex"><div class="toast-body"><strong>${title}:</strong> ${msg}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button></div>
        `
        container.appendChild(el)
        setTimeout(() => el.remove(), 4000)
    }
}

document.addEventListener('DOMContentLoaded', () => App.init())