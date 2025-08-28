import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthProvider';

export default function Signup() {
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

    async function handleSignup(e) {
        e.preventDefault();
        setError(null);

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else {
            router.replace('/');
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h1>Sign Up</h1>
            <form onSubmit={handleSignup}>
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
                    Sign Up
                </button>
                <p style={{ marginTop: 10 }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
                        Log In
                    </Link>
                </p>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
