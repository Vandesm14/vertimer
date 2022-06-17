import { useReducer, useState } from "preact/hooks";
import { render } from "preact";

interface Slot {
  time: number;
  relative: boolean;
}

const newSlot: () => Slot = () => ({ time: 0, relative: true });

type Transaction = (slots: Slot[]) => Slot[];

function App() {
  const [slots, alterSlots] = useReducer<Slot[], Transaction>(
    (slots, transaction) => transaction(slots),
    []
  );

  const addSlot = () => alterSlots((list) => [...list, newSlot()]);

  return (
    <main>
      <button onClick={addSlot}>Add</button>
      Hello!
    </main>
  );
}

render(<App />, document.body);
