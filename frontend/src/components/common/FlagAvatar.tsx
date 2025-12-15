'use client';

import ImageWithFallback from '@/components/common/ImageWithFallback';

interface FlagAvatarProps {
    image: string;
    name: string;
    countryCode?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showBorder?: boolean;
}

const FlagAvatar: React.FC<FlagAvatarProps> = ({
    image,
    name,
    countryCode,
    size = 'md',
    className = '',
    showBorder = true
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
            IT: '🇮🇹',
            CA: '🇨🇦',
            MX: '🇲🇽',
            BR: '🇧🇷',
            CN: '🇨🇳'
        };
        return flagMap[code] || '🌍';
    };

    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const fontSizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-3xl',
        xl: 'text-4xl'
    };

    const imageSizes = {
        sm: 24,
        md: 32,
        lg: 48,
        xl: 64
    };

    const borderClass = showBorder ? 'border border-gray-200' : '';

    // ✅ Agar image invalid hai toh directly fallback dikha do
    if (!image || image.trim() === '') {
        return (
            <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-full ${borderClass} ${className}`}>
                <span className={`flex h-full w-full items-center justify-center ${fontSizeClasses[size]}`}>
                    {getCountryFlag(countryCode || '')}
                </span>
            </div>
        );
    }

    return (
        <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-full ${borderClass} ${className}`}>
            <ImageWithFallback
                src={image}
                alt={`${name} flag`}
                width={imageSizes[size]}
                height={imageSizes[size]}
                className='h-full w-full object-cover'
                unoptimized
                fallbackElement={
                    <span className={`flex h-full w-full items-center justify-center ${fontSizeClasses[size]}`}>
                        {getCountryFlag(countryCode || '')}
                    </span>
                }
            />
        </div>
    );
};

export default FlagAvatar;
