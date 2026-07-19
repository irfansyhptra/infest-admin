"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useScreenSize } from '@/libs/hooks/screenSizeValidation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const { isMobile } = useScreenSize();
  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <Link 
      href="/" 
      className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors duration-200"
      >
      <Home className="w-4 h-4" />
      <span className="hidden sm:inline">
        {(("Dashboard").length > 20 && isMobile) ? `${("Dashboard").slice(0, 20)}...` : "Dashboard"}
      </span>
      </Link>
      
      {items.map((item, index) => (
      <React.Fragment key={index}>
        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
        
        {item.href && !item.isActive ? (
        <Link 
          href={item.href}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          {(item.label.length > 20 && isMobile) ? `${item.label.slice(0, 20)}...` : item.label}
        </Link>
        ) : (
        <span 
          className={`${
          item.isActive 
            ? 'text-white font-medium' 
            : 'text-gray-300'
          }`}
        >
          {(item.label.length > 20 && isMobile) ? `${item.label.slice(0, 20)}...` : item.label}
        </span>
        )}
      </React.Fragment>
      ))}
    </nav>
  );
}

// Utility function to create breadcrumb items for common patterns
export const createBreadcrumbs = {
  competition: (competitionName: string, competitionId: string): BreadcrumbItem[] => [
    { label: 'Competitions', href: '/competitions' },
    { label: competitionName, isActive: true }
  ],
  
  team: (teamName: string, teamId: string, competitionName?: string, competitionId?: string): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Teams', href: '/teams' }
    ];
    
    if (competitionName && competitionId) {
      items.splice(1, 0, 
        { label: 'Competitions', href: '/competitions' },
        { label: competitionName, href: `/competitions/${competitionId}` }
      );
    }
    
    items.push({ label: teamName, isActive: true });
    return items;
  },
  
  custom: (items: Omit<BreadcrumbItem, 'isActive'>[]): BreadcrumbItem[] => {
    return items.map((item, index) => ({
      ...item,
      isActive: index === items.length - 1
    }));
  }
};
