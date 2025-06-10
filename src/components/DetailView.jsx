export default function Sidebar({ titles, onSelect }) {
  return (
    <div className="w-1/4 bg-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      {titles.map((title) => (
        <button
          key={title}
          onClick={() => onSelect(title)}
          className="block w-full text-left px-2 py-1 hover:bg-gray-300"
        >
          {title}
        </button>
      ))}
    </div>
  );
}
