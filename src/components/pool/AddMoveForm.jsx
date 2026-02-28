import React, { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'

export default function AddMoveForm({ onSubmit, category, loading = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isCollab, setIsCollab] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({ title: title.trim(), description: description.trim(), isCollab })
    setTitle('')
    setDescription('')
    setIsCollab(false)
  }

  return (
    <Card className="p-5">
      <h3 className="font-display text-lg text-charcoal mb-4">
        Add a Move
        <span className="ml-2 capitalize text-warm-gray text-base">({category})</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What is the move?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block font-body font-medium text-sm text-charcoal mb-1.5">
            Description <span className="text-warm-gray font-normal">(optional)</span>
          </label>
          <textarea
            className={[
              'w-full rounded-xl bg-cream border border-warm-gray/30 px-4 py-3 text-charcoal',
              'placeholder:text-warm-gray outline-none transition-all duration-200 font-body',
              'focus:border-sky-blue focus:ring-2 focus:ring-sky-blue/20',
              'resize-none',
            ].join(' ')}
            rows={3}
            placeholder="Add some details or rules for this move..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Collab toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-semibold text-charcoal">Collab Move</p>
            <p className="font-body text-xs text-warm-gray">Requires a partner to complete</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isCollab}
            onClick={() => setIsCollab((prev) => !prev)}
            className={[
              'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
              isCollab ? 'bg-sunset-gold' : 'bg-light-warm-gray',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                'mt-1',
                isCollab ? 'translate-x-6 ml-0' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        </div>

        <Button
          type="submit"
          disabled={!title.trim()}
          loading={loading}
          className="w-full"
        >
          Add to Pool
        </Button>
      </form>
    </Card>
  )
}
