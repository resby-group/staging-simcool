'use client';

import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { RootState } from '@/redux/store/store';

import CountrySmallCard from './common/CountrySmallCard';
import { ChevronRight, Globe, MapPin, Search, Sparkles } from 'lucide-react';
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

interface Region {
    id: number;
    name: string;
    slug: string;
    image: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    start_price: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T[];
}

// ✅ Fixed interface - consistent types
interface UnifiedDestination {
    id: string; // Always string for unified format
    numericId: number; // Original numeric ID
    name: string;
    priceFormatted: string; // Display price (formatted string)
    image: string;
    country_code?: string;
    countries?: number;
    type: 'country' | 'region';
    featured?: boolean;
    slug: string;
    start_price: number; // Numeric price for calculations
}

const AllDestinations = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const userRedux = useSelector((state: RootState) => state.user.user);
    const userToken = useSelector((state: RootState) => state.user.userToken);

    const tokeBaseHandler = userToken ? useProtectedApiHandler : usePublicApiHandler;

    const { data: countryApiData, isLoading: countryLoading } = tokeBaseHandler<ApiResponse<Country>>({
        url: '/country'
    });

    const { data: regionApiData, isLoading: regionLoading } = tokeBaseHandler<ApiResponse<Region>>({
        url: '/regions'
    });

    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    const determineIfFeatured = (price: number, name: string, type: 'country' | 'region'): boolean => {
        if (type === 'region') {
            const popularRegions = ['europe', 'asia', 'americas', 'africa'];
            return popularRegions.includes(name.toLowerCase());
        }
        return price < 5;
    };

    const countries = useMemo(() => {
        return countryApiData?.success ? countryApiData.data : [];
    }, [countryApiData]);

    const regions = useMemo(() => {
        return regionApiData?.success ? regionApiData.data : [];
    }, [regionApiData]);

    // ✅ Fixed transformation with consistent types
    const unifiedDestinations = useMemo((): UnifiedDestination[] => {
        const countryDestinations: UnifiedDestination[] = countries
            .filter((pkg) => pkg.start_price !== null)
            .map((country) => ({
                id: `country-${country.id}`,
                numericId: country.id,
                name: country.name,
                priceFormatted: `From ${userRedux?.currency?.symbol || '$'}${(Number(country.start_price) || 0).toFixed(2)}`,
                image: country.image,
                country_code: country.country_code,
                type: 'country' as const,
                featured: determineIfFeatured(country.start_price, country.name, 'country'),
                slug: country.slug,
                start_price: Number(country.start_price) || 0
            }));

        const regionDestinations: UnifiedDestination[] = regions
            .filter((pkg) => pkg.start_price !== null)
            .map((region) => ({
                id: `region-${region.id}`,
                numericId: region.id,
                name: region.name,
                priceFormatted: `From ${userRedux?.currency?.symbol || '$'}${(Number(region.start_price) || 0).toFixed(2)}`,
                image: region.image,
                type: 'region' as const,
                featured: determineIfFeatured(region.start_price, region.name, 'region'),
                slug: region.slug,
                start_price: Number(region.start_price) || 0
            }));

        return [...countryDestinations, ...regionDestinations];
    }, [countries, regions, userRedux?.currency?.symbol]);

    const filteredDestinations = useMemo(() => {
        let filtered = unifiedDestinations;

        if (activeTab !== 'all') {
            filtered = filtered.filter((dest) => dest.type === activeTab);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((dest) => dest.name.toLowerCase().includes(query));
        }

        return filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [unifiedDestinations, activeTab, searchQuery]);

    const getDestinationIcon = (dest: UnifiedDestination) => {
        if (dest.type === 'region') {
            if (dest.image) {
                return (
                    <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                        <Image
                            src={dest.image}
                            alt={`${dest.name} region`}
                            width={32}
                            height={32}
                            className='h-full w-full object-cover'
                            unoptimized
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML =
                                        '<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">ircle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg></div>';
                                }
                            }}
                        />
                    </div>
                );
            }
            return <Globe className='h-8 w-8 text-blue-600' />;
        }

        if (dest.image) {
            return (
                <div className='relative h-8 w-8 overflow-hidden rounded-full'>
                    <Image
                        src={dest.image}
                        alt={`${dest.name} flag`}
                        width={32}
                        height={32}
                        className='h-full w-full object-cover'
                        unoptimized
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && dest.country_code) {
                                parent.innerHTML = `<span class="text-2xl">${getCountryFlag(dest.country_code)}</span>`;
                            } else if (parent) {
                                parent.innerHTML =
                                    '<div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                            }
                        }}
                    />
                </div>
            );
        }

        if (dest.country_code) {
            return <span className='text-2xl'>{getCountryFlag(dest.country_code)}</span>;
        }

        return <MapPin className='h-6 w-6 text-gray-400' />;
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
    };

    const router = useRouter();

    const handleNaviage = (info: UnifiedDestination) => {
        if (info.type === 'country') {
            router.push(`/country-plan/${info.slug}`);
        }
        if (info.type === 'region') {
            router.push(`/region-plan/${info.slug}`);
        }
    };

    // const isLoading = !countryApiData || !regionApiData;

    if (countryLoading || regionLoading) {
        return (
            <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center'>
                        <div className='mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600'></div>
                        <p className='text-lg text-gray-600'>Loading destinations...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='bg-gradient-to-b from-gray-50 to-white py-16 lg:py-20'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Sparkles className='h-4 w-4' />
                        Global Coverage
                    </div>

                    <h1 className='text-primary mb-6 text-4xl font-medium md:text-5xl'>All destinations</h1>

                    <p className='mx-auto mb-8 max-w-3xl text-lg text-gray-600'>
                        Find the best data plans in over {unifiedDestinations.length}+ destinations — and enjoy easy and
                        safe internet access wherever you go. Connect instantly with our premium eSIM solutions.
                    </p>
                </div>

                <div className='mb-8'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                            <TabsList className='grid h-12 w-full grid-cols-3 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:w-auto'>
                                <TabsTrigger
                                    value='all'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    All ({unifiedDestinations.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value='country'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    Countries ({countries.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value='region'
                                    className='data-[state=active]:bg-primary rounded-lg font-semibold transition-all duration-300 data-[state=active]:text-white data-[state=active]:shadow-sm'>
                                    Regions ({regions.length})
                                </TabsTrigger>
                            </TabsList>

                            <div className='relative w-full sm:w-auto sm:min-w-[300px]'>
                                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                                <Input
                                    type='text'
                                    name='allDestinations'
                                    placeholder='Search for destination'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className='h-12 rounded-xl border-gray-200 bg-white pr-4 pl-10 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                                />
                                {searchQuery && (
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setSearchQuery('')}
                                        className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-lg p-0 hover:bg-gray-100'>
                                        ×
                                    </Button>
                                )}
                            </div>
                        </div>

                        <TabsContent value={activeTab} className='mt-6'>
                            <div className='mb-6'>
                                <p className='text-sm text-gray-600'>
                                    Showing {filteredDestinations.length} destinations
                                    {searchQuery && <span> for "{searchQuery}"</span>}
                                </p>
                            </div>

                            {filteredDestinations.length > 0 ? (
                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                    {filteredDestinations.map((dest) => {
                                        return (
                                            <CountrySmallCard
                                                key={dest.id}
                                                id={dest.numericId}
                                                name={dest.name}
                                                image={dest.image}
                                                startPrice={dest.start_price}
                                                currencySymbol={userRedux?.currency?.symbol || '$'}
                                                onClick={() => handleNaviage(dest)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className='py-16 text-center'>
                                    <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100'>
                                        <Search className='h-8 w-8 text-gray-400' />
                                    </div>
                                    <h3 className='mb-2 text-lg font-medium text-gray-900'>No destinations found</h3>
                                    <p className='mb-4 text-gray-600'>Try adjusting your search or filter criteria</p>
                                    <Button variant='outline' onClick={handleClearFilters}>
                                        Clear filters
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    );
};

export default AllDestinations;
