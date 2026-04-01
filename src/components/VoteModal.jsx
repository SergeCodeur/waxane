import { useState, useEffect, useRef } from 'react'
import OtpInput from './OtpInput.jsx'
import './VoteModal.css'

function VoteModal({ siteId, onClose }) {
  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'confirmed'
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [validating, setValidating] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [error, setError] = useState('')
  const phoneRef = useRef(null)

  const isBusy = sending || validating || cooldown

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !isBusy) onClose(step === 'confirmed')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isBusy, step])

  // Bloquer le scroll du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (step === 'phone' && phoneRef.current) {
      phoneRef.current.focus()
    }
  }, [step])

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError('Veuillez entrer votre numéro WhatsApp.')
      return
    }

    if (!/^\d{8,15}$/.test(phone)) {
      setError('Numéro invalide.')
      return
    }

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: phone, siteChoice: siteId }),
      })

      if (res.ok) {
        // Cooldown visuel de 2s avant de passer à l'étape OTP
        setCooldown(true)
        setTimeout(() => {
          setCooldown(false)
          setSending(false)
          setStep('otp')
        }, 2000)
        return
      } else {
        const data = await res.json()
        if (data.error === 'already_voted') {
          setError('Ce numéro a déjà voté.')
        } else {
          setError('Une erreur est survenue. Réessayez.')
        }
      }
    } catch {
      setError('Une erreur est survenue. Réessayez.')
    }

    setSending(false)
  }

  const handleValidate = async () => {
    if (otpCode.length < 6) {
      setError('Veuillez entrer le code complet.')
      return
    }

    setValidating(true)
    setError('')

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: phone, code: otpCode, siteChoice: siteId }),
      })

      if (res.ok) {
        setStep('confirmed')
      } else {
        const data = await res.json()
        if (data.error === 'invalid_code') {
          setError('Code incorrect ou expiré.')
        } else {
          setError('Une erreur est survenue. Réessayez.')
        }
      }
    } catch {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setValidating(false)
    }
  }

  const handlePhoneKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendCode()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isBusy) {
      onClose(step === 'confirmed')
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button
          className="modal-close"
          onClick={() => !isBusy && onClose(step === 'confirmed')}
          aria-label="Fermer"
        >
          ×
        </button>

        {step === 'confirmed' ? (
          <div className="step-confirmed">
            <h2>Merci !</h2>
            <p className="modal-desc">Votre vote a bien été pris en compte.</p>
            <button className="btn-primary" onClick={() => onClose(true)}>Fermer</button>
          </div>
        ) : (
          <>
            <h2>Voter pour le {siteId === 'siteA' ? 'Site A' : 'Site B'}</h2>
            <p className="modal-desc">
              {step === 'phone'
                ? 'Le vote est unique et anonyme. Entrez votre numéro WhatsApp pour recevoir un code de vérification.'
                : `Un code à 6 chiffres a été envoyé sur WhatsApp au +${phone}.`}
            </p>

            {step === 'phone' && (
              <div className="step-phone">
                <label htmlFor="phone">Numéro WhatsApp (avec indicatif pays)</label>
                <div className="input-wrapper">
                  <span className="prefix">+</span>
                  <input
                    ref={phoneRef}
                    id="phone"
                    type="tel"
                    placeholder="2290160000000"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                    onKeyDown={handlePhoneKey}
                  />
                </div>
                <p className="phone-hint">Ex : 2290160000000 ou 33600000000</p>
                {error && <p className="modal-error">{error}</p>}
                <button
                  className="btn-primary"
                  onClick={handleSendCode}
                  disabled={sending || cooldown}
                >
                  {sending || cooldown ? 'Envoi en cours...' : 'Recevoir mon code'}
                </button>
              </div>
            )}

            {step === 'otp' && (
              <div className="step-otp">
                <label>Code de vérification (6 chiffres)</label>
                <OtpInput length={6} onChange={(val) => { setOtpCode(val); setError('') }} onComplete={handleValidate} />
                {error && <p className="modal-error">{error}</p>}
                <button
                  className="btn-primary"
                  onClick={handleValidate}
                  disabled={validating}
                >
                  {validating ? 'Validation...' : 'Valider mon vote'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default VoteModal
