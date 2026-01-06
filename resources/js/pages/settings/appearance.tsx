import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import { useTranslations, t } from '@/hooks/use-translations';

export default function Appearance() {
    const translations = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('appearance_settings', translations),
            href: editAppearance().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('appearance_settings', translations)} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('appearance_settings', translations)}
                        description={t('update_appearance_settings', translations)}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
