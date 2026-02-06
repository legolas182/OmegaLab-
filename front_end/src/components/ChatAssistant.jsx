import { useState, useRef, useEffect } from 'react'
import chatAssistantService from '../services/chatAssistantService'

import { useNavigate } from 'react-router-dom'

const ChatAssistant = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('chat_messages')
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages)
                return parsed.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            } catch (e) {
                console.error('Error parsing chat messages:', e)
            }
        }
        return [{
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de IA.¿En qué puedo ayudarte?',
            timestamp: new Date()
        }]
    })

    // Persistir mensajes
    useEffect(() => {
        localStorage.setItem('chat_messages', JSON.stringify(messages))
    }, [messages])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Auto-scroll al final de los mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Focus en el input y scroll al fondo cuando se abre el chat
    useEffect(() => {
        if (isOpen) {
            if (inputRef.current) {
                inputRef.current.focus()
            }
            // Asegurar que el scroll baje al abrir
            setTimeout(scrollToBottom, 100)
        }
    }, [isOpen])

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

        try {
            const response = await chatAssistantService.sendMessage(inputMessage)

            // Procesar comandos de navegación
            let content = response.response
            const navigateMatch = content.match(/<<NAVIGATE:(.*?)>>/)

            if (navigateMatch) {
                const route = navigateMatch[1]
                // Eliminar el comando del mensaje visible
                content = content.replace(navigateMatch[0], '').trim()

                // Ejecutar navegación
                console.log('Navegando a:', route)
                navigate(route)
            }

            const assistantMessage = {
                role: 'assistant',
                content: content,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            const errorMessage = {
                role: 'assistant',
                content: `Lo siento, ocurrió un error: ${error.message}`,
                timestamp: new Date(),
                isError: true
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chat-assistant-btn fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
                    aria-label="Abrir asistente de IA"
                >
                    <span className="material-symbols-outlined text-white text-2xl group-hover:scale-110 transition-transform">
                        smart_toy
                    </span>
                    <div className="chat-assistant-dot absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 animate-pulse"></div>
                </button>
            )}

            {/* Ventana de chat */}
            {isOpen && (
                <div className="chat-assistant-window fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-96 h-full sm:h-[600px] sm:max-h-[90vh] bg-card-dark border-0 sm:border border-border-dark sm:rounded-2xl shadow-2xl flex flex-col z-50 animate-slide-up">
                    {/* Header */}
                    <div className="chat-assistant-header flex items-center justify-between p-4 border-b border-border-dark bg-gradient-to-r from-blue-500/15 to-purple-500/15 sm:rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-white text-xl">
                                    smart_toy
                                </span>
                            </div>
                            <div>
                                <h3 className="text-text-light font-semibold text-base">Asistente IA</h3>
                                <p className="chat-assistant-subtitle text-text-muted text-sm">Supervisor de Calidad</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-lg hover:bg-input-dark transition-colors flex items-center justify-center"
                            aria-label="Cerrar chat"
                        >
                            <span className="material-symbols-outlined text-text-muted text-xl chat-assistant-close">
                                close
                            </span>
                        </button>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                                        : message.isError
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            : 'bg-input-dark text-text-light border border-border-dark'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    <p className={`text-xs mt-1 ${message.role === 'user'
                                        ? 'text-white/70'
                                        : message.isError
                                            ? 'text-red-400/70'
                                            : 'text-text-muted'
                                        }`}>
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Indicador de escritura */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-input-dark border border-border-dark rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border-dark bg-card-dark sm:rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu pregunta..."
                                disabled={isLoading}
                                className="flex-1 bg-input-dark border border-border-dark rounded-xl px-4 py-2 text-text-light placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                aria-label="Enviar mensaje"
                            >
                                <span className="material-symbols-outlined text-white text-xl">
                                    send
                                </span>
                            </button>
                        </div>
                        <p className="text-text-muted text-xs mt-2 text-center">
                            Presiona Enter para enviar
                        </p>
                    </div>
                </div>
            )}

        </>
    )
}

export default ChatAssistant
