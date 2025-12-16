import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { index as projectsIndex } from '@/routes/projects';
import { create as createConfiguration, show as showConfiguration, lock, copy, destroy, exportMethod as exportConfiguration } from '@/routes/configurations';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Copy, Download, Lock, Plus, Trash2 } from 'lucide-react';

interface Configuration {
    id: number;
    name: string;
    is_completed: boolean;
    is_locked: boolean;
    created_at: string;
}

interface Project {
    id: number;
    name: string;
}

interface PageProps {
    project: Project;
    configurations: Configuration[];
}

export default function ConfigurationsIndex({ project, configurations }: PageProps) {

    const handleLock = (configId: number) => {
        if (confirm('Are you sure you want to lock this configuration? It cannot be edited after locking.')) {
            router.post(lock({ project: project.id, configuration: configId }).url);
        }
    };

    const handleCopy = (configId: number) => {
        router.post(copy({ project: project.id, configuration: configId }).url);
    };

    const handleDelete = (configId: number) => {
        if (confirm('Are you sure you want to delete this configuration?')) {
            router.delete(destroy({ project: project.id, configuration: configId }).url);
        }
    };

    return (
        <CustomerLayout>
            <Head title={`Configurations - ${project.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={projectsIndex().url}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                            <p className="text-muted-foreground mt-2">Manage your configurations</p>
                        </div>
                    </div>
                    <Link href={createConfiguration({ project: project.id }).url}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Configuration
                        </Button>
                    </Link>
                </div>

                {configurations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="mb-4 text-muted-foreground">No configurations yet</p>
                            <Link href={createConfiguration({ project: project.id }).url}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Configuration
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {configurations.map((config) => (
                            <Card key={config.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{config.name}</CardTitle>
                                            <CardDescription>
                                                Created {new Date(config.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        {config.is_locked && (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Locked
                                            </span>
                                        )}
                                        {config.is_completed && !config.is_locked && (
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={showConfiguration({ project: project.id, configuration: config.id }).url}>
                                            <Button size="sm" variant="outline">
                                                View
                                            </Button>
                                        </Link>
                                        {!config.is_locked && (
                                            <Link href={showConfiguration({ project: project.id, configuration: config.id }).url}>
                                                <Button size="sm" variant="outline">
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}
                                        {!config.is_locked && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleLock(config.id)}
                                            >
                                                <Lock className="mr-1 h-3 w-3" />
                                                Lock
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopy(config.id)}
                                        >
                                            <Copy className="mr-1 h-3 w-3" />
                                            Copy
                                        </Button>
                                        <a
                                            href={exportConfiguration({ project: project.id, configuration: config.id }).url}
                                            target="_blank"
                                        >
                                            <Button size="sm" variant="outline">
                                                <Download className="mr-1 h-3 w-3" />
                                                PDF
                                            </Button>
                                        </a>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(config.id)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}

