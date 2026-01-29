—Rimport React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    MenuItem,
    Grid,
    CircularProgress
} from '@mui/material';
import { updateProject } from '../../services/projects';
import { getTags, getTopics, createTag, createTopic } from '../../services/adminService'; // Import create services
import { getUsers } from '../../services/users'; // Import getUsers
import { Tag } from '../../types/tag';
import { Topic } from '../../types/topic';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import CreatableAutocomplete from '../common/CreatableAutocomplete';
import { FormControl, InputLabel, Select, OutlinedInput } from '@mui/material'; // Import MUI components


interface EditProjectModalProps {
    open: boolean;
    onClose: () => void;
    project: any; // Using any for simplicity, ideally strictly typed, now including tags/topics
    onProjectUpdated: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ open, onClose, project, onProjectUpdated }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [ownerId, setOwnerId] = useState<number | ''>(''); // Add ownerId state
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch available tags, topics, and users
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

    const { data: users, isLoading: isLoadingUsers } = useQuery<any[]>({
        queryKey: ['users'],
        queryFn: getUsers,
        enabled: open,
    });


    useEffect(() => {
        if (project) {
            setName(project.name || '');
            setDescription(project.description || '');
            setStartDate(project.start_date ? project.start_date.split('T')[0] : '');
            setEndDate(project.end_date ? project.end_date.split('T')[0] : '');
            setStatus(project.status || 'Not Started');
            setOwnerId(project.owner_id || '');
            setSelectedTags(project.tags || []);
            setSelectedTopics(project.topics || []);
        }
    }, [project, open]);

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

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await updateProject(project.id, {
                name,
                description,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                status,
                owner_id: ownerId !== '' ? Number(ownerId) : undefined,
                tag_ids: selectedTags.map(tag => tag.id),
                topic_ids: selectedTopics.map(topic => topic.id),
            });
            onProjectUpdated();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

    const formLoading = loading || isLoadingTags || isLoadingTopics || isLoadingUsers;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Project</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {formLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        label="Project Name"
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
                        <InputLabel id="owner-label">Project Owner</InputLabel>
                        <Select
                            labelId="owner-label"
                            value={ownerId}
                            onChange={(e) => setOwnerId(Number(e.target.value))}
                            input={<OutlinedInput label="Project Owner" />}
                            renderValue={(selected) => {
                                const u = users?.find(user => user.id === selected);
                                return u ? (u.name && u.surname ? `${u.name} ${u.surname}` : u.email) : selected;
                            }}
                        >
                            {users?.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.name && u.surname ? `${u.name} ${u.surname} (${u.email})` : u.email}
                                </MenuItem>
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
                                label="End Date"
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
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={formLoading} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={formLoading}
                    sx={{ px: 4 }}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProjectModal;
—R"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382ifile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/EditProjectModal.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan