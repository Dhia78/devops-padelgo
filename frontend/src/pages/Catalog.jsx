import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EquipmentCard from "../components/EquipmentCard";
import { useAppContext } from "../context/AppContext";
import { fetchClubs, fetchCourts, todayDateValue } from "../lib/api";

const defaultFilters = {
  category: "",
  minPrice: "",
  maxPrice: "",
  available: "",
  sort: "rating",
  order: "desc",
  page: "1"
};

export default function Catalog() {
  const { availabilityVersion } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubs, setClubs] = useState([]);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 9 });
  const [loading, setLoading] = useState(true);

  const filters = useMemo(() => {
    const updated = { ...defaultFilters };
    Object.keys(updated).forEach((key) => {
      if (searchParams.has(key)) {
        updated[key] = searchParams.get(key) || "";
      }
    });
    return updated;
  }, [searchParams]);

  useEffect(() => {
    fetchClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCourts({
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      available: filters.available,
      sort: filters.sort,
      order: filters.order,
      page: filters.page,
      pageSize: 9,
      date: todayDateValue()
    })
      .then((payload) => {
        setItems(payload.items || []);
        setMeta({ total: payload.total, page: payload.page, pageSize: payload.pageSize });
      })
      .catch(() => {
        setItems([]);
        setMeta({ total: 0, page: 1, pageSize: 9 });
      })
      .finally(() => setLoading(false));
  }, [filters, availabilityVersion]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === "" || value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== "page") {
      next.set("page", "1");
    }
    setSearchParams(next);
  }

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  const page = Number(filters.page || 1);

  return (
    <div className="catalog">
      <section className="catalog-hero">
        <div>
          <p className="eyebrow">Padel Paris</p>
          <h1>Terrains disponibles</h1>
        </div>
        <p className="catalog-count">{loading ? "Recherche en cours" : `${meta.total} terrains trouvés`}</p>
      </section>

      <section className="filters">
        <label>
          Club
          <select value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">Toutes</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.slug}>
                {club.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Prix max / h
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
          />
        </label>
        <label>
          Créneaux
          <select value={filters.available} onChange={(event) => updateFilter("available", event.target.value)}>
            <option value="">Tous les terrains</option>
            <option value="today">Disponibles aujourd'hui</option>
            <option value="upcoming">Disponibles prochains jours</option>
            <option value="fullToday">Complets aujourd'hui</option>
          </select>
        </label>
        <label>
          Tri
          <select value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
            <option value="rating">Note</option>
              <option value="price">Prix</option>
              <option value="name">Nom</option>
          </select>
        </label>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Résultats</p>
            <h2>{loading ? "Chargement..." : `${meta.total} terrains`}</h2>
          </div>
          <div className="pagination">
            <button
              className="ghost-button"
              type="button"
              disabled={page <= 1}
              onClick={() => updateFilter("page", String(page - 1))}
            >
              Précédent
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="ghost-button"
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateFilter("page", String(page + 1))}
            >
              Suivant
            </button>
          </div>
        </div>
        <div className="grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <div className="card skeleton" key={index} />)
            : items.map((equipment) => <EquipmentCard key={equipment.id} equipment={equipment} />)}
        </div>
      </section>
    </div>
  );
}
