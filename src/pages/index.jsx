import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Hello Mini NextJS</h1>
      <button onClick={() => setCount(() => count + 1)}>count is {count}</button>
      <p>
        <Link to="/other">Go to another page</Link>
      </p>
    </>
  );
}
