import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../trpc";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

function CreateProjectModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateProjectModalProps) {
    const [projectId, setProjectId] = useState("");
    const [name, setName] = useState("");
    const [retentionDays, setRetentionDays] = useState("90");
    const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const createProject = useMutation({
        ...trpc.projects.create.mutationOptions(),
        onSuccess: (data) => {
            setCreatedApiKey(data.apiKey);
            setError(null);
            onSuccess();
        },
        onError: (err: any) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        createProject.mutate({
            projectId,
            name,
            settings: {
                dataRetentionDays: parseInt(retentionDays, 10),
            },
        });
    };

    const handleClose = () => {
        setProjectId("");
        setName("");
        setRetentionDays("90");
        setCreatedApiKey(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Create Project
                </h2>

                {createdApiKey ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-sm font-medium text-green-800 mb-2">
                                Project created successfully!
                            </p>
                            <p className="text-xs text-green-700 mb-3">
                                Copy your API key now. You won't be able to see
                                it again!
                            </p>
                            <div className="bg-white border border-green-300 rounded p-2">
                                <code className="text-sm text-gray-900 break-all">
                                    {createdApiKey}
                                </code>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="projectId"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Project ID
                            </label>
                            <input
                                id="projectId"
                                type="text"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="my-project"
                                pattern="[a-zA-Z0-9-]+"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Alphanumeric and hyphens only
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Project Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="My Project"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="retention"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Data Retention (days)
                            </label>
                            <input
                                id="retention"
                                type="number"
                                value={retentionDays}
                                onChange={(e) =>
                                    setRetentionDays(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                                max="365"
                                required
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createProject.isPending}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                            >
                                {createProject.isPending
                                    ? "Creating..."
                                    : "Create"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

interface ProjectCardProps {
    project: any;
    onDelete: () => void;
    onRegenerateKey: () => void;
}

function ProjectCard({ project, onDelete, onRegenerateKey }: ProjectCardProps) {
    const [showApiKey, setShowApiKey] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const statsQuery = useQuery(
        trpc.projects.stats.queryOptions({
            projectId: project.projectId,
        })
    );

    const deleteProject = useMutation({
        ...trpc.projects.delete.mutationOptions(),
        onSuccess: () => {
            onDelete();
            setShowDeleteConfirm(false);
        },
    });

    const regenerateKey = useMutation({
        ...trpc.projects.regenerateApiKey.mutationOptions(),
        onSuccess: () => {
            onRegenerateKey();
        },
    });

    const stats = statsQuery.data;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        {project.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                        ID: {project.projectId}
                    </p>
                </div>
            </div>

            {statsQuery.isLoading ? (
                <div className="text-sm text-gray-500">Loading stats...</div>
            ) : statsQuery.error ? (
                <div className="text-sm text-red-600">Error loading stats</div>
            ) : stats ? (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">
                            Total Events
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.totalEvents.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">
                            Unique Users
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.uniqueUsers.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">
                            Event Types
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {stats.eventBreakdown.length}
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="mb-4">
                <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                    {showApiKey ? "Hide API Key" : "Show API Key"}
                </button>
                {showApiKey && (
                    <div className="mt-2 bg-gray-50 rounded p-2 border border-gray-200">
                        <code className="text-xs text-gray-900 break-all">
                            {project.apiKey}
                        </code>
                    </div>
                )}
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => {
                        if (
                            confirm(
                                "Are you sure you want to regenerate the API key? The old key will stop working."
                            )
                        ) {
                            regenerateKey.mutate({
                                projectId: project.projectId,
                            });
                        }
                    }}
                    disabled={regenerateKey.isPending}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 text-sm font-medium transition-colors disabled:bg-yellow-50"
                >
                    {regenerateKey.isPending
                        ? "Regenerating..."
                        : "Regenerate Key"}
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium transition-colors"
                >
                    Delete
                </button>
            </div>

            {showDeleteConfirm && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm text-red-800 mb-3">
                        Are you sure? This will delete the project and all its
                        events permanently.
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() =>
                                deleteProject.mutate({
                                    projectId: project.projectId,
                                })
                            }
                            disabled={deleteProject.isPending}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-red-400 transition-colors"
                        >
                            {deleteProject.isPending
                                ? "Deleting..."
                                : "Confirm Delete"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Projects() {
    const queryClient = useQueryClient();
    const [showCreateModal, setShowCreateModal] = useState(false);

    const projectsQuery = useQuery(trpc.projects.list.queryOptions());

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ["projects", "list"] });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Create Project
                </button>
            </div>

            {projectsQuery.isLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading projects...</p>
                </div>
            )}

            {projectsQuery.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">
                        Error loading projects: {projectsQuery.error.message}
                    </p>
                </div>
            )}

            {projectsQuery.data && projectsQuery.data.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600 mb-4">
                        No projects yet. Create your first project to get
                        started!
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Create Project
                    </button>
                </div>
            )}

            {projectsQuery.data && projectsQuery.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectsQuery.data.map((project) => (
                        <ProjectCard
                            key={project.projectId}
                            project={project}
                            onDelete={handleRefresh}
                            onRegenerateKey={handleRefresh}
                        />
                    ))}
                </div>
            )}

            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
