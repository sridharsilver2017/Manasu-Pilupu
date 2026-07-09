import Link from 'next/link';

export default function Pagination({ currentPage, totalPages }) {
  // Don't render pagination if there's only 1 page
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="pagination">
      {isFirstPage ? (
        <span className="pagination-btn disabled">&larr; క్రితం (Prev)</span>
      ) : (
        <Link href={currentPage - 1 === 1 ? '/' : `/page/${currentPage - 1}`} className="pagination-btn">
          &larr; క్రితం (Prev)
        </Link>
      )}

      <span className="pagination-info">
        పేజీ {currentPage} / {totalPages}
      </span>

      {isLastPage ? (
        <span className="pagination-btn disabled">తరువాత (Next) &rarr;</span>
      ) : (
        <Link href={`/page/${currentPage + 1}`} className="pagination-btn">
          తరువాత (Next) &rarr;
        </Link>
      )}
    </div>
  );
}
