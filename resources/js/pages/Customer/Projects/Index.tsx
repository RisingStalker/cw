import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { index as projectsIndex } from '@/routes/projects';
import { index as configurationsIndex } from '@/routes/configurations';
import { Head, Link } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';

interface Project {
    id: number;
    name: string;
    rooms_count: number;
    bathrooms_count: number;
    configurations_count: number;
}

interface PageProps {
    projects: Project[];
}

export default function CustomerProjectsIndex({ projects }: PageProps) {
    return (
        <CustomerLayout>
            <Head title="My Projects" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Select a project to manage configurations
                    </p>
                </div>

                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No projects available</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription>
                                        {project.rooms_count} rooms • {project.bathrooms_count} bathrooms
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {project.configurations_count} configuration{project.configurations_count !== 1 ? 's' : ''}
                                        </span>
                                        <Link href={configurationsIndex({ project: project.id }).url}>
                                            <Button size="sm">View Configurations</Button>
                                        </Link>
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

