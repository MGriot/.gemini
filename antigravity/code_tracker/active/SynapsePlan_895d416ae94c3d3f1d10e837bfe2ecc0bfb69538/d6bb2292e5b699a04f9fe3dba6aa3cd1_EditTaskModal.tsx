à¯import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    Grid,
    MenuItem,
    Typography,
    List,
    Select,
    InputLabel,
    FormControl,
    OutlinedInput,
    Chip,
    Slider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';
import SubtaskHierarchyRenderer from './SubtaskHierarchyRenderer';
import SubtaskEditor from './SubtaskEditor';
import { updateTask } from '../../services/tasks';
import { getSubtasks, createSubtask, deleteSubtask, updateSubtask, Subtask } from '../../services/subtasks';
import { getUsers } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { format, isValid, parseISO, min, max } from 'date-fns';
import { getTags, getTopics, createTag, createTopic } from '../../services/adminService';
import { Tag } from '../../types/tag';
import { Topic } from '../../types/topic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreatableAutocomplete from '../common/CreatableAutocomplete';

interface EditTaskModalProps {
    open: boolean;
    onClose: () => void;
    task: any;
    onTaskUpdated: () => void;
    availableTasks?: any[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ open, onClose, task, onTaskUpdated, availableTasks = [] }) => {
    const queryClient = useQueryClient();
    // Task State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [promoterIds, setPromoterIds] = useState<number[]>([]);
    const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [parentId, setParentId] = useState<number | ''>('');

    // Data
    const [users, setUsers] = useState<any[]>([]);

    // Subtask State
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
    const [newSubtaskOwnerId, setNewSubtaskOwnerId] = useState<number | ''>('');
    const [newSubtaskStart, setNewSubtaskStart] = useState('');
    const [newSubtaskEnd, setNewSubtaskEnd] = useState('');
    const [newSubtaskProgress, setNewSubtaskProgress] = useState<number>(0);
    const [newSubtaskStatus, setNewSubtaskStatus] = useState('Not Started');
    const [newSubtaskTags, setNewSubtaskTags] = useState<Tag[]>([]);
    const [newSubtaskTopics, setNewSubtaskTopics] = useState<Topic[]>([]);
    const [newSubtaskParentSubtaskId, setNewSubtaskParentSubtaskId] = useState<number | ''>('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const { data: availableTags, isLoading: isLoadingTags } = useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: getTags,
        enabled: open,
    });

    const { data: availableTopics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
        queryKey: ['topics'],
        queryFn: getTopics,
        enabled: open,
    });

    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    useEffect(() => {
        if (task && open) {
            setName(task.name || '');
            setDescription(task.description || '');
            setStartDate(task.start_date ? task.start_date.split('T')[0] : '');
            setEndDate(task.end_date ? task.end_date.split('T')[0] : '');
            setStatus(task.status || 'Not Started');
            setPromoterIds(task.promoters ? task.promoters.map((u: any) => u.id) : []);
            setAssigneeIds(task.assignees ? task.assignees.map((u: any) => u.id) : []);
            setParentId(task.parent_id || '');
            setSelectedTags(task.tags || []);
            setSelectedTopics(task.topics || []);
            fetchSubtasks();
        }
    }, [task, open]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const fetchSubtasks = async () => {
        try {
            if (task?.id) {
                const data = await getSubtasks(task.id);
                setSubtasks(data);
            }
        } catch (err) {
            console.error("Failed to load subtasks", err);
        }
    };

    const handleCreateTag = async (tagName: string) => {
        const newTag = await createTag({ name: tagName });
        queryClient.invalidateQueries({ queryKey: ['tags'] });
        return newTag;
    };

    const handleCreateTopic = async (topicName: string) => {
        const newTopic = await createTopic({ name: topicName });
        queryClient.invalidateQueries({ queryKey: ['topics'] });
        return newTopic;
    };

    const getSuggestedDates = () => {
        if (subtasks.length === 0) return null;
        const validStartDates = subtasks.map(s => s.start_date ? parseISO(s.start_date) : null).filter((d): d is Date => isValid(d));
        const validEndDates = subtasks.map(s => s.end_date ? parseISO(s.end_date) : null).filter((d): d is Date => isValid(d));
        if (validStartDates.length === 0 && validEndDates.length === 0) return null;
        const minStart = validStartDates.length > 0 ? min(validStartDates) : null;
        const maxEnd = validEndDates.length > 0 ? max(validEndDates) : null;
        return { start: minStart ? format(minStart, 'yyyy-MM-dd') : '', end: maxEnd ? format(maxEnd, 'yyyy-MM-dd') : '' };
    };

    const handleSyncDates = () => {
        const suggestions = getSuggestedDates();
        if (suggestions) {
            if (suggestions.start) setStartDate(suggestions.start);
            if (suggestions.end) setEndDate(suggestions.end);
        }
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskName.trim()) { setError('Subtask name cannot be empty.'); return; }
        if (!newSubtaskOwnerId) { setError('Subtask owner is required.'); return; }
        if (!user || !user.id) { setError('You must be logged in.'); return; }
        try {
            await createSubtask(task.id, newSubtaskParentSubtaskId === '' ? undefined : Number(newSubtaskParentSubtaskId), {
                name: newSubtaskName, description: newSubtaskDescription || undefined, owner_id: Number(newSubtaskOwnerId),
                start_date: newSubtaskStart ? new Date(newSubtaskStart).toISOString() : undefined,
                end_date: newSubtaskEnd ? new Date(newSubtaskEnd).toISOString() : undefined,
                status: newSubtaskStatus, progress: newSubtaskProgress,
                tag_ids: newSubtaskTags.map(t => t.id), topic_ids: newSubtaskTopics.map(t => t.id),
            });
            setNewSubtaskName(''); setNewSubtaskDescription(''); setNewSubtaskOwnerId(''); setNewSubtaskStart(''); setNewSubtaskEnd('');
            setNewSubtaskProgress(0); setNewSubtaskStatus('Not Started'); setNewSubtaskTags([]); setNewSubtaskTopics([]);
            setNewSubtaskParentSubtaskId(''); setIsAddingSubtask(false); fetchSubtasks();
        } catch (err) { console.error(err); setError("Failed to add subtask"); }
    };

    const handleDeleteSubtask = async (id: number) => {
        if (!window.confirm("Delete subtask?")) return;
        try { await deleteSubtask(id); fetchSubtasks(); } catch (err) { console.error(err); }
    };

    const handleToggleSubtask = async (sub: Subtask) => {
        try {
            const newStatus = sub.status === 'Completed' ? 'Not Started' : 'Completed';
            await updateSubtask(sub.id, { status: newStatus });
            setSubtasks(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
        } catch (err) { console.error(err); setError("Failed to update status"); }
    };

    const handleEditSubtask = (subtaskToEdit: Subtask) => { setEditingSubtask(subtaskToEdit); };
    const handleSubtaskUpdated = () => { fetchSubtasks(); setEditingSubtask(null); };

    const handleSubmit = async () => {
        if (!name.trim()) { setError('Task name is required'); return; }
        setLoading(true); setError('');
        try {
            await updateTask(task.id, {
                name, description, start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined, status,
                promoter_ids: promoterIds, assignee_ids: assigneeIds,
                parent_id: parentId !== '' ? Number(parentId) : null,
                tag_ids: selectedTags.map(tag => tag.id), topic_ids: selectedTopics.map(topic => topic.id),
            });
            onTaskUpdated();
            onClose();
        } catch (err) { console.error(err); setError('Failed to update task'); } finally { setLoading(false); }
    };

    const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    const suggestions = getSuggestedDates();
    const formLoading = loading || isLoadingTags || isLoadingTopics;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Task</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Details</Typography>
                            <TextField label="Task Name" fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} required />
                            <TextField label="Description" fullWidth multiline rows={3} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
                            
                            <FormControl fullWidth>
                                <InputLabel id="parent-task-label">Parent Task (Optional)</InputLabel>
                                <Select
                                    labelId="parent-task-label"
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value as number | '')}
                                    input={<OutlinedInput label="Parent Task (Optional)" />}
                                >
                                    <MenuItem value=""><em>None (Root Task)</em></MenuItem>
                                    {availableTasks.filter(t => t.id !== task.id).map((t) => (
                                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6}><TextField label="Start Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={loading} /></Grid>
                                <Grid item xs={6}><TextField label="Due Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={loading} /></Grid>
                            </Grid>
                            {suggestions && (suggestions.start || suggestions.end) && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                                    <SyncIcon color="primary" fontSize="small" />
                                    <Typography variant="caption" color="text.secondary">Suggested: {suggestions.start || '...'} to {suggestions.end || '...'}</Typography>
                                    <Button size="small" onClick={handleSyncDates}>Apply</Button>
                                </Box>
                            )}
                            <TextField select label="Status" fullWidth value={status} onChange={(e) => setStatus(e.target.value)} disabled={loading}>
                                {statuses.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                            </TextField>

                            <FormControl fullWidth>
                                <InputLabel id="promoters-label">Promoters / Leads</InputLabel>
                                <Select
                                    labelId="promoters-label"
                                    multiple
                                    value={promoterIds}
                                    onChange={(e) => setPromoterIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value as number[])}
                                    input={<OutlinedInput label="Promoters / Leads" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const u = users.find(user => user.id === value);
                                                const label = u ? (u.name && u.surname ? `${u.name} ${u.surname}` : u.email) : value;
                                                return <Chip key={value} label={label} size="small" color="primary" variant="outlined" />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {users.map((u) => (<MenuItem key={u.id} value={u.id}>{u.name && u.surname ? `${u.name} ${u.surname} (${u.email})` : u.email}</MenuItem>))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel id="assignees-label">Assignees (Team)</InputLabel>
                                <Select
                                    labelId="assignees-label"
                                    multiple
                                    value={assigneeIds}
                                    onChange={(e) => setAssigneeIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value as number[])}
                                    input={<OutlinedInput label="Assignees (Team)" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const u = users.find(user => user.id === value);
                                                const label = u ? (u.name && u.surname ? `${u.name} ${u.surname}` : u.email) : value;
                                                return <Chip key={value} label={label} size="small" />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {users.map((u) => (<MenuItem key={u.id} value={u.id}>{u.name && u.surname ? `${u.name} ${u.surname} (${u.email})` : u.email}</MenuItem>))}
                                </Select>
                            </FormControl>

                            <CreatableAutocomplete label="Tags" options={availableTags || []} value={selectedTags} onChange={setSelectedTags} onCreateNew={handleCreateTag} getOptionLabel={(option) => option.name} placeholder="Select or create tags" loading={isLoadingTags} disabled={formLoading} chipColorField="color" />
                            <CreatableAutocomplete label="Topics" options={availableTopics || []} value={selectedTopics} onChange={setSelectedTopics} onCreateNew={handleCreateTopic} getOptionLabel={(option) => option.name} placeholder="Select or create topics" loading={isLoadingTopics} disabled={formLoading} />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Subtasks</Typography>
                        <Box sx={{ mb: 2 }}>
                            {isAddingSubtask ? (
                                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                                    <TextField label="Subtask Name" size="small" fullWidth sx={{ mb: 2 }} value={newSubtaskName} onChange={(e) => setNewSubtaskName(e.target.value)} required />
                                    <TextField label="Description" size="small" fullWidth multiline rows={2} sx={{ mb: 2 }} value={newSubtaskDescription} onChange={(e) => setNewSubtaskDescription(e.target.value)} />
                                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                        <InputLabel>Owner</InputLabel>
                                        <Select value={newSubtaskOwnerId} label="Owner" onChange={(e) => setNewSubtaskOwnerId(Number(e.target.value))} required>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {users.map((u) => (<MenuItem key={u.id} value={u.id}>{u.name && u.surname ? `${u.name} ${u.surname}` : u.email}</MenuItem>))}
                                        </Select>
                                    </FormControl>
                                    <TextField select label="Status" size="small" fullWidth sx={{ mb: 2 }} value={newSubtaskStatus} onChange={(e) => setNewSubtaskStatus(e.target.value)}>
                                        {statuses.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                                    </TextField>
                                    <Box sx={{ mb: 2 }}><Typography variant="caption" gutterBottom>Progress: {newSubtaskProgress}%</Typography><Slider value={newSubtaskProgress} onChange={(_, val) => setNewSubtaskProgress(val as number)} min={0} max={100} step={1} valueLabelDisplay="auto" /></Box>
                                    <Grid container spacing={1} sx={{ mb: 2 }}>
                                        <Grid item xs={6}><TextField type="date" label="Start" InputLabelProps={{ shrink: true }} size="small" fullWidth value={newSubtaskStart} onChange={(e) => setNewSubtaskStart(e.target.value)} /></Grid>
                                        <Grid item xs={6}><TextField type="date" label="End" InputLabelProps={{ shrink: true }} size="small" fullWidth value={newSubtaskEnd} onChange={(e) => setNewSubtaskEnd(e.target.value)} /></Grid>
                                    </Grid>
                                    <CreatableAutocomplete label="Tags" options={availableTags || []} value={newSubtaskTags} onChange={setNewSubtaskTags} onCreateNew={handleCreateTag} getOptionLabel={(option) => option.name} placeholder="Select tags" loading={isLoadingTags} chipColorField="color" />
                                    <Box sx={{ mb: 2 }} />
                                    <CreatableAutocomplete label="Topics" options={availableTopics || []} value={newSubtaskTopics} onChange={setNewSubtaskTopics} onCreateNew={handleCreateTopic} getOptionLabel={(option) => option.name} placeholder="Select topics" loading={isLoadingTopics} />
                                    <FormControl fullWidth size="small" sx={{ mb: 2, mt: 2 }}>
                                        <InputLabel>Parent Subtask (optional)</InputLabel>
                                        <Select value={newSubtaskParentSubtaskId} label="Parent Subtask (optional)" onChange={(e) => setNewSubtaskParentSubtaskId(Number(e.target.value))}>
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {subtasks.map((sub) => (<MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>))}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}><Button size="small" onClick={() => setIsAddingSubtask(false)}>Cancel</Button><Button size="small" variant="contained" onClick={handleAddSubtask}>Add</Button></Box>
                                </Box>
                            ) : (<Button startIcon={<AddIcon />} fullWidth variant="outlined" onClick={() => setIsAddingSubtask(true)}>Add Subtask</Button>)}
                        </Box>
                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}><SubtaskHierarchyRenderer subtasks={subtasks} onToggleSubtask={handleToggleSubtask} onDeleteSubtask={handleDeleteSubtask} onEditSubtask={handleEditSubtask} users={users} />{subtasks.length === 0 && <Typography variant="body2" color="text.secondary" align="center">No subtasks yet.</Typography>}</List>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button><Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ px: 4 }}>Save Changes</Button></DialogActions>
            {editingSubtask && (<SubtaskEditor open={Boolean(editingSubtask)} onClose={() => setEditingSubtask(null)} subtask={editingSubtask} onSubtaskUpdated={handleSubtaskUpdated} users={users} currentTaskSubtasks={subtasks} />)}
        </Dialog>
    );
};

export default EditTaskModal;à¯"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382cfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/EditTaskModal.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan