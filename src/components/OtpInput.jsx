import { useRef, useEffect } from 'react'
import './OtpInput.css'

function OtpInput({ length = 6, onChange, onComplete }) {
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const getCode = () => inputs.current.map(i => i.value).join('')

  const handleInput = (e, index) => {
    const value = e.target.value.replace(/\D/g, '')
    e.target.value = value.slice(-1)

    const code = getCode()
    onChange(code)

    if (value && index < length - 1) {
      inputs.current[index + 1].focus()
    }

    if (code.length === length) {
      onComplete?.()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)

    data.split('').forEach((char, i) => {
      if (inputs.current[i]) {
        inputs.current[i].value = char
      }
    })

    const focusIdx = Math.min(data.length, length - 1)
    inputs.current[focusIdx]?.focus()

    onChange(getCode())
  }

  return (
    <div className="otp-container">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="otp-digit"
          onInput={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}

export default OtpInput
