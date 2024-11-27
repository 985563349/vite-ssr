import { useState } from 'react';
import { Link } from 'react-router-dom';

export async function getServerSideProps() {
  return {
    hobby: ['eat', 'play', 'sleep'],
  };
}

export default function Index({ hobby }) {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Hello Vite SSR</h1>
      <button onClick={() => setCount(() => count + 1)}>count is {count}</button>
      <p>
        <Link to="/posts/123">Go to another page</Link>
      </p>
      <p>Hobby</p>
      <ul>
        {hobby.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}
