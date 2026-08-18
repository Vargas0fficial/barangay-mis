"use client";
import { useState, useEffect, useCallback } from "react";

interface UseCrudOptions<T> {
  endpoint: string; // e.g. "/api/residents"
  /** Some endpoints return a raw array, others return { residents: [...] } etc. Normalize here. */
  extractList?: (data: any) => T[];
  getId: (item: T) => string | undefined;
}

/**
 * Shared fetch/create/update/delete logic for the system's CRUD pages
 * (Residents, Officials, Blotter, 4Ps, ...). Each page still owns its own
 * form state and JSX — this just centralizes the repeated API plumbing.
 */
export function useCrud<T>({ endpoint, extractList, getId }: UseCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const list = extractList ? extractList(data) : Array.isArray(data) ? data : [];
        setItems(list);
      }
    } catch (err) {
      console.error(`Failed to fetch ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, extractList]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Returns { ok: true } on success, or { ok: false, error } so the caller can show it in the modal. */
  const create = async (payload: Record<string, unknown>) => {
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAll();
        return { ok: true as const };
      }
      const message = data.error || "Failed to save record.";
      setError(message);
      return { ok: false as const, error: message };
    } catch (err) {
      const message = "Network error while saving record.";
      console.error(err);
      setError(message);
      return { ok: false as const, error: message };
    }
  };

  const update = async (id: string, payload: Record<string, unknown>) => {
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchAll();
        return { ok: true as const };
      }
      const message = data.error || "Failed to update record.";
      setError(message);
      return { ok: false as const, error: message };
    } catch (err) {
      const message = "Network error while updating record.";
      console.error(err);
      setError(message);
      return { ok: false as const, error: message };
    }
  };

  const remove = async (item: T) => {
    const id = getId(item);
    if (!id) return { ok: false as const, error: "Missing record id." };
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchAll();
        return { ok: true as const };
      }
      return { ok: false as const, error: "Failed to delete record." };
    } catch (err) {
      console.error(err);
      return { ok: false as const, error: "Network error while deleting record." };
    }
  };

  return { items, loading, error, setError, fetchAll, create, update, remove };
}
