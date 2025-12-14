// 🎯 前端交互功能 - 连接后端API

class FrontendInteractions {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // 初始化用户状态显示
            this.initUserStatus();
            await this.testBackendConnection();
            this.initGuestbook();
            this.initSleepTracker();
            this.initProjectInteractions();
            this.initContactForm();
            this.initMobileMenu();
            console.log('✅ 前端交互功能初始化完成');
        } catch (error) {
            console.error('❌ 前端交互初始化失败:', error);
        }
    }

    // 👤 初始化用户状态
    initUserStatus() {
        this.updateUserUI();
        // 定期刷新用户状态
        setInterval(() => {
            this.updateUserUI();
        }, 30000); // 每30秒检查一次
    }

    // 🔄 更新用户界面状态
    updateUserUI() {
        const isLoggedIn = API.isLoggedIn();
        const user = API.getUser();
        
        // 更新导航栏登录按钮
        const navLoginBtn = document.querySelector('.nav-login-btn');
        const navRegisterBtn = document.querySelector('.nav-register-item');
        
        if (isLoggedIn && user) {
            if (navLoginBtn) {
                navLoginBtn.textContent = user.username || user.email || '已登录';
                navLoginBtn.onclick = () => this.showUserMenu();
            }
            if (navRegisterBtn) {
                navRegisterBtn.style.display = 'none';
            }
        } else {
            if (navLoginBtn) {
                navLoginBtn.textContent = '登录';
                navLoginBtn.onclick = () => showLoginModal();
            }
            if (navRegisterBtn) {
                navRegisterBtn.style.display = 'block';
            }
        }
        
        // 更新留言板权限提示
        this.updateGuestbookPermission(isLoggedIn, user);
    }

    // 👤 显示用户菜单
    showUserMenu() {
        const user = API.getUser();
        if (!user) return;
        
        this.showModal('用户中心', `
            <div style="color: white;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                        👤
                    </div>
                    <h3 style="margin: 0;">${user.username || '用户'}</h3>
                    <p style="margin: 4px 0; opacity: 0.8;">${user.email}</p>
                    ${user.phoneNumber ? `<p style="margin: 4px 0; opacity: 0.8;">📱 ${user.phoneNumber}</p>` : ''}
                    ${user.openid ? '<p style="margin: 4px 0; opacity: 0.8;">💬 微信登录</p>' : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="form-button" onclick="interactions.viewSleepStats()" style="background: rgba(255,255,255,0.2);">
                        查看睡眠统计
                    </button>
                    <button class="form-button" onclick="API.logout().then(() => window.location.reload())" style="background: rgba(239,68,68,0.2);">
                        退出登录
                    </button>
                    <button class="form-button" onclick="interactions.closeModal()" style="background: rgba(255,255,255,0.1);">
                        关闭
                    </button>
                </div>
            </div>
        `);
    }

    // 📊 查看睡眠统计
    async viewSleepStats() {
        this.closeModal();
        // 滚动到睡眠记录区域
        const sleepSection = document.getElementById('contact');
        if (sleepSection) {
            sleepSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 🌐 测试后端连接
    async testBackendConnection() {
        try {
            await API.healthCheck();
            console.log('🎉 后端连接正常');
        } catch (error) {
            console.warn('⚠️ 后端连接失败，使用本地模式');
            API.showError('后端服务未启动，数据将保存在本地');
        }
    }

    // 💬 留言板功能
    initGuestbook() {
        const form = document.getElementById('guestbookForm');
        if (!form) return;

        // 表单提交前权限检查
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 检查用户登录状态和权限
            if (!this.checkGuestbookPermission()) {
                return;
            }
            
            const submitBtn = form.querySelector('.form-button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>提交中...</span><span>⏳</span>';

            try {
                const user = API.getUser();
                const content = document.getElementById('guestMessage').value.trim();

                const result = await API.submitGuestbook(content);
                form.reset();
                await this.loadGuestbookMessages();
                
                if (result.success) {
                    API.showSuccess('留言提交成功！审核通过后会显示。');
                }

            } catch (error) {
                console.error('留言提交失败:', error);
                API.showError('留言提交失败，请稍后重试');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>提交留言</span><span>📝</span>';
            }
        });

        // 加载现有留言
        this.loadGuestbookMessages();
    }

    // 🔐 检查留言板权限
    checkGuestbookPermission() {
        const isLoggedIn = API.isLoggedIn();
        const user = API.getUser();
        
        if (!isLoggedIn || !user) {
            this.showLoginPrompt();
            return false;
        }
        
        // 检查是否为微信或手机号登录用户
        const loginMethod = user.loginMethod || '';
        if (loginMethod !== 'phone' && loginMethod !== 'wechat' && !user.phoneNumber && !user.openid) {
            API.showError('只有微信或手机号登录用户才能留言，请使用手机号或微信登录');
            return false;
        }
        
        return true;
    }

    // 🔑 显示登录提示
    showLoginPrompt() {
        this.showModal('需要登录', `
            <div style="color: white; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
                <h3 style="margin-bottom: 16px;">需要登录才能留言</h3>
                <p style="margin-bottom: 24px; opacity: 0.9;">留言功能仅对微信或手机号登录用户开放</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="form-button" onclick="interactions.closeModal(); showLoginModal(); switchAuthTab('phone-login');" style="flex: 1;">
                        手机号登录
                    </button>
                    <button class="form-button" onclick="interactions.closeModal(); showLoginModal(); switchAuthTab('wechat-login');" style="flex: 1; background: rgba(255,255,255,0.2);">
                        微信登录
                    </button>
                </div>
                <div style="margin-top: 16px;">
                    <button class="form-button" onclick="interactions.closeModal()" style="background: rgba(255,255,255,0.1);">
                        取消
                    </button>
                </div>
            </div>
        `);
    }

    // 📋 更新留言板权限提示
    updateGuestbookPermission(isLoggedIn, user) {
        const guestbookForm = document.getElementById('guestbookForm');
        const guestbookContainer = document.getElementById('guestbookMessages');
        
        if (!guestbookForm) return;
        
        if (!isLoggedIn) {
            // 未登录用户提示
            const permissionTip = document.getElementById('guestbookPermissionTip');
            if (!permissionTip) {
                const tip = document.createElement('div');
                tip.id = 'guestbookPermissionTip';
                tip.className = 'permission-tip';
                tip.innerHTML = `
                    <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;">
                        <p style="margin: 0; color: #ffc107;">🔒 需要微信或手机号登录才能留言</p>
                        <button class="form-button" onclick="showLoginModal(); switchAuthTab('phone-login');" style="margin-top: 8px; background: rgba(255,193,7,0.2); border-color: #ffc107;">
                            立即登录
                        </button>
                    </div>
                `;
                guestbookForm.parentNode.insertBefore(tip, guestbookForm);
            }
            guestbookForm.style.display = 'none';
        } else if (user && !user.phoneNumber && !user.openid) {
            // 邮箱登录用户提示
            const permissionTip = document.getElementById('guestbookPermissionTip');
            if (!permissionTip) {
                const tip = document.createElement('div');
                tip.id = 'guestbookPermissionTip';
                tip.className = 'permission-tip';
                tip.innerHTML = `
                    <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;">
                        <p style="margin: 0; color: #ffc107;">📱 留言功能仅对微信或手机号登录用户开放</p>
                        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">当前为邮箱登录，请使用手机号或微信登录</p>
                    </div>
                `;
                guestbookForm.parentNode.insertBefore(tip, guestbookForm);
            }
            guestbookForm.style.display = 'none';
        } else {
            // 有权限用户
            const permissionTip = document.getElementById('guestbookPermissionTip');
            if (permissionTip) {
                permissionTip.remove();
            }
            guestbookForm.style.display = 'block';
        }
    }

    // 📋 加载留言列表
    async loadGuestbookMessages() {
        try {
            const response = await API.getGuestbook();
            const messagesContainer = document.getElementById('guestbookMessages');
            
            if (!messagesContainer) return;

            if (response.success && response.data && response.data.length > 0) {
                const user = API.getUser();
                const isLoggedIn = API.isLoggedIn();
                
                messagesContainer.innerHTML = response.data.map(msg => {
                    // 处理回复列表
                    const repliesHtml = msg.replies && msg.replies.length > 0 ? `
                        <div class="replies-list" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                            ${msg.replies.map(reply => `
                                <div class="reply-item" style="margin-bottom: 12px; padding-left: 20px; border-left: 2px solid rgba(102, 126, 234, 0.5);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <strong style="color: #667eea; font-size: 14px;">${this.escapeHtml(reply.name)}</strong>
                                        <span style="color: rgba(255,255,255,0.6); font-size: 12px;">${new Date(reply.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">${this.escapeHtml(reply.message)}</p>
                                </div>
                            `).join('')}
                        </div>
                    ` : '';
                    
                    return `
                        <div class="guestbook-message" data-id="${msg.id || ''}">
                            <div class="message-header">
                                <strong class="message-name">${this.escapeHtml(msg.name)}</strong>
                                <span class="message-date">${new Date(msg.timestamp).toLocaleDateString()}</span>
                                ${msg.loginType ? `<span class="login-badge ${msg.loginType}">${msg.loginType === 'phone' ? '📱' : '💬'}</span>` : ''}
                            </div>
                            <p class="message-content">${this.escapeHtml(msg.message)}</p>
                            ${repliesHtml}
                            <div class="message-actions">
                                <button class="reply-btn" onclick="interactions.replyToMessage('${msg.id || ''}', '${this.escapeHtml(msg.name)}')">
                                    💬 回复
                                </button>
                                ${isLoggedIn && user && (user.id === msg.userId) ? `
                                    <button class="delete-btn" onclick="interactions.deleteMessage('${msg.id || ''}')">
                                        🗑️ 删除
                                    </button>
                                ` : ''}
                            </div>
                            <div class="reply-section" id="reply-section-${msg.id || ''}" style="display: none;">
                                <div class="reply-form">
                                    <textarea class="reply-textarea" id="reply-text-${msg.id || ''}" placeholder="写下您的回复..."></textarea>
                                    <div class="reply-actions">
                                        <button class="reply-submit" onclick="interactions.submitReply('${msg.id || ''}')">发送回复</button>
                                        <button class="reply-cancel" onclick="interactions.cancelReply('${msg.id || ''}')">取消</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                messagesContainer.innerHTML = '<p class="no-messages">暂无留言，快来抢沙发吧！</p>';
            }
        } catch (error) {
            const messagesContainer = document.getElementById('guestbookMessages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '<p class="no-messages">留言加载失败，请刷新重试</p>';
            }
        }
    }

    // 😴 睡眠记录功能
    initSleepTracker() {
        const form = document.getElementById('sleepForm');
        const durationSlider = document.getElementById('sleepDuration');
        const qualitySlider = document.getElementById('sleepQuality');
        const durationValue = document.getElementById('durationValue');
        const qualityValue = document.getElementById('qualityValue');
        const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');

        if (!form) return;

        // 滑块实时显示
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value}h`;
        });

        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value;
        });

        // 表单提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.form-button');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>记录中...</span><span>⏳</span>';

            try {
                const sleepData = {
                    duration: parseFloat(durationSlider.value),
                    quality: parseInt(qualitySlider.value),
                    notes: document.getElementById('sleepNotes').value.trim(),
                    userId: 'web_user'
                };

                await API.submitSleepData(sleepData);
                form.reset();
                durationValue.textContent = '7.0h';
                qualityValue.textContent = '7';
                
                // 重新加载统计数据
                await this.loadSleepStats();

            } catch (error) {
                console.error('睡眠记录失败:', error);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>记录睡眠</span><span>💤</span>';
            }
        });

        // AI分析按钮点击事件
        if (aiAnalysisBtn) {
            aiAnalysisBtn.addEventListener('click', async () => {
                aiAnalysisBtn.disabled = true;
                aiAnalysisBtn.innerHTML = '<span>分析中...</span><span>🤖</span>';
                
                try {
                    // 获取当前表单数据
                    const sleepData = {
                        duration: parseFloat(durationSlider.value),
                        quality: parseInt(qualitySlider.value),
                        notes: document.getElementById('sleepNotes').value.trim(),
                        date: new Date().toISOString().split('T')[0]
                    };
                    
                    // 调用AI分析API
                    const result = await API.aiSleepAnalysis(sleepData);
                    
                    if (result.success && result.data) {
                        this.displayAIAnalysisResult(result.data);
                    } else {
                        API.showError('AI分析失败，请稍后重试');
                    }
                } catch (error) {
                    console.error('AI分析失败:', error);
                    API.showError('AI分析失败，请稍后重试');
                } finally {
                    aiAnalysisBtn.disabled = false;
                    aiAnalysisBtn.innerHTML = '<span>AI智能分析</span>';
                }
            });
        }

        // 加载统计数据
        this.loadSleepStats();
    }

    // 显示AI分析结果
    displayAIAnalysisResult(data) {
        const aiAnalysisResult = document.getElementById('aiAnalysisResult');
        if (!aiAnalysisResult) return;
        
        // 更新评分和等级
        this.updateAIScore(data.score, data.grade);
        
        // 更新评价
        this.updateAIEvaluation(data.evaluation);
        
        // 更新洞察
        this.updateAIInsights(data.insights);
        
        // 更新建议
        this.updateAISuggestions(data.suggestions);
        
        // 更新风险评估
        if (data.riskAssessment) {
            this.updateRiskAssessment(data.riskAssessment);
        }
        
        // 更新详细分析
        if (data.detailedAnalysis) {
            this.updateDetailedAnalysis(data.detailedAnalysis);
        }
        
        // 显示结果区域
        aiAnalysisResult.style.display = 'block';
        
        // 滚动到结果区域
        aiAnalysisResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 添加显示动画
        aiAnalysisResult.classList.add('analysis-show');
    }

    // 更新AI评分显示
    updateAIScore(score, grade) {
        const aiScore = document.getElementById('aiScore');
        const aiGrade = document.getElementById('aiGrade');
        
        if (aiScore) {
            aiScore.textContent = score;
        }
        
        if (aiGrade && grade) {
            aiGrade.textContent = `${grade.grade} (${grade.label})`;
            aiGrade.style.color = grade.color;
        }
        
        // 添加评分动画
        if (aiScore) {
            aiScore.style.animation = 'scoreAnimation 1s ease-out';
        }
    }

    // 更新AI评价
    updateAIEvaluation(evaluation) {
        const aiEvaluation = document.getElementById('aiEvaluation');
        if (!aiEvaluation) return;
        
        // 分段显示评价，提高可读性
        const paragraphs = evaluation.split('。').filter(p => p.trim());
        aiEvaluation.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 12px; line-height: 1.6;">${p}。</p>`).join('');
    }

    // 更新AI洞察
    updateAIInsights(insights) {
        const aiInsights = document.getElementById('aiInsights');
        if (!aiInsights) return;
        
        aiInsights.innerHTML = '';
        insights.forEach(insight => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: #667eea;">▸</span> ${insight}`;
            li.style.marginBottom = '8px';
            li.style.lineHeight = '1.5';
            aiInsights.appendChild(li);
        });
    }

    // 更新AI建议
    updateAISuggestions(suggestions) {
        const aiSuggestions = document.getElementById('aiSuggestions');
        if (!aiSuggestions) return;
        
        aiSuggestions.innerHTML = '';
        suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color: #10b981;">✓</span> ${suggestion}`;
            li.style.marginBottom = '12px';
            li.style.lineHeight = '1.5';
            li.style.paddingLeft = '8px';
            aiSuggestions.appendChild(li);
        });
    }

    // 更新风险评估
    updateRiskAssessment(risks) {
        const riskContainer = document.getElementById('riskAssessment');
        if (!riskContainer || !risks || risks.length === 0) {
            if (riskContainer) riskContainer.style.display = 'none';
            return;
        }
        
        riskContainer.style.display = 'block';
        riskContainer.innerHTML = `
            <h4 style="color: #f59e0b; margin-bottom: 12px;">⚠️ 健康风险评估</h4>
            ${risks.map(risk => `
                <div class="risk-item" style="
                    background: ${risk.level === 'high' ? 'rgba(239, 68, 68, 0.1)' : risk.level === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
                    border-left: 4px solid ${risk.level === 'high' ? '#ef4444' : risk.level === 'medium' ? '#f59e0b' : '#10b981'};
                    padding: 12px;
                    margin-bottom: 12px;
                    border-radius: 0 8px 8px 0;
                ">
                    <strong style="color: ${risk.level === 'high' ? '#ef4444' : risk.level === 'medium' ? '#f59e0b' : '#10b981'};">
                        ${risk.type} (${risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中风险' : '低风险'})
                    </strong>
                    <p style="margin: 6px 0; font-size: 14px; line-height: 1.4;">${risk.description}</p>
                    <p style="margin: 6px 0 0 0; font-size: 13px; font-style: italic;">
                        💡 建议: ${risk.recommendation}
                    </p>
                </div>
            `).join('')}
        `;
    }

    // 更新详细分析
    updateDetailedAnalysis(analysis) {
        const detailedContainer = document.getElementById('detailedAnalysis');
        if (!detailedContainer || !analysis) {
            if (detailedContainer) detailedContainer.style.display = 'none';
            return;
        }
        
        detailedContainer.style.display = 'block';
        const { sleepArchitecture, healthImpact } = analysis;
        
        detailedContainer.innerHTML = `
            <h4 style="color: #667eea; margin-bottom: 16px;">📊 深度睡眠分析</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                    <h5 style="color: #a78bfa; margin-bottom: 8px;">睡眠结构</h5>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <div>深睡: ${sleepArchitecture.deepSleep}%</div>
                        <div>浅睡: ${sleepArchitecture.lightSleep}%</div>
                        <div>REM: ${sleepArchitecture.remSleep}%</div>
                        <div>清醒: ${sleepArchitecture.awake}%</div>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                    <h5 style="color: #60a5fa; margin-bottom: 8px;">健康影响</h5>
                    <div style="font-size: 14px; line-height: 1.6;">
                        <div>免疫系统: ${healthImpact.immuneSystem === 'strong' ? '强健' : healthImpact.immuneSystem === 'moderate' ? '中等' : '较弱'}</div>
                        <div>认知功能: ${healthImpact.cognitiveFunction}%</div>
                        <div>情绪调节: ${healthImpact.emotionalRegulation}%</div>
                        <div>身体恢复: ${healthImpact.physicalRecovery}%</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 📊 加载睡眠统计
    async loadSleepStats() {
        try {
            const response = await API.getSleepData();
            
            if (response.success && response.data && response.data.stats) {
                const stats = response.data.stats;
                
                document.getElementById('totalSleeps').textContent = stats.totalSleeps || 0;
                document.getElementById('avgDuration').textContent = stats.averageDuration || 0;
                document.getElementById('avgQuality').textContent = stats.averageQuality || 0;
            }
        } catch (error) {
            console.error('睡眠统计加载失败:', error);
        }
    }

    // 🎨 项目展示功能
    initProjectInteractions() {
        // 为项目卡片添加点击事件
        const projectCards = document.querySelectorAll('.portfolio-item');
        
        projectCards.forEach((card, index) => {
            // 添加悬停效果
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.3s ease';
            
            // 鼠标悬停效果
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });

            // 点击卡片查看详情
            card.addEventListener('click', (e) => {
                // 如果点击的是链接，不阻止默认行为
                if (e.target.tagName === 'A' || e.target.closest('a')) {
                    return;
                }
                e.preventDefault();
                this.viewProjectDetails(index);
            });
        });

        // 加载项目数据
        this.loadProjects();
    }

    // 📋 加载项目数据
    async loadProjects() {
        try {
            const response = await API.getProjects();
            
            if (response.success && response.data) {
                console.log('✅ 项目数据加载成功:', response.data);
                // 这里可以根据后端数据更新项目展示
            }
        } catch (error) {
            console.error('项目数据加载失败:', error);
        }
    }

    // 🔍 查看项目详情
    viewProjectDetails(index) {
        const projects = document.querySelectorAll('.portfolio-item');
        const project = projects[index];
        
        if (!project) return;

        const title = project.querySelector('h3').textContent;
        const description = project.querySelector('p').textContent;
        const tags = Array.from(project.querySelectorAll('.tag')).map(tag => tag.textContent);
        
        // 创建详情弹窗
        this.showModal('项目详情', `
            <div style="color: white;">
                <h3 style="margin-bottom: 16px; font-size: 24px;">${title}</h3>
                <p style="margin-bottom: 16px; line-height: 1.6; opacity: 0.9;">${description}</p>
                <div style="margin-bottom: 20px;">
                    <strong style="display: block; margin-bottom: 8px;">标签：</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${tags.map(tag => `<span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 14px;">${tag}</span>`).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 24px;">
                    <button class="form-button" onclick="interactions.shareProject(${index})" style="flex: 1;">分享项目</button>
                    <button class="form-button" onclick="interactions.closeModal()" style="flex: 1; background: rgba(255,255,255,0.2);">关闭</button>
                </div>
            </div>
        `);
    }

    // 🔗 分享项目
    shareProject(index) {
        const projects = document.querySelectorAll('.portfolio-item');
        const project = projects[index];
        
        if (!project) return;

        const title = project.querySelector('h3').textContent;
        const shareText = `来看看这个超酷的项目：${title}`;
        const shareUrl = window.location.href + '#portfolio';
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: shareText,
                url: shareUrl
            }).catch(err => {
                console.log('分享取消或失败:', err);
            });
        } else {
            // 复制到剪贴板
            const fullText = `${shareText}\n${shareUrl}`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullText).then(() => {
                    API.showSuccess('分享链接已复制到剪贴板！');
                }).catch(() => {
                    this.fallbackCopy(fullText);
                });
            } else {
                this.fallbackCopy(fullText);
            }
        }
    }
    
    // 备用复制方法
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            API.showSuccess('分享链接已复制到剪贴板！');
        } catch (err) {
            API.showError('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }

    // 📱 移动端菜单功能
    initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        if (!btn || !sidebar) return;
        
        // 确保按钮有aria属性
        btn.addEventListener('click', () => {
            const isActive = sidebar.classList.contains('active');
            sidebar.classList.toggle('active');
            btn.setAttribute('aria-expanded', !isActive);
        });
        
        // 点击外部区域关闭菜单
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !btn.contains(e.target)) {
                sidebar.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // 📧 联系表单功能
    initContactForm() {
        const contactLinks = document.querySelectorAll('.contact-link');
        
        contactLinks.forEach(link => {
            // 邮箱链接已经在HTML中绑定了copyEmail函数，这里只处理其他链接
            if (!link.textContent.includes('@')) {
                // GitHub和WeChat链接保持默认行为
                link.addEventListener('click', (e) => {
                    // 如果链接是#，阻止默认行为并显示提示
                    if (link.getAttribute('href') === '#' || link.getAttribute('href') === 'https://github.com/sleeper' || link.getAttribute('href') === 'https://wechat.com/sleeper') {
                        e.preventDefault();
                        this.showModal('联系我', `
                            <div style="color: white;">
                                <p style="margin-bottom: 16px;">您可以通过以下方式联系我：</p>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <a href="mailto:1762079094@qq.com" style="color: white; text-decoration: underline;">📧 邮箱：1762079094@qq.com</a>
                                    <p style="opacity: 0.8;">💬 微信：请通过邮箱联系获取</p>
                                    <p style="opacity: 0.8;">🐙 GitHub：正在建设中...</p>
                                </div>
                                <div style="margin-top: 20px;">
                                    <button class="form-button" onclick="interactions.closeModal()">关闭</button>
                                </div>
                            </div>
                        `);
                    }
                });
            }
        });
    }

    // 📨 处理联系表单提交
    async handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            await API.submitContact(contactData);
            this.closeModal();
            
            // 打开邮件客户端
            window.location.href = `mailto:1762079094@qq.com?subject=${encodeURIComponent('来自网站的联系消息')}&body=${encodeURIComponent(`姓名：${contactData.name}\n邮箱：${contactData.email}\n\n${contactData.message}`)}`;
            
        } catch (error) {
            console.error('联系表单提交失败:', error);
        }
    }

    // 🎭 弹窗功能
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="interactions.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    // 💬 回复留言
    replyToMessage(messageId, authorName) {
        const replySection = document.getElementById(`reply-section-${messageId}`);
        const replyTextarea = document.getElementById(`reply-text-${messageId}`);
        
        if (replySection && replyTextarea) {
            replySection.style.display = replySection.style.display === 'none' ? 'block' : 'none';
            if (replySection.style.display === 'block') {
                replyTextarea.focus();
                replyTextarea.placeholder = `回复 @${authorName}...`;
            }
        }
    }

    // 📝 提交回复
    async submitReply(messageId) {
        const replyTextarea = document.getElementById(`reply-text-${messageId}`);
        if (!replyTextarea || !replyTextarea.value.trim()) {
            API.showError('请输入回复内容');
            return;
        }

        // 检查权限
        if (!this.checkGuestbookPermission()) {
            return;
        }

        try {
            const content = replyTextarea.value.trim();

            // 调用API提交回复
            const result = await API.replyGuestbook(messageId, content);
            
            if (result.success) {
                this.cancelReply(messageId);
                // 重新加载留言
                await this.loadGuestbookMessages();
            } else {
                API.showError(result.error || '回复提交失败，请稍后重试');
            }
            
        } catch (error) {
            console.error('提交回复失败:', error);
            API.showError('回复提交失败，请稍后重试');
        }
    }

    // ❌ 取消回复
    cancelReply(messageId) {
        const replySection = document.getElementById(`reply-section-${messageId}`);
        const replyTextarea = document.getElementById(`reply-text-${messageId}`);
        
        if (replySection && replyTextarea) {
            replySection.style.display = 'none';
            replyTextarea.value = '';
        }
    }

    // 🗑️ 删除留言
    async deleteMessage(messageId) {
        if (!confirm('确定要删除这条留言吗？')) {
            return;
        }

        try {
            const result = await API.deleteGuestbook(messageId);
            if (result.success) {
                API.showSuccess('留言已删除');
                await this.loadGuestbookMessages();
            }
        } catch (error) {
            console.error('删除留言失败:', error);
            API.showError('删除失败，请稍后重试');
        }
    }

    // 🛡️ HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 🎨 添加弹窗样式
const modalStyles = `
    <style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 16px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 24px 0;
        color: white;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 24px;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .modal-body {
        padding: 24px;
        color: white;
    }
    
    .modal-body .form-input,
    .modal-body .form-textarea {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        color: white;
    }
    
    .modal-body .form-input::placeholder,
    .modal-body .form-textarea::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .guestbook-message {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        backdrop-filter: blur(10px);
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .message-name {
        color: #667eea;
        font-weight: 600;
    }
    
    .message-date {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
    }
    
    .message-content {
        margin: 0;
        line-height: 1.5;
    }
    
    .no-messages {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
    }
    .no-messages {
        text-align: center;
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
    }
    
    .login-badge {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.2);
        margin-left: 8px;
    }
    
    .message-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }
    
    .reply-btn, .delete-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .reply-btn:hover {
        background: rgba(102, 126, 234, 0.3);
        border-color: #667eea;
    }
    
    .delete-btn:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: #ef4444;
    }
    
    .reply-section {
        margin-top: 16px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border-left: 3px solid #667eea;
    }
    
    .reply-textarea {
        width: 100%;
        min-height: 60px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
        resize: vertical;
        font-family: inherit;
    }
    
    .reply-textarea::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }
    
    .reply-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        justify-content: flex-end;
    }
    
    .reply-submit, .reply-cancel {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .reply-submit {
        background: #667eea;
        color: white;
    }
    
    .reply-submit:hover {
        background: #5a67d8;
    }
    
    .reply-cancel {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
    
    .reply-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .permission-tip {
        animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .permission-tip {
        animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes scoreAnimation {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .analysis-show {
        animation: fadeIn 0.5s ease;
    }
    
    .ai-grade {
        font-size: 18px;
        font-weight: 600;
        margin-left: 12px;
        padding: 4px 12px;
        border-radius: 16px;
        background: rgba(255,255,255,0.1);
        display: inline-block;
    }
    
    #riskAssessment, #detailedAnalysis {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(255,255,255,0.2);
    }
    
    .risk-item {
        transition: all 0.3s ease;
    }
    
    .risk-item:hover {
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    </style>
`;

// 注入样式
document.head.insertAdjacentHTML('beforeend', modalStyles);

// 🌍 创建全局交互实例（延迟初始化，确保DOM已加载）
let interactions;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        interactions = new FrontendInteractions();
        window.interactions = interactions; // 确保全局可访问
    });
} else {
    interactions = new FrontendInteractions();
    window.interactions = interactions; // 确保全局可访问
}