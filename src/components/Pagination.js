import Link from 'next/link';

export default function Pagination({ currentPage, totalPages, basePath = '' }) {
  // Don't render pagination if there's only 1 page
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="pagination">
      {isFirstPage ? (
        <span className="pagination-btn disabled">&larr; క్రితం</span>
      ) : (
        <Link href={currentPage - 1 === 1 ? (basePath || '/') : `${basePath}/page/${currentPage - 1}`} className="pagination-btn">
          &larr; క్రితం
        </Link>
      )}

      <span className="pagination-info">
        పేజీ {currentPage} / {totalPages}
      </span>

      {isLastPage ? (
        <span className="pagination-btn disabled">తరువాత &rarr;</span>
      ) : (
        <Link href={`${basePath}/page/${currentPage + 1}`} className="pagination-btn">
          తరువాత &rarr;
        </Link>
      )}
    </div>
  );
}
