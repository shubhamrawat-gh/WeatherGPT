import { useState, useEffect, useRef } from 'react'

interface TypingTextProps {
  words: string[]
}

export default function TypingText({ words }: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const wordsRef = useRef(words)
  useEffect(() => {
    wordsRef.current = words
  })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const activeWord = wordsRef.current[currentWordIndex] || ''

    if (!isDeleting) {
      if (currentText !== activeWord) {
        timer = setTimeout(() => {
          setCurrentText(activeWord.slice(0, currentText.length + 1))
        }, 40) // Snappy typing speed
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, 1200) // 1.2s pause at full word
      }
    } else {
      if (currentText !== '') {
        timer = setTimeout(() => {
          setCurrentText(activeWord.slice(0, currentText.length - 1))
        }, 20) // Fast deletion speed
      } else {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % wordsRef.current.length)
      }
    }

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, currentWordIndex])

  return (
    <span className="text-brand-green inline-grid grid-cols-1 grid-rows-1 align-bottom">
      {/* Invisible template word to reserve space and prevent layout shifts */}
      <span className="invisible col-start-1 row-start-1 select-none">Stronger_</span>
      {/* The animated visible word */}
      <span className="col-start-1 row-start-1">
        {currentText}
        <span className="animate-cursor-blink select-none">_</span>
      </span>
    </span>
  )
}

