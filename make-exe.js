// make-exe.js - Build automático
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FAFANET IP Tracker - Build Automático');
console.log('=========================================');

try {
    // 1. Verificar estrutura
    console.log('\n1. 📁 Verificando estrutura...');
    
    const requiredFiles = [
        'src/main.js',
        'src/preload.js',
        'src/renderer/pages/login.html',
        'src/renderer/pages/dashboard.html',
        'package.json'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(path.join(__dirname, file))) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - NÃO ENCONTRADO!`);
            throw new Error(`Arquivo necessário não encontrado: ${file}`);
        }
    });
    
    // 2. Verificar ícone
    console.log('\n2. 🎨 Verificando ícone...');
    const iconPath = path.join(__dirname, 'src', 'assets', 'icon.ico');
    if (!fs.existsSync(iconPath)) {
        console.log('   ⚠️  Ícone não encontrado, criando temporário...');
        const assetsDir = path.dirname(iconPath);
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }
        fs.writeFileSync(iconPath, 'Ícone temporário');
        console.log('   ✅ Ícone temporário criado');
    } else {
        console.log('   ✅ Ícone encontrado');
    }
    
    // 3. Instalar dependências se necessário
    console.log('\n3. 📦 Verificando dependências...');
    if (!fs.existsSync(path.join(__dirname, 'node_modules', 'electron-builder'))) {
        console.log('   ⚠️  Instalando electron-builder...');
        execSync('npm install --save-dev electron-builder', { stdio: 'inherit' });
    } else {
        console.log('   ✅ Dependências já instaladas');
    }
    
    // 4. Executar build
    console.log('\n4. 🔨 Executando build...');
    console.log('   Esta etapa pode levar alguns minutos...');
    
    // Limpar builds anteriores
    const distDir = path.join(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
        console.log('   🧹 Limpando builds anteriores...');
        fs.rmSync(distDir, { recursive: true, force: true });
    }
    
    // Build portable
    console.log('   🛠️  Criando executável portable...');
    execSync('npx electron-builder --win portable', { stdio: 'inherit' });
    
    // 5. Verificar resultado
    console.log('\n5. ✅ Verificando resultado...');
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        console.log('\n📁 ARQUIVOS GERADOS:');
        console.log('===================');
        
        files.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`📄 ${file} - ${sizeMB} MB`);
            
            // Se for o portable, mostrar localização
            if (file.includes('FAFANET_IP_Tracker.exe') || file.includes('portable')) {
                console.log(`📍 Local: ${filePath}`);
            }
        });
        
        // Abrir pasta no explorador
        console.log('\n🔓 Abrindo pasta de output...');
        execSync(`explorer "${distDir}"`);
        
        console.log('\n🎉 BUILD CONCLUÍDO COM SUCESSO!');
        console.log('================================');
        console.log('Seu executável está na pasta "dist/"');
        console.log('Para testar: Execute o arquivo .exe');
        
    } else {
        console.error('❌ A pasta "dist" não foi criada!');
        console.log('Verifique os erros acima.');
    }
    
} catch (error) {
    console.error('\n❌ ERRO NO BUILD:', error.message);
    console.log('\n💡 Soluções possíveis:');
    console.log('1. Execute: npm install');
    console.log('2. Verifique se o Node.js está atualizado');
    console.log('3. Execute com admin: PowerShell como Administrador');
    process.exit(1);
}