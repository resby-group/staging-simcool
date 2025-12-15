'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Info, Zap } from 'lucide-react';
import { FaSimCard } from 'react-icons/fa';
import { LuRadioTower } from 'react-icons/lu';

interface Operator {
    id: number;
    name: string;
    country_id: number;
    region_id: number;
    airaloOperatorId: number;
    type: string;
    is_prepaid: number;
    esim_type: string;
    apn_type: string;
    apn_value: string;
    info: string;
    image: string;
    plan_type: string;
    activation_policy: string;
    is_kyc_verify: number;
    rechargeability: number;
    is_active: boolean;
    airalo_active: number;
    created_at: string;
    updated_at: string;
}

type OperatorOrArray = Operator | Operator[] | undefined | null;

type OperatorListModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    operators: OperatorOrArray; // packageDetails.operator
    title?: string;
};

export function OperatorListModal({
    open,
    onOpenChange,
    operators,
    title = 'Supported Operators'
}: Readonly<OperatorListModalProps>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <LuRadioTower size={20} />
                        {title}
                    </DialogTitle>
                    <DialogDescription>This package is available through the following operators.</DialogDescription>
                </DialogHeader>

                <div className='max-h-[60vh] space-y-3 overflow-y-auto'>
                    {(!Array.isArray(operators) || operators.length === 0) && (
                        <p className='py-6 text-center text-sm text-gray-500'>
                            No operators available for this package.
                        </p>
                    )}

                    {Array.isArray(operators) &&
                        operators.map((op) => (
                            <div
                                key={op.id}
                                className='flex items-center justify-between gap-4 rounded-xl border p-3 shadow-sm transition hover:shadow-md'>
                                {/* left: image + name + meta */}
                                <div className='flex flex-1 items-center gap-3'>
                                    <div className='relative h-9 w-9 overflow-hidden rounded-full bg-gray-100'>
                                        {op.image && op.image !== 'null' && op.image.trim() !== '' ? (
                                            <Image
                                                src={op.image}
                                                alt={`${op.name} logo`}
                                                fill
                                                sizes='36px'
                                                className='object-cover'
                                                onError={(e) => {
                                                    // Image load fail hone par fallback dikhaao
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling;
                                                    if (fallback) {
                                                        (fallback as HTMLElement).style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className='flex h-full w-full items-center justify-center text-gray-400'
                                            style={{
                                                display:
                                                    op.image && op.image !== 'null' && op.image.trim() !== ''
                                                        ? 'none'
                                                        : 'flex'
                                            }}>
                                            <FaSimCard size={16} />
                                        </div>
                                    </div>

                                    <div className='flex flex-col'>
                                        <span className='text-sm font-semibold'>{op.name}</span>

                                        <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
                                            <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5'>
                                                <Zap size={12} />
                                                {op.type || '—'}
                                            </span>

                                            <span className='rounded-full bg-gray-100 px-2 py-0.5'>
                                                {op.is_prepaid ? 'Prepaid' : 'Postpaid'}
                                            </span>

                                            {op.esim_type && (
                                                <span className='rounded-full bg-gray-100 px-2 py-0.5'>
                                                    {op.esim_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* right: details / actions */}
                                <div className='flex flex-col items-end gap-2'>
                                    <div className='flex items-center gap-2 text-xs'>
                                        {op.is_active ? (
                                            <span className='rounded-full bg-green-100 px-2 py-0.5 text-green-700'>
                                                Active
                                            </span>
                                        ) : (
                                            <span className='rounded-full bg-red-100 px-2 py-0.5 text-red-700'>
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    {/* optional compact details button to expand more info or show tooltip */}
                                    <details className='text-xs'>
                                        <summary className='cursor-pointer text-gray-600 select-none'>Details</summary>
                                        <div className='mt-2 w-64 rounded-lg bg-gray-50 p-3 text-[13px] text-gray-700'>
                                            {op.info ? (
                                                <p className='mb-2 flex items-start gap-2'>
                                                    <Info size={14} />
                                                    <span>{op.info}</span>
                                                </p>
                                            ) : null}

                                            {op.apn_type || op.apn_value ? (
                                                <p className='mb-2'>
                                                    <span className='font-medium'>APN:</span>{' '}
                                                    <span className='ml-1'>
                                                        {op.apn_type || ''} {op.apn_value ? `• ${op.apn_value}` : ''}
                                                    </span>
                                                </p>
                                            ) : null}

                                            {op.activation_policy && (
                                                <p className='mb-2'>
                                                    <span className='font-medium'>Activation:</span>{' '}
                                                    <span className='ml-1'>{op.activation_policy}</span>
                                                </p>
                                            )}

                                            <p className='text-[12px] text-gray-500'>
                                                KYC: {op.is_kyc_verify ? 'Required' : 'Not required'} • Rechargeability:{' '}
                                                {op.rechargeability ? 'Yes' : 'No'}
                                            </p>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
