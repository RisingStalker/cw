import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/customer-layout';
import { useTranslations, t } from '@/hooks/use-translations';
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
    const translations = useTranslations();

    return (
        <CustomerLayout>
            <Head title={t('my_projects', translations)} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('my_projects', translations)}</h1>
                    <p className="text-muted-foreground mt-2">
                        {t('select_project_manage_configurations', translations)}
                    </p>
                </div>

                {projects.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">{t('no_projects', translations)}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                    <CardDescription>
                                        {project.rooms_count} {t('rooms', translations)} • {project.bathrooms_count} {t('bathrooms', translations)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {project.configurations_count} {project.configurations_count !== 1 ? t('configurations_plural', translations) : t('configuration_singular', translations)}
                                        </span>
                                        <Link href={configurationsIndex({ project: project.id }).url}>
                                            <Button size="sm">{t('view_configurations', translations)}</Button>
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

