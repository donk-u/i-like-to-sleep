// 🎬 页面加载完成
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}

// 图片加载检测
function waitForImages() {
    const images = document.querySelectorAll('img');
    let loadedCount = 0;
    const totalImages = images.length;
    
    if (totalImages === 0) {
        return Promise.resolve();
    }
    
    return new Promise((resolve) => {
        let resolved = false;
        
        images.forEach((img) => {
            if (img.complete && img.naturalHeight !== 0) {
                loadedCount++;
            } else {
                img.addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === totalImages && !resolved) {
                        resolved = true;
                        resolve();
                    }
                });
                img.addEventListener('error', () => {
                    loadedCount++;
                    if (loadedCount === totalImages && !resolved) {
                        resolved = true;
                        resolve();
                    }
                });
            }
        });
        
        // 如果所有图片都已加载完成
        if (loadedCount === totalImages && !resolved) {
            resolved = true;
            resolve();
        }
        
        // 超时保护：3秒后无论如何都继续
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                resolve();
            }
        }, 3000);
    });
}

// 使用多种方式确保加载动画消失
window.addEventListener('load', async () => {
    await waitForImages();
    setTimeout(hideLoader, 500);
    initAll();
});

// 如果load事件未触发，使用DOMContentLoaded作为备选
document.addEventListener('DOMContentLoaded', async () => {
    // 设置超时，确保即使资源加载失败也会隐藏加载动画
    setTimeout(async () => {
        await waitForImages();
        hideLoader();
        initAll();
    }, 2000);
});

function initAll() {
    try {
        initTypewriter();
        initScrollAnimations();
        initMobileMenu();
        initProfileInteraction();
        initStatsCounter();
        initCTAButton();
        initSleepSliders();
    } catch (error) {
        console.error('初始化错误:', error);
        // 即使出错也隐藏加载动画
        hideLoader();
    }
}

// 🎯 CTA按钮功能
function initCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

