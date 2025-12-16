'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { getUserTokenClient } from '@/lib/userAuth';

const ProtectedPage = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [originalRoute, setOriginalRoute] = useState('/dashboard');

    useEffect(() => {
        const getOriginalRoute = () => {
            const cookies = document.cookie.split(';');
            const originalRouteCookie = cookies.find((c) => c.trim().startsWith('originalRoute='));

            if (originalRouteCookie) {
                const route = decodeURIComponent(originalRouteCookie.split('=')[1]);
                setOriginalRoute(route);
                document.cookie = 'originalRoute=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        };

        const checkAuth = () => {
            const token = getUserTokenClient();
            if (token) {
                setIsAuthenticated(true);
                setTimeout(() => {
                    router.push(originalRoute);
                }, 1000);
            }
        };

        getOriginalRoute();
        checkAuth();
    }, [router, originalRoute]);

    const handleLogin = () => {
        router.push('/');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    // Success State
    if (isAuthenticated) {
        return (
            <div className='flex h-screen items-center justify-center bg-gray-900'>
                <div className='relative'>
                    <div className='absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20'></div>
                    <div className='relative rounded-full bg-green-500 p-8'>
                        <svg className='h-16 w-16 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
                        </svg>
                    </div>
                </div>
                <div className='absolute bottom-12 text-center'>
                    <p className='text-xl font-medium text-white'>Redirecting to your destination...</p>
                </div>
            </div>
        );
    }

    // Protected Route - Responsive Split Design
    return (
        <div className='flex min-h-screen flex-col lg:flex-row'>
            {/* Left Side - Visual Section */}
            <div className='relative flex min-h-[40vh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-8 lg:min-h-screen lg:w-1/2 lg:py-12'>
                {/* Animated Background Shapes */}
                <div className='absolute top-10 left-4 h-20 w-20 animate-pulse rounded-full bg-white/10 sm:top-20 sm:left-10 sm:h-32 sm:w-32'></div>
                <div className='absolute right-4 bottom-10 h-24 w-24 animate-pulse rounded-full bg-white/10 delay-75 sm:right-10 sm:bottom-20 sm:h-40 sm:w-40'></div>
                <div className='absolute top-1/2 left-1/4 h-16 w-16 animate-pulse rounded-full bg-white/10 delay-150 sm:left-1/3 sm:h-24 sm:w-24'></div>

                {/* Lock Icon */}
                <div className='relative z-10 px-4 text-center'>
                    <div className='mb-6 inline-block rounded-2xl bg-white/20 p-6 backdrop-blur-sm sm:rounded-3xl sm:p-8'>
                        <svg
                            className='h-16 w-16 text-white sm:h-20 sm:w-20 lg:h-24 lg:w-24'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={1.5}
                                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                            />
                        </svg>
                    </div>
                    <h2 className='mb-2 text-2xl font-bold text-white sm:mb-3 sm:text-3xl lg:text-4xl'>
                        Secure Access
                    </h2>
                    <p className='text-base text-white/90 sm:text-lg'>Your privacy is our priority</p>
                </div>
            </div>

            {/* Right Side - Content Section */}
            <div className='flex w-full items-center justify-center bg-white px-4 py-8 sm:px-6 sm:py-12 lg:w-1/2'>
                <div className='w-full max-w-md'>
                    {/* Status Badge */}
                    <div className='mb-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 sm:mb-6 sm:px-4 sm:py-2 sm:text-sm'>
                        <span className='h-2 w-2 animate-pulse rounded-full bg-red-500'></span>
                        Unauthorized Access
                    </div>

                    {/* Heading */}
                    <h1 className='mb-2 text-3xl font-bold text-gray-900 sm:mb-3 sm:text-4xl'>401</h1>
                    <h2 className='mb-1 text-xl font-semibold text-gray-800 sm:mb-2 sm:text-2xl'>
                        Authentication Required
                    </h2>
                    <p className='mb-6 text-sm text-gray-600 sm:mb-8 sm:text-base'>
                        You need to be logged in to view this content
                    </p>

                    {/* Route Info */}
                    <div className='mb-6 space-y-2 rounded-xl border-2 border-gray-100 bg-gray-50 p-4 sm:mb-8 sm:rounded-2xl sm:p-5'>
                        <div className='flex items-center gap-2 text-xs font-medium text-gray-500 sm:text-sm'>
                            <svg
                                className='h-4 w-4 flex-shrink-0'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                            </svg>
                            <span>Requested Path</span>
                        </div>
                        <p className='font-mono text-xs font-semibold break-all text-gray-900 sm:text-sm'>
                            {originalRoute}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className='space-y-2.5 sm:space-y-3'>
                        <button
                            onClick={handleLogin}
                            className='group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:gap-3 sm:px-6 sm:py-4 sm:text-base'>
                            <svg
                                className='h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                                />
                            </svg>
                            <span>Login to Continue</span>
                        </button>

                        <button
                            onClick={handleGoHome}
                            className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 sm:gap-3 sm:px-6 sm:py-4 sm:text-base'>
                            <svg
                                className='h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'>
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                                />
                            </svg>
                            <span>Back to Home</span>
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className='mt-6 flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500 sm:mt-8 sm:text-sm'>
                        <span>Need assistance?</span>
                        <a href='/' className='font-semibold text-indigo-600 hover:underline'>
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtectedPage;
