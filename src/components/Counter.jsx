import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-blue-500 text-white p-4 rounded">
      <p>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-700 rounded"
      >
        Increment
      </button>
    </div>
  );
}