import Link from 'next/link';
import { useDarkMode } from './DarkModeContext';

export default function Nav() {
    const { dark, setDark } = useDarkMode();
    return (
        <nav className="flex justify-between items-center py-4 px-6 border-b border-gray-200 dark:border-gray-700 mb-6">
            <div>
                <Link href="/" className="mr-4">Home</Link>
                <Link href="/steps" className="mr-4">Steps</Link>
                <Link href="/weights" className="mr-4">Weights</Link>
                <Link href="/workouts" className="mr-4">Workouts</Link>
                <Link href="/daily-tasks" className="mr-4">Daily Tasks</Link>
                <Link href="/import" className="mr-4">Import CSV</Link>
            </div>
            <button
                className="rounded px-3 py-1 border border-gray-400 dark:border-gray-600"
                onClick={() => setDark(d => !d)}
                aria-label="Toggle dark mode"
            >
                {dark ? '🌙' : '☀️'}
            </button>
        </nav>
    );
}