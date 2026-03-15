import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Pagination.css";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        {startItem}-{endItem} / {totalItems}
      </div>

      <div className="pagination-controls">
        <div className="pagination-buttons">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <FaChevronLeft />
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`pagination-btn ${
                page === currentPage ? "active" : ""
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
