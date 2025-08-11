/**
 * Audio Unlocker - Infinity Unlocker
 * Solução JavaScript pura para quebrar bloqueios de áudio dos navegadores
 * Funciona em qualquer site hospedado sem necessidade de servidor
 */

class AudioUnlocker {
    constructor() {
        this.audioEnabled = false;
        this.audioContext = null;
        this.audioBuffers = [];
        this.audioSources = [];
        this.maxConcurrentSounds = 5;
        this.audioData = null;
        this.init();
    }

    /**
     * Inicializa o sistema de áudio
     */
    async init() {
        try {
            // Criar contexto de áudio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Carregar o arquivo de áudio como ArrayBuffer
            await this.loadAudioFile();
            
            console.log('🎵 Audio Unlocker inicializado com sucesso!');
        } catch (error) {
            console.log('❌ Erro ao inicializar Audio Unlocker:', error);
        }
    }

    /**
     * Carrega o arquivo de áudio
     */
    async loadAudioFile() {
        try {
            const response = await fetch('sonds/notificacao-compra.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.audioData = await this.audioContext.decodeAudioData(arrayBuffer);
            console.log('✅ Arquivo de áudio carregado');
        } catch (error) {
            console.log('❌ Erro ao carregar arquivo de áudio:', error);
            // Fallback: criar um beep simples
            this.createFallbackAudio();
        }
    }

    /**
     * Cria um beep de fallback caso o arquivo não carregue
     */
    createFallbackAudio() {
        try {
            const sampleRate = 44100;
            const duration = 0.3; // 300ms
            const frequency = 800; // 800Hz
            const samples = sampleRate * duration;
            
            const audioBuffer = this.audioContext.createBuffer(1, samples, sampleRate);
            const channelData = audioBuffer.getChannelData(0);
            
            for (let i = 0; i < samples; i++) {
                const t = i / sampleRate;
                channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
            }
            
            this.audioData = audioBuffer;
            console.log('✅ Áudio de fallback criado');
        } catch (error) {
            console.log('❌ Erro ao criar áudio de fallback:', error);
        }
    }

    /**
     * Ativa o áudio após interação do usuário
     */
    enableAudio() {
        if (!this.audioEnabled) {
            this.audioEnabled = true;
            
            // Resumir contexto se estiver suspenso
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            console.log('🔊 Áudio ativado pelo usuário');
        }
    }

    /**
     * Reproduz o som de notificação
     */
    playNotificationSound() {
        if (!this.audioEnabled || !this.audioData) {
            console.log('⚠️ Áudio não ativado ou não carregado');
            return false;
        }

        try {
            // Limpar fontes antigas
            this.cleanupOldSources();

            // Criar nova fonte de áudio
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioData;
            
            // Criar gain node para controle de volume
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            
            // Conectar a cadeia de áudio
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Adicionar à lista de fontes ativas
            this.audioSources.push({
                source: source,
                startTime: this.audioContext.currentTime
            });
            
            // Reproduzir o som
            source.start();
            
            // Remover da lista quando terminar
            source.onended = () => {
                this.audioSources = this.audioSources.filter(s => s.source !== source);
            };
            
            console.log('✅ Som reproduzido com sucesso');
            return true;
            
        } catch (error) {
            console.log('❌ Erro ao reproduzir som:', error);
            return false;
        }
    }

    /**
     * Limpa fontes de áudio antigas
     */
    cleanupOldSources() {
        const currentTime = this.audioContext.currentTime;
        this.audioSources = this.audioSources.filter(s => {
            if (currentTime - s.startTime > 1) { // Remover após 1 segundo
                try {
                    s.source.stop();
                } catch (e) {
                    // Ignorar erros de fonte já parada
                }
                return false;
            }
            return true;
        });
    }

    /**
     * Adiciona eventos para ativar áudio
     */
    addActivationEvents() {
        const events = ['click', 'touchstart', 'mousedown', 'keydown', 'scroll', 'wheel'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.enableAudio();
            }, { once: true, passive: true });
        });
    }

    /**
     * Método alternativo usando HTML5 Audio (fallback)
     */
    playWithHTML5Audio() {
        if (!this.audioEnabled) {
            console.log('⚠️ Áudio não ativado');
            return false;
        }

        try {
            const audio = new Audio('sonds/notificacao-compra.mp3');
            audio.volume = 0.3;
            
            // Tentar reproduzir
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('❌ Erro HTML5 Audio:', error);
                    // Se falhar, tentar com Web Audio API
                    this.playNotificationSound();
                });
            }
            
            return true;
        } catch (error) {
            console.log('❌ Erro ao criar HTML5 Audio:', error);
            return false;
        }
    }

    /**
     * Método híbrido que tenta múltiplas abordagens
     */
    playSound() {
        // Primeiro tentar Web Audio API
        if (this.audioContext && this.audioData) {
            return this.playNotificationSound();
        }
        
        // Fallback para HTML5 Audio
        return this.playWithHTML5Audio();
    }
}

// Função global para usar no HTML
window.playNotificationSound = function() {
    if (window.audioUnlocker) {
        return window.audioUnlocker.playSound();
    } else {
        console.log('❌ Audio Unlocker não inicializado');
        return false;
    }
};

// Função para inicializar
window.initAudioUnlocker = function() {
    window.audioUnlocker = new AudioUnlocker();
    window.audioUnlocker.addActivationEvents();
    return window.audioUnlocker;
};

// Auto-inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Audio Unlocker
    window.initAudioUnlocker();
    
    // Indicador visual removido - sistema funcionando perfeitamente
});

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioUnlocker;
} 