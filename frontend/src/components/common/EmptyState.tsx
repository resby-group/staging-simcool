import { FileQuestion, RefreshCw, Search } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export default function EmptyState({
    title = 'No Data Found',
    description = 'There is no data available to display at the moment.',
    icon,
    action
}: EmptyStateProps) {
    return (
        <div className='flex flex-col items-center justify-center px-4 py-12 text-center'>
            <div className='mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800'>
                {icon || <FileQuestion className='h-12 w-12 text-gray-400 dark:text-gray-500' />}
            </div>

            <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>{title}</h3>

            <p className='mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400'>{description}</p>

            {action && <div className='flex gap-3'>{action}</div>}
        </div>
    );
}
