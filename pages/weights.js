import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase/supabaseClient';
import Nav from '../components/Nav';
import { useRouter } from 'next/router';

const initialForm = {
    date: '',
    weight: '',
    measured_at: ''
};

export default function WeightsPage() {
    const { user, loading } = useAuth();
    const [weights, setWeights] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    useEffect(() => {
        if (user) fetchWeights();
    }, [user]);

    async function fetchWeights() {
        const { data, error } = await supabase
            .from('weights')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
        if (!error) setWeights(data);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.date || !form.weight) {
            setError('Date and weight required');
            return;
        }
        if (editingId) {
            const { error } = await supabase.from('weights').update({
                date: form.date,
                weight_lbs: parseFloat(form.weight),
                measured_at: form.measured_at || null
            }).eq('id', editingId);
            if (error) setError(error.message);
            else {
                setEditingId(null);
                setForm(initialForm);
                fetchWeights();
            }
        } else {
            const { error } = await supabase.from('weights').insert([
                {
                    user_id: user.id,
                    date: form.date,
                    weight_lbs: parseFloat(form.weight),
                    measured_at: form.measured_at || null
                }
            ]);
            if (error) setError(error.message);
            else {
                setForm(initialForm);
                fetchWeights();
            }
        }
    }

    function handleEdit(row) {
        setEditingId(row.id);
        setForm({
            date: row.date,
            weight: row.weight_lbs,
            measured_at: row.measured_at || ''
        });
    }

    async function handleDelete(id) {
        if (!confirm('Delete this entry?')) return;
        await supabase.from('weights').delete().eq('id', id);
        fetchWeights();
        if (editingId === id) {
            setEditingId(null);
            setForm(initialForm);
        }
    }

    function handleCancelEdit() {
        setEditingId(null);
        setForm(initialForm);
    }

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow">
            <Nav />
            <h2 className="text-xl font-bold mb-4">Log Weight</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6">
                <input type="date" name="date" value={form.date} onChange={handleChange} required className="input input-bordered flex-1" />
                <input type="number" step="0.01" name="weight" placeholder="Weight (lbs)" value={form.weight} onChange={handleChange} required className="input input-bordered flex-1" />
                <input type="text" name="measured_at" placeholder="Measured At (e.g. Home, Work)" value={form.measured_at} onChange={handleChange} className="input input-bordered flex-1" />
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>}
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <h3 className="font-semibold mb-2">Your Weights</h3>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Weight (lbs)</th>
                            <th>Measured At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weights.map(row => (
                            <tr key={row.id}>
                                <td>{row.date}</td>
                                <td>{row.weight_lbs}</td>
                                <td>{row.measured_at || ''}</td>
                                <td>
                                    <button onClick={() => handleEdit(row)} className="text-blue-500 mr-2">Edit</button>
                                    <button onClick={() => handleDelete(row.id)} className="text-red-500">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}