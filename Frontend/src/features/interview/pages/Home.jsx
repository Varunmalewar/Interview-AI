import { useState } from 'react'
import { FileText, User, Sparkles } from 'lucide-react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import Navbar from '../../../components/Navbar.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Textarea } from '../../../components/ui/Textarea.jsx'
import { Dropzone } from '../../../components/ui/Dropzone.jsx'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { Spinner } from '../../../components/ui/Spinner.jsx'
import { useToast } from '../../../components/ui/Toast.jsx'

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    const handleGenerateReport = async () => {
        if (!resumeFile && !selfDescription.trim()) {
            toast.error('Add a resume or a short self-description to continue')
            return
        }

        setSubmitting(true)
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (data?._id) {
                navigate(`/interview/${data._id}`)
            } else {
                toast.error('Could not generate the report. Please try again.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    // `loading` is shared with report fetching; while the user is actively
    // generating, keep the page visible and show the spinner on the button.
    if (loading && !submitting) {
        return (
            <>
                <Navbar />
                <main className='page-loading'>
                    <Spinner size='lg' />
                    <p>Loading your interview plans…</p>
                </main>
            </>
        )
    }

    return (
        <>
            <Navbar />
            <div className='home-page'>
                {/* Page Header */}
                <header className='page-header'>
                    <h1>
                        Create Your Custom <span className='highlight'>Interview Plan</span>
                    </h1>
                    <p>
                        Let our AI analyze the job requirements and your unique profile to build a
                        winning strategy.
                    </p>
                </header>

                {/* Main Card */}
                <div className='interview-card'>
                    <div className='interview-card__body'>
                        {/* Left Panel - Job Description */}
                        <div className='panel panel--left'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <FileText size={18} aria-hidden='true' />
                                </span>
                                <h2>Target Job Description</h2>
                                <Badge tone='accent' variant='outline'>
                                    Required
                                </Badge>
                            </div>
                            <Textarea
                                className='panel__field'
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                maxLength={5000}
                                rows={14}
                                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            />
                        </div>

                        {/* Vertical Divider */}
                        <div className='panel-divider' />

                        {/* Right Panel - Profile */}
                        <div className='panel panel--right'>
                            <div className='panel__header'>
                                <span className='panel__icon'>
                                    <User size={18} aria-hidden='true' />
                                </span>
                                <h2>Your Profile</h2>
                            </div>

                            {/* Upload Resume */}
                            <div className='upload-section'>
                                <div className='section-label'>
                                    Upload Resume
                                    <Badge tone='success' variant='outline'>
                                        Best Results
                                    </Badge>
                                </div>
                                <Dropzone
                                    value={resumeFile}
                                    onChange={setResumeFile}
                                    accept='.pdf'
                                    maxSizeMB={5}
                                    onReject={(reason) => {
                                        if (reason === 'size') {
                                            toast.error('Resume must be smaller than 5 MB')
                                        } else {
                                            toast.error('Please upload a PDF file')
                                        }
                                    }}
                                />
                            </div>

                            {/* OR Divider */}
                            <div className='or-divider'>
                                <span>OR</span>
                            </div>

                            {/* Quick Self-Description */}
                            <div className='self-description'>
                                <label className='section-label' htmlFor='selfDescription'>
                                    Quick Self-Description
                                </label>
                                <Textarea
                                    id='selfDescription'
                                    name='selfDescription'
                                    className='panel__field panel__field--short'
                                    value={selfDescription}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                    maxLength={5000}
                                    placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                />
                            </div>

                            {/* Info Box */}
                            <Alert tone='info'>
                                Either a <strong>Resume</strong> or a <strong>Self Description</strong>{' '}
                                is required to generate a personalized plan.
                            </Alert>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className='interview-card__footer'>
                        <span className='footer-info'>
                            AI-Powered Strategy Generation &bull; Approx 30s
                        </span>
                        <Button
                            size='lg'
                            icon={<Sparkles size={18} />}
                            loading={submitting}
                            onClick={handleGenerateReport}
                        >
                            Generate My Interview Strategy
                        </Button>
                    </div>
                </div>

                {/* Recent Reports List */}
                {reports.length > 0 && (
                    <section className='recent-reports'>
                        <h2>My Recent Interview Plans</h2>
                        <ul className='reports-list'>
                            {reports.map((report) => (
                                <li key={report._id}>
                                    <Card
                                        variant='interactive'
                                        className='report-item'
                                        onClick={() => navigate(`/interview/${report._id}`)}
                                    >
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <p className='report-meta'>
                                            Generated on{' '}
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className='match-score'>
                                            Match Score: {report.matchScore}%
                                        </p>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Page Footer */}
                <footer className='page-footer'>
                    <a href='#'>Privacy Policy</a>
                    <a href='#'>Terms of Service</a>
                    <a href='#'>Help Center</a>
                </footer>
            </div>
        </>
    )
}

export default Home
