import '../style/progress-panel.scss'
import { Mic2, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Spinner } from '../../../components/ui/Spinner.jsx'

const scoreTone = (score) => (score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low')

const MODE_LABELS = { practice: 'Practice', voice: 'Voice', timed: 'Timed' }

const SECTIONS = [
    { id: 'technical', label: 'Technical' },
    { id: 'behavioral', label: 'Behavioral' },
]

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const formatBarDate = (dateKey) => {
    const [, m, d] = dateKey.split('-')
    return `${Number(m)}/${Number(d)}`
}

/**
 * Readiness Score + Progress Tracking dashboard (the 4th tab).
 * Renders practice stats (readiness ring, section breakdown, 14-day history,
 * streak, attempts by mode) plus the 10 most recent attempts.
 */
const ProgressPanel = ({ reportId, getStats, getAttempts, onStartMock }) => {
    const [stats, setStats] = useState(null)
    const [attempts, setAttempts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const [s, a] = await Promise.all([
                    getStats({ reportId }),
                    getAttempts({ reportId, limit: 10 }),
                ])
                if (cancelled) return
                setStats(s)
                setAttempts(a || [])
            } catch {
                if (!cancelled) setError('Could not load your practice progress.')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [reportId, getStats, getAttempts])

    if (loading) {
        return (
            <section className='progress-panel'>
                <div className='progress-state'>
                    <Spinner />
                    <p>Loading your progress…</p>
                </div>
            </section>
        )
    }

    if (error || !stats) {
        return (
            <section className='progress-panel'>
                <Alert tone='error'>{error || 'Progress is unavailable right now.'}</Alert>
            </section>
        )
    }

    if (stats.totalAttempts === 0) {
        return (
            <section className='progress-panel'>
                <div className='content-header'>
                    <h2>Progress</h2>
                </div>
                <div className='progress-state progress-state--empty'>
                    <span className='progress-state__icon'>
                        <TrendingUp size={26} />
                    </span>
                    <h3>No practice attempts yet</h3>
                    <p>Practice a question or run a mock interview to start building your readiness score.</p>
                    {onStartMock && (
                        <Button size='md' icon={<Mic2 size={16} />} onClick={onStartMock}>
                            Start a Mock Interview
                        </Button>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section className='progress-panel'>
            <div className='content-header'>
                <h2>Progress</h2>
            </div>

            {/* ── Readiness ring + summary ─────────────────────────────────── */}
            <div className='progress-readiness'>
                <div className={`progress-readiness__ring score--${scoreTone(stats.readiness)}`}>
                    <span className='progress-readiness__value'>{stats.readiness}</span>
                    <span className='progress-readiness__pct'>/100</span>
                </div>
                <div className='progress-readiness__meta'>
                    <p className='progress-readiness__title'>Readiness Score</p>
                    <p className='progress-readiness__sub'>
                        Based on your {stats.totalAttempts} practice answers
                    </p>
                    <p className='progress-readiness__streak'>
                        {stats.streak > 0 ? `${stats.streak}-day streak` : 'No active streak yet'}
                    </p>
                </div>
            </div>

            {/* ── Section breakdown + mode chips ───────────────────────────── */}
            <div className='progress-grid'>
                {SECTIONS.map((s) => {
                    const avg = stats.avgScoreBySection?.[s.id]
                    return (
                        <div key={s.id} className='progress-card'>
                            <p className='progress-card__label'>{s.label}</p>
                            <div className='progress-card__track'>
                                <div
                                    className={`progress-card__bar score--${avg == null ? 'low' : scoreTone(avg)}`}
                                    style={{ width: `${avg ?? 0}%` }}
                                />
                            </div>
                            <p className='progress-card__value'>{avg == null ? '—' : `${avg}%`}</p>
                        </div>
                    )
                })}

                <div className='progress-card progress-card--modes'>
                    <p className='progress-card__label'>Attempts by Mode</p>
                    <div className='progress-card__chips'>
                        {Object.entries(stats.attemptsByMode || {}).map(([mode, count]) =>
                            count > 0 ? (
                                <Badge key={mode} tone='neutral' variant='outline'>
                                    {MODE_LABELS[mode] || mode} · {count}
                                </Badge>
                            ) : null
                        )}
                    </div>
                </div>
            </div>

            {/* ── 14-day score history ─────────────────────────────────────── */}
            <div className='progress-history'>
                <p className='progress-card__label'>Score History · Last 14 Days</p>
                <div className='progress-history__chart' aria-label='Average score per day over the last 14 days'>
                    {stats.scoreHistory.map((d) => (
                        <div key={d.date} className='progress-history__col'>
                            <div className='progress-history__track'>
                                {d.average != null && (
                                    <div
                                        className={`progress-history__bar score--${scoreTone(d.average)}`}
                                        style={{ height: `${d.average}%` }}
                                        title={`${formatBarDate(d.date)} — ${d.average}%`}
                                    />
                                )}
                            </div>
                            <span className='progress-history__date'>{formatBarDate(d.date)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Recent attempts ──────────────────────────────────────────── */}
            <div className='progress-recent'>
                <p className='progress-card__label'>Recent Attempts</p>
                {attempts.length === 0 ? (
                    <p className='progress-recent__empty'>No attempts recorded yet.</p>
                ) : (
                    <ul className='progress-recent__list'>
                        {attempts.slice(0, 10).map((a) => (
                            <li key={a._id} className='progress-recent__item'>
                                <span className='progress-recent__question'>{a.question}</span>
                                <span className='progress-recent__meta'>
                                    <Badge tone='neutral' variant='outline'>
                                        {MODE_LABELS[a.mode] || a.mode}
                                    </Badge>
                                    <span className={`progress-recent__score score--${scoreTone(a.score)}`}>
                                        {Math.round(a.score)}%
                                    </span>
                                    <span className='progress-recent__date'>{formatDate(a.createdAt)}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}

export default ProgressPanel
