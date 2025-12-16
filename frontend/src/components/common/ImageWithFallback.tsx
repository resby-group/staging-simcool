// components/common/ImageWithFallback.tsx
'use client';

import { useState } from 'react';

import Image, { ImageProps } from 'next/image';

// components/common/ImageWithFallback.tsx

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'onError'> {
    src: string;
    fallbackSrc?: string;
    fallbackElement?: React.ReactNode;
    alt: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, fallbackElement, alt, ...rest }) => {
    const [imgSrc, setImgSrc] = useState<string>(src);
    const [hasError, setHasError] = useState<boolean>(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            if (fallbackSrc) {
                setImgSrc(fallbackSrc);
            }
        }
    };

    if (hasError && fallbackElement && !fallbackSrc) {
        return <>{fallbackElement}</>;
    }

    return <Image {...rest} src={imgSrc} alt={alt} onError={handleError} />;
};

export default ImageWithFallback;