// 😴 睡眠滑块实时更新
function initSleepSliders() {
    const durationSlider = document.getElementById('sleepDuration');
    const qualitySlider = document.getElementById('sleepQuality');
    const durationValue = document.getElementById('durationValue');
    const qualityValue = document.getElementById('qualityValue');
    
    if (durationSlider && durationValue) {
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value}h`;
        });
    }
    
    if (qualitySlider && qualityValue) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });
    }
}

// ✍️ 打字机效果
function initTypewriter() {
    const subtitle = "睡眠工程师 · 梦境架构师";
    const subtitleElement = document.getElementById('subtitle');
    if (!subtitleElement) return;
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < subtitle.length) {
            subtitleElement.textContent += subtitle[i];
            i++;
        } else {
            clearInterval(timer);
        }
    }, 80);
}

// 📈 数字滚动动画
function initStatsCounter() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.getAttribute('data-target');
                animateNumber(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

// ✅ 弹性缓动函数
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function animateNumber(element, target) {
    const suffix = target === 7300 ? '+' : target === 20 ? '+' : '';
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        
        const current = target * eased;
        element.textContent = Math.floor(current) + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = target + suffix;
        }
    };
    
    requestAnimationFrame(animate);
}

// 🔄 滚动动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.stat-item, .service-item, .portfolio-item').forEach(el => {
        observer.observe(el);
    });
}

// 📱 移动端菜单
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    
    btn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });
}

// 🖱️ 头像交互
function initProfileInteraction() {
    const profileImg = document.getElementById('profileImg');
    if (!profileImg) return;
    
    // 检查图片是否加载成功
    if (profileImg.complete && profileImg.naturalHeight !== 0) {
        setupProfileInteraction(profileImg);
    } else {
        // 等待图片加载
        profileImg.addEventListener('load', () => {
            setupProfileInteraction(profileImg);
        });
        
        // 如果图片加载失败，设置超时处理
        profileImg.addEventListener('error', () => {
            console.warn('头像图片加载失败，跳过交互效果');
            // 可以在这里设置一个默认占位符
            if (profileImg.style.display === 'none') {
                profileImg.parentElement.style.display = 'none';
            }
        });
        
        // 超时保护：5秒后如果还没加载完成，就跳过交互设置
        setTimeout(() => {
            if (profileImg.complete && profileImg.naturalHeight !== 0) {
                setupProfileInteraction(profileImg);
            }
        }, 5000);
    }
}

function setupProfileInteraction(profileImg) {
    if (!profileImg || profileImg.style.display === 'none') return;
    
    profileImg.addEventListener('click', () => {
        profileImg.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => {
            profileImg.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
    });
    
    // 鼠标跟随光效
    document.addEventListener('mousemove', (e) => {
        if (profileImg.style.display === 'none') return;
        
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        const intensity = 0.3 + (x + y) * 0.2;
        
        profileImg.style.boxShadow = `
            ${(x - 0.5) * 20}px ${(y - 0.5) * 20}px 30px rgba(0, 0, 0, 0.5),
            0 0 30px rgba(99, 102, 241, ${intensity})
        `;
    });
}

// 🎯 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 😴 睡眠模式：页面闲置3分钟后进入"睡眠模式"
let sleepTimer;
function resetSleepTimer() {
    clearTimeout(sleepTimer);
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = '<span class="title-line">DEEP SLEEPER</span><span class="title-line highlight">SLEEP ENGINEER</span>';
    }
    document.body.style.filter = '';
    
    sleepTimer = setTimeout(() => {
        document.body.style.filter = 'blur(2px) brightness(0.5)';
        if (heroTitle) {
            heroTitle.innerHTML = '<span class="title-line highlight">Zzz...</span>';
        }
    }, 180000); // 3分钟
}

document.addEventListener('mousemove', resetSleepTimer);
document.addEventListener('keypress', resetSleepTimer);
document.addEventListener('scroll', resetSleepTimer);
resetSleepTimer(); // 初始化

// 📊 睡眠指数显示
function updateSleepIndex() {
    const sleepIndexEl = document.querySelector('.sleep-index');
    if (!sleepIndexEl) return;
    
    const now = new Date();
    const hour = now.getHours();
    let sleepIndex;
    
    if (hour >= 22 || hour <= 6) {
        sleepIndex = "深度睡眠黄金期";
    } else if (hour >= 13 && hour <= 14) {
        sleepIndex = "午休能量补给站";
    } else {
        sleepIndex = "清醒状态";
    }
    
    sleepIndexEl.textContent = `此刻：${sleepIndex}`;
}

// 初始化睡眠指数
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateSleepIndex();
        setInterval(updateSleepIndex, 60000);
    });
} else {
    updateSleepIndex();
    setInterval(updateSleepIndex, 60000);
}

// 🔐 CloudBase登录/注册功能
function initAuth() {
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const phoneLoginForm = document.getElementById('phoneLoginForm');
    const wechatLoginForm = document.getElementById('wechatLoginForm');
    const authTabs = document.querySelectorAll('.auth-tab');
    const modalClose = document.getElementById('modalClose');
    const authModalTitle = document.getElementById('authModalTitle');
    
    // 显示登录模态框
    window.showLoginModal = function() {
        if (authModal) {
            authModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            // 切换到登录表单
            switchAuthTab('login');
        }
    };
    
    // 显示注册模态框
    window.showRegisterModal = function() {
        if (authModal) {
            authModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            // 切换到注册表单
            switchAuthTab('register');
        }
    };
    
    // 隐藏模态框
    function hideAuthModal() {
        if (authModal) {
            authModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
    
    // 切换表单
    function switchAuthTab(tabName) {
        // 更新标签
        authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // 更新表单
        loginForm.classList.toggle('active', tabName === 'login');
        registerForm.classList.toggle('active', tabName === 'register');
        phoneLoginForm.classList.toggle('active', tabName === 'phone-login');
        wechatLoginForm.classList.toggle('active', tabName === 'wechat-login');
        
        // 更新标题
        if (authModalTitle) {
            switch(tabName) {
                case 'login':
                    authModalTitle.textContent = '邮箱登录';
                    break;
                case 'register':
                    authModalTitle.textContent = '注册';
                    break;
                case 'phone-login':
                    authModalTitle.textContent = '手机登录';
                    break;
                case 'wechat-login':
                    authModalTitle.textContent = '微信登录';
                    break;
                default:
                    authModalTitle.textContent = '登录';
            }
        }
        
        // 清空表单错误
        clearFormErrors();
    }
    
    // 清空表单错误
    function clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(error => error.remove());
    }
    
    // 显示表单错误
    function showFormError(input, message) {
        // 移除已存在的错误
        const existingError = input.parentElement.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // 创建新错误元素
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        
        // 添加到输入框后面
        input.parentElement.appendChild(errorElement);
    }
    
    // 表单验证
    function validateLoginForm(formData) {
        if (!formData.email) {
            return { valid: false, field: 'loginEmail', message: '请输入邮箱' };
        }
        
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return { valid: false, field: 'loginEmail', message: '邮箱格式不正确' };
        }
        
        if (!formData.password) {
            return { valid: false, field: 'loginPassword', message: '请输入密码' };
        }
        
        return { valid: true };
    }
    
    function validateRegisterForm(formData) {
        if (!formData.username) {
            return { valid: false, field: 'registerUsername', message: '请输入用户名' };
        }
        
        if (!formData.email) {
            return { valid: false, field: 'registerEmail', message: '请输入邮箱' };
        }
        
        // 简单的邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return { valid: false, field: 'registerEmail', message: '邮箱格式不正确' };
        }
        
        if (!formData.password) {
            return { valid: false, field: 'registerPassword', message: '请输入密码' };
        }
        
        if (formData.password.length < 6) {
            return { valid: false, field: 'registerPassword', message: '密码长度不能少于6个字符' };
        }
        
        if (formData.password !== formData.confirmPassword) {
            return { valid: false, field: 'registerConfirmPassword', message: '两次输入的密码不一致' };
        }
        
        return { valid: true };
    }
    
    // 手机号登录表单验证
    function validatePhoneLoginForm(formData) {
        if (!formData.phoneNumber) {
            return { valid: false, field: 'phoneNumber', message: '请输入手机号' };
        }
        
        // 简单的手机号格式验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            return { valid: false, field: 'phoneNumber', message: '手机号格式不正确' };
        }
        
        if (!formData.verificationCode) {
            return { valid: false, field: 'verificationCode', message: '请输入验证码' };
        }
        
        // 验证码格式验证
        const codeRegex = /^\d{6}$/;
        if (!codeRegex.test(formData.verificationCode)) {
            return { valid: false, field: 'verificationCode', message: '验证码格式不正确' };
        }
        
        return { valid: true };
    }
    
    // 发送验证码函数
    window.sendVerificationCode = async function() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const phoneInput = document.getElementById('phoneNumber');
        const sendBtn = document.querySelector('.send-code-btn');
        
        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            showFormError(phoneInput, '手机号格式不正确');
            return;
        }
        
        try {
            // 调用API发送验证码
            const result = await API.sendVerificationCode(phoneNumber);
            
            if (result.success) {
                // 显示倒计时
                let countdown = 60;
                sendBtn.disabled = true;
                sendBtn.textContent = `${countdown}秒后重发`;
                
                const timer = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(timer);
                        sendBtn.disabled = false;
                        sendBtn.textContent = '发送验证码';
                    } else {
                        sendBtn.textContent = `${countdown}秒后重发`;
                    }
                }, 1000);
                
                API.showSuccess('验证码发送成功');
            } else {
                showFormError(phoneInput, result.error || '发送验证码失败');
            }
        } catch (error) {
            console.error('发送验证码失败:', error);
            showFormError(phoneInput, '发送验证码失败，请稍后重试');
        }
    };
    
    // 微信登录函数
    window.wechatLogin = async function() {
        try {
            // 直接调用API微信登录
            const result = await API.wechatLogin();
            
            if (result.success) {
                hideAuthModal();
                window.location.reload();
            } else {
                API.showError(result.message || '微信登录失败');
            }
        } catch (error) {
            console.error('微信登录失败:', error);
            API.showError('微信登录失败，请稍后重试');
        }
    };
    
    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const formData = { email, password };
            
            // 验证表单
            const validation = validateLoginForm(formData);
            if (!validation.valid) {
                const input = document.getElementById(validation.field);
                showFormError(input, validation.message);
                return;
            }
            
            try {
                // 调用API登录
                const result = await API.login(formData);
                
                if (result.success) {
                    hideAuthModal();
                    window.location.reload(); // 刷新页面，更新登录状态
                } else {
                    showFormError(document.getElementById('loginPassword'), result.message || '登录失败，请检查邮箱和密码');
                }
            } catch (error) {
                console.error('登录失败:', error);
                showFormError(document.getElementById('loginPassword'), '登录失败，请稍后重试');
            }
        });
    }
    
    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();
            
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            const formData = { username, email, password, confirmPassword };
            
            // 验证表单
            const validation = validateRegisterForm(formData);
            if (!validation.valid) {
                const input = document.getElementById(validation.field);
                showFormError(input, validation.message);
                return;
            }
            
            try {
                // 调用API注册
                const result = await API.register({ username, email, password });
                
                if (result.success) {
                    hideAuthModal();
                    window.location.reload(); // 刷新页面，更新登录状态
                } else {
                    showFormError(document.getElementById('registerEmail'), result.message || '注册失败，请稍后重试');
                }
            } catch (error) {
                console.error('注册失败:', error);
                showFormError(document.getElementById('registerEmail'), '注册失败，请稍后重试');
            }
        });
    }
    
    // 手机号登录表单提交
    if (phoneLoginForm) {
        phoneLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFormErrors();
            
            const phoneNumber = document.getElementById('phoneNumber').value;
            const verificationCode = document.getElementById('verificationCode').value;
            
            const formData = { phoneNumber, verificationCode };
            
            // 验证表单
            const validation = validatePhoneLoginForm(formData);
            if (!validation.valid) {
                const input = document.getElementById(validation.field);
                showFormError(input, validation.message);
                return;
            }
            
            try {
                // 调用API手机登录
                const result = await API.phoneLogin(phoneNumber, verificationCode);
                
                if (result.success) {
                    hideAuthModal();
                    window.location.reload(); // 刷新页面，更新登录状态
                } else {
                    showFormError(document.getElementById('verificationCode'), result.message || '登录失败，请检查验证码');
                }
            } catch (error) {
                console.error('手机号登录失败:', error);
                showFormError(document.getElementById('verificationCode'), '登录失败，请稍后重试');
            }
        });
    }
    
    // 标签切换事件
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchAuthTab(tab.dataset.tab);
        });
    });
    
    // 关闭模态框事件
    if (modalClose) {
        modalClose.addEventListener('click', hideAuthModal);
    }
    
    // 点击模态框外部关闭
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                hideAuthModal();
            }
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideAuthModal();
        }
    });
    
    // 初始化
    hideAuthModal();
    
    // 检查登录状态 - 页面加载时自动检查
    checkLoginStatusOnLoad();
}

// 页面加载时检查登录状态
async function checkLoginStatusOnLoad() {
    if (API.isLoggedIn()) {
        try {
            // 验证token是否有效，并刷新用户信息
            const user = await API.refreshUserInfo();
            if (user) {
                // 用户已登录且token有效，更新UI
                updateLoginStatus();
                console.log('✅ 用户已登录:', user);
            } else {
                // token无效，清除登录状态
                API.logout();
                console.log('⚠️ Token已失效，请重新登录');
            }
        } catch (error) {
            console.error('检查登录状态失败:', error);
            // 如果验证失败，清除登录状态
            API.logout();
        }
    }
}

// 更新登录状态UI
function updateLoginStatus() {
    const user = API.getUser();
    const isLoggedIn = API.isLoggedIn();
    
    if (isLoggedIn && user) {
        // 更新导航栏显示
        const navLoginBtn = document.querySelector('.nav-login-btn');
        const navRegisterItem = document.querySelector('.nav-register-item');
        
        if (navLoginBtn) {
            navLoginBtn.textContent = user.username || user.email || '已登录';
            navLoginBtn.onclick = () => {
                // 显示用户菜单或退出登录
                if (window.interactions && window.interactions.showUserMenu) {
                    window.interactions.showUserMenu();
                }
            };
        }
        
        if (navRegisterItem) {
            navRegisterItem.style.display = 'none';
        }
        
        // 更新留言板权限显示
        if (window.interactions && window.interactions.updateGuestbookPermission) {
            window.interactions.updateGuestbookPermission(isLoggedIn, user);
        }
        
        // 更新留言板表单显示
        const guestbookForm = document.getElementById('guestbookForm');
        const guestbookAuthRequired = document.getElementById('guestbookAuthRequired');
        
        if (guestbookForm && guestbookAuthRequired) {
            // 检查是否为微信或手机号登录
            if (user.phoneNumber || user.openid) {
                guestbookForm.style.display = 'block';
                guestbookAuthRequired.style.display = 'none';
                
                // 更新用户信息显示
                const userInfoDisplay = document.getElementById('userInfoDisplay');
                const userName = document.getElementById('userName');
                const loginMethod = document.getElementById('loginMethod');
                
                if (userName) {
                    userName.textContent = user.username || user.email || '用户';
                }
                if (loginMethod) {
                    loginMethod.textContent = user.phoneNumber ? '📱 手机号登录' : '💬 微信登录';
                }
            } else {
                guestbookForm.style.display = 'none';
                guestbookAuthRequired.style.display = 'block';
            }
        }
    } else {
        // 未登录状态
        const navLoginBtn = document.querySelector('.nav-login-btn');
        const navRegisterItem = document.querySelector('.nav-register-item');
        
        if (navLoginBtn) {
            navLoginBtn.textContent = '登录';
            navLoginBtn.onclick = () => showLoginModal();
        }
        
        if (navRegisterItem) {
            navRegisterItem.style.display = 'block';
        }
        
        // 隐藏留言板表单
        const guestbookForm = document.getElementById('guestbookForm');
        const guestbookAuthRequired = document.getElementById('guestbookAuthRequired');
        
        if (guestbookForm) {
            guestbookForm.style.display = 'none';
        }
        if (guestbookAuthRequired) {
            guestbookAuthRequired.style.display = 'block';
        }
    }
}

// 退出登录函数
window.logout = async function() {
    try {
        await API.logout();
        updateLoginStatus();
        window.location.reload();
    } catch (error) {
        console.error('退出登录失败:', error);
        // 即使API调用失败，也清除本地状态
        API.removeToken();
        API.removeUser();
        updateLoginStatus();
        window.location.reload();
    }
};

// 在页面加载完成后初始化认证功能
document.addEventListener('DOMContentLoaded', initAuth);

// 在initAll函数中添加认证初始化
function initAll() {
    try {
        initTypewriter();
        initScrollAnimations();
        initMobileMenu();
        initProfileInteraction();
        initStatsCounter();
        initCTAButton();
        initSleepSliders();
        initAuth(); // 添加认证初始化
    } catch (error) {
        console.error('初始化错误:', error);
        // 即使出错也隐藏加载动画
        hideLoader();
    }
}