import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Film, Music, FileWarning, CheckCircle2, Loader2, X } from 'lucide-react'
import clsx from 'clsx'

const ACCEPTED = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/mp4': ['.m4a'],
}

const MAX_SIZE_MB = 200

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function UploadZone({ onFileSelected, onUrlAnalyze, uploading, uploadProgress }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [urlError, setUrlError] = useState(null)

  const validate = useCallback((f) => {
    if (!Object.keys(ACCEPTED).includes(f.type)) {
      return 'Unsupported format. Please upload MP4, MOV, AVI, WebM, MP3, WAV, OGG, or M4A.'
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum size is ${MAX_SIZE_MB} MB.`
    }
    return null
  }, [])

  const handleFile = useCallback((f) => {
    const err = validate(f)
    if (err) { setError(err); return }
    setError(null)
    setFile(f)
    onFileSelected(f)
  }, [validate, onFileSelected])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const onInputChange = (e) => {
    const picked = e.target.files[0]
    if (picked) handleFile(picked)
  }

  const clear = (e) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
  }

  const isVideo = file?.type?.startsWith('video')
  const isAudio = file?.type?.startsWith('audio')

  const handleUrlAnalyze = () => {
    if (!mediaUrl) return
    const isYoutube = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be')
    const isInstagram = mediaUrl.includes('instagram.com') || mediaUrl.includes('instagr.am')
    
    if (!isYoutube && !isInstagram) {
      setUrlError('Please enter a valid YouTube or Instagram URL')
      return
    }
    setUrlError(null)
    onUrlAnalyze(mediaUrl)
  }

  return (
    <div className="w-full">
      <motion.label
        htmlFor="file-upload"
        className={clsx(
          'relative flex flex-col items-center justify-center w-full min-h-[490px] rounded-[2.7rem] border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden group',
          dragging
            ? 'border-accent-cyan bg-accent-cyan/5 glow-cyan'
            : file && !error
            ? 'border-accent-purple/60 bg-accent-purple/5'
            : error
            ? 'border-accent-red/60 bg-accent-red/5'
            : 'border-black/5 bg-gray-50 hover:border-black/10 hover:bg-gray-100/50'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
      >
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,245,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Scan line when dragging */}
        <AnimatePresence>
          {dragging && (
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-cyan to-transparent pointer-events-none"
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 px-8 py-6"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
                <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/20 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-black font-medium">Uploading & Analyzing…</p>
                <p className="text-gray-400 text-sm mt-1">{file?.name}</p>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
              <p className="text-accent-cyan font-mono text-sm">{uploadProgress}%</p>
            </motion.div>
          ) : file && !error ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3 px-8 py-6 text-center w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {isVideo ? (
                  <Film className="w-12 h-12 text-accent-purple" />
                ) : isAudio ? (
                  <Music className="w-12 h-12 text-accent-cyan" />
                ) : (
                  <CheckCircle2 className="w-12 h-12 text-accent-green" />
                )}
              </motion.div>
              <div>
                <p className="text-black font-semibold text-sm truncate max-w-[240px]">{file.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{formatBytes(file.size)} · {file.type}</p>
              </div>
              <p className="text-gray-500 text-xs font-medium">File ready — click Analyze to proceed</p>
              <button
                onClick={clear}
                className="absolute top-3 right-3 text-gray-300 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 px-8 py-8 text-center"
            >
              {/* Floating icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center group-hover:glow-cyan transition-all duration-300 shadow-sm">
                  <Upload className="w-7 h-7 text-gray-400 group-hover:text-accent-cyan transition-colors duration-300" />
                </div>
                <motion.div
                  className="absolute -inset-2 rounded-3xl border border-accent-cyan/20"
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
              </motion.div>

              <div>
                <p className="text-black font-semibold text-lg tracking-tight">
                  Drop your media file here
                </p>
                <p className="text-gray-400 text-[0.85rem] mt-1 font-medium">
                  or <span className="text-accent-cyan font-bold">browse files</span>
                </p>
              </div>

              <div className="flex gap-2 flex-wrap justify-center">
                {['MP4', 'MOV', 'WebM', 'AVI', 'MP3', 'WAV'].map((fmt) => (
                  <span key={fmt} className="text-[10px] px-3 py-1 rounded-full bg-gray-50 text-gray-400 font-bold tracking-wider border border-black/5">
                    {fmt}
                  </span>
                ))}
              </div>
              <p className="text-gray-300 text-[0.65rem] font-bold uppercase tracking-widest">Max {MAX_SIZE_MB} MB</p>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept={Object.values(ACCEPTED).flat().join(',')}
          onChange={onInputChange}
          disabled={uploading}
        />
      </motion.label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-2 flex items-center gap-2 text-accent-red text-sm px-1"
          >
            <FileWarning className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-gray-300">OR</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-black/5 to-transparent" />
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Paste YouTube or Instagram URL"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value)
                  if (urlError) setUrlError(null)
                }}
                disabled={uploading}
                className={clsx(
                  "w-full bg-gray-50/50 border-2 rounded-2xl py-4 px-6 text-sm font-medium transition-all outline-none",
                  urlError 
                    ? "border-red-500/50 focus:border-red-500 text-red-900" 
                    : "border-black/5 focus:border-black/10 focus:bg-white"
                )}
              />
              <button
                onClick={handleUrlAnalyze}
                disabled={uploading || !mediaUrl}
                className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:opacity-85 active:scale-[0.98] transition-all disabled:opacity-20 disabled:scale-100 disabled:grayscale"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze URL'}
              </button>
            </div>
            
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-[0.7rem] font-bold uppercase tracking-widest ml-1"
              >
                {urlError}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
