import React from 'react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '../types/breadcrumbs';

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <div className="text-xs md:text-sm text-white/50 mb-6 font-semibold tracking-wide flex flex-wrap items-center">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {item.path ? (
                        <Link to={item.path} className="hover:text-red-500 transition-colors whitespace-nowrap">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-red-600 whitespace-nowrap">{item.label}</span>
                    )}
                    
                    {index < items.length - 1 && <span className="mx-2">/</span>}
                </React.Fragment>
            ))}
        </div>
    );
};