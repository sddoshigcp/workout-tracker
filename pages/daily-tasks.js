import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase/supabaseClient';
import Nav from '../components/Nav';
import { useRouter } from 'next/router';

const TASKS = ["protein shake", "daily vitamin"]; // Add new tasks here

export default function DailyTasksPage() {
    const { user, loading } = useAuth();
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [taskStates, setTaskStates] = useState({});
    const [error, setError] = useState('');
    const [tableData, setTableData] = useState([]);
    const [dates, setDates] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    useEffect(() => {
        if (user && date) fetchTasks();
    }, [user, date]);

    useEffect(() => {
        if (user) fetchTable();
    }, [user]);

    async function fetchTasks() {
        setError('');
        const { data, error } = await supabase
            .from('daily_tasks')
            .select('task_name, value')
            .eq('user_id', user.id)
            .eq('date', date);
        if (error) setError(error.message);
        else {
            const states = {};
            data.forEach(row => { states[row.task_name] = row.value; });
            setTaskStates(states);
        }
    }

    async function handleChange(task, checked) {
        setError('');
        setTaskStates(s => ({ ...s, [task]: checked }));
        const { error } = await supabase
            .from('daily_tasks')
            .upsert([
                {
                    user_id: user.id,
                    date,
                    task_name: task,
                    value: checked
                }
            ], { onConflict: 'user_id,date,task_name' });
        if (error) setError(error.message);
        fetchTable();
    }

    async function fetchTable() {
        // Show last 7 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 6);
        const fromStr = fromDate.toISOString().slice(0, 10);

        const { data, error } = await supabase
            .from('daily_tasks')
            .select('date, task_name, value')
            .eq('user_id', user.id)
            .gte('date', fromStr)
            .order('date', { ascending: false });

        if (error) setError(error.message);
        else {
            const map = {};
            data.forEach(row => {
                if (!map[row.date]) map[row.date] = {};
                map[row.date][row.task_name] = row.value;
            });
            const dateList = [];
            for (let i = 0;i < 7;i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dateList.push(d.toISOString().slice(0, 10));
            }
            setDates(dateList);
            setTableData(map);
        }
    }

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow">
            <Nav />
            <h2 className="text-xl font-bold mb-4">Daily Tasks</h2>
            <label className="block mb-2">
                Date:{' '}
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input input-bordered"
                />
            </label>
            <form className="mb-6">
                {TASKS.map(task => (
                    <div key={task} className="mb-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={!!taskStates[task]}
                                onChange={e => handleChange(task, e.target.checked)}
                                className="checkbox"
                            />
                            {task.charAt(0).toUpperCase() + task.slice(1)}
                        </label>
                    </div>
                ))}
            </form>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <h3 className="font-semibold mb-2">Last 7 Days</h3>
            <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                    <thead>
                        <tr>
                            <th>Date</th>
                            {TASKS.map(task => (
                                <th key={task}>{task.charAt(0).toUpperCase() + task.slice(1)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dates.map(date => (
                            <tr key={date}>
                                <td>{date}</td>
                                {TASKS.map(task => (
                                    <td key={task} className="text-center">
                                        {tableData[date]?.[task] === undefined
                                            ? ''
                                            : tableData[date][task]
                                                ? '✔️'
                                                : '❌'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}