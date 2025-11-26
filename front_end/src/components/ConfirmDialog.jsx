import { useEffect } from 'react'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Aceptar', cancelText = 'Cancelar', type = 'danger' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card-dark rounded-lg border border-border-dark max-w-md w-full shadow-xl">
        <div className="p-6">
          {/* Icono y título */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              type === 'danger' ? 'bg-danger/20' : 'bg-warning/20'
            }`}>
              <span className={`material-symbols-outlined text-2xl ${
                type === 'danger' ? 'text-danger' : 'text-warning'
              }`}>
                {type === 'danger' ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-text-light text-lg font-semibold mb-1">
                {title || 'Confirmar acción'}
              </h3>
              <p className="text-text-muted text-sm">
                {message || '¿Estás seguro de realizar esta acción?'}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-input-dark text-text-light text-sm font-medium hover:bg-border-dark transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                type === 'danger'
                  ? 'bg-danger hover:bg-danger/90'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

