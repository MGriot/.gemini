–Limport React, { useState } from 'react';
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
import { createProject } from '../../services/projects';
import { getUsers } from '../../services/users';
import { getTags, getTopics, createTag, createTopic } from '../../services/adminService'; // Import create services
import { Tag } from '../../types/tag';
import { Topic } from '../../types/topic';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import CreatableAutocomplete from '../common/CreatableAutocomplete';

interface CreateProjectModalProps {
    open: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose, onProjectCreated }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('Not Started');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [ownerId, setOwnerId] = useState<number | ''>('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch available tags and topics
    const { data: availableTags, isLoading: isLoadingTags } = useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: getTags,
        enabled: open, // Only fetch when modal is open
    });

    const { data: availableTopics, isLoading: isLoadingTopics } = useQuery<Topic[]>({
        queryKey: ['topics'],
        queryFn: getTopics,
        enabled: open, // Only fetch when modal is open
    });

    React.useEffect(() => {
        if (open) {
            getUsers().then(setAvailableUsers).catch(console.error);
        }
    }, [open]);

    const handleClose = () => {
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('Not Started');
        setSelectedTags([]);
        setSelectedTopics([]);
        setOwnerId('');
        setError('');
        onClose();
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

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await createProject({
                name,
                description,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                status,
                owner_id: ownerId !== '' ? Number(ownerId) : undefined,
                tag_ids: selectedTags.map(tag => tag.id),
                topic_ids: selectedTopics.map(topic => topic.id),
            });
            onProjectCreated();
            handleClose();
        } catch (err) {
            console.error(err);
            setError('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const statuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

    const formLoading = loading || isLoadingTags || isLoadingTopics;


    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>Create New Project</DialogTitle>
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

                    <TextField
                        select
                        label="Owner"
                        fullWidth
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value as number)}
                        disabled={formLoading}
                        required
                    >
                        <MenuItem value=""><em>Select Owner</em></MenuItem>
                        {availableUsers.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                                {u.name && u.surname ? `${u.name} ${u.surname}` : u.email}
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
                <Button onClick={handleClose} disabled={formLoading} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={formLoading}
                    sx={{ px: 4 }}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateProjectModal;
½ ½ï*cascade08
ïî
 î
ò*cascade08
ò£ £¹*cascade08
¹¢ ¢»*cascade08
»¦ ¦ï*cascade08
ï†8 †8û=*cascade08
û=–L "(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382kfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/CreateProjectModal.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan