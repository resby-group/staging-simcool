'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import CountrySmallCard from '../common/CountrySmallCard';
import { Search } from 'lucide-react';
import { FaPlaneDeparture } from 'react-icons/fa';
// Added plane icon
import { useSelector } from 'react-redux';

interface Country {
    id: number;
    region_id: number;
    name: string;
    slug: string;
    country_code: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_price: number;
}

interface ApiResponse {
    success: boolean;
    data: Country[];
}

interface DestinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (destination: string) => void;
}

const DestinationModal: React.FC<DestinationModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const userRedux = useSelector((state: RootState) => state.user.user);
    const userToken = useSelector((state: RootState) => state.user.userToken);

    const { data: countryData, refetch } =
        userToken === null
            ? usePublicApiHandler<ApiResponse>({
                  url: '/country'
              })
            : useProtectedApiHandler<ApiResponse>({
                  url: '/country'
              });

    useEffect(() => {
        refetch();
    });

    const router = useRouter();
    // Memoize countries to prevent unnecessary re-renders
    const countries = useMemo(() => {
        return countryData?.success ? countryData.data : [];
    }, [countryData]);

    // Memoize filtered destinations to optimize performance
    const filteredDestinations = useMemo(() => {
        if (searchQuery.trim() === '') {
            return countries;
        }

        return countries.filter(
            (country) =>
                country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                country.country_code.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, countries]);

    // Reset search when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleSelectDestination = (country: Country) => {
        router.push(`/country-plan/${country.slug}`);
        onSelect(`${country.name}, ${country.country_code}`);
        onClose();
        setSearchQuery('');
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    // Helper function to get country flag emoji as fallback
    const getCountryFlag = (countryCode: string): string => {
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
        return flagMap[countryCode] || '🌍';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='max-h-[90vh] max-w-lg gap-0 p-0'>
                <DialogHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 pb-4'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <DialogTitle className='text-xl font-bold text-gray-900'>
                                Select Your Destination
                            </DialogTitle>
                            <DialogDescription className='mt-1 text-sm text-gray-600'>
                                Choose where you need mobile data
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Modified Search Input - Image Style */}
                    <div className='relative mt-4'>
                        <div className='absolute top-1/2 left-4 flex -translate-y-1/2 items-center'>
                            <FaPlaneDeparture className='h-5 w-5 text-blue-500' />
                        </div>
                        <input
                            type='text'
                            name='search'
                            placeholder='Find your next travel destination'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='h-14 w-full rounded-full border border-gray-200 bg-white pr-12 pl-14 text-gray-600 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-gray-400 focus:outline-none'
                            autoFocus
                        />
                        <div className='absolute top-1/2 right-4 -translate-y-1/2'>
                            <Search className='h-5 w-5 text-blue-500' />
                        </div>
                    </div>
                </DialogHeader>
                <DialogDescription></DialogDescription>

                {/* Modal Body */}
                <div className='max-h-80 overflow-y-auto px-2'>
                    {filteredDestinations.length > 0 ? (
                        <div className='space-y-1 p-2'>
                            {filteredDestinations.map((country) => (
                                <CountrySmallCard
                                    key={country.id}
                                    id={country.id}
                                    name={country.name}
                                    countryCode={country.country_code}
                                    image={country.image}
                                    startPrice={country.start_price}
                                    currencySymbol={userRedux?.currency?.symbol || '$'}
                                    onClick={() => handleSelectDestination(country)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='p-12 text-center'>
                            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                                <Search className='h-8 w-8 text-gray-400' />
                            </div>
                            <h3 className='mb-2 text-lg font-medium text-gray-900'>No destinations found</h3>
                            <p className='text-gray-500'>Try adjusting your search terms or check spelling.</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className='border-t border-gray-200 bg-gray-50 p-4'>
                    <div className='flex items-center justify-between text-sm text-gray-600'>
                        <span>💡 Tip: Search by country name or code</span>
                        <span>{filteredDestinations.length} destinations</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DestinationModal;
