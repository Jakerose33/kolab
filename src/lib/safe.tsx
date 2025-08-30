import { useParams } from 'react-router-dom';
import React from 'react';

export function useRequiredParam(name: string) {
  const params = useParams();
  const raw = params[name];
  return { value: raw ?? null, missing: !raw };
}

export function isNonEmpty<T>(v: T | null | undefined): v is T {
  return v !== null && v !== undefined;
}

export function asNumber(id: string | null) {
  const n = id ? Number(id) : NaN;
  return { n, ok: Number.isFinite(n) };
}

// Common error handling components
export function PageSkeleton() { 
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/3"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-3/4"></div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="p-4 border rounded text-sm text-rose-600 bg-rose-50">
      {message}
    </div>
  );
}

export function NotFound({ title = 'Not found', subtitle = '' }: { title?: string; subtitle?: string }) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}