import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase/supabaseClient';
import Nav from '../components/Nav';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to login if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [loading, user, router]);

    async function handleLogout() {
        await supabase.auth.signOut();
        router.replace('/login');
    }

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
            <Nav />
            <h1>Welcome to Workout Tracker!</h1>
            <p>You are logged in as {user.email}</p>
            <ul>
                <li><a href="/steps">Steps</a></li>
                <li><a href="/weights">Weights</a></li>
                <li><a href="/workouts">Workouts</a></li>
                <li><a href="/daily-tasks">Daily Tasks</a></li>
            </ul>
            <button onClick={handleLogout} style={{ marginTop: 20 }}>
                Log Out
            </button>
        </div>
    );
}
