import '../style/interview.scss'
import { CodeXml, Copy, MessageSquare, Mic2, Navigation, PenLine, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'
import { MockInterviewModal } from '../components/MockInterviewModal.jsx'
import ProgressPanel from '../components/ProgressPanel.jsx'
import Navbar from '../../../components/Navbar.jsx'
import { Spinner } from '../../../components/ui/Spinner.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Textarea } from '../../../components/ui/Textarea.jsx'
import { Alert } from '../../../components/ui/Alert.jsx'
import { useToast } from '../../../components/ui/Toast.jsx'
import { Tabs, TabList, Tab, TabPanel } from '../../../components/ui/Tabs.jsx'
import { AccordionItem } from '../../../components/ui/Accordion.jsx'
import { useMediaQuery } from '../../../hooks/useMediaQuery.js'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: <CodeXml size={16} /> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <MessageSquare size={16} /> },
    { id: 'roadmap', label: 'Road Map', icon: <Navigation size={16} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={16} /> },
]

const SEVERITY_TONE = { high: 'danger', medium: 'warning', low: 'success' }

const scoreTone = (score) => (score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low')

// Clipboard fallback for non-secure contexts where navigator.clipboard is absent.
const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
}

// ── Sub-components ────────────────────────────────────────────────────────────
// A single follow-up question with its own nested practice loop (one level deep).
const FollowUpPractice = ({ followUp, sourceQuestion, modelAnswer, section, reportId, onEvaluate }) => {
    const [open, setOpen] = useState(false)
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const submitAnswer = async () => {
        if (!answer.trim() || submitting) return
        setSubmitting(true)
        setError(null)
        try {
            const evaluation = await onEvaluate({
                question: followUp,
                intention: '',
                modelAnswer,
                userAnswer: answer,
                mode: 'practice',
                section,
                reportId,
                sourceQuestion,
            })
            setResult(evaluation)
        } catch {
            setError('Something went wrong while evaluating. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // Nested result replaces the follow-up block (depth stays at 1 — no deeper loops).
    if (result) {
        return <PracticeResult result={result} depth={1} />
    }

    return (
        <div className='follow-up'>
            <div className='follow-up__row'>
                <p className='follow-up__question'>{followUp}</p>
                <Button variant='ghost' size='sm' icon={<PenLine size={14} />} onClick={() => setOpen((o) => !o)}>
                    {open ? 'Close' : 'Practice'}
                </Button>
            </div>
            {open && (
                <div className='follow-up__panel'>
                    <Textarea
                        label='Your answer'
                        placeholder='Answer the follow-up question…'
                        rows={3}
                        maxLength={2000}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                    <div className='follow-up__actions'>
                        <Button
                            size='sm'
                            icon={<Sparkles size={14} />}
                            loading={submitting}
                            disabled={!answer.trim()}
                            onClick={submitAnswer}
                        >
                            Evaluate
                        </Button>
                    </div>
                    {error && <Alert tone='error'>{error}</Alert>}
                </div>
            )}
        </div>
    )
}

const PracticeResult = ({ result, depth = 0, section, reportId, sourceQuestion, modelAnswer, onEvaluate }) => {
    const score = Math.round(result.score)

    return (
        <div className='practice-result'>
            <div className='practice-result__header'>
                <div className={`practice-result__ring score--${scoreTone(score)}`}>
                    <span className='practice-result__value'>{score}</span>
                    <span className='practice-result__pct'>/100</span>
                </div>
                <div className='practice-result__feedback'>
                    <Badge tone={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'} variant='soft'>
                        {score >= 80 ? 'Strong answer' : score >= 60 ? 'Solid, could be better' : 'Needs work'}
                    </Badge>
                    <p>{result.feedback}</p>
                </div>
            </div>

            {result.keyPoints?.length > 0 && (
                <div className='practice-result__list'>
                    <p className='practice-result__list-label'>Key points to mention</p>
                    <ul>
                        {result.keyPoints.map((point, i) => (
                            <li key={i}>
                                <span className='practice-result__bullet' />
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {result.tips?.length > 0 && (
                <div className='practice-result__list'>
                    <p className='practice-result__list-label'>Tips to improve</p>
                    <ul>
                        {result.tips.map((tip, i) => (
                            <li key={i}>
                                <span className='practice-result__bullet' />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {depth === 0 && result.followUps?.length > 0 && (
                <div className='practice-result__list'>
                    <p className='practice-result__list-label'>Follow-up practice</p>
                    <ul className='follow-up-list'>
                        {result.followUps.map((followUp, i) => (
                            <li key={i}>
                                <FollowUpPractice
                                    followUp={followUp}
                                    sourceQuestion={sourceQuestion}
                                    modelAnswer={modelAnswer}
                                    section={section}
                                    reportId={reportId}
                                    onEvaluate={onEvaluate}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

const QuestionCard = ({ item, index, section, reportId, onEvaluate }) => {
    const toast = useToast()
    const [practicing, setPracticing] = useState(false)
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)

    const copyTimer = useRef(null)
    useEffect(() => () => clearTimeout(copyTimer.current), [])

    const copyAnswer = async () => {
        try {
            await copyToClipboard(item.answer)
            setCopied(true)
            toast.success('Model answer copied to clipboard')
            clearTimeout(copyTimer.current)
            copyTimer.current = setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Could not copy automatically — select the answer and copy it manually')
        }
    }

    const togglePractice = () => {
        setPracticing((open) => !open)
        if (practicing) {
            setResult(null)
            setError(null)
        }
    }

    const submitAnswer = async () => {
        if (!answer.trim() || submitting) return
        setSubmitting(true)
        setError(null)
        try {
            const evaluation = await onEvaluate({
                question: item.question,
                intention: item.intention,
                modelAnswer: item.answer,
                userAnswer: answer,
                mode: 'practice',
                section,
                reportId,
            })
            setResult(evaluation)
        } catch {
            setError('Something went wrong while evaluating. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AccordionItem
            id={`${section}-q-${index}`}
            className='q-card'
            summary={
                <>
                    <span className='q-card__index'>Q{index + 1}</span>
                    <p className='q-card__question'>{item.question}</p>
                </>
            }
        >
            <div className='q-card__body'>
                <div className='q-card__toolbar'>
                    <Button variant='ghost' size='sm' icon={<Copy size={14} />} onClick={copyAnswer}>
                        {copied ? 'Copied!' : 'Copy Answer'}
                    </Button>
                    <Button
                        variant={practicing ? 'primary' : 'secondary'}
                        size='sm'
                        icon={<PenLine size={14} />}
                        onClick={togglePractice}
                    >
                        {practicing ? 'Close Practice' : 'Practice'}
                    </Button>
                </div>

                {practicing && (
                    <div className='q-card__practice'>
                        <Textarea
                            label='Your answer'
                            hint='Type your answer as if you were in the interview — it will be scored against the model answer.'
                            placeholder='Start typing your answer…'
                            rows={5}
                            maxLength={2000}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <div className='q-card__practice-actions'>
                            <Button
                                size='sm'
                                icon={<Sparkles size={14} />}
                                loading={submitting}
                                disabled={!answer.trim()}
                                onClick={submitAnswer}
                            >
                                Evaluate Answer
                            </Button>
                        </div>

                        {error && <Alert tone='error'>{error}</Alert>}
                        {result && (
                            <PracticeResult
                                result={result}
                                section={section}
                                reportId={reportId}
                                sourceQuestion={item.question}
                                modelAnswer={item.answer}
                                onEvaluate={onEvaluate}
                            />
                        )}
                    </div>
                )}

                <div className='q-card__section'>
                    <Badge tone='intention' variant='outline'>
                        Intention
                    </Badge>
                    <p>{item.intention}</p>
                </div>
                <div className='q-card__section'>
                    <Badge tone='success' variant='outline'>
                        Model Answer
                    </Badge>
                    <p>{item.answer}</p>
                </div>
            </div>
        </AccordionItem>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const { report, loading, getResumePdf, evaluateAnswerResponse, transcribeAnswer, getPracticeStats, getPracticeAttempts } = useInterview()
    const { interviewId } = useParams()
    const isMobile = useMediaQuery('(max-width: 767px)')
    const [mockOpen, setMockOpen] = useState(false)

    // The report is already fetched by useInterview's own effect based on
    // the route's interviewId param — no need to fetch it again here.

    if (loading || !report) {
        return (
            <>
                <Navbar />
                <main className='page-loading'>
                    <Spinner size='lg' />
                    <p>Loading your interview plan…</p>
                </main>
            </>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'

    return (
        <>
            <Navbar />
            <div className='interview-page'>
                <div className='interview-layout'>
                    <Tabs defaultActiveId='technical'>
                        {/* ── Left Nav ── */}
                        <nav className='interview-nav'>
                            <div className='nav-content'>
                                <p className='interview-nav__label'>Sections</p>
                                <TabList orientation={isMobile ? 'horizontal' : 'vertical'}>
                                    {NAV_ITEMS.map((item) => (
                                        <Tab key={item.id} id={item.id} icon={item.icon}>
                                            {item.label}
                                        </Tab>
                                    ))}
                                </TabList>
                            </div>
                            <Button
                                variant='secondary'
                                size='sm'
                                icon={<Sparkles size={14} />}
                                onClick={() => getResumePdf(interviewId)}
                            >
                                Download Resume
                            </Button>
                        </nav>

                        <div className='interview-divider' />

                        {/* ── Center Content ── */}
                        <main className='interview-content'>
                            <TabPanel id='technical'>
                                <section>
                                    <div className='content-header'>
                                        <h2>Technical Questions</h2>
                                        <Badge tone='neutral' variant='outline'>
                                            {report.technicalQuestions.length} questions
                                        </Badge>
                                    </div>
                                    <div className='q-list'>
                                        {report.technicalQuestions.map((q, i) => (
                                            <QuestionCard key={i} section='technical' item={q} index={i} reportId={interviewId} onEvaluate={evaluateAnswerResponse} />
                                        ))}
                                    </div>
                                </section>
                            </TabPanel>

                            <TabPanel id='behavioral'>
                                <section>
                                    <div className='content-header'>
                                        <h2>Behavioral Questions</h2>
                                        <Badge tone='neutral' variant='outline'>
                                            {report.behavioralQuestions.length} questions
                                        </Badge>
                                    </div>
                                    <div className='q-list'>
                                        {report.behavioralQuestions.map((q, i) => (
                                            <QuestionCard key={i} section='behavioral' item={q} index={i} reportId={interviewId} onEvaluate={evaluateAnswerResponse} />
                                        ))}
                                    </div>
                                </section>
                            </TabPanel>

                            <TabPanel id='roadmap'>
                                <section>
                                    <div className='content-header'>
                                        <h2>Preparation Road Map</h2>
                                        <Badge tone='neutral' variant='outline'>
                                            {report.preparationPlan.length}-day plan
                                        </Badge>
                                    </div>
                                    <div className='roadmap-list'>
                                        {report.preparationPlan.map((day) => (
                                            <RoadMapDay key={day.day} day={day} />
                                        ))}
                                    </div>
                                </section>
                            </TabPanel>

                            <TabPanel id='progress'>
                                <ProgressPanel
                                    reportId={interviewId}
                                    getStats={getPracticeStats}
                                    getAttempts={getPracticeAttempts}
                                    onStartMock={() => setMockOpen(true)}
                                />
                            </TabPanel>
                        </main>

                        <div className='interview-divider' />

                        {/* ── Right Sidebar ── */}
                        <aside className='interview-sidebar'>
                            {/* Mock Interview launch */}
                            <Button
                                variant='secondary'
                                size='sm'
                                fullWidth
                                icon={<Mic2 size={14} />}
                                onClick={() => setMockOpen(true)}
                            >
                                Mock Interview
                            </Button>

                            {/* Match Score */}
                            <div className='match-score'>
                                <p className='match-score__label'>Match Score</p>
                                <div className={`match-score__ring ${scoreColor}`}>
                                    <span className='match-score__value'>{report.matchScore}</span>
                                    <span className='match-score__pct'>%</span>
                                </div>
                                <p className='match-score__sub'>Strong match for this role</p>
                            </div>

                            <div className='sidebar-divider' />

                            {/* Skill Gaps */}
                            <div className='skill-gaps'>
                                <p className='skill-gaps__label'>Skill Gaps</p>
                                <div className='skill-gaps__list'>
                                    {report.skillGaps.map((gap, i) => (
                                        <Badge
                                            key={i}
                                            tone={SEVERITY_TONE[gap.severity] ?? 'neutral'}
                                            variant='outline'
                                        >
                                            {gap.skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </Tabs>
                </div>
            </div>
            <MockInterviewModal
                open={mockOpen}
                onClose={() => setMockOpen(false)}
                report={report}
                reportId={interviewId}
                onEvaluate={evaluateAnswerResponse}
                transcribeAnswer={transcribeAnswer}
            />
        </>
    )
}

export default Interview