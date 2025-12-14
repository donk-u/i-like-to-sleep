
// 🌐 API 管理模块 - 使用CloudBase SDK
class APIManager {
    constructor() {
        // CloudBase SDK实例
        this.tcb = window.tcb;
        this.db = this.tcb.database();
        console.log('🌐 API初始化: 使用CloudBase SDK');
        
        // 用户状态管理
        this.userKey = 'sleep-engineer-user';
        
        // 检查CloudBase SDK是否可用
        if (!this.tcb) {
            console.error('❌ CloudBase SDK未初始化');
            this.showError('CloudBase SDK初始化失败，请刷新页面重试');
        }
    }
    
    // 获取存储的用户信息
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }
    
    // 存储用户信息
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }
    
    // 移除用户信息
    removeUser() {
        localStorage.removeItem(this.userKey);
    }
    
    // 检查是否已登录 - 使用CloudBase Auth状态
    isLoggedIn() {
        return !!this.getUser();
    }
    
    // CloudBase Auth登录状态检查
    async checkAuthState() {
        try {
            const authState = await this.tcb.auth().getLoginState();
            if (authState) {
                this.setUser(authState.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('检查登录状态失败:', error);
            return false;
        }
    }

    // 📡 CloudBase数据库操作
    async dbQuery(collection, query = {}, options = {}) {
        try {
            console.log(`📊 数据库查询: ${collection}`);
            
            let dbQuery = this.db.collection(collection);
            
            // 应用查询条件
            if (Object.keys(query).length > 0) {
                dbQuery = dbQuery.where(query);
            }
            
            // 应用排序
            if (options.orderBy) {
                dbQuery = dbQuery.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
            }
            
            // 应用分页
            if (options.limit) {
                dbQuery = dbQuery.limit(options.limit);
            }
            
            if (options.skip) {
                dbQuery = dbQuery.skip(options.skip);
            }
            
            const result = await dbQuery.get();
            console.log('✅ 数据库查询成功:', result);
            return { success: true, data: result.data };
            
        } catch (error) {
            console.error('❌ 数据库查询失败:', error);
            this.showError('数据查询失败，请稍后重试');
            throw error;
        }
    }

    // 📤 CloudBase数据库插入
    async dbInsert(collection, data) {
        try {
            console.log(`📝 数据库插入: ${collection}`);
            
            const result = await this.db.collection(collection).add(data);
            console.log('✅ 数据库插入成功:', result);
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ 数据库插入失败:', error);
            this.showError('数据保存失败，请稍后重试');
            throw error;
        }
    }

    // 🗑️ CloudBase数据库删除
    async dbDelete(collection, docId) {
        try {
            console.log(`🗑️ 数据库删除: ${collection}/${docId}`);
            
            const result = await this.db.collection(collection).doc(docId).remove();
            console.log('✅ 数据库删除成功:', result);
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ 数据库删除失败:', error);
            this.showError('删除失败，请稍后重试');
            throw error;
        }
    }

    // 🔄 CloudBase数据库更新
    async dbUpdate(collection, docId, data) {
        try {
            console.log(`🔄 数据库更新: ${collection}/${docId}`);
            
            const result = await this.db.collection(collection).doc(docId).update(data);
            console.log('✅ 数据库更新成功:', result);
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ 数据库更新失败:', error);
            this.showError('更新失败，请稍后重试');
            throw error;
        }
    }

    // 🎭 错误显示
    showError(message) {
        // 创建错误提示
        const errorDiv = document.createElement('div');
        errorDiv.className = 'api-error-toast';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // 自动消失
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // 🎉 成功提示
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'api-success-toast';
        successDiv.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    }

    // 📋 留言板API - 直接使用CloudBase数据库
    async getGuestbook(status = 'approved', page = 1, limit = 20) {
        try {
            console.log('📊 获取留言列表:', { status, page, limit });
            
            // 直接从数据库获取留言
            const result = await this.dbQuery('guestbook', 
                { status }, 
                { 
                    orderBy: { field: 'createdAt', direction: 'desc' },
                    limit: limit,
                    skip: (page - 1) * limit
                }
            );
            
            console.log('✅ 留言列表获取成功:', result);
            return result;
            
        } catch (error) {
            console.error('❌ 获取留言列表失败:', error);
            this.showError('获取留言失败，请稍后重试');
            throw error;
        }
    }

    async submitGuestbook(content, images = []) {
        try {
            console.log('📝 提交留言:', { content, images });
            
            // 获取当前用户信息
            const userInfo = await this.getCurrentUserInfo();
            
            // 直接保存到数据库
            const guestbookData = {
                content: content,
                userInfo: userInfo,
                images: images,
                status: 'approved', // 默认直接显示，不需要审核
                createdAt: new Date(),
                updatedAt: new Date(),
                replies: []
            };
            
            const result = await this.dbInsert('guestbook', guestbookData);
            console.log('✅ 留言提交成功:', result);
            this.showSuccess('留言提交成功！');
            return result;
            
        } catch (error) {
            console.error('❌ 留言提交失败:', error);
            this.showError('留言提交失败，请稍后重试');
            throw error;
        }
    }

    async deleteGuestbook(messageId) {
        try {
            console.log('🗑️ 删除留言:', messageId);
            
            // 直接从数据库删除
            const result = await this.dbDelete('guestbook', messageId);
            console.log('✅ 留言删除成功:', result);
            this.showSuccess('留言已删除');
            return result;
            
        } catch (error) {
            console.error('❌ 删除留言失败:', error);
            this.showError('删除留言失败，请稍后重试');
            throw error;
        }
    }

    async replyGuestbook(messageId, replyContent) {
        try {
            console.log('💬 回复留言:', { messageId, replyContent });
            
            // 获取当前用户信息
            const userInfo = await this.getCurrentUserInfo();
            
            // 创建回复数据
            const reply = {
                content: replyContent,
                userInfo: userInfo,
                createdAt: new Date()
            };
            
            // 获取当前留言
            const guestbookCollection = this.db.collection('guestbook');
            const messageResult = await guestbookCollection.doc(messageId).get();
            
            if (messageResult.data && messageResult.data.length > 0) {
                const message = messageResult.data[0];
                const replies = message.replies || [];
                
                // 添加新回复
                replies.push(reply);
                
                // 更新留言
                const result = await this.dbUpdate('guestbook', messageId, {
                    replies: replies,
                    updatedAt: new Date()
                });
                
                console.log('✅ 回复成功:', result);
                this.showSuccess('回复成功！');
                return result;
            } else {
                throw new Error('留言不存在');
            }
            
        } catch (error) {
            console.error('❌ 回复失败:', error);
            this.showError('回复失败，请稍后重试');
            throw error;
        }
    }

    // 图片上传功能 - 直接使用CloudBase存储服务
    async uploadImage(file) {
        try {
            console.log('🖼️ 上传图片:', file.name);
            
            // 获取当前用户信息
            const user = this.getUser();
            if (!user) {
                throw new Error('用户未登录，无法上传图片');
            }
            
            // 生成唯一的文件名
            const timestamp = new Date().getTime();
            const uniqueFileName = `guestbook/${user.userId || user.openid || user._openid}/${timestamp}_${file.name}`;
            
            // 获取CloudBase存储引用
            const storage = this.tcb.storage();
            
            // 上传文件到CloudBase存储
            const uploadResult = await storage.uploadFile({
                cloudPath: uniqueFileName,
                file: file
            });
            
            // 获取文件的访问URL
            const fileURL = await storage.getTempFileURL({
                fileList: [uploadResult.fileID]
            });
            
            console.log('✅ 图片上传成功:', uploadResult);
            
            // 返回图片信息
            const imageInfo = {
                fileId: uploadResult.fileID,
                url: fileURL.fileList[0].tempFileURL,
                name: file.name,
                size: file.size,
                type: file.type
            };
            
            return imageInfo;
            
        } catch (error) {
            console.error('❌ 图片上传失败:', error);
            this.showError('图片上传失败，请重试');
            throw error;
        }
    }

    // 获取当前用户信息
    async getCurrentUserInfo() {
        const user = this.getUser();
        if (user) {
            return user;
        }
        
        const authState = await this.tcb.auth().getLoginState();
        if (authState) {
            this.setUser(authState.user);
            return authState.user;
        }
        
        throw new Error('用户未登录');
    }

    // 😴 睡眠数据API - 使用CloudBase数据库
    async getSleepData() {
        return this.dbQuery('sleep_data', {}, { orderBy: { field: 'date', direction: 'desc' } });
    }

    async submitSleepData(data) {
        const sleepRecord = {
            ...data,
            date: new Date(),
            createdAt: new Date()
        };
        
        const result = await this.dbInsert('sleep_data', sleepRecord);
        this.showSuccess('睡眠数据记录成功！');
        return result;
    }

    // AI睡眠质量分析API - 前端实现
    async aiSleepAnalysis(sleepData) {
        try {
            console.log('🤖 执行前端AI睡眠分析');
            
            // 直接在前端生成AI分析结果
            const aiResult = this.generateAISleepAnalysis(sleepData);
            console.log('✅ AI分析结果:', aiResult);
            
            return { success: true, data: aiResult };
            
        } catch (error) {
            console.error('❌ AI分析失败:', error);
            this.showError('AI分析失败，请重试');
            throw error;
        }
    }
    
    // 生成AI睡眠分析结果
    generateAISleepAnalysis(sleepData) {
        const { duration, quality, notes } = sleepData;
        
        // 生成AI评分（基于睡眠时长和质量）
        let aiScore = Math.min(100, Math.max(0, Math.round((duration / 8) * 50 + (quality / 10) * 50)));
        
        // 生成AI评价
        let aiEvaluation = '';
        if (aiScore >= 90) {
            aiEvaluation = '您的睡眠质量非常优秀！睡眠时长和深度都处于理想状态，继续保持良好的睡眠习惯，这将有助于您的身心健康和工作效率。';
        } else if (aiScore >= 70) {
            aiEvaluation = '您的睡眠质量良好，但仍有提升空间。建议保持规律的作息时间，优化睡眠环境，避免睡前使用电子设备。';
        } else if (aiScore >= 50) {
            aiEvaluation = '您的睡眠质量一般，建议关注睡眠质量问题。可能的原因包括睡眠时间不足、睡眠环境不佳或睡前压力过大。';
        } else {
            aiEvaluation = '您的睡眠质量较差，建议调整作息时间，改善睡眠环境，并考虑咨询专业医生或睡眠专家。';
        }
        
        // 生成个性化建议
        const suggestions = [];
        if (duration < 7) {
            suggestions.push('建议增加睡眠时间，成年人每天应保持7-8小时的睡眠。');
        } else if (duration > 9) {
            suggestions.push('睡眠时间偏长，建议保持规律作息，避免过度睡眠。');
        } else {
            suggestions.push('睡眠时长处于理想范围，继续保持。');
        }
        
        if (quality < 6) {
            suggestions.push('睡眠质量不佳，建议优化睡眠环境，保持卧室安静、黑暗和凉爽。');
            suggestions.push('睡前避免饮用咖啡、茶等含咖啡因的饮料。');
        } else {
            suggestions.push('睡眠质量良好，建议保持规律的作息时间。');
        }
        
        if (notes && notes.includes('压力')) {
            suggestions.push('建议在睡前进行放松活动，如冥想、深呼吸或温水浴，以缓解压力。');
        }
        
        if (notes && notes.includes('失眠')) {
            suggestions.push('建议睡前避免使用电子设备，可尝试阅读书籍或听轻柔音乐帮助入睡。');
        }
        
        // 生成睡眠洞察
        const insights = [
            `您的睡眠时长为${duration}小时，睡眠质量评分为${quality}/10。`,
            `AI综合评分为${aiScore}分，${aiScore >= 70 ? '属于良好水平' : aiScore >= 50 ? '属于一般水平' : '需要改善'}。`,
            '保持规律的睡眠习惯对身心健康至关重要，建议每天固定时间上床睡觉和起床。'
        ];
        
        // 生成风险评估（如果有）
        let riskAssessment = null;
        if (aiScore < 50) {
            riskAssessment = {
                level: 'high',
                message: '长期睡眠质量不佳可能会影响免疫力、记忆力和情绪，建议及时调整睡眠习惯或咨询专业人士。'
            };
        } else if (aiScore < 70) {
            riskAssessment = {
                level: 'medium',
                message: '睡眠质量一般，建议关注睡眠习惯，避免长期处于亚健康状态。'
            };
        }
        
        // 生成详细分析
        const detailedAnalysis = {
            durationAnalysis: duration < 7 ? '睡眠时长不足' : duration > 9 ? '睡眠时长偏长' : '睡眠时长理想',
            qualityAnalysis: quality < 6 ? '睡眠质量不佳' : quality < 8 ? '睡眠质量良好' : '睡眠质量优秀',
            sleepCycle: Math.round(duration / 1.5), // 每个睡眠周期约90分钟
            recommendedActions: suggestions
        };
        
        return {
            score: aiScore,
            evaluation: aiEvaluation,
            suggestions: suggestions,
            insights: insights,
            riskAssessment: riskAssessment,
            detailedAnalysis: detailedAnalysis,
            sleepData: sleepData,
            timestamp: new Date().toISOString(),
            model: 'SleepAI v1.0 (Frontend)'
        };
    }

    // 🎨 项目展示API
    async getProjects() {
        return this.dbQuery('projects', {}, { orderBy: { field: 'order', direction: 'asc' } });
    }

    // 📧 联系表单API
    async submitContact(data) {
        const contactData = {
            ...data,
            status: 'unread',
            createdAt: new Date()
        };
        
        const result = await this.dbInsert('contact_messages', contactData);
        this.showSuccess('联系信息已收到，我们会尽快回复！');
        return result;
    }

    // 🏥 健康检查
    async healthCheck() {
        try {
            // 检查数据库连接
            await this.db.collection('health_check').limit(1).get();
            return { success: true, message: '系统运行正常' };
        } catch (error) {
            return { success: false, message: '系统异常' };
        }
    }
    
    // 🔐 CloudBase认证API
    // 邮箱注册
    async register(userData) {
        try {
            console.log('📧 邮箱注册:', userData.email);
            
            const result = await this.tcb.auth().signUpWithEmailAndPassword(
                userData.email,
                userData.password
            );
            
            console.log('✅ 注册成功:', result);
            this.setUser(result.user);
            this.showSuccess('注册成功！欢迎使用睡眠工程师平台');
            
            // 自动登录
            const loginResult = await this.tcb.auth().signInWithEmailAndPassword(
                userData.email,
                userData.password
            );
            
            return { success: true, data: { user: loginResult.user } };
            
        } catch (error) {
            console.error('❌ 注册失败:', error);
            const message = this.getAuthErrorMessage(error);
            this.showError(message);
            return { success: false, message: message };
        }
    }
    
    // 邮箱登录
    async login(credentials) {
        try {
            console.log('📧 邮箱登录:', credentials.email);
            
            const result = await this.tcb.auth().signInWithEmailAndPassword(
                credentials.email,
                credentials.password
            );
            
            console.log('✅ 登录成功:', result);
            this.setUser(result.user);
            this.showSuccess('登录成功！欢迎回来');
            
            return { success: true, data: { user: result.user } };
            
        } catch (error) {
            console.error('❌ 登录失败:', error);
            const message = this.getAuthErrorMessage(error);
            this.showError(message);
            return { success: false, message: message };
        }
    }
    
    // 手机号登录
    async phoneLogin(phoneNumber, verificationCode) {
        try {
            console.log('📱 手机号登录:', phoneNumber);
            
            const result = await this.tcb.auth().signInWithPhoneNumber(
                phoneNumber,
                verificationCode
            );
            
            console.log('✅ 手机号登录成功:', result);
            this.setUser(result.user);
            this.showSuccess('手机号登录成功！');
            
            return { success: true, data: { user: result.user } };
            
        } catch (error) {
            console.error('❌ 手机号登录失败:', error);
            const message = this.getAuthErrorMessage(error);
            this.showError(message);
            return { success: false, message: message };
        }
    }
    
    // 发送手机验证码
    async sendVerificationCode(phoneNumber) {
        try {
            console.log('📱 发送验证码:', phoneNumber);
            
            // 验证手机号格式
            if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
                throw new Error('手机号格式不正确');
            }
            
            const result = await this.tcb.auth().sendPhoneVerificationCode(phoneNumber);
            
            console.log('✅ 验证码发送成功:', result);
            this.showSuccess('验证码已发送，请注意查收');
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ 发送验证码失败:', error);
            const message = this.getAuthErrorMessage(error);
            this.showError(message);
            return { success: false, message: message };
        }
    }
    
    // 微信登录
    async wechatLogin() {
        try {
            console.log('💬 微信登录');
            
            // 使用微信登录
            const result = await this.tcb.auth().weixinAuthProvider().signIn();
            
            console.log('✅ 微信登录成功:', result);
            this.setUser(result.user);
            this.showSuccess('微信登录成功！');
            
            return { success: true, data: { user: result.user } };
            
        } catch (error) {
            console.error('❌ 微信登录失败:', error);
            const message = this.getAuthErrorMessage(error);
            this.showError(message);
            return { success: false, message: message };
        }
    }
    
    // 匿名登录
    async anonymousLogin() {
        try {
            console.log('👤 匿名登录');
            
            const result = await this.tcb.auth().anonymousAuthProvider().signIn();
            
            console.log('✅ 匿名登录成功:', result);
            this.setUser(result.user);
            this.showSuccess('欢迎体验睡眠工程师平台');
            
            return { success: true, data: { user: result.user } };
            
        } catch (error) {
            console.error('❌ 匿名登录失败:', error);
            this.showError('匿名登录失败，请重试');
            return { success: false, message: '匿名登录失败' };
        }
    }
    
    // 获取当前用户信息
    async getUserInfo() {
        try {
            const authState = await this.tcb.auth().getLoginState();
            if (authState) {
                this.setUser(authState.user);
                return { success: true, data: { user: authState.user } };
            }
            
            return { success: false, message: '用户未登录' };
            
        } catch (error) {
            console.error('❌ 获取用户信息失败:', error);
            return { success: false, message: '获取用户信息失败' };
        }
    }
    
    // 登出
    async logout() {
        try {
            console.log('🔐 用户登出');
            
            await this.tcb.auth().signOut();
            this.removeUser();
            this.showSuccess('已成功登出，期待再次相见');
            
        } catch (error) {
            console.error('❌ 登出失败:', error);
            // 即使登出API失败，也清除本地状态
            this.removeUser();
        }
    }
    
    // 刷新用户信息
    async refreshUserInfo() {
        try {
            const authState = await this.tcb.auth().getLoginState();
            if (authState) {
                this.setUser(authState.user);
                return authState.user;
            }
            return null;
        } catch (error) {
            console.error('❌ 刷新用户信息失败:', error);
            this.removeUser();
            return null;
        }
    }
    
    // 获取认证错误消息
    getAuthErrorMessage(error) {
        const errorCode = error.code || error.message;
        
        switch(errorCode) {
            case 'INVALID_EMAIL':
            case 'auth/invalid-email':
                return '邮箱格式不正确，请检查后重试';
            
            case 'USER_NOT_FOUND':
            case 'auth/user-not-found':
                return '用户不存在，请先注册';
            
            case 'WRONG_PASSWORD':
            case 'auth/wrong-password':
                return '密码错误，请检查后重试';
            
            case 'EMAIL_ALREADY_IN_USE':
            case 'auth/email-already-in-use':
                return '该邮箱已被注册，请使用其他邮箱或直接登录';
            
            case 'INVALID_PHONE_NUMBER':
                return '手机号格式不正确，请输入正确的11位手机号';
            
            case 'INVALID_VERIFICATION_CODE':
                return '验证码错误，请重新输入';
            
            case 'VERIFICATION_CODE_EXPIRED':
                return '验证码已过期，请重新获取';
            
            case 'TOO_MANY_REQUESTS':
                return '操作过于频繁，请稍后重试';
            
            case 'NETWORK_ERROR':
                return '网络连接失败，请检查网络设置';
            
            default:
                return error.message || '认证失败，请稍后重试';
        }
    }
    
    // 验证邮箱格式
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // 验证手机号格式
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
    
    // 验证密码强度
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, message: '密码长度至少6位' };
        }
        return { valid: true, message: '密码格式正确' };
    }
}

// 🌍 创建全局API实例
const API = new APIManager();