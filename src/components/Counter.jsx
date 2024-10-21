import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(1);
  const initialValue = 1;

  return (
    <div className="text-base-content p-4 rounded">
      <p>Count: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        className="mt-2 px-4 py-2 btn btn-primary"
      >
        Increment
      </button>
      <button
        onClick={() => setCount(count - 1)}
        className="mt-2 px-4 py-2 btn btn-primary"
      >
        Decrement
      </button>
      <button
        onClick={() => setCount(initialValue)}
        className="mt-2 px-4 py-2 btn btn-primary"
      >
        Reset
      </button>
    </div>
  );
}
