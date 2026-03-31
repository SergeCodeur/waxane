import { useState, useEffect, useRef } from 'react'
import OtpInput from './OtpInput.jsx'
import './VoteModal.css'

function VoteModal({ siteId, onClose }) {
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [validating, setValidating] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const phoneRef = useRef(null)

  const siteName = siteId === 'siteA' ? 'Site A' : 'Site B'

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (step === 'phone' && phoneRef.current) {
      phoneRef.current.focus()
    }
  }, [step])

  const handleSendCode = () => {
    if (!phone || !/^\d{8,15}$/.test(phone)) {
      alert('Veuillez entrer un numéro valide (chiffres uniquement, sans le +).')
      return
    }

    setSending(true)
    // FIXME: À remplacer par fetch /api/send-otp
    setTimeout(() => {
      setSending(false)
      setStep('otp')
    }, 1000)
  }

  const handleValidate = () => {
    if (otpCode.length !== 6) {
      alert('Veuillez entrer les 6 chiffres du code reçu.')
      return
    }

    setValidating(true)
    // FIXME: À remplacer par fetch /api/verify-otp
    setTimeout(() => {
      setValidating(false)
      alert('Merci ! Votre vote a bien été pris en compte 🎉')
      onClose()
    }, 1200)
  }

  const handlePhoneKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendCode()
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">×</button>

        <h2>Voter pour le {siteId === 'siteA' ? 'Site A' : 'Site B'}</h2>
        <p className="modal-desc">
          {step === 'phone'
            ? 'Le vote est unique et anonyme. Entrez votre numéro WhatsApp pour recevoir un code de vérification.'
            : `Un code à 6 chiffres a été envoyé sur WhatsApp au +${phone}.`}
        </p>

        {step === 'phone' && (
          <div className="step-phone">
            <label htmlFor="phone">Numéro WhatsApp</label>
            <div className="input-wrapper">
              <span className="prefix">+</span>
              <input
                ref={phoneRef}
                id="phone"
                type="tel"
                placeholder="22960000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handlePhoneKey}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleSendCode}
              disabled={sending}
            >
              {sending ? 'Envoi en cours...' : 'Recevoir mon code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="step-otp">
            <label>Code de vérification (6 chiffres)</label>
            <OtpInput length={6} onChange={setOtpCode} onComplete={handleValidate} />
            <button
              className="btn-primary"
              onClick={handleValidate}
              disabled={validating}
            >
              {validating ? 'Validation...' : 'Valider mon vote'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VoteModal
