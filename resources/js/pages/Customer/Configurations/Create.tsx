import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import CustomerLayout from '@/layouts/customer-layout';
import { index as configurationsIndex } from '@/routes/configurations';
import { store as storeConfiguration } from '@/routes/configurations';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useTranslations, t } from '@/hooks/use-translations';

interface Project {
    id: number;
    name: string;
}

interface PageProps {
    project: Project;
}

export default function CreateConfiguration({ project }: PageProps) {
    const translations = useTranslations();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeConfiguration({ project: project.id }).url, {
            onSuccess: () => {
                // Redirect will be handled by the controller
            },
        });
    };

    return (
        <CustomerLayout>
            <Head title={`Create Configuration - ${project.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={configurationsIndex({ project: project.id }).url}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('back', translations)}
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('create_configuration', translations)}</h1>
                        <p className="text-muted-foreground mt-2">{t('start_configuring_project', translations)}: {project.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('configuration_name', translations)}</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            placeholder={t('configuration_name_placeholder', translations)}
                        />
                        <InputError message={errors.name} />
                        <p className="text-sm text-muted-foreground">
                            {t('configuration_name_description', translations)}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            {t('create_and_start_configuration', translations)}
                        </Button>
                        <Link href={configurationsIndex({ project: project.id }).url}>
                            <Button type="button" variant="outline">
                                {t('cancel', translations)}
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}

