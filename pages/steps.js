import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase/supabaseClient';
import Nav from '../components/Nav';
import { useRouter } from 'next/router';

const initialForm = {
    date: '',
    steps: ''
};

export default function StepsPage() {
    const { user, loading } = useAuth();
    const [stepsData, setStepsData] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    useEffect(() => {
        if (user) fetchSteps();
    }, [user]);

    async function fetchSteps() {
        const { data, error } = await supabase
            .from('steps')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
        if (!error) setStepsData(data);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.date || !form.steps) {
            setError('Date and steps required');
            return;
        }
        if (editingId) {
            const { error } = await supabase.from('steps').update({
                date: form.date,
                steps: parseInt(form.steps, 10)
            }).eq('id', editingId);
            if (error) setError(error.message);
            else {
                setEditingId(null);
                setForm(initialForm);
                fetchSteps();
            }
        } else {
            const { error } = await supabase.from('steps').insert([
                {
                    user_id: user.id,
                    date: form.date,
                    steps: parseInt(form.steps, 10)
                }
            ]);
            if (error) setError(error.message);
            else {
                setForm(initialForm);
                fetchSteps();
            }
        }
    }

    function handleEdit(row) {
        setEditingId(row.id);
        setForm({
            date: row.date,
            steps: row.steps
        });
    }

    async function handleDelete(id) {
        if (!confirm('Delete this entry?')) return;
        await supabase.from('steps').delete().eq('id', id);
        fetchSteps();
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
            <h2 className="text-xl font-bold mb-4">Log Steps</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6">
                <input type="date" name="date" value={form.date} onChange={handleChange} required className="input input-bordered flex-1" />
                <input type="number" name="steps" placeholder="Steps" value={form.steps} onChange={handleChange} required className="input input-bordered flex-1" />
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>}
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <h3 className="font-semibold mb-2">Your Steps</h3>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Steps</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stepsData.map(row => (
                            <tr key={row.id}>
                                <td>{row.date}</td>
                                <td>{row.steps}</td>
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