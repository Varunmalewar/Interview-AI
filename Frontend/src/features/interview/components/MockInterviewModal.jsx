import '../style/mock-interview.scss'
import { ChevronRight, Mic2, Square, Timer, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Textarea } from '../../../components/ui/Textarea.jsx'
import { useMediaRecorder } from '../hooks/useMediaRecorder.js'

// ── Timed mode constants ──────────────────────────────────────────────────────
const TIMED_SECONDS = 120 // 2:00 per question
const WARNING_AT = 30 // timer turns warning below this
const DANGER_AT = 10 // timer turns danger below this

const MODES = [
    { id: 'timed', label: 'Timed', icon: <Timer size={16} />, hint: 'Answer each question against a countdown' },
    { id: 'voice', label: 'Voice', icon: <Mic2 size={16} />, hint: 'Record your answer aloud — speak naturally' },
]

const SECTIONS = [
    { id: 'technical', label: 'Technical' },
    { id: 'behavioral', label: 'Behavioral' },
]

const COUNTS = [5, 10, 15]

const scoreTone = (score) => (score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low')

const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

const formatElapsed = (ms) => {
    const total = Math.round(ms / 1000)
    const m = Math.floor(total / 60)
    const s = total % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
}

/**
 * Full-screen mock interview modal. Shares the record → respond shell across
 * Timed (countdown + typed answer) and Voice (recorded answer) modes; every
 * answer is evaluated and persisted as a PracticeAttempt via onEvaluate.
 * Voice answers are transcribed server-side (transcribeAnswer) before scoring.
 */
export const MockInterviewModal = ({ open, onClose, report, reportId, onEvaluate, transcribeAnswer }) => {
    const [mode, setMode] = useState('timed')
    const [section, setSection] = useState('technical')
    const [count, setCount] = useState(5)
    const [phase, setPhase] = useState('setup') // setup | answering | scorecard
    const [questions, setQuestions] = useState([])
    const [index, setIndex] = useState(0)
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [transcribing, setTranscribing] = useState(false)
    const [results, setResults] = useState([])
    const [error, setError] = useState(null)
    const [remaining, setRemaining] = useState(TIMED_SECONDS)
    const [startedAt, setStartedAt] = useState(null)

    const { start: startRecording, stop: stopRecording, reset: resetRecording, blob, isRecording, error: recorderError } = useMediaRecorder()

    const dialogRef = useRef(null)
    const submitRef = useRef(() => {})

    // Reset to the setup screen each time the modal opens.
    useEffect(() => {
        if (open) {
            setPhase('setup')
            setResults([])
            setAnswer('')
            setSubmitting(false)
            setTranscribing(false)
            setError(null)
            resetRecording()
        }
    }, [open, resetRecording])

    // Esc closes the modal; focus moves inside so keyboard users stay in context.
    useEffect(() => {
        if (!open) return
        dialogRef.current?.focus()
        const onKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    // Timed countdown — resets per question, pauses work once submitted.
    useEffect(() => {
        if (phase !== 'answering' || mode !== 'timed') return
        setRemaining(TIMED_SECONDS)
        const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
        return () => clearInterval(id)
    }, [phase, mode, index])

    // Object URL for the recorded-audio preview; revoked when the blob changes.
    const [audioUrl, setAudioUrl] = useState('')
    useEffect(() => {
        if (!blob) {
            setAudioUrl('')
            return undefined
        }
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [blob])

    // Live elapsed timer while the mic is recording.
    const [recordingSeconds, setRecordingSeconds] = useState(0)
    useEffect(() => {
        if (!isRecording) {
            setRecordingSeconds(0)
            return undefined
        }
        const id = setInterval(() => setRecordingSeconds((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [isRecording])

    const current = questions[index]
    const isLast = index === questions.length - 1

    const start = () => {
        const pool = section === 'technical' ? report.technicalQuestions : report.behavioralQuestions
        const list = (pool || []).slice(0, count)
        setQuestions(list)
        setIndex(0)
        setAnswer('')
        setResults([])
        setError(null)
        setStartedAt(Date.now())
        resetRecording()
        setPhase('answering')
    }

    const evaluateCurrent = useCallback(async (text, allowEmpty = false) => {
        if (!current || submitting) return
        if (!text.trim() && !allowEmpty) return
        setSubmitting(true)
        setError(null)
        try {
            const evaluation = await onEvaluate({
                question: current.question,
                intention: current.intention || '',
                modelAnswer: current.answer,
                userAnswer: text,
                mode,
                reportId,
                section,
            })
            const next = [...results, { question: current.question, userAnswer: text, result: evaluation }]
            setResults(next)
            if (isLast) {
                setPhase('scorecard')
            } else {
                setIndex((i) => i + 1)
                setAnswer('')
                resetRecording()
            }
        } catch {
            setError('Something went wrong while evaluating. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }, [current, submitting, results, isLast, mode, reportId, section, onEvaluate, resetRecording])

    // Voice submit: transcribe the recording (unless the user already edited the
    // transcript), then score it the same way as a typed answer.
    const submitVoice = useCallback(async () => {
        if (!current || submitting || transcribing) return
        if (!blob && !answer.trim()) return
        setTranscribing(true)
        setError(null)
        try {
            let text = answer.trim()
            if (!text && blob) {
                const res = await transcribeAnswer(blob)
                text = (res?.transcript || '').trim()
                setAnswer(text)
            }
            await evaluateCurrent(text, true)
        } catch {
            setError('Could not transcribe your recording. Please try again.')
        } finally {
            setTranscribing(false)
        }
    }, [current, submitting, transcribing, blob, answer, transcribeAnswer, evaluateCurrent])

    // Keep the auto-submit (timer hits 0) on the latest closure.
    submitRef.current = () => evaluateCurrent(answer, true)

    // Auto-submit when the timed countdown reaches 0.
    useEffect(() => {
        if (remaining === 0 && phase === 'answering' && mode === 'timed' && !submitting) {
            submitRef.current()
        }
    }, [remaining, phase, mode, submitting])

    if (!open) return null

    const timerTone = remaining <= DANGER_AT ? 'danger' : remaining <= WARNING_AT ? 'warning' : ''
    const avgScore = results.length
        ? Math.round(results.reduce((sum, a) => sum + a.result.score, 0) / results.length)
        : 0

    return (
        <div className='mock-overlay' onClick={onClose}>
            <div
                className='mock-dialog'
                role='dialog'
                aria-modal='true'
                aria-label='Mock interview'
                tabIndex={-1}
                ref={dialogRef}
                onClick={(e) => e.stopPropagation()}
            >
                <header className='mock-dialog__header'>
                    <div className='mock-dialog__title'>
                        <h3>
                            {phase === 'setup' && 'Mock Interview'}
                            {phase === 'answering' && `Question ${index + 1} of ${questions.length}`}
                            {phase === 'scorecard' && 'Scorecard'}
                        </h3>
                        {phase === 'answering' && (
                            <Badge tone='neutral' variant='outline'>
                                {mode === 'timed' ? 'Timed' : 'Voice'}
                            </Badge>
                        )}
                    </div>
                    <button className='mock-dialog__close' onClick={onClose} aria-label='Close mock interview'>
                        <X size={18} />
                    </button>
                </header>

                {/* ── Setup ─────────────────────────────────────────────────── */}
                {phase === 'setup' && (
                    <div className='mock-setup'>
                        <div className='mock-setup__group'>
                            <p className='mock-setup__label'>Mode</p>
                            <div className='mock-setup__options'>
                                {MODES.map((m) => {
                                    const selected = mode === m.id
                                    return (
                                        <button
                                            key={m.id}
                                            type='button'
                                            className={`mock-option ${selected ? 'mock-option--selected' : ''}`}
                                            onClick={() => setMode(m.id)}
                                            aria-pressed={selected}
                                        >
                                            <span className='mock-option__icon'>{m.icon}</span>
                                            <span className='mock-option__text'>
                                                <strong>{m.label}</strong>
                                                <small>{m.hint}</small>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='mock-setup__group'>
                            <p className='mock-setup__label'>Section</p>
                            <div className='mock-setup__options'>
                                {SECTIONS.map((s) => {
                                    const selected = section === s.id
                                    return (
                                        <button
                                            key={s.id}
                                            type='button'
                                            className={`mock-option mock-option--compact ${selected ? 'mock-option--selected' : ''}`}
                                            onClick={() => setSection(s.id)}
                                            aria-pressed={selected}
                                        >
                                            <span className='mock-option__text'>
                                                <strong>{s.label}</strong>
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className='mock-setup__group'>
                            <p className='mock-setup__label'>Questions</p>
                            <div className='mock-setup__counts'>
                                {COUNTS.map((c) => (
                                    <button
                                        key={c}
                                        type='button'
                                        className={`mock-count ${count === c ? 'mock-count--selected' : ''}`}
                                        onClick={() => setCount(c)}
                                        aria-pressed={count === c}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className='mock-setup__actions'>
                            <Button size='md' icon={<ChevronRight size={16} />} iconPosition='right' onClick={start}>
                                Start Mock Interview
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Answering ─────────────────────────────────────────────── */}
                {phase === 'answering' && current && (
                    <div className='mock-answer'>
                        {mode === 'timed' && (
                            <div className={`mock-timer mock-timer--${timerTone || 'idle'}`} role='timer' aria-live='off'>
                                <Timer size={14} />
                                <span>{formatTimer(remaining)}</span>
                            </div>
                        )}

                        <p className='mock-answer__question'>{current.question}</p>

                        {mode === 'voice' && (
                            <div className='mock-voice'>
                                {!blob && !isRecording && (
                                    <Button variant='secondary' size='md' icon={<Mic2 size={16} />} onClick={startRecording}>
                                        Record Answer
                                    </Button>
                                )}

                                {isRecording && (
                                    <div className='mock-voice__recording'>
                                        <span className='mock-voice__dot' />
                                        <span className='mock-voice__elapsed'>Recording… {recordingSeconds}s</span>
                                        <Button size='md' icon={<Square size={14} fill='currentColor' />} onClick={stopRecording}>
                                            Stop
                                        </Button>
                                    </div>
                                )}

                                {blob && !isRecording && (
                                    <div className='mock-voice__preview'>
                                        <audio controls src={audioUrl} className='mock-voice__audio'>
                                            Your browser does not support audio preview.
                                        </audio>
                                        <Button variant='ghost' size='sm' icon={<Trash2 size={14} />} onClick={resetRecording}>
                                            Delete
                                        </Button>
                                    </div>
                                )}

                                {recorderError && <Alert tone='error'>{recorderError}</Alert>}
                            </div>
                        )}

                        <Textarea
                            label='Your answer'
                            hint={
                                mode === 'timed'
                                    ? 'Type your answer before the timer runs out — it submits automatically at 0:00.'
                                    : 'Record with the mic below, or type instead — your transcript appears here and can be edited before submitting.'
                            }
                            placeholder={mode === 'timed' ? 'Start typing your answer…' : 'Your transcript will appear here after you record…'}
                            rows={6}
                            maxLength={2000}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={submitting || transcribing}
                        />

                        {error && <Alert tone='error'>{error}</Alert>}

                        <div className='mock-answer__actions'>
                            {mode === 'timed' ? (
                                <Button
                                    size='md'
                                    icon={<ChevronRight size={16} />}
                                    iconPosition='right'
                                    loading={submitting}
                                    disabled={!answer.trim()}
                                    onClick={() => evaluateCurrent(answer)}
                                >
                                    {isLast ? 'Finish Interview' : 'Submit Answer'}
                                </Button>
                            ) : (
                                <Button
                                    size='md'
                                    icon={<ChevronRight size={16} />}
                                    iconPosition='right'
                                    loading={submitting || transcribing}
                                    disabled={!blob && !answer.trim()}
                                    onClick={submitVoice}
                                >
                                    {isLast ? 'Finish Interview' : 'Submit Answer'}
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Scorecard ─────────────────────────────────────────────── */}
                {phase === 'scorecard' && (
                    <div className='mock-scorecard'>
                        <div className='mock-scorecard__summary'>
                            <div className={`mock-scorecard__ring score--${scoreTone(avgScore)}`}>
                                <span className='mock-scorecard__value'>{avgScore}</span>
                                <span className='mock-scorecard__pct'>/100</span>
                            </div>
                            <div className='mock-scorecard__meta'>
                                <p className='mock-scorecard__title'>
                                    {avgScore >= 80 ? 'Excellent!' : avgScore >= 60 ? 'Solid performance' : 'Keep practicing'}
                                </p>
                                <p className='mock-scorecard__sub'>
                                    {results.length} questions · {startedAt ? formatElapsed(Date.now() - startedAt) : ''} · {mode} mode
                                </p>
                            </div>
                        </div>

                        <ul className='mock-scorecard__list'>
                            {results.map((attempt, i) => (
                                <li key={i} className='mock-scorecard__item'>
                                    <span className='mock-scorecard__item-question'>{attempt.question}</span>
                                    <Badge tone={attempt.result.score >= 80 ? 'success' : attempt.result.score >= 60 ? 'warning' : 'danger'} variant='soft'>
                                        {Math.round(attempt.result.score)}%
                                    </Badge>
                                </li>
                            ))}
                        </ul>

                        <div className='mock-scorecard__actions'>
                            <Button variant='secondary' onClick={start}>
                                Run Again
                            </Button>
                            <Button variant='primary' onClick={onClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
