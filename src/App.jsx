import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import DetailView from "./components/DetailView";

export default function App() {
  const [data, setData] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);

  useEffect(() => {
    fetch("/data/links.csv")
      .then((res) => res.text())
      .then((text) =>
        Papa.parse(text, {
          header: true,
          complete: (results) => setData(results.data),
        })
      );
  }, []);

  const uniqueTitles = [...new Set(data.map((row) => row.Title))];

  const filtered = data.filter((row) => row.Title === selectedTitle);

  return (
    <div className="flex h-screen">
      <Sidebar titles={uniqueTitles} onSelect={setSelectedTitle} />
      <DetailView data={filtered} />
    </div>
  );
}
