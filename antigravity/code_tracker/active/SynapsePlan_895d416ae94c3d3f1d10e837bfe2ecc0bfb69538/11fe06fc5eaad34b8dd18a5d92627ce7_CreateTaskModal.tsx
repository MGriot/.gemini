Ëôimport React, { useState, useEffect } from 'react';
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
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Chip,
    CircularProgress,
    Slider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { createTask } from '../../services/tasks';
import { createSubtask } from '../../services/subtasks';
import { getUsers } from '../../services/users';
import { useAuth } from '../../context/AuthContext';
import { getTags, getTopics, createTag, createTopic } from '../../services/adminService';
import { Tag } from '../../types/tag';
import { Topic } from '../../types/topic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreatableAutocomplete from '../common/CreatableAutocomplete';

interface CreateTaskModalProps {
    open: boolean;
    onClose: () => void;
    projectId: string | number;
    onTaskCreated: () => void;
    availableTasks?: any[]; // For parent task selection
}

interface PendingSubtask {
    id?: number;
    name: string;
    description?: string;
    owner_id: number;
    start_date?: string;
    end_date?: string;
    status: string;
    progress: number;
    tag_ids: number[];
    topic_ids: number[];
    parent_subtask_id?: number;
    parent_task_id?: number;
    nested_subtasks: PendingSubtask[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, onClose, projectId, onTaskCreated, availableTasks = [] }) => {
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
    const [pendingSubtasks, setPendingSubtasks] = useState<PendingSubtask[]>([]);
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
        } else {
            resetForm();
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('Not Started');
        setPromoterIds([]);
        setAssigneeIds([]);
        setParentId('');
        setPendingSubtasks([]);
        setNewSubtaskName('');
        setNewSubtaskDescription('');
        setNewSubtaskOwnerId('');
        setNewSubtaskStart('');
        setNewSubtaskEnd('');
        setNewSubtaskProgress(0);
        setNewSubtaskStatus('Not Started');
        setNewSubtaskTags([]);
        setNewSubtaskTopics([]);
        setNewSubtaskParentSubtaskId('');
        setIsAddingSubtask(false);
        setSelectedTags([]);
        setSelectedTopics([]);
        setError('');
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

    const handleAddSubtask = () => {
        if (!newSubtaskName.trim()) {
            setError('Subtask name cannot be empty.');
            return;
        }
        if (!newSubtaskOwnerId) {
            setError('Subtask owner is required.');
            return;
        }
        if (!user || !user.id) {
            setError('You must be logged in to create a subtask.');
            return;
        }

        const newSubtask: PendingSubtask = {
            id: Date.now(),
            name: newSubtaskName,
            description: newSubtaskDescription || undefined,
            owner_id: Number(newSubtaskOwnerId),
            start_date: newSubtaskStart || undefined,
            end_date: newSubtaskEnd || undefined,
            status: newSubtaskStatus,
            progress: newSubtaskProgress,
            tag_ids: newSubtaskTags.map(t => t.id),
            topic_ids: newSubtaskTopics.map(t => t.id),
            nested_subtasks: []
        };

        const addNestedSubtask = (
            subs: PendingSubtask[],
            subToAdd: PendingSubtask,
            targetParentTempId?: number
        ): PendingSubtask[] => {
            if (!targetParentTempId) {
                return [...subs, subToAdd];
            }

            return subs.map(s => {
                if (s.id === targetParentTempId) {
                    return {
                        ...s,
                        nested_subtasks: [...s.nested_subtasks, subToAdd]
                    };
                }
                return {
                    ...s,
                    nested_subtasks: addNestedSubtask(s.nested_subtasks, subToAdd, targetParentTempId)
                };
            });
        };

        setPendingSubtasks(prev =>
            addNestedSubtask(prev, newSubtask, newSubtaskParentSubtaskId !== '' ? Number(newSubtaskParentSubtaskId) : undefined)
        );

        setNewSubtaskName('');
        setNewSubtaskDescription('');
        setNewSubtaskOwnerId('');
        setNewSubtaskStart('');
        setNewSubtaskEnd('');
        setNewSubtaskProgress(0);
        setNewSubtaskStatus('Not Started');
        setNewSubtaskTags([]);
        setNewSubtaskTopics([]);
        setNewSubtaskParentSubtaskId('');
        setIsAddingSubtask(false);
        setError('');
    };

    const handleDeletePendingSubtask = (index: number) => {
        const updated = [...pendingSubtasks];
        updated.splice(index, 1);
        setPendingSubtasks(updated);
    };

    const createSubtasksRecursive = async (originalTaskId: number, currentParentId: number, subs: PendingSubtask[], isCurrentParentTask: boolean) => {
        for (const sub of subs) {
            let createdSubtask;
            const subtaskDataPayload = {
                name: sub.name,
                description: sub.description,
                owner_id: sub.owner_id,
                start_date: sub.start_date ? new Date(sub.start_date).toISOString() : undefined,
                end_date: sub.end_date ? new Date(sub.end_date).toISOString() : undefined,
                status: sub.status,
                progress: sub.progress,
                tag_ids: sub.tag_ids,
                topic_ids: sub.topic_ids,
            };

            if (isCurrentParentTask) {
                createdSubtask = await createSubtask(currentParentId, undefined, subtaskDataPayload);
            } else {
                createdSubtask = await createSubtask(originalTaskId, currentParentId, subtaskDataPayload);
            }

            if (createdSubtask && sub.nested_subtasks.length > 0) {
                await createSubtasksRecursive(originalTaskId, createdSubtask.id, sub.nested_subtasks, false);
            }
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Task name is required');
            return;
        }

        if (!user || !user.id) {
            setError('You must be logged in to create a task');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const newTask = await createTask(projectId, {
                name,
                description,
                project_id: Number(projectId),
                owner_id: user.id,
                parent_id: parentId !== '' ? Number(parentId) : undefined,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                status,
                promoter_ids: promoterIds,
                assignee_ids: assigneeIds,
                tag_ids: selectedTags.map(tag => tag.id),
                topic_ids: selectedTopics.map(topic => topic.id),
            });

            if (pendingSubtasks.length > 0 && newTask.id) {
                await createSubtasksRecursive(newTask.id, newTask.id, pendingSubtasks, true);
            }

            onTaskCreated();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to create task (or subtasks)');
        } finally {
            setLoading(false);
        }
    };

    const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    const formLoading = loading || isLoadingTags || isLoadingTopics;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Task</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {formLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Details</Typography>
                            <TextField
                                autoFocus
                                label="Task Name"
                                fullWidth
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={formLoading}
                                required
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={formLoading}
                            />

                            <FormControl fullWidth>
                                <InputLabel id="parent-task-label">Parent Task (Optional)</InputLabel>
                                <Select
                                    labelId="parent-task-label"
                                    value={parentId}
                                    onChange={(e) => setParentId(e.target.value as number | '')}
                                    input={<OutlinedInput label="Parent Task (Optional)" />}
                                >
                                    <MenuItem value=""><em>None (Root Task)</em></MenuItem>
                                    {availableTasks.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Start Date"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={formLoading}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Due Date"
                                        type="date"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={formLoading}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                select
                                label="Status"
                                fullWidth
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                disabled={formLoading}
                            >
                                {statuses.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
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
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {u.name && u.surname ? `${u.name} ${u.surname} (${u.email})` : u.email}
                                        </MenuItem>
                                    ))}
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
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>
                                            {u.name && u.surname ? `${u.name} ${u.surname} (${u.email})` : u.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <CreatableAutocomplete
                                label="Tags"
                                options={availableTags || []}
                                value={selectedTags}
                                onChange={setSelectedTags}
                                onCreateNew={handleCreateTag}
                                getOptionLabel={(option) => option.name}
                                placeholder="Select or create tags"
                                loading={isLoadingTags}
                                disabled={formLoading}
                                chipColorField="color"
                            />

                            <CreatableAutocomplete
                                label="Topics"
                                options={availableTopics || []}
                                value={selectedTopics}
                                onChange={setSelectedTopics}
                                onCreateNew={handleCreateTopic}
                                getOptionLabel={(option) => option.name}
                                placeholder="Select or create topics"
                                loading={isLoadingTopics}
                                disabled={formLoading}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Subtasks</Typography>
                        <Box sx={{ mb: 2 }}>
                            {isAddingSubtask ? (
                                <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                                    <TextField
                                        label="Subtask Name"
                                        size="small"
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        value={newSubtaskName}
                                        onChange={(e) => {
                                            setNewSubtaskName(e.target.value);
                                            if (error === 'Subtask name cannot be empty.') setError('');
                                        }}
                                        required
                                    />
                                    <TextField
                                        label="Description"
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        sx={{ mb: 2 }}
                                        value={newSubtaskDescription}
                                        onChange={(e) => setNewSubtaskDescription(e.target.value)}
                                    />
                                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                        <InputLabel>Owner</InputLabel>
                                        <Select
                                            value={newSubtaskOwnerId}
                                            label="Owner"
                                            onChange={(e) => {
                                                setNewSubtaskOwnerId(Number(e.target.value));
                                                if (error === 'Subtask owner is required.') setError('');
                                            }}
                                            required
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {users.map((u) => (
                                                <MenuItem key={u.id} value={u.id}>
                                                    {u.name && u.surname ? `${u.name} ${u.surname}` : u.email}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        select
                                        label="Status"
                                        size="small"
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        value={newSubtaskStatus}
                                        onChange={(e) => setNewSubtaskStatus(e.target.value)}
                                    >
                                        {statuses.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" gutterBottom>Progress: {newSubtaskProgress}%</Typography>
                                        <Slider
                                            value={newSubtaskProgress}
                                            onChange={(_, val) => setNewSubtaskProgress(val as number)}
                                            min={0}
                                            max={100}
                                            step={1}
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>
                                    <Grid container spacing={1} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <TextField
                                                type="date"
                                                label="Start"
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                fullWidth
                                                value={newSubtaskStart}
                                                onChange={(e) => setNewSubtaskStart(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                type="date"
                                                label="End"
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                fullWidth
                                                value={newSubtaskEnd}
                                                onChange={(e) => setNewSubtaskEnd(e.target.value)}
                                            />
                                        </Grid>
                                    </Grid>

                                    <CreatableAutocomplete
                                        label="Tags"
                                        options={availableTags || []}
                                        value={newSubtaskTags}
                                        onChange={setNewSubtaskTags}
                                        onCreateNew={handleCreateTag}
                                        getOptionLabel={(option) => option.name}
                                        placeholder="Select tags"
                                        loading={isLoadingTags}
                                        chipColorField="color"
                                    />
                                    <Box sx={{ mb: 2 }} />
                                    <CreatableAutocomplete
                                        label="Topics"
                                        options={availableTopics || []}
                                        value={newSubtaskTopics}
                                        onChange={setNewSubtaskTopics}
                                        onCreateNew={handleCreateTopic}
                                        getOptionLabel={(option) => option.name}
                                        placeholder="Select topics"
                                        loading={isLoadingTopics}
                                    />

                                    <FormControl fullWidth size="small" sx={{ mb: 2, mt: 2 }}>
                                        <InputLabel>Parent Subtask (optional)</InputLabel>
                                        <Select
                                            value={newSubtaskParentSubtaskId}
                                            label="Parent Subtask (optional)"
                                            onChange={(e) => setNewSubtaskParentSubtaskId(Number(e.target.value))}
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {pendingSubtasks.map((sub, index) => (
                                                <MenuItem key={index} value={index}>{sub.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Button size="small" onClick={() => setIsAddingSubtask(false)}>Cancel</Button>
                                        <Button size="small" variant="contained" onClick={handleAddSubtask}>Add</Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Button startIcon={<AddIcon />} fullWidth variant="outlined" onClick={() => setIsAddingSubtask(true)}>
                                    Add Subtask
                                </Button>
                            )}
                        </Box>

                        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            {pendingSubtasks.map((sub, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={sub.name}
                                        secondary={
                                            sub.start_date || sub.end_date
                                                ? `${sub.start_date || '?'} - ${sub.end_date || '?'}`
                                                : "No dates set"
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" size="small" onClick={() => handleDeletePendingSubtask(index)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {pendingSubtasks.length === 0 && <Typography variant="body2" color="text.secondary" align="center">No subtasks added yet.</Typography>}
                        </List>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={formLoading} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={formLoading}
                    sx={{ px: 4 }}
                >
                    Create Task
                </Button>
            </DialogActions>
        </Dialog >
    );
};

export default CreateTaskModal;Ò£ Ò£€¤*cascade08€¤¡¤ ¡¤µ¥*cascade08µ¥’¬ 
’¬Â¬Â¬×­ ×­‰®*cascade08‰®µ® µ®Î¯*cascade08Î¯žô žôŸô*cascade08ŸôËô "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382efile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/tasks/CreateTaskModal.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan