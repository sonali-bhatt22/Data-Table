import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useEffect, useState, useRef } from "react";
import "./index.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import { OverlayPanel } from "primereact/overlaypanel";
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export default function App() {
  const [page, setPage] = useState(0);
  const [rows] = useState<number>(12);
  const [totalRecords, setTotalRecords] = useState(0);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [allRowIds, setAllRowIds] = useState<number[]>([]);
  const op = useRef<OverlayPanel>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  //Fetching pages on each request
  useEffect(() => {
    fetchPage(page + 1);
  }, [page]);

  const fetchPage = async (pageNum: number) => {
    
    const res = await fetch(
      `https://api.artic.edu/api/v1/artworks?page=${pageNum}`
    );
    const data = await res.json();
    setArtworks(data.data);
    setAllRowIds((prev) => {
      const newIds = data.data.map((a: Artwork) => a.id);
      return Array.from(new Set([...prev, ...newIds]));
    });
    setTotalRecords(data.pagination.total);
    
  };
  //Handling selection change (toggle for checkbox)
  const handleSelectionChange = (selected: Artwork[]) => {
    setSelectedRows((prev) => {
      const updated = { ...prev };
      const newSelection: { [key: number]: boolean } = {};
      selected.forEach((row) => {
        newSelection[row.id] = true;
      });
      artworks.forEach((row) => {
        if (!newSelection[row.id]) delete updated[row.id];
      });
      return { ...updated, ...newSelection };
    });
  };

  const handlePageChange = (e: { page: number }) => {
    setPage(e.page);
  };
  //Handling selection of first 'n' rows
  const handleSelectedRows = (count: number) => {
    if (count <= 0) return;

    const updated: Record<number, boolean> = {};
    allRowIds.slice(0, count).forEach((id) => (updated[id] = true));

    setSelectedRows(updated);
    op.current?.hide();
  };

  return (
    <div className="p-4">
      <DataTable
        value={artworks}
        selectionMode="checkbox"
        selection={artworks.filter((a) => selectedRows[a.id])}
        onSelectionChange={(e) => handleSelectionChange(e.value as Artwork[])}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
        paginator={false}
        className="dataTable"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <div></div>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <Paginator
        first={page * rows}
        rows={rows}
        totalRecords={totalRecords}
        onPageChange={(e: any) => handlePageChange(e)}
        pageLinkSize={5}
      />
      <button
        type="button"
        onClick={(e) => op.current?.toggle(e)}
        className="overlay-button"
      >
        <i className="pi pi-chevron-down"></i>
      </button>
      <OverlayPanel ref={op}>
        <div className="overlay-content">
          <input
            type="number"
            placeholder="enter no. of rows"
            ref={inputRef}
            min={1}
            max={artworks.length}
          />
          <button
            className="submit-button"
            onClick={() => {
              const count = Number(inputRef.current?.value) || 0;
              handleSelectedRows(count);
            }}
          >
            Submit
          </button>
        </div>
      </OverlayPanel>
    </div>
  );
}
