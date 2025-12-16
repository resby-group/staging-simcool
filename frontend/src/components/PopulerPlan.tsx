'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/LanguageContext';
import { useProtectedApiHandler } from '@/lib/apiHandler/useProtectedApiHandler';
import { usePublicApiHandler } from '@/lib/apiHandler/usePublicApiHandler';
import { setEsimProvider } from '@/redux/slice/esimProviderSlice';
import { setUser } from '@/redux/slice/userSlice';
import { RootState } from '@/redux/store/store';

import Alert from './Alert';
import CommonPlanCard from './common/CommonPlanCard';
import BuyPlanModal from './modals/BuyPlanModal';
import PaymentModal from './modals/PaymentModal';
import PlanExploreModal from './modals/PlanExploreModal';
import PlanCardSkeleton from './skeleton/PlanCardSkeleton';
import {
    ArrowDownUp,
    ArrowRight,
    Calendar,
    CheckCircle,
    MessageSquare,
    PhoneCallIcon,
    Star,
    TrendingUp,
    View
} from 'lucide-react';
import { FaSms } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

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
}

interface Package {
    id: number;
    operator_id: number;
    airalo_package_id: string;
    name: string;
    type: string;
    day: number;
    is_unlimited: boolean;
    short_info: string | null;
    data: string;
    net_price: number;
    country: Country | null;
    region: string | null;
    sms: string | null;
    mins: string | null;
    is_active: boolean;
    is_popular: boolean;
    created_at: string;
    updated_at: string;
    esim_provider: string;
}

