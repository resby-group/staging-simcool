'use client';

import ImageWithFallback from '@/components/common/ImageWithFallback';
import { Button } from '@/components/ui/button';

interface CountryCardProps {
    id: number;
    name: string;
    countryCode?: string;
    image: string;
    startPrice: number;
    currencySymbol?: string;
    onClick: () => void;
    className?: string;
}

const CountrySmallCard: React.FC<CountryCardProps> = ({
    name,
    countryCode,
    image,
    startPrice,
    currencySymbol = '$',
    onClick,
    className = ''
}) => {
    const getCountryFlag = (code: string): string => {
        const flagMap: Record<string, string> = {
            IN: '🇮🇳',
            US: '🇺🇸',
            GB: '🇬🇧',
            JP: '🇯🇵',
            FR: '🇫🇷',
            AE: '🇦🇪',
            SG: '🇸🇬',
            AU: '🇦🇺',
            TH: '🇹🇭',
            DE: '🇩🇪',
            ES: '🇪🇸',
            IT: '🇮🇹'
        };
        return flagMap[code || ''] || '🌍';
    };

    return (
        <Button
            variant='ghost'
            onClick={onClick}
            className={`group h-auto w-full transform cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${className}`}>
            <div className='flex w-full items-center gap-4'>
                {/* Flag/Image Section - Increased size */}
                <div className='flex-shrink-0'>
                    <div className='relative h-12 w-12 overflow-hidden rounded-full border-2 border-gray-100 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-blue-200'>
                        <ImageWithFallback
                            src={image}
                            alt={`${name} flag`}
                            width={48}
                            height={48}
                            className='h-full w-full object-cover'
                            unoptimized
                            fallbackElement={
                                <span className='flex h-full w-full items-center justify-center text-3xl'>
                                    {getCountryFlag(countryCode || '')}
                                </span>
                            }
                        />
                    </div>
                </div>

                {/* Content Section - With overflow handling */}
                <div className='min-w-0 flex-1 text-left'>
                    <p className='truncate text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-700'>
                        {name}
                    </p>
                    {countryCode && <p className='text-xs tracking-wide text-gray-500 uppercase'>{countryCode}</p>}
                    <p className='mt-1 text-xs font-medium text-gray-600 transition-colors duration-200 group-hover:text-blue-600'>
                        Starting from {currencySymbol}
                        {(Number(startPrice) || 0).toFixed(2)}
                    </p>
                </div>

                {/* Arrow Icon */}
                <div className='flex-shrink-0'>
                    <svg
                        className='h-5 w-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                </div>
            </div>
        </Button>
    );
};

export default CountrySmallCard;
