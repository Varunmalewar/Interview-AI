import '../style/interview.scss'
import { CodeXml, MessageSquare, Navigation, Sparkles } from 'lucide-react'
import { useInterview } from '../hooks/useInterview.js'
import { useParams } from 'react-router'
import Navbar from '../../../components/Navbar.jsx'
import { Spinner } from '../../../components/ui/Spinner.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Tabs, TabList, Tab, TabPanel } from '../../../components/ui/Tabs.jsx'
import { AccordionItem } from '../../../components/ui/Accordion.jsx'
import { useMediaQuery } from '../../../hooks/useMediaQuery.js'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: <CodeXml size={16} /> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <MessageSquare size={16} /> },
    { id: 'roadmap', label: 'Road Map', icon: <Navigation size={16} /> },
]

const SEVERITY_TONE = { high: 'danger', medium: 'warning', low: 'success' }

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, section }) => (
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
    const { report, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const isMobile = useMediaQuery('(max-width: 767px)')

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
                                            <QuestionCard key={i} section='technical' item={q} index={i} />
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
                                            <QuestionCard key={i} section='behavioral' item={q} index={i} />
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
                        </main>

                        <div className='interview-divider' />

                        {/* ── Right Sidebar ── */}
                        <aside className='interview-sidebar'>
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
        </>
    )
}

export default Interview