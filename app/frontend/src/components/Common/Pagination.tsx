import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
      let endPage = startPage + maxVisible - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(endPage - maxVisible + 1, 1);
      }
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
      <div className="flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
            currentPage === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          Previous
        </button>
      </div>
      
      <div className="hidden md:flex">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
              page === currentPage
                ? 'border-maroon-500 text-maroon-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
            disabled={typeof page !== 'number'}
          >
            {typeof page === 'number' ? page : <EllipsisHorizontalIcon className="h-5 w-5" />}
          </button>
        ))}
      </div>
      
      <div className="flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
            currentPage === totalPages
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Next
          <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;