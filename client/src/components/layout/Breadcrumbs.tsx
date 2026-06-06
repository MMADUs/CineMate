import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    path?: string; 
} 

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    disableAll?: boolean; 
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, disableAll = false }) => {
    return (
        <div className="text-xs md:text-sm text-white/50 mb-6 font-semibold tracking-wide flex flex-wrap items-center">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                if (disableAll || !item.path) {
                    return (
                        <React.Fragment key={index}>
                            <span className={`whitespace-nowrap ${isLast ? 'text-red-600' : 'text-white/50 cursor-not-allowed'}`}>
                                {item.label}
                            </span>
                            {!isLast && <span className="mx-2">/</span>}
                        </React.Fragment>
                    );
                }

                return (
                    <React.Fragment key={index}>
                        <Link to={item.path} className="hover:text-red-500 transition-colors whitespace-nowrap">
                            {item.label}
                        </Link>
                        {!isLast && <span className="mx-2">/</span>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};