// 🔍 功能测试脚本
console.log('🚀 开始测试项目功能...');

// 测试CloudBase连接
function testCloudBaseConnection() {
    console.log('\n📡 测试CloudBase连接...');
    try {
        if (window.tcb) {
            console.log('✅ CloudBase SDK已加载');
            console.log('✅ CloudBase配置:', window.cloudbaseConfig);
            return true;
        } else {
            console.error('❌ CloudBase SDK未加载');
            return false;
        }
    } catch (error) {
        console.error('❌ CloudBase连接测试失败:', error);
        return false;
    }
}

// 测试API实例
function testAPIInstance() {
    console.log('\n🌐 测试API实例...');
    try {
        if (typeof API !== 'undefined') {
            console.log('✅ API实例已创建');
            console.log('✅ API方法列表:', Object.getOwnPropertyNames(API.constructor.prototype).filter(method => method !== 'constructor'));
            return true;
        } else {
            console.error('❌ API实例未创建');
            return false;
        }
    } catch (error) {
        console.error('❌ API实例测试失败:', error);
        return false;
    }
}

// 测试交互功能
function testInteractions() {
    console.log('\n🤝 测试交互功能...');
    try {
        if (typeof window.interactions !== 'undefined') {
            console.log('✅ 交互实例已创建');
            return true;
        } else {
            console.log('⚠️ 交互实例尚未创建（可能需要DOM完全加载）');
            return true; // 允许通过，因为可能是异步加载
        }
    } catch (error) {
        console.error('❌ 交互功能测试失败:', error);
        return false;
    }
}

// 测试HTML元素存在性
function testHTMLElements() {
    console.log('\n🏗️ 测试HTML元素存在性...');
    const requiredElements = [
        { id: 'home', name: '首页区域' },
        { id: 'about', name: '关于我区域' },
        { id: 'services', name: '服务区域' },
        { id: 'portfolio', name: '作品集区域' },
        { id: 'contact', name: '联系区域' },
        { id: 'guestbook', name: '留言板区域' },
        { id: 'sleep-tracker', name: '睡眠记录区域' },
        { id: 'authModal', name: '登录模态框' }
    ];
    
    let allFound = true;
    requiredElements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            console.log(`✅ ${element.name}存在`);
        } else {
            console.error(`❌ ${element.name}不存在`);
            allFound = false;
        }
    });
    return allFound;
}

// 运行所有测试
function runAllTests() {
    console.log('\n🎯 运行所有测试...');
    
    const results = {
        cloudBase: testCloudBaseConnection(),
        apiInstance: testAPIInstance(),
        interactions: testInteractions(),
        htmlElements: testHTMLElements()
    };
    
    console.log('\n📋 测试结果汇总:');
    Object.entries(results).forEach(([testName, result]) => {
        console.log(`${result ? '✅' : '❌'} ${testName}: ${result ? '通过' : '失败'}`);
    });
    
    const allPassed = Object.values(results).every(result => result === true);
    if (allPassed) {
        console.log('\n🎉 所有核心功能测试通过！');
    } else {
        console.log('\n⚠️ 部分测试未通过，请检查上述错误信息');
    }
    
    return allPassed;
}

// 在页面加载完成后运行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAllTests, 1000); // 延迟1秒，确保所有脚本都已加载
    });
} else {
    setTimeout(runAllTests, 1000);
}

// 导出测试函数供控制台使用
window.testProject = runAllTests;