import { useReducer, useState } from "preact/hooks";
import { render } from "preact";

interface Slot {
  id: number;
  time: number;
  relative: boolean;
}

const gid = () => Math.round(Math.random() * 10 ** 8);

const newSlot: () => Slot = () => ({
  id: gid(),
  time: 0,
  relative: true,
});

type Transaction = (slots: Slot[]) => Slot[];

const removeAtIndex = (arr: Array<any>, index: number) => [
  ...arr.slice(0, index),
  ...arr.slice(index + 1),
];

function App() {
  const [slots, alterSlots] = useReducer<Slot[], Transaction>(
    (slots, transaction) => transaction(slots),
    []
  );

  const addSlot = () => alterSlots((list) => [...list, newSlot()]);
  const removeSlot = (id: Slot["id"]) =>
    alterSlots((list) =>
      removeAtIndex(
        slots,
        list.findIndex((el) => el.id === id)
      )
    );

  return (
    <main>
      <button onClick={addSlot}>Add</button>
      <ul>
        {slots.map((slot) => (
          <li>
            {slot.id}{" "}
            <button onClick={() => removeSlot(slot.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

render(<App />, document.body);
