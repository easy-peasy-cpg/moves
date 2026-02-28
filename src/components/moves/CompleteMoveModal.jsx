import React, { useState, useEffect, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import confetti from 'canvas-confetti'
import { supabase } from '../../lib/supabase'
import { getCelebrationPrompt } from '../../lib/api'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import CategoryPill from '../ui/CategoryPill'
import Avatar from '../ui/Avatar'

export default function CompleteMoveModal({
  move,
  isOpen,
  onClose,
  onComplete,
  seasonId,
  userId,
  members = [],
}) {
  const pool = move?.moves_pool || {}
  const fileInputRef = useRef(null)

  const [celebrationPrompt, setCelebrationPrompt] = useState('')
  const [promptLoading, setPromptLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [story, setStory] = useState('')
  const [collabPartnerId, setCollabPartnerId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Determine if this is a collab move
  const isCollab = pool.category === 'social' || move?.is_collab

  // Crew members excluding self
  const crewOptions = members
    .filter((m) => m.user_id !== userId)
    .map((m) => ({
      id: m.user_id,
      name: m.profiles?.display_name || m.profiles?.username || 'Unknown',
      avatar: m.profiles?.avatar_url,
    }))

  // Fetch celebration prompt when modal opens
  useEffect(() => {
    if (!isOpen || !pool.title) return

    async function fetchPrompt() {
      setPromptLoading(true)
      try {
        const prompt = await getCelebrationPrompt(pool.title, pool.category)
        setCelebrationPrompt(prompt)
      } catch {
        setCelebrationPrompt('You did it! Drop the proof.')
      } finally {
        setPromptLoading(false)
      }
    }

    fetchPrompt()
  }, [isOpen, pool.title, pool.category])

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Compress image
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })
      setSelectedFile(compressed)
      setPreview(URL.createObjectURL(compressed))
    } catch (err) {
      console.error('Error compressing image:', err)
      // Fall back to original file
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview)
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadPhoto() {
    if (!selectedFile) return null

    const filePath = `${seasonId}/${userId}/${move.id}.jpg`

    const { data, error } = await supabase.storage
      .from('move-photos')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: selectedFile.type || 'image/jpeg',
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('move-photos')
      .getPublicUrl(filePath)

    return urlData?.publicUrl || null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      setUploading(true)
      const photoUrl = await uploadPhoto()
      setUploading(false)

      await onComplete({
        photoUrl,
        story: story.trim() || null,
        collabPartnerId: collabPartnerId || null,
      })

      // Fire confetti on success
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#5BB5E0', '#F5A623', '#D4725E', '#C94277', '#8BAF7A', '#6B4FA0', '#FAD96E'],
      })
    } catch (err) {
      console.error('Error submitting move:', err)
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (!move) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title + Category */}
        <div>
          <h2 className="font-display text-xl text-charcoal">
            Complete: {pool.title}
          </h2>
          <div className="mt-2">
            <CategoryPill category={pool.category} size="sm" />
          </div>
        </div>

        {/* AI Celebration Prompt */}
        <div className="bg-cream rounded-xl p-4">
          {promptLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-sunset-gold border-t-transparent rounded-full animate-spin" />
              <span className="font-body text-sm text-warm-gray italic">Loading your prompt...</span>
            </div>
          ) : (
            <p className="font-body text-sm text-charcoal italic leading-relaxed">
              {celebrationPrompt || 'You did it! Drop the proof.'}
            </p>
          )}
        </div>

        {/* Photo Upload */}
        <div>
          <h3 className="font-body font-semibold text-charcoal text-sm mb-2">
            Drop the proof.
          </h3>

          {preview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-charcoal/60 text-white flex items-center justify-center hover:bg-charcoal/80 transition-colors"
                aria-label="Remove photo"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-warm-gray/30 rounded-xl p-8 text-center hover:border-sky-blue/50 hover:bg-sky-blue/5 transition-all duration-200 group"
            >
              <svg
                className="w-10 h-10 mx-auto text-warm-gray group-hover:text-sky-blue transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="font-body text-sm text-warm-gray mt-2 group-hover:text-charcoal transition-colors">
                Tap to add a photo
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Story / Caption */}
        <div>
          <label className="block font-body font-medium text-sm text-charcoal mb-1.5">
            Story
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={celebrationPrompt || 'Tell the story...'}
            rows={3}
            className="w-full rounded-xl bg-cream border border-warm-gray/30 px-4 py-3 text-charcoal placeholder:text-warm-gray outline-none transition-all duration-200 font-body focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20 resize-none"
          />
        </div>

        {/* Collab Partner */}
        {isCollab && crewOptions.length > 0 && (
          <div>
            <label className="block font-body font-medium text-sm text-charcoal mb-1.5">
              Tag a partner
            </label>
            <select
              value={collabPartnerId}
              onChange={(e) => setCollabPartnerId(e.target.value)}
              className="w-full rounded-xl bg-cream border border-warm-gray/30 px-4 py-3 text-charcoal outline-none transition-all duration-200 font-body focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20"
            >
              <option value="">Select a crew member</option>
              {crewOptions.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-sage-green text-white hover:bg-sage-green/90"
          size="lg"
          loading={submitting}
          disabled={submitting}
        >
          {uploading ? 'Uploading photo...' : 'Post Your Move'}
        </Button>
      </form>
    </Modal>
  )
}
