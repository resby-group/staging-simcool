'use client';

import { Button } from '@/components/ui/button';

import FlagAvatar from './FlagAvatar';
import { ArrowDownUp, ArrowRight, Calendar, CheckCircle, MessageSquare, PhoneCallIcon, View } from 'lucide-react';

interface PlanFeature {
    text: string;
    icon?: React.ReactNode;
}

interface PlanCardProps {
    id: number;
    name: string;
    isPopular?: boolean;
    image?: string;
    countryName?: string;
    countryCode?: string;
    data: string;
    voice?: string | null;
    sms?: string | null;
    days: number;
    price: number;
    currencySymbol?: string;
    features?: PlanFeature[];
    onViewDetails: () => void;
    onBuyPlan: () => void;
    className?: string;
}

const CommonPlanCard: React.FC<PlanCardProps> = ({
    id,
    name,
    isPopular = false,
    image = '',
    countryName = '',
    countryCode = '',
    data,
    voice = null,
    sms = null,
    days,
    price,
    currencySymbol = '$',
    features = [],
    onViewDetails,
    onBuyPlan,
    className = ''
}) => {
    const formatDataType = (dataValue: string): string => {
        if (!dataValue) return 'N/A';
        return dataValue.includes('unlimited') ? 'Unlimited' : dataValue.toUpperCase();
    };

    const pricePerDay = (price / days).toFixed(2);

    const defaultFeatures: PlanFeature[] = [
        { text: `${formatDataType(data)} Data` },
        { text: `Valid for ${days} days` }
    ];

    const displayFeatures = features.length > 0 ? features : defaultFeatures;

    return (
        <div
            key={id}
            className={`group relative flex transform flex-col rounded-2xl border bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isPopular
                    ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white'
                    : 'border-gray-200 hover:border-blue-300'
            } ${className}`}>
            {/* Popular Badge */}
            {isPopular && (
                <div className='absolute -top-2 -right-2'>
                    <div className='rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-lg'>
                        Most Popular
                    </div>
                </div>
            )}

            {/* Header with Country/Region Info */}
            <div className='mb-4 flex items-center gap-3'>
                <FlagAvatar image={image} name={countryName || name} countryCode={countryCode} size='md' />
                <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-sm font-bold text-gray-900'>{name}</h3>
                    {countryName && <p className='truncate text-xs text-gray-500 capitalize'>{countryName}</p>}
                </div>
            </div>

            {/* Plan Details Grid */}
            <div className='mb-4 text-center'>
                <div className='grid grid-cols-3 gap-4'>
                    {/* Data */}
                    <div className='flex flex-col items-center gap-2'>
                        <ArrowDownUp className='h-4 w-4 text-blue-600' />
                        <span className='text-sm font-medium text-gray-900'>{formatDataType(data)}</span>
                    </div>

                    {/* Voice */}
                    <div className='flex flex-col items-center gap-2'>
                        <PhoneCallIcon className={`h-4 w-4 ${voice ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${voice ? 'text-gray-900' : 'text-gray-400'}`}>
                            {voice || 'N/A'}
                        </span>
                    </div>

                    {/* SMS */}
                    <div className='flex flex-col items-center gap-2'>
                        <MessageSquare className={`h-4 w-4 ${sms ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${sms ? 'text-gray-900' : 'text-gray-400'}`}>
                            {sms || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Days Display */}
                <div className='my-3 flex items-center justify-center gap-1 text-gray-600'>
                    <Calendar className='h-3 w-3' />
                    <span className='text-xs'>{days} Days</span>
                </div>

                {/* Price Display */}
                <div className='mb-3'>
                    <div className='flex items-baseline justify-center gap-1'>
                        <span className='text-secondary text-2xl font-bold'>
                            {currencySymbol} {price.toFixed(2)}
                        </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                        {currencySymbol}
                        {pricePerDay} per day
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <div className='mb-4 flex-grow space-y-2'>
                {displayFeatures.map((feature, index) => (
                    <div key={index} className='flex items-center gap-2'>
                        {feature.icon || <CheckCircle className='h-3 w-3 flex-shrink-0 text-green-500' />}
                        <span className='text-xs text-gray-700'>{feature.text}</span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className='mt-auto space-y-3'>
                {/* View Details Button */}
                <Button
                    onClick={onViewDetails}
                    variant='outline'
                    className='group w-full rounded-lg border-2 border-gray-300 bg-transparent px-4 py-3 font-medium text-gray-700 transition-all duration-300 hover:border-gray-400 hover:bg-gray-50'>
                    <span className='flex items-center justify-center gap-2'>
                        <View className='h-4 w-4 transition-transform group-hover:scale-110' />
                        View Plan Details
                        <ArrowRight className='h-3 w-3 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100' />
                    </span>
                </Button>

                {/* Buy Plan Button */}
                <Button
                    onClick={onBuyPlan}
                    className={`group w-full transform rounded-lg px-4 py-3 font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                        isPopular
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 hover:shadow-xl'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                    <span className='flex items-center justify-center gap-2'>
                        <span className='relative'>
                            Get Plan
                            <span className='absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full' />
                        </span>
                        <ArrowRight className='h-4 w-4 transition-all group-hover:translate-x-1 group-hover:scale-110' />
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default CommonPlanCard;
