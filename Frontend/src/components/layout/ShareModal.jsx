import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Download, Share2, Copy, Check, Loader2 } from 'lucide-react'

/**
 * ShareModal - iOS-style share sheet for captured constellation images
 * Supports: Save to device, Web Share API (mobile), Clipboard copy (desktop)
 */
export function ShareModal({ isOpen, onClose, imageData }) {
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [canWebShare, setCanWebShare] = useState(false)

  // Check Web Share API support on mount
  useEffect(() => {
    const checkShareSupport = async () => {
      if (navigator.share && navigator.canShare) {
        // Test if file sharing is supported
        try {
          const testBlob = new Blob(['test'], { type: 'image/png' })
          const testFile = new File([testBlob], 'test.png', { type: 'image/png' })
          const canShare = navigator.canShare({ files: [testFile] })
          setCanWebShare(canShare)
        } catch {
          setCanWebShare(false)
        }
      }
    }
    checkShareSupport()
  }, [])

  // Save to device
  const handleSave = () => {
    if (!imageData) return
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')
    link.download = `Sidera_${date}.png`
    link.href = imageData
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    onClose()
  }

  // Web Share API (mobile)
  const handleShare = async () => {
    if (!imageData) return
    setSharing(true)

    try {
      // Convert base64 to Blob
      const response = await fetch(imageData)
      const blob = await response.blob()
      const file = new File([blob], 'sidera_constellation.png', { type: 'image/png' })

      await navigator.share({
        files: [file],
        title: 'Sidera 별자리',
        text: '✨ 내 별자리를 공유합니다'
      })
      onClose()
    } catch (err) {
      // User cancelled or error
      console.log('Share cancelled or failed:', err.message)
    } finally {
      setSharing(false)
    }
  }

  // Copy to clipboard (desktop fallback)
  const handleCopy = async () => {
    if (!imageData) return

    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
      // Fallback: copy data URL as text
      try {
        await navigator.clipboard.writeText(imageData)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert('클립보드 복사에 실패했습니다')
      }
    }
  }

  if (!isOpen || !imageData) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm bg-gray-900/95 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">공유하기</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-4">
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
            <img
              src={imageData}
              alt="Captured constellation"
              className="w-full h-auto max-h-48 object-contain"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-6 space-y-2">
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Download size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="text-white font-medium">저장하기</p>
              <p className="text-xs text-gray-500">기기에 이미지 다운로드</p>
            </div>
          </button>

          {/* Share Button (Mobile) or Copy Button (Desktop) */}
          {canWebShare ? (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="w-full flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/20 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/30 text-purple-300">
                {sharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-medium">공유하기</p>
                <p className="text-xs text-gray-400">카카오톡, 인스타그램 등</p>
              </div>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500/20 text-green-400">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-medium">{copied ? '복사됨!' : '이미지 복사'}</p>
                <p className="text-xs text-gray-500">클립보드에 복사 후 붙여넣기</p>
              </div>
            </button>
          )}

          {/* Desktop: Show both Copy and a note about mobile sharing */}
          {!canWebShare && (
            <p className="text-center text-xs text-gray-500 pt-2">
              💡 모바일에서는 카카오톡, 인스타그램 등으로 직접 공유할 수 있어요
            </p>
          )}
        </div>

        {/* Safe area for iOS bottom bar */}
        <div className="h-safe-area-inset-bottom sm:hidden" />
      </motion.div>
    </motion.div>
  )
}
