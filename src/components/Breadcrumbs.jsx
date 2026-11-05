import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {items.map((it, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={14} className="separator" />
          {it.href ? (
            <Link to={it.href}>{it.label}</Link>
          ) : (
            <span className="current">{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
