"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCategoriesClient } from '@/lib/api-client';

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await getAllCategoriesClient();
        const valid = fetchedCategories.filter(cat => cat.count > 0 && cat.slug !== 'uncategorized');
        setCategories(valid);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="home-wrapper" style={{ paddingTop: '40px' }}>
      <section className="animate-fade-in-up">
        <div className="section-header">
          <h1>విభాగాలు</h1>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            మీకు నచ్చిన విభాగంలోని వ్యాసాలను చదవండి
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
            {categories.map((category) => (
              <Link 
                href={`/category?slug=${category.slug}`} 
                key={category.id} 
                className="category-card"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--primary-color)' }}>
                  {category.name}
                </h2>
                <span style={{ backgroundColor: 'var(--bg-primary)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {category.count} {category.count === 1 ? 'వ్యాసం' : 'వ్యాసాలు'}
                </span>
                {category.description && (
                  <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
