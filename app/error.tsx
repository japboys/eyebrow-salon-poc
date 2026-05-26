'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-primary mb-2">エラーが発生しました</h2>
        <p className="text-sm text-textLight mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primaryLight transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  )
}
