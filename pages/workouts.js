import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase/supabaseClient';
import Nav from '../components/Nav';
import { useRouter } from 'next/router';

const initialForm = {
    date: '',
    workout_name: '',
    reps: '',
    weight: '',
    time: '',
    distance: '',
    calories: '',
    notes: ''
};

export default function WorkoutsPage() {
    const { user, loading } = useAuth();
    const [workouts, setWorkouts] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    useEffect(() => {
        if (user) fetchWorkouts();
    }, [user]);

    async function fetchWorkouts() {
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
        if (!error) setWorkouts(data);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.date || !form.workout_name) {
            setError('Date and workout name required');
            return;
        }
        if (editingId) {
            // Update
            const { error } = await supabase.from('workouts').update({
                ...form,
                reps: form.reps ? parseInt(form.reps, 10) : null,
                weight: form.weight ? parseFloat(form.weight) : null,
                distance: form.distance ? parseFloat(form.distance) : null,
                calories: form.calories ? parseFloat(form.calories) : null,
                notes: form.notes || null
            }).eq('id', editingId);
            if (error) setError(error.message);
            else {
                setEditingId(null);
                setForm(initialForm);
                fetchWorkouts();
            }
        } else {
            // Insert
            const { error } = await supabase.from('workouts').insert([
                {
                    user_id: user.id,
                    date: form.date,
                    workout_name: form.workout_name,
                    reps: form.reps ? parseInt(form.reps, 10) : null,
                    weight: form.weight ? parseFloat(form.weight) : null,
                    time: form.time ? form.time : null,
                    distance: form.distance ? parseFloat(form.distance) : null,
                    calories: form.calories ? parseFloat(form.calories) : null,
                    notes: form.notes || null
                }
            ]);
            if (error) setError(error.message);
            else {
                setForm(initialForm);
                fetchWorkouts();
            }
        }
    }

    function handleEdit(row) {
        setEditingId(row.id);
        setForm({
            date: row.date,
            workout_name: row.workout_name,
            reps: row.reps || '',
            weight: row.weight || '',
            time: row.time || '',
            distance: row.distance || '',
            calories: row.calories || '',
            notes: row.notes || ''
        });
    }

    async function handleDelete(id) {
        if (!confirm('Delete this entry?')) return;
        await supabase.from('workouts').delete().eq('id', id);
        fetchWorkouts();
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
        <div className="max-w-3xl mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow">
            <Nav />
            <h2 className="text-xl font-bold mb-4">Log Workout</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6">
                <input type="date" name="date" value={form.date} onChange={handleChange} required className="input input-bordered flex-1" />
                <input type="text" name="workout_name" placeholder="Workout Name" value={form.workout_name} onChange={handleChange} required className="input input-bordered flex-1" />
                <input type="number" name="reps" placeholder="Reps" value={form.reps} onChange={handleChange} className="input input-bordered w-20" />
                <input type="number" step="0.01" name="weight" placeholder="Weight" value={form.weight} onChange={handleChange} className="input input-bordered w-24" />
                <input type="text" name="time" placeholder="Time (e.g. 00:30:00)" value={form.time} onChange={handleChange} className="input input-bordered w-32" />
                <input type="number" step="0.01" name="distance" placeholder="Distance" value={form.distance} onChange={handleChange} className="input input-bordered w-24" />
                <input type="number" step="0.01" name="calories" placeholder="Calories" value={form.calories} onChange={handleChange} className="input input-bordered w-24" />
                <input type="text" name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="input input-bordered flex-1" />
                <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
                {editingId && <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>}
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <h3 className="font-semibold mb-2">Your Workouts</h3>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Reps</th>
                            <th>Weight</th>
                            <th>Time</th>
                            <th>Distance</th>
                            <th>Calories</th>
                            <th>Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workouts.map(row => (
                            <tr key={row.id}>
                                <td>{row.date}</td>
                                <td>{row.workout_name}</td>
                                <td>{row.reps}</td>
                                <td>{row.weight}</td>
                                <td>{row.time}</td>
                                <td>{row.distance}</td>
                                <td>{row.calories}</td>
                                <td>{row.notes || ''}</td>
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