interface ApiResponse {
    data: Package[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
    success: boolean;
    message: string;
}

export interface PlanDetails {
    data?: string;
    sms?: string;
    mins?: string;
    days?: string;
}

const PopularPlans = () => {
    const [isPlanExploreModalOpen, setisPlanExploreModalOpen] = useState(false);
    const [isBuyPlanExploreModalOpen, setisBuyPlanExploreModalOpen] = useState(false);
    const [provideId, setprovideId] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const userRedux = useSelector((state: RootState) => state.user.user);
    const { t } = useTranslation();

    const dispatch = useDispatch();

    // Alert state
    const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    const showAlertMessage = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info'): void => {
        setAlertMessage(message);
        setAlertType(type);
        setShowAlert(true);
    }, []);

    const userToken = useSelector((state: RootState) => state.user.userToken);

    const {
        data: packagesData,
        isLoading,
        refetch
    } = userToken === null
        ? usePublicApiHandler<ApiResponse | null>({
              url: '/packages?per_page=4'
          })
        : useProtectedApiHandler<ApiResponse | null>({
              url: '/packages?per_page=4'
          });

    const providers = packagesData?.data.slice(0, 1)[0];

    useEffect(() => {
        refetch();
        if (providers) {
            dispatch(setEsimProvider(providers.esim_provider));
        }
    });

    const router = useRouter();

    // Helper function to get country flag from country code
    const getCountryFlag = (countryCode: string): string => {
        if (!countryCode || countryCode.length !== 2) return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    // Memoize popular packages

    const popularPackages = useMemo(() => {
        if (!packagesData?.success || !packagesData.data) return [];

        return packagesData.data
            .filter((pkg) => pkg.is_popular && pkg.is_active)
            .sort((a, b) => a.net_price - b.net_price);
    }, [packagesData]);


    if (!packagesData?.success || popularPackages.length === 0) {
        return (
            <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
                <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                    <div className='flex min-h-[300px] flex-col items-center justify-center'>
                        <div className='max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg'>
                            <TrendingUp className='mx-auto mb-3 h-12 w-12 text-blue-500' />
                            <h3 className='mb-2 text-lg font-bold text-gray-900'>
                                {packagesData?.message || 'No Popular Plans Available'}
                            </h3>
                            <p className='text-sm text-gray-600'>Popular plans are currently unavailable.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    function parsePlan(planString: string): PlanDetails {
        const parts = planString.split(' - ');
        const result: PlanDetails = {};
        parts.forEach((part) => {
            const lower = part.toLowerCase();

            if (lower.includes('gb')) {
                result.data = part.trim();
            } else if (lower.includes('sms')) {
                result.sms = part.trim();
            } else if (lower.includes('mins')) {
                result.mins = part.trim();
            } else if (lower.includes('days')) {
                result.days = part.trim();
            }
        });

        return result;
    }

    const handleExploreModal = (planData: Package) => {
        setisPlanExploreModalOpen(true);
        setprovideId(planData.id);
    };
    const handleBuyPlanModal = (planData: Package) => {
        if (!userRedux) {
            showAlertMessage('Please log in to purchase a plan.', 'warning');
            return;
        }

        const SMS = parsePlan(planData.name).sms;
        const MINS = parsePlan(planData.name).mins;

        if (SMS && MINS && userRedux?.kyc_status !== 'approved') {
            showAlertMessage('To view plan details, please complete KYC verification.', 'warning');
            setTimeout(() => {
                router.push('/profile');
            }, 3000);
            return;
        }
        setisBuyPlanExploreModalOpen(true);
        setprovideId(planData.id);
    };

    const handleBuyNow = () => {
        setShowPaymentModal(true);
    };

    const handlePaymentModalClose = () => {
        setShowPaymentModal(false);
    };

    return (
        <section className='bg-gradient-to-b from-blue-50 via-white to-purple-50 py-12 lg:py-16'>
            <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Header Section - Fully Dynamic */}
                <div className='mb-12 text-center'>
                    <div className='from-primary to-secondary mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-medium text-white'>
                        <Star className='h-4 w-4 text-yellow-500' />
                        {t('home.popularPlan.mostPopularEsims', { count: popularPackages.length })}
                    </div>

                    <h1 className='text-primary mb-4 text-3xl font-bold md:text-4xl'>
                        {t('home.popularPlan.popularEsims')}
                    </h1>

                    <p className='mx-auto mb-6 max-w-2xl text-base text-gray-600'>
                        {t('home.popularPlan.choosePackages', {
                            total: packagesData.meta.total,
                            pages: packagesData.meta.last_page
                        })}
                    </p>

                    <Button onClick={() => router.push('all-packages')}>{t('home.popularPlan.viewAllPackages')}</Button>
                </div>

                {/* Compact Popular Plans Grid */}
                {isLoading ? (
                    <PlanCardSkeleton count={4} />
                ) : (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {popularPackages.map((plan, index) => {
                            const planTypeData = parsePlan(plan.name);

                            const isPopular = true;

                            return (
                                <CommonPlanCard
                                    id={plan.id}
                                    key={plan.id}
                                    name={plan.name}
                                    isPopular={isPopular}
                                    image={plan.country?.image}
                                    countryName={plan.country?.name}
                                    countryCode={plan.country?.country_code}
                                    data={plan.data}
                                    voice={planTypeData.mins}
                                    sms={planTypeData.sms}
                                    days={plan.day}
                                    price={plan.net_price}
                                    currencySymbol={userRedux?.currency?.symbol || '$'}
                                    onViewDetails={() => handleExploreModal(plan)}
                                    onBuyPlan={() => handleBuyPlanModal(plan)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            {isPlanExploreModalOpen && (
                <PlanExploreModal
                    isOpen={isPlanExploreModalOpen}
                    onClose={() => setisPlanExploreModalOpen(false)}
                    packageId={provideId}
                    onPurchase={handleBuyNow}
                />
            )}
            {isBuyPlanExploreModalOpen && (
                <BuyPlanModal
                    isOpen={isBuyPlanExploreModalOpen}
                    onClose={() => setisBuyPlanExploreModalOpen(false)}
                    packageId={provideId}
                    onPurchase={handleBuyNow}
                />
            )}

            {showPaymentModal && (
                <PaymentModal
                    open={showPaymentModal}
                    onOpenChange={handlePaymentModalClose}
                    esimPackageId={provideId}
                />
            )}

            {showAlert && (
                <Alert message={alertMessage} onClose={() => setShowAlert(false)} type={alertType} duration={3000} />
            )}
        </section>
    );
};

export default PopularPlans;
