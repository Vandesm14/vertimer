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

const tryCall = (fn: Function) => fn && fn();

interface TimerProps {
  onStart?: () => void;
  onStop?: () => void;
  onPause?: () => void;
  rate?: number;
}

type TimerState = "on" | "off" | "paused";
type TimerAction = "start" | "stop" | "pause";

/*
  Off: Start -> On
  Off: Stop -> Off
  Off: Pause -> Off

  On: Start -> On
  On: Stop -> Off
  On: Pause -> Paused

  Paused: Start -> On
  Paused: Stop -> Off
  Paused: Pause -> On
*/

function Timer(props: TimerProps) {
  const [time, setTime] = useReducer<number, "increment" | number>(
    (prevState, action) => {
      if (action === "increment") {
        return prevState + 1;
      } else {
        return action;
      }
    },
    0
  );
  const [interval, _setInterval] = useState<null | number>(null);
  const [state, setState] = useReducer<TimerState, TimerAction>(
    (prevState, action) => {
      const start = (): TimerState => {
        _setInterval(setInterval(increment, props.rate ?? 1000));
        tryCall(props.onStart);
        return "on";
      };

      const stop = (): TimerState => {
        clearInterval(interval);
        setTime(0);
        tryCall(props.onStop);
        return "off";
      };

      const pause = (): TimerState => {
        clearInterval(interval);
        tryCall(props.onPause);
        return "paused";
      };

      if (action === "stop") {
        return stop();
      } else if (action === "start") {
        return start();
      } else if (action === "pause" && prevState === "paused") {
        return start();
      } else if (action === "pause" && prevState === "on") {
        return pause();
      }

      return prevState;
    },
    "off"
  );

  // TODO: Increment based on time between last tick instead of interval, which is unreliable
  const increment = () => setTime("increment");

  const toggle = () => {
    if (state === "on") {
      setState("pause");
    } else {
      setState("start");
    }
  };
  const stop = () => setState("stop");

  const buttonText = () => {
    const obj: Record<TimerState, string> = {
      on: "Pause",
      off: "Start",
      paused: "Resume",
    };

    return obj[state];
  };

  return (
    <div className="timer">
      <span>{time}</span>
      <button onClick={toggle}>{buttonText()}</button>
      <button onClick={stop}>Stop</button>
      <br />
      <span>{state}</span>
    </div>
  );
}

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
      <Timer />
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
