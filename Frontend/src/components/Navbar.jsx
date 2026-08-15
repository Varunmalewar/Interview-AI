import { useNavigate } from 'react-router'
import { Lightbulb, User, LogOut } from 'lucide-react'
import { Button } from './ui/Button.jsx'
import { useAuth } from '../features/auth/Hooks/useAuth.js'
import './navbar.scss'

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    return (
        <nav className='navbar'>
            <div
                className='navbar__brand'
                onClick={() => navigate('/')}
                role='link'
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate('/')
                }}
            >
                <span className='navbar__logo' aria-hidden='true'>
                    <Lightbulb size={20} strokeWidth={2} />
                </span>
                <span className='navbar__name'>
                    Interview<span className='navbar__accent'>AI</span>
                </span>
            </div>

            <div className='navbar__right'>
                {user && (
                    <span className='navbar__user'>
                        <User size={14} strokeWidth={2} aria-hidden='true' />
                        <span className='navbar__username'>{user.username}</span>
                    </span>
                )}
                <Button
                    variant='secondary'
                    size='sm'
                    icon={<LogOut size={14} />}
                    onClick={onLogout}
                >
                    Logout
                </Button>
            </div>
        </nav>
    )
}

export default Navbar
