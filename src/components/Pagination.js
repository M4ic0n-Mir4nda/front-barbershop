import React from 'react';
import { usePagination, DOTS } from './usePagination';
import { Box, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/pagination.css';

const Pagination = props => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
    className
  } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize
  });

  // Verifique se paginationRange está definido
  if (!paginationRange || paginationRange.length < 2) {
    return null; // Não renderiza a paginação se o range for inválido
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];

  return (
    <Box
        sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <ul className={`pagination-container ${className || ''}`}>
        <IconButton 
            disabled={currentPage === 1} 
            onClick={onPrevious}
            sx={{
                height: "30%",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <ArrowBackIcon />
        </IconButton>
      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return <li key={`dots-${index}`} className="pagination-item dots">&#8230;</li>;
      }

        return (
          <li
            key={pageNumber}
            className={`pagination-item ${pageNumber === currentPage ? 'selected' : ''}`}
            onClick={() => onPageChange(pageNumber)
            
            }
          >
            {pageNumber}
          </li>
        );
      })}
        <IconButton 
            disabled={currentPage === lastPage} 
            onClick={onNext}
            sx={{
                height: "30%",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <ArrowForwardIcon />
        </IconButton>
    </ul>
    </Box>
  );
};

export default Pagination;
