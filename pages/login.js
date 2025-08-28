import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthProvider';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const { user, loading } = useAuth();
    const router = useRouter();

    // Redirect to home if already logged in
    useEffect(() => {
        if (!loading && user) {
            router.replace('/');
        }
    }, [loading, user, router]);

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else {
            router.replace('/');
        }
    }

    // Optionally, show loading spinner while checking auth
    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: 10, width: '100%' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ display: 'block', marginBottom: 10, width: '100%' }}
                />
                <button type="submit" style={{ width: '100%' }}>
                    Log In
                </button>
                <p style={{ marginTop: 10 }}>
                    Don’t have an account?{' '}
                    <Link href="/signup" style={{ color: 'blue', textDecoration: 'underline' }}>
                        Sign Up
                    </Link>
                </p>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